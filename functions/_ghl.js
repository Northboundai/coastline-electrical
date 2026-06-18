/* =====================================================================
   Coastline Electrical — functions/_ghl.js
   Shared helper for the lead API routes (contact / booking / chat-lead).

   The browser NEVER calls GoHighLevel directly. It POSTs a clean lead object
   to one of our routes; that route reads the secret webhook URL from an
   environment variable and forwards the lead on. This keeps the real GHL
   webhook URLs out of the public frontend bundle.

   Files prefixed with "_" are treated as non-routes by Cloudflare Pages and
   are simply imported by the route files, which works on Vercel and Netlify
   too. See DEPLOY.md for per-host placement.
   ===================================================================== */

export const JSON_HEADERS = {
  "Content-Type": "application/json",
  // Lock this down to your own domain in production:
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^(?:\+?61|0)[234578]\d{8}$/;
const clean = (v) => (typeof v === "string" ? v.trim() : v == null ? "" : v);

// Normalise an incoming lead into the canonical shape we send to GoHighLevel.
export function sanitise(body, defaults) {
  defaults = defaults || {};
  const first = clean(body.firstName);
  const last = clean(body.lastName);
  const tags = Array.isArray(body.tags) ? body.tags.filter(Boolean) : [];
  // Always ensure the base CRM tags are present.
  ["electrician", "central-coast", "website"].forEach((t) => {
    if (tags.indexOf(t) === -1) tags.push(t);
  });
  return {
    business: clean(body.business) || "Coastline Electrical Co.",
    leadType: clean(body.leadType) || defaults.leadType || "Enquiry",
    leadSource: clean(body.leadSource) || "website",
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
    message: clean(body.message),
    consent: !!body.consent,
    tags,
    createdAt: clean(body.createdAt) || new Date().toISOString(),
  };
}

export function validate(lead, required) {
  const missing = (required || []).filter((f) => !lead[f]);
  if (missing.length) return "Missing required field(s): " + missing.join(", ");
  if (lead.email && !EMAIL_RE.test(lead.email)) return "Invalid email address.";
  if (lead.phone && !PHONE_RE.test(lead.phone.replace(/[\s()\-.]/g, ""))) return "Invalid Australian phone number.";
  return null;
}

// Read the secret webhook URL from env and forward the lead to GoHighLevel.
async function forward(lead, webhookEnv) {
  const webhook = (typeof process !== "undefined" && process.env && process.env[webhookEnv]) || globalThis[webhookEnv];
  if (!webhook) {
    // Not configured yet — accept the lead so the site keeps working.
    console.log("[" + webhookEnv + "] not set; lead accepted but not forwarded.", lead);
    return { ok: true, forwarded: false, message: "Lead received (webhook not configured)." };
  }
  // ---- Optional: add GHL API auth here ----
  // If you switch from an Inbound Webhook to the GoHighLevel REST API, set an
  // Authorization header with your private token, e.g.:
  //   headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.GHL_API_TOKEN}` }
  // and adjust the body to the contacts/opportunities endpoint shape.
  const res = await fetch(webhook, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(lead),
  });
  return { ok: res.ok, forwarded: res.ok, status: res.status };
}

// Web Fetch API handler used by every route (Vercel Edge, Netlify, Cloudflare).
export async function handleLead(request, opts) {
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: JSON_HEADERS });
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ ok: false, error: "Method not allowed. Use POST." }),
      { status: 405, headers: { ...JSON_HEADERS, Allow: "POST" } });
  }
  let body;
  try { body = await request.json(); }
  catch (e) { return new Response(JSON.stringify({ ok: false, error: "Invalid JSON body." }), { status: 400, headers: JSON_HEADERS }); }

  // Spam honeypot: if the hidden field is filled, silently accept and drop.
  if (clean(body.company_website)) return new Response(JSON.stringify({ ok: true, forwarded: false }), { status: 200, headers: JSON_HEADERS });

  const lead = sanitise(body, { leadType: opts.defaultType });
  const error = validate(lead, opts.required);
  if (error) return new Response(JSON.stringify({ ok: false, error }), { status: 422, headers: JSON_HEADERS });

  try {
    const result = await forward(lead, opts.webhookEnv);
    return new Response(JSON.stringify(result), { status: result.ok ? 200 : 502, headers: JSON_HEADERS });
  } catch (err) {
    console.error("[" + opts.webhookEnv + "] forward failed:", err);
    return new Response(JSON.stringify({ ok: false, error: "Failed to forward lead to CRM." }), { status: 502, headers: JSON_HEADERS });
  }
}
