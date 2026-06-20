/* =====================================================================
   Coastline Electrical — functions/_ghl.js   (code-first GHL engine)

   The 3 lead routes (contact / booking / chat-lead) all call handleLead().
   Per submission it talks to the GoHighLevel v2 API directly:
     1. upserts the contact (standard + custom fields, tags)
     2. creates an opportunity in the Tradie Leads pipeline
     3. emails an instant auto-reply to the customer
     4. emails an internal lead alert to the office
   Requires env var GHL_API_TOKEN (a GHL Private Integration token).
   Until it is set, leads are accepted and logged so the site keeps working.
   ===================================================================== */

const GHL = "https://services.leadconnectorhq.com";

const CONFIG = {
  locationId: "xxsGDQZGPawg6WJy5sVM",
  // pipeline + stages — "Tradie leads" pipeline (IDs pulled from GHL 2026-06-20).
  pipelineId: process.env.GHL_PIPELINE_ID || "2A3mKKLSEoqINj2dLfm3",
  stageNewLead: process.env.GHL_STAGE_NEW_LEAD || "dda36c34-e75f-4a04-a58d-b73f192c6f8a", // New Lead
  stageBooked: process.env.GHL_STAGE_BOOKED || "f92c98c5-63b3-42fe-80bf-392ad91a83b4",   // Booked
  fields: {
    suburb:        "XtBJ58ztLghN2Z9wCS50",
    serviceNeeded: "miYEshoZ2T8lxoqrSI8w",
    urgency:       "gNelEfSPm6XJsEij5Wk5",
    propertyType:  "6Nvb9idtQxkVTiAwYNVf",
    jobAddress:    "VFG7iDDBXVSLrFbU4snQ",
    preferredDate: "VNO5Q87c3g1YYxvvXl1j",
    preferredTime: "YpvDpkRvVLFLDcPzi5Lh",
    message:       "mcBnH90U4R0RzuF33qDf",
    leadType:      "VkyVKrRuxGk2HZBh6gar",
    sourcePage:    "gcx9u3cQuxg7NgrR3b9T",
  },
  alertEmail: "northboundaiagency+coastline@gmail.com",
  brand:      "Coastline Electrical",
  bookingUrl: process.env.GHL_BOOKING_URL || "",
  // Booking-form submissions become real auto-confirmed appointments here:
  calendarId:     "xl0iSewh5p2sRcVpdA7Z",
  assignedUserId: "mfUJRP8soiyaspAz5Spj",
  slotMins:       60,
};

const JSON_HEADERS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const clean = (v) => (typeof v === "string" ? v.trim() : v == null ? "" : v);
const reply = (statusCode, obj) => ({ statusCode, headers: JSON_HEADERS, body: JSON.stringify(obj) });

function sanitise(body, defaults) {
  defaults = defaults || {};
  const first = clean(body.firstName);
  const last = clean(body.lastName);
  return {
    business: clean(body.business) || "Coastline Electrical Co.",
    leadType: clean(body.leadType) || defaults.leadType || "Enquiry",
    sourcePage: clean(body.sourcePage),
    firstName: first,
    lastName: last,
    name: clean(body.name) || (first + " " + last).trim(),
    phone: clean(body.phone),
    email: clean(body.email),
    suburb: clean(body.suburb),
    address: clean(body.address),
    serviceNeeded: clean(body.serviceNeeded),
    propertyType: clean(body.propertyType),
    urgency: clean(body.urgency),
    preferredDate: clean(body.preferredDate),
    preferredTime: clean(body.preferredTime),
    slotIso: clean(body.slotIso),
    message: clean(body.message),
  };
}

function ghlHeaders(token) {
  return {
    Authorization: `Bearer ${token}`,
    Version: "2021-07-28",
    "Content-Type": "application/json",
    Accept: "application/json",
    "User-Agent": "CoastlineSite/1.0",
  };
}
async function ghl(path, body, token) {
  const res = await fetch(`${GHL}${path}`, { method: "POST", headers: ghlHeaders(token), body: JSON.stringify(body) });
  const text = await res.text();
  if (!res.ok) throw new Error(`GHL ${path} ${res.status}: ${text}`);
  try { return JSON.parse(text); } catch { return { raw: text }; }
}
const sendEmail = (token, contactId, subject, html) =>
  ghl("/conversations/messages", { type: "Email", contactId, subject, html }, token);

async function ghlGet(path, token, version) {
  const res = await fetch(`${GHL}${path}`, {
    headers: { Authorization: `Bearer ${token}`, Version: version || "2021-07-28", Accept: "application/json", "User-Agent": "CoastlineSite/1.0" },
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`GHL GET ${path} ${res.status}: ${text}`);
  return JSON.parse(text);
}
function fmtSlot(iso) {
  const m = String(iso).match(/T(\d{2}):(\d{2})/);
  if (!m) return iso;
  let h = +m[1]; const mi = m[2]; const ap = h >= 12 ? "PM" : "AM";
  h = h % 12; if (h === 0) h = 12;
  return `${h}:${mi} ${ap}`;
}
// Live open slots for a YYYY-MM-DD from the booking calendar (Sydney time, on the half-hour).
async function freeSlots(date) {
  const token = process.env.GHL_API_TOKEN || "";
  if (!token || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return [];
  const start = Date.parse(`${date}T00:00:00+10:00`);
  const end = start + 24 * 3600 * 1000;
  const data = await ghlGet(`/calendars/${CONFIG.calendarId}/free-slots?startDate=${start}&endDate=${end}&timezone=Australia%2FSydney`, token, "2021-04-15");
  const key = data[date] ? date : Object.keys(data).find((k) => /^\d{4}-\d{2}-\d{2}$/.test(k));
  const raw = (key && data[key] && data[key].slots) || [];
  return raw.filter((iso) => /T\d{2}:(00|30):/.test(iso)).map((iso) => ({ value: iso, label: fmtSlot(iso) }));
}

const cf = (id, value) => (value ? { id, field_value: value } : null);

// --- Booking-form date/time -> real calendar appointment (Sydney time) ---
function parseTime(t) {
  const m = String(t).match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!m) return null;
  let h = +m[1]; const mi = +m[2], ap = m[3].toUpperCase();
  if (ap === "PM" && h !== 12) h += 12;
  if (ap === "AM" && h === 12) h = 0;
  return { h, mi };
}
function sydneyOffset(y, mo, d) {
  // Sydney DST (+11) runs first Sunday Oct -> first Sunday Apr; otherwise +10.
  const firstSun = (yr, m) => { const dow = new Date(Date.UTC(yr, m - 1, 1)).getUTCDay(); return 1 + ((7 - dow) % 7); };
  const afterOct = mo > 10 || (mo === 10 && d >= firstSun(y, 10));
  const beforeApr = mo < 4 || (mo === 4 && d < firstSun(y, 4));
  return afterOct || beforeApr ? 11 : 10;
}
function buildAppt(dateStr, timeStr) {
  const t = parseTime(timeStr); if (!t) return null;
  const [y, mo, d] = String(dateStr).split("-").map(Number);
  if (!y || !mo || !d) return null;
  const pad = (n) => String(n).padStart(2, "0");
  const off = "+" + pad(sydneyOffset(y, mo, d)) + ":00";
  let eh = t.h, em = t.mi + CONFIG.slotMins; eh += Math.floor(em / 60); em %= 60;
  return { start: `${dateStr}T${pad(t.h)}:${pad(t.mi)}:00${off}`, end: `${dateStr}T${pad(eh)}:${pad(em)}:00${off}`, label: `${dateStr} ${timeStr}` };
}

async function handleLead(event, opts) {
  const method = event.httpMethod || event.method || "GET";
  if (method === "OPTIONS") return { statusCode: 204, headers: JSON_HEADERS, body: "" };
  if (method !== "POST") return reply(405, { ok: false, error: "Use POST." });

  let body;
  try { body = JSON.parse(event.body || "{}"); }
  catch { return reply(400, { ok: false, error: "Invalid JSON." }); }
  if (clean(body.company_website)) return reply(200, { ok: true }); // honeypot

  const lead = sanitise(body, { leadType: opts.defaultType });
  const missing = (opts.required || []).filter((f) => !lead[f]);
  if (missing.length) return reply(422, { ok: false, error: "Missing: " + missing.join(", ") });
  if (lead.email && !EMAIL_RE.test(lead.email)) return reply(422, { ok: false, error: "Invalid email." });

  const token = process.env.GHL_API_TOKEN || "";
  if (!token) { console.log("[lead] GHL_API_TOKEN not set; accepted but not pushed:", lead); return reply(200, { ok: true, pushed: false }); }

  try {
    const first = lead.firstName || lead.name.split(" ")[0] || lead.name;
    const last = lead.lastName || lead.name.split(" ").slice(1).join(" ");
    const up = await ghl("/contacts/upsert", {
      locationId: CONFIG.locationId,
      firstName: first, lastName: last, email: lead.email,
      phone: lead.phone || undefined,
      companyName: lead.business || undefined,
      address1: lead.address || undefined,
      city: lead.suburb || undefined,
      state: lead.suburb ? "NSW" : undefined,
      country: "AU",
      source: "Website " + lead.leadType.toLowerCase(),
      tags: ["electrician", "central-coast", "website", "new-lead", "lead-" + lead.leadType.toLowerCase()],
      customFields: [
        cf(CONFIG.fields.suburb, lead.suburb), cf(CONFIG.fields.serviceNeeded, lead.serviceNeeded),
        cf(CONFIG.fields.urgency, lead.urgency), cf(CONFIG.fields.propertyType, lead.propertyType),
        cf(CONFIG.fields.jobAddress, lead.address), cf(CONFIG.fields.preferredDate, lead.preferredDate),
        cf(CONFIG.fields.preferredTime, lead.preferredTime), cf(CONFIG.fields.message, lead.message),
        cf(CONFIG.fields.leadType, lead.leadType), cf(CONFIG.fields.sourcePage, lead.sourcePage),
      ].filter(Boolean),
    }, token);
    const contactId = (up.contact || up).id;

    if (CONFIG.pipelineId) {
      const stageId = lead.leadType === "Booking" ? (CONFIG.stageBooked || CONFIG.stageNewLead) : CONFIG.stageNewLead;
      try {
        await ghl("/opportunities/", {
          locationId: CONFIG.locationId, pipelineId: CONFIG.pipelineId, pipelineStageId: stageId,
          name: `${lead.name}${lead.serviceNeeded ? " - " + lead.serviceNeeded : ""}`,
          status: "open", contactId,
        }, token);
      } catch (e) { console.error("[lead] opportunity failed:", e.message); }
    }

    // Booking -> create a REAL auto-confirmed appointment on the calendar
    let appt = null;
    let apptError = null;
    if (lead.leadType === "Booking" && (lead.slotIso || (lead.preferredDate && lead.preferredTime)) && CONFIG.calendarId) {
      // Prefer the exact ISO slot the customer picked from live GHL availability.
      if (lead.slotIso) {
        const startMs = Date.parse(lead.slotIso);
        if (isNaN(startMs)) apptError = `Bad slot: "${lead.slotIso}"`;
        else appt = { start: new Date(startMs).toISOString(), end: new Date(startMs + CONFIG.slotMins * 60000).toISOString(), label: `${lead.preferredDate} ${lead.preferredTime}`.trim() };
      } else {
        appt = buildAppt(lead.preferredDate, lead.preferredTime);
        if (!appt) apptError = `Unparseable date/time: "${lead.preferredDate}" "${lead.preferredTime}"`;
      }
      if (appt) {
        try {
          // No ignoreFreeSlotValidation -> GHL rejects clashes, so double-booking is impossible.
          await ghl("/calendars/events/appointments", {
            calendarId: CONFIG.calendarId, locationId: CONFIG.locationId, contactId,
            startTime: appt.start, endTime: appt.end,
            title: `${lead.serviceNeeded || "Job"} - ${lead.name}`,
            appointmentStatus: "confirmed", assignedUserId: CONFIG.assignedUserId,
          }, token);
        } catch (e) { console.error("[lead] appointment failed (slot likely just taken):", e.message); apptError = e.message; appt = null; }
      } else if (apptError) {
        console.error("[lead] appointment skipped:", apptError);
      }
    }

    const subject = appt ? `Your ${CONFIG.brand} booking is confirmed` : `Thanks for contacting ${CONFIG.brand}`;
    try { await sendEmail(token, contactId, subject, autoReplyHtml(first, lead, appt)); }
    catch (e) { console.error("[lead] auto-reply failed:", e.message); }

    try {
      const alert = await ghl("/contacts/upsert", { locationId: CONFIG.locationId, firstName: "Lead Alerts", email: CONFIG.alertEmail, tags: ["internal-alerts"] }, token);
      const when = appt ? ` — ${prettyDate(lead.preferredDate)} ${lead.preferredTime}` : "";
      const where = lead.suburb ? ` (${lead.suburb})` : "";
      const subjectAlert = `${appt ? "NEW BOOKING" : "New " + lead.leadType.toLowerCase()}: ${lead.name}${lead.serviceNeeded ? " — " + lead.serviceNeeded : ""}${where}${when}`;
      await sendEmail(token, (alert.contact || alert).id, subjectAlert, alertHtml(lead, appt));
    } catch (e) { console.error("[lead] alert failed:", e.message); }

    return reply(200, { ok: true, pushed: true, contactId, appointmentCreated: !!appt, appointmentError: apptError || undefined });
  } catch (err) {
    console.error("[lead] push failed:", err.message);
    return reply(200, { ok: true, pushed: false });
  }
}

function autoReplyHtml(first, lead, appt) {
  const confirmed = appt
    ? `<p>Good news — your appointment is <strong>confirmed</strong> for <strong>${escapeHtml(lead.preferredDate)} at ${escapeHtml(lead.preferredTime)}</strong>. A licensed Coastline sparky will be there, and we'll send a reminder before we head over.</p>`
    : "";
  const book = (!appt && CONFIG.bookingUrl) ? `<p>Want to lock in a time? <a href="${CONFIG.bookingUrl}">Book online here</a>.</p>` : "";
  return `
  <p>Hi ${escapeHtml(first)},</p>
  <p>Thanks for getting in touch with Coastline Electrical.${appt ? "" : " One of our sparkies will be in touch shortly."}</p>
  ${confirmed}
  ${lead.serviceNeeded && !appt ? `<p>You mentioned: <strong>${escapeHtml(lead.serviceNeeded)}</strong>${lead.suburb ? " in " + escapeHtml(lead.suburb) : ""}. We'll sort you out.</p>` : ""}
  ${book}
  <p>If anything changes or it's urgent, just give us a call.</p>
  <p>Cheers,<br>The Coastline Electrical team</p>`;
}
// YYYY-MM-DD -> "23 Jun 2026" (no Date object, so no timezone drift)
function prettyDate(d) {
  const m = String(d || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return d || "";
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${+m[3]} ${months[+m[2] - 1]} ${m[1]}`;
}
function alertHtml(lead, appt) {
  const esc = escapeHtml;
  // row value is treated as pre-built HTML, so escape text before passing it in
  const row = (k, v) => v ? `<tr><td style="padding:4px 16px 4px 0;color:#666;white-space:nowrap;vertical-align:top">${k}</td><td style="padding:4px 0"><strong>${v}</strong></td></tr>` : "";
  const phoneLink = lead.phone ? `<a href="tel:${esc(lead.phone)}">${esc(lead.phone)}</a>` : "";
  const emailLink = lead.email ? `<a href="mailto:${esc(lead.email)}">${esc(lead.email)}</a>` : "";
  const fullAddress = [lead.address, lead.suburb].filter(Boolean).map(esc).join(", ") + (lead.suburb ? " NSW" : "");
  const firstName = (lead.name || "").split(" ")[0] || lead.name;

  const heading = appt
    ? `<h2 style="margin:0 0 4px;color:#0a2540">New booking — ${esc(lead.serviceNeeded || "Job")}</h2>`
    : `<h2 style="margin:0 0 4px;color:#0a2540">New ${esc(lead.leadType.toLowerCase())} lead — ${esc(lead.serviceNeeded || "enquiry")}</h2>`;

  const apptBox = appt
    ? `<div style="margin:12px 0;padding:12px 16px;background:#e8f8ee;border-left:4px solid #1d7a44;border-radius:6px">
         <div style="font-size:16px;color:#0a2540"><strong>${esc(prettyDate(lead.preferredDate))} at ${esc(lead.preferredTime)}</strong></div>
         <div style="font-size:13px;color:#1d7a44;margin-top:2px">Confirmed in your calendar and assigned to you.</div>
       </div>`
    : ((lead.preferredDate || lead.preferredTime)
        ? `<p style="margin:8px 0"><strong>Requested time:</strong> ${esc(prettyDate(lead.preferredDate))} ${esc(lead.preferredTime)}</p>`
        : "");

  return `
  ${heading}
  <p style="margin:0 0 8px;color:#666;font-size:13px">Came in via the website${lead.sourcePage ? " (" + esc(lead.sourcePage) + ")" : ""}.</p>
  ${apptBox}
  <table style="border-collapse:collapse;font-size:14px;margin-top:8px">
    ${row("Customer", esc(lead.name))}
    ${row("Phone", phoneLink)}
    ${row("Email", emailLink)}
    ${row("Job address", fullAddress.replace(/^,\s*/, "").trim() ? fullAddress : "")}
    ${row("Service", esc(lead.serviceNeeded))}
    ${row("Urgency", esc(lead.urgency))}
    ${row("Property", esc(lead.propertyType))}
  </table>
  ${lead.message ? `<p style="margin-top:12px"><strong>Notes from customer</strong><br>${esc(lead.message).replace(/\n/g, "<br>")}</p>` : ""}
  <p style="margin-top:16px">${lead.phone ? `Call <strong>${esc(firstName)}</strong> on ${phoneLink} to confirm.` : "Follow up with this lead today."}</p>`;
}
function escapeHtml(s) {
  return String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

module.exports = { handleLead, JSON_HEADERS, CONFIG, freeSlots };
