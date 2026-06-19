/* POST /api/contact -> GoHighLevel (code-first via _ghl.js). */
const { handleLead } = require("./_ghl.js");
exports.handler = (event) => handleLead(event, { defaultType: "Contact", required: ["firstName", "phone", "email"] });
