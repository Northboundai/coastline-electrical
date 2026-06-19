/* POST /api/chat-lead -> GoHighLevel (code-first via _ghl.js). */
const { handleLead } = require("./_ghl.js");
exports.handler = (event) => handleLead(event, { defaultType: "Chatbot", required: ["name", "phone", "email"] });
