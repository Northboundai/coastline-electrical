/* =====================================================================
   POST /api/booking  ->  GoHighLevel  (env: GHL_BOOKING_WEBHOOK_URL)
   Receives native booking-flow requests, validates, forwards to GHL.
   In GHL, map these into a calendar/opportunity workflow and send the
   confirmation SMS/email. preferredDate + preferredTime are included.
   ===================================================================== */
import { handleLead, JSON_HEADERS } from "./_ghl.js";

const CONFIG = {
  required: ["firstName", "phone", "email", "suburb", "serviceNeeded"],
  webhookEnv: "GHL_BOOKING_WEBHOOK_URL",
  defaultType: "Booking",
};

// --- Web Fetch API (Vercel Edge, Netlify, generic) ---
export default async function handler(request) {
  return handleLead(request, CONFIG);
}

// --- Cloudflare Pages Functions adapter ---
// export async function onRequestPost(context) { return handleLead(context.request, CONFIG); }
// export async function onRequestOptions() { return new Response(null, { status: 204, headers: JSON_HEADERS }); }
