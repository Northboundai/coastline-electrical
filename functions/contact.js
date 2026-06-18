/* =====================================================================
   POST /api/contact  ->  GoHighLevel  (env: GHL_CONTACT_WEBHOOK_URL)
   Receives website contact-form leads, validates, forwards to GHL.
   ===================================================================== */
import { handleLead, JSON_HEADERS } from "./_ghl.js";

const CONFIG = {
  required: ["firstName", "phone", "email"],
  webhookEnv: "GHL_CONTACT_WEBHOOK_URL",
  defaultType: "Contact",
};

// --- Web Fetch API (Vercel Edge, Netlify, generic) ---
export default async function handler(request) {
  return handleLead(request, CONFIG);
}

// --- Cloudflare Pages Functions adapter ---
// export async function onRequestPost(context) { return handleLead(context.request, CONFIG); }
// export async function onRequestOptions() { return new Response(null, { status: 204, headers: JSON_HEADERS }); }

// --- Classic Node / Netlify Lambda adapter (uncomment if your host needs it) ---
// export async function handlerNode(event) {
//   const req = new Request("http://x", { method: event.httpMethod, body: event.body });
//   const res = await handleLead(req, CONFIG);
//   return { statusCode: res.status, headers: JSON_HEADERS, body: await res.text() };
// }
