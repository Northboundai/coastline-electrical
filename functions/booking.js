/* POST /api/booking -> GoHighLevel (code-first via _ghl.js). */
const { handleLead } = require("./_ghl.js");
exports.handler = (event) => handleLead(event, { defaultType: "Booking", required: ["firstName", "phone", "email", "address", "suburb", "serviceNeeded"] });
