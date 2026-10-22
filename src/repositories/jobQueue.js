import axios from '@commons/axios';

const BASEURL = import.meta.env.VITE_API_URL;
const url = `${BASEURL}/admin/job`;

/**
 * @typedef {Object} JobQueue
 * @property {string} _id - The unique identifier of the task.
 * @property {null | boolean} canceled - Indicates if the task was canceled.
 * @property {string[]} commands - List of commands to execute.
 * @property {"pending" | "running" | "failed" | "completed"} status - The status of the task.
 * @property {null | string} failedReason - Reason for failure, if applicable.
 * @property {number} repeat - Current repeat count.
 * @property {number} maxRepeat - Maximum allowed repeat attempts.
 * @property {"MIKROTIK"} type - The type of task.
 * @property {string} mikrotikType - The specific Mikrotik command type.
 * @property {string} runAt - The scheduled run time in ISO 8601 format.
 * @property {string} createdAt - The creation timestamp in ISO 8601 format.
 * @property {string} customer_id - Unique identifier for the customer.
 * @property {string} customerFullname - Full name of the customer.
 * @property {string} customerId - Customer ID.
 * @property {string} customerPhone - Customer's phone number.
 * @property {string} customerAddress - Customer's address.
 * @property {string} area_id - Unique identifier of the area.
 * @property {string} areaTitle - Title or name of the area.
 * @property {string} [createdUserFullname] -- Full name of the user who created the task.
 * @property {string} [createdUser_id] -- Unique identifier of the user who created the task.
 */

/**
 * @param {{limit: number; page: number; find: string; area: string; type: string; mikrotikType: string}} param0
 * @returns {Promise<{totalItems: number; data: JobQueue[]}>}
 */
export async function list({ limit, page, find, area, type, mikrotikType, activeOnly }) {
  const { data } = await axios.get(url, {
    params: { limit, page, find, area, type, mikrotikType, activeOnly },
  });
  return data.message;
}

/**
 * @param {string} id
 * @returns {Promise<string>}
 */
export async function cancel(id) {
  const { data } = await axios.patch(`${url}/${id}/cancel`);
  return data.message;
}

/**
 * Check Queue Customer is exists or alive
 * @param {string} customerId
 * @returns {Promise<boolean>}
 */
export async function isQueueAlive(customerId) {
  const { data } = await axios.get(`${url}/queue-alive/${customerId}`);
  return data.message;
}

/**
 * Cancel All Queue Customer
 * @param {string} customerId
 * @returns
 */
export async function cancelAll(customerId, { queueType } = {}) {
  const { data } = await axios.patch(`${url}/cancel-all/${customerId}`, null, {
    params: { queueType },
  });
  return data.message;
}
