import axios from 'src/commons/axios';

const BASEURL = import.meta.env.VITE_API_URL;
const url = `${BASEURL}/admin/broadcast-job`;

/**
 * @typedef {Object} BroadcastJob
 * @property {string} _id - The unique identifier for the broadcast job
 * @property {string} status - The status of the broadcast job (e.g., "sent")
 * @property {string|null} actionUser - The user who performed an action on this job (nullable)
 * @property {string|null} actionUserFullname - The user who performed an action on this job (nullable)
 * @property {string|null} actionAt - The timestamp when the action was performed (nullable)
 * @property {string} runningAt - The timestamp when the job was executed
 * @property {string} jobId - The job identifier
 * @property {string} message - The broadcast message content
 * @property {string} phone - The recipient's phone number
 * @property {string} messageCategory - The category of the message (e.g., "broadcast")
 * @property {string} createdAt - The timestamp when the job was created
 * @property {string} customerFullname - The full name of the customer
 * @property {string} customerId - The customer identifier
 * @property {string} customer_id - The customer's database ID
 * @property {string} whatsappNode - The WhatsApp node identifier
 * @property {string} whatsappNodeTitle - The title/name of the WhatsApp node
 * @property {string} createdUser - The user ID who created the broadcast job
 * @property {string} createdUserFullname - The full name of the user who created the job
 */

/**
 * @typedef {Object} BroadcastJobParam
 * @property {number} page
 * @property {number} limit
 * @property {string} messageCategory
 * @property {string} whatsappNode
 */

/**
 * @param {BroadcastJobParam} params
 * @returns {Promise<{total: number; data: BroadcastJob[]}>}
 */
export async function findAll(params) {
  const { data } = await axios.get(url, { params });
  return data.message;
}

/** Cancel All Job */
export async function cancelAll() {
  const u = `${url}/cancel/all`;
  const { data } = await axios.delete(u);
  return data.message;
}

/** Cancel some Job */
export async function cancel(id) {
  const u = `${url}/cancel/${id}`;
  const { data } = await axios.delete(u);
  return data.message;
}
