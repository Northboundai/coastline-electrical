/* =====================================================================
   Coastline Electrical Co. — lib/integrations.js
   Central configuration + GoHighLevel (GHL) integration map.

   Loaded as a CLASSIC script (NOT an ES module) so it also works when the
   site is opened directly from file:// during demos. It sets a single
   global: window.COASTLINE_CONFIG, read by main.js and booking.js.

   --------------------------------------------------------------------
   ENVIRONMENT VARIABLES  (set these on your host: Vercel / Netlify /
   Cloudflare Pages / Render / etc. — see DEPLOY.md and .env.example)

     Public (safe to expose, used to build calendar embeds / links):
       NEXT_PUBLIC_GHL_LOCATION_ID   -> publicId below
       NEXT_PUBLIC_GHL_CALENDAR_ID   -> calendarId below
       NEXT_PUBLIC_GHL_BOOKING_URL   -> bookingUrl below  (LeadConnector widget)

     Secret (server-only — NEVER place in this file or any frontend JS):
       GHL_CONTACT_WEBHOOK_URL   -> read by functions/contact.js
       GHL_BOOKING_WEBHOOK_URL   -> read by functions/booking.js
       GHL_CHATBOT_WEBHOOK_URL   -> read by functions/chat-lead.js

   The browser NEVER talks to GoHighLevel directly. It posts a clean lead
   object to one of our own endpoints (below); the serverless function holds
   the secret webhook URL in an env var and forwards it on. This keeps the
   real webhook URLs out of the public bundle.
   ===================================================================== */

window.COASTLINE_CONFIG = {
  /* ---- Business identity (single source of truth) ---- */
  business: "Coastline Electrical Co.",
  phoneDisplay: "(02) 4321 1234",
  phoneDial: "+61243211234",          // tel: value (E.164)
  email: "hello@coastlineelectrical.com.au",
  serviceArea: "Central Coast, NSW",
  licence: "NSW Lic. 000000C",        // REPLACE_ME with the real licence number
  abn: "00 000 000 000",              // REPLACE_ME

  /* ---- GoHighLevel public identifiers (REPLACE_ME) ---- */
  ghl: {
    publicId: "REPLACE_ME_LOCATION_ID",   // NEXT_PUBLIC_GHL_LOCATION_ID
    calendarId: "REPLACE_ME_CALENDAR_ID",  // NEXT_PUBLIC_GHL_CALENDAR_ID
    // The hosted LeadConnector booking widget URL (used by the optional
    // "Book through our calendar" iframe on book.html, and chatbot hand-off):
    bookingUrl: "https://api.leadconnectorhq.com/widget/booking/REPLACE_ME"
  },

  /* ---- Lead endpoints (our own serverless functions) ----
     These map 1:1 to the files in /functions. Adjust the paths to match
     your host's convention, e.g.:
       Vercel:            /api/contact
       Netlify:           /.netlify/functions/contact
       Cloudflare Pages:  /contact  (functions/contact.js)
     If no backend is deployed yet, submissions still succeed in "demo mode"
     (saved to localStorage) — see sendLead() in main.js. */
  endpoints: {
    contact: "/api/contact",     // -> functions/contact.js  -> GHL_CONTACT_WEBHOOK_URL
    booking: "/api/booking",     // -> functions/booking.js  -> GHL_BOOKING_WEBHOOK_URL
    chat:    "/api/chat-lead"    // -> functions/chat-lead.js -> GHL_CHATBOT_WEBHOOK_URL
  },

  /* ---- CRM tagging map by service type (sent with every lead) ----
     Base tags always applied: electrician, central-coast, website.
     The selected service adds its slug so GHL can route/automate by service. */
  baseTags: ["electrician", "central-coast", "website"],

  /* ---- Booking availability (fake data — wire to a real calendar later) ----
     Used by the native booking calendar in booking.js. The serverless layer
     can later replace this with live GHL/Google Calendar free-slot data. */
  availability: {
    // Days of week that are bookable (0 = Sun ... 6 = Sat). Sundays closed.
    openDays: [1, 2, 3, 4, 5, 6],
    // Saturday is "by appointment" — flagged, fewer slots.
    byAppointmentDays: [6],
    // Standard time windows offered per day.
    timeSlots: ["7:30 AM", "9:00 AM", "10:30 AM", "12:00 PM", "1:30 PM", "3:00 PM"],
    // A few dates marked fully booked for demo realism (offset in days from today).
    fullyBookedOffsets: [2, 5, 9, 14],
    // How many days ahead the calendar allows booking.
    horizonDays: 60
  }
};

/* Convenience: expose a tiny helper to build a tel: link consistently. */
window.COASTLINE_CONFIG.telHref = "tel:" + window.COASTLINE_CONFIG.phoneDial;
window.COASTLINE_CONFIG.mailHref = "mailto:" + window.COASTLINE_CONFIG.email;
