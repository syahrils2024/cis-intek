import axios from '@commons/axios';

const APIURL = import.meta.env.VITE_API_URL;
const BASEURL = `${APIURL}/admin/whatsapp`;
const BASEURLV3 = `${APIURL}/v3/whatsapp`;

/**
 * @typedef {Object} WhatsappNode
 * @property {string} _id
 * @property {string} dockerId
 * @property {string} title
 * @property {string} phone
 * @property {"PENDING" | "ACTIVE" | "DISCONNECT"} status
 * @property {number} port
 * @property {string} description
 * @property {boolean} isOnline
 * @property {import('./whatsappGroup').WhatsappGroup[]} groups
 */

/**
 * @typedef {Object} WhatsappNodeRequest
 * @property {string} title
 * @property {string} phone
 * @property {string[]} groupId
 * @property {string} description
 */

/**
 * @typedef {object} WhatsappStatus
 * @property {string} nodeId - The unique identifier of the WhatsApp node.
 * @property {string} status - The status of the WhatsApp node (e.g., "active").
 * @property {?string} error - The error message if any, otherwise null.
 */

/**
 * @returns {Promise<WhatsappNode[]>}
 */
export const getWhatsappNode = async () => {
  const { data } = await axios.get(`${BASEURL}/devices`);
  return data.message;
};

/**
 * @param {WhatsappNodeRequest} body
 */
export const createWhatsappNode = async (body) => {
  await axios.post(`${BASEURL}/devices`, body);
};

/**
 * @param {WhatsappNodeRequest} body
 */
export const updateWhatsappNode = async (id) => {
  await axios.patch(`${BASEURL}/update-version/${id}`);
};

/**
 * @param {WhatsappNodeRequest} body
 */
export const updateWhatsappNodeData = async (id, body) => {
  await axios.patch(`${BASEURL}/devices/${id}`, body);
};

/**
 * @param {string} id
 */
export const restartWhatsappNode = async (id) => {
  await axios.patch(`${BASEURL}/restart/${id}`);
};

/**
 * @param {string} id
 * @param {string} status
 */
export const changeStatusWhatsappNode = async (id, status) => {
  await axios.patch(`${BASEURL}/set-status/${id}`, { status });
};

/**
 * @param {string} id
 */
export const deleteWhatsappNode = async (id) => {
  await axios.delete(`${BASEURL}/${id}`);
};

/**
 * @param {string} id
 * @param {string} status
 */
export const clearDataWhatsappNode = async (id, status) => {
  await axios.patch(`${BASEURL}/clear-data/${id}`);
};

/**
 * Get Whatsapp Node Status
 * @param {string[]} nodeIds
 * @returns {Promise<WhatsappStatus[]>}
 */
export const getWhatsappNodeStatus = async (nodeIds) => {
  const { data } = await axios.post(`${BASEURLV3}/devices/status`, { whatsappNodes: nodeIds });
  return data.message;
};

/**
 * Get node console logs
 * @param {string} id
 * @returns
 */
export async function getNodeLogs(id) {
  const { data } = await axios.get(`${BASEURL}/devices/logs/${id}`);
  return data.message;
}

/**
 * Set online status of a whatsapp node
 * @param {*} id
 * @param {*} isOnline
 * @returns
 */
export async function setOnlineStatus(id, isOnline) {
  const { data } = await axios.patch(`${BASEURL}/online/${id}`, { isOnline });
  return data.message;
}
