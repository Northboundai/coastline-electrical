/* GET /api/slots?date=YYYY-MM-DD -> live open booking times from GHL.
   Feeds the custom booking wizard real availability so it never offers a
   taken slot (and the booking itself is validated server-side). */
const { freeSlots, JSON_HEADERS } = require("./_ghl.js");

exports.handler = async (event) => {
  const method = event.httpMethod || event.method || "GET";
  if (method === "OPTIONS") return { statusCode: 204, headers: JSON_HEADERS, body: "" };
  const date = ((event.queryStringParameters || {}).date || "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return { statusCode: 400, headers: JSON_HEADERS, body: JSON.stringify({ ok: false, error: "Provide ?date=YYYY-MM-DD", slots: [] }) };
  }
  try {
    const slots = await freeSlots(date);
    return { statusCode: 200, headers: JSON_HEADERS, body: JSON.stringify({ ok: true, date, slots }) };
  } catch (e) {
    console.error("[slots] failed:", e.message);
    return { statusCode: 200, headers: JSON_HEADERS, body: JSON.stringify({ ok: false, error: "Could not load times", slots: [] }) };
  }
};
