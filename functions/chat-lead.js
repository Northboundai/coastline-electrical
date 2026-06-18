/* =====================================================================
   POST /api/chat-lead  ->  GoHighLevel  (env: GHL_CHATBOT_WEBHOOK_URL)
   Receives leads captured by the floating chatbot, validates, forwards.
   The chatbot submits once it has name, phone, email, suburb and service.
   ===================================================================== */
import { handleLead, JSON_HEADERS } from "./_ghl.js";

const CONFIG = {
  required: ["name", "phone", "email"],
  webhookEnv: "GHL_CHATBOT_WEBHOOK_URL",
  defaultType: "Chatbot",
};

// --- Web Fetch API (Vercel Edge, Netlify, generic) ---
export default async function handler(request) {
  return handleLead(request, CONFIG);
}

// --- Cloudflare Pages Functions adapter ---
// export async function onRequestPost(context) { return handleLead(context.request, CONFIG); }
// export async function onRequestOptions() { return new Response(null, { status: 204, headers: JSON_HEADERS }); }
