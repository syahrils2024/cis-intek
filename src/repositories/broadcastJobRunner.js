import axios from 'src/commons/axios';

const BASEURL = import.meta.env.VITE_API_URL;
const url = `${BASEURL}/admin/broadcast-job-runner`;

/**
 * @typedef {Object} BroadcastJobRunner
 * @property {string} _id - The unique identifier for the broadcast job runner
 * @property {string} runningAt - The timestamp when the job runner started executing
 * @property {string} finishedAt - The timestamp when the job runner finished executing
 * @property {string|null} actionUser - The user who performed an action on this runner (nullable)
 * @property {string} createdUser - The user ID who created the broadcast job runner
 * @property {string[]} checkBillingStatus - Array of billing statuses to check (e.g., "unpaid", "paid", "partially_paid", "cancelled")
 * @property {number} checkBillingMonth - The billing month to check (1-12)
 * @property {number} checkBillingYear - The billing year to check
 * @property {string} template - The message template used for broadcasting
 * @property {string} createdAt - The timestamp when the job runner was created
 * @property {string} createdUseFullname - The full name of the user who created the runner
 * @property {string|null} actionUserFullname - The full name of the user who performed an action (nullable)
 * @property {number} totalItem - The total number of items to be processed
 * @property {number} sentItem - The number of items that have been sent
 * @property {Object[]} area - Array of area objects
 * @property {string} area[]._id - The unique identifier for the area
 * @property {string} area[].title - The title/name of the area
 * @property {Object[]} whatsappNodes - Array of WhatsApp node objects
 * @property {string} whatsappNodes[]._id - The unique identifier for the WhatsApp node
 * @property {string} whatsappNodes[].title - The title/name of the WhatsApp node
 */

/**
 * Find all broadcast job runners.
 * @param {{
 * page: number;
 * limit: number;
 * }} params - Query parameters for the request
 * @returns {Promise<{total: number; data: BroadcastJobRunner[]}>} - A promise that resolves to an array of broadcast job runners
 */
export async function findAll(params) {
  const { data } = await axios.get(url, { params });
  return data.message;
}

/**
 * Cancel Job Runner
 * @param {string} id
 * @returns {Promise<string>} - A promise that resolves to a success message
 */
export async function cancel(id) {
  const u = `${url}/${id}/cancel`;
  const { data } = await axios.delete(u);
  return data.message;
}
