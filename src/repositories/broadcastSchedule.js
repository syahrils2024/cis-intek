import axios from '@commons/axios';

const BASEURL = import.meta.env.VITE_API_URL;

/**
 * @typedef {Object} BroadcastScheduleRequest
 * @property {string} title
 * @property {number} date
 * @property {number} messagePerSession
 * @property {number} delayMessage
 * @property {number} delaySession
 * @property {string[]} whatsappNodes
 * @property {Object[]} rules
 * @property {string} rules[].area
 * @property {string} rules[].template
 * @property {string[]} rules[].billingStatus
 * @property {boolean} rules[].sendInvoice
 * @property {boolean} rules[].sendSpecial
 * @property {boolean} enabled
 */

/**
 * @typedef {Object} BroadcastSchedule
 * @property {string} _id - The unique MongoDB ObjectId of the automation configuration.
 * @property {string} title - The title of the broadcast schedule.
 * @property {number} date - The day of the month (1-31) when the automation is triggered.
 * @property {Object[]} rules - Array of rule objects defining automation behavior.
 * @property {string} rules[].areaTitle - Title of the service area (e.g., "TEST TANJUNG LALANG").
 * @property {string} rules[].area_id - MongoDB ObjectId referencing the area.
 * @property {string} rules[].template - Name of the message template used (e.g., "Promo Download myINTEK").
 * @property {string} rules[].template_id - MongoDB ObjectId referencing the message template.
 * @property {string[]} rules[].billingStatus - List of applicable billing statuses: "paid", "unpaid", "partially_paid", "canceled".
 * @property {boolean} rules[].sendInvoice - Whether to send an invoice message.
 * @property {boolean} rules[].sendSpecial - Whether to send a special/promotional message.
 * @property {Object[]} whatsappNodes - Array of WhatsApp node connections.
 * @property {string} whatsappNodes[]._id - MongoDB ObjectId of the WhatsApp node.
 * @property {string} whatsappNodes[].description - Description of the node (e.g., "HP Poco Ari BIN").
 * @property {string} whatsappNodes[].title - Name/title of the bot or node.
 * @property {number} whatsappNodes[].port - Port number used by the WhatsApp node server.
 * @property {string} whatsappNodes[].status - Current status of the node (e.g., "active").
 * @property {string} whatsappNodes[].phone - WhatsApp registered phone number (e.g., "082174904944").
 * @property {number} messagePerSession - Max number of messages sent per WhatsApp session.
 * @property {number} delayMessage - Delay in seconds between individual messages.
 * @property {number} delaySession - Delay in minutes between automation sessions.
 */

/**
 * Find all broadcast schedules.
 * @returns {Promise<BroadcastSchedule[]>}
 */
export async function findAll() {
  const { data } = await axios.get(`${BASEURL}/admin/broadcast-schedule`);
  return data.message;
}

/**
 * Find a broadcast schedule by ID.
 * @param {string} id
 * @returns {Promise<BroadcastSchedule>}
 */
export async function findOne(id) {
  const { data } = await axios.get(`${BASEURL}/admin/broadcast-schedule/${id}`);
  return data.message;
}

/**
 * Add Broadcast Schedule
 * @param {BroadcastScheduleRequest} body
 * @returns {Promise<string>}
 */
export async function add(body) {
  const { data } = await axios.post(`${BASEURL}/admin/broadcast-schedule`, body);
  return data.message;
}

/**
 * Update Broadcast Schedule
 * @param {string} id
 * @param {BroadcastScheduleRequest} body
 * @returns {Promise<string>}
 */
export async function update(id, body) {
  const { data } = await axios.put(`${BASEURL}/admin/broadcast-schedule/${id}`, body);
  return data.message;
}

/**
 * Update Broadcast Schedule
 * @param {string} id
 * @param {BroadcastScheduleRequest} body
 * @returns {Promise<string>}
 */
export async function toggleEnabled(id, enabled) {
  const { data } = await axios.patch(`${BASEURL}/admin/broadcast-schedule/${id}/toggle-enabled`, { enabled });
  return data.message;
}

/**
 * Remove Broadcast Schedule
 * @param {string} id
 * @returns {Promise<string>}
 */
export async function remove(id) {
  const { data } = await axios.delete(`${BASEURL}/admin/broadcast-schedule/${id}`);
  return data.message;
}
