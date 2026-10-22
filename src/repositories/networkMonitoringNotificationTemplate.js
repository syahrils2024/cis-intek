import axios from 'src/commons/axios';

const APIURL = import.meta.env.VITE_API_URL;
const BASEURL = `${APIURL}/admin/network-monitoring-notification-template`;

/**
 * @typedef {Object} NetworkMonitoringNotificationTemplate
 * @property {string|null} removedAt
 * @property {string} _id
 * @property {string} templateName
 * @property {string} template
 * @property {string} createdAt
 * @property {string} updatedAt
 * @property {number} __v
 */

/**
 * @typedef {Object} NetworkMonitoringNotificationTemplateRequest
 * @property {string} templateName
 * @property {string} template
 */

/**
 * @description Get all network monitoring notification templates
 * @returns {Promise<NetworkMonitoringNotificationTemplate[]>}
 */
export async function getNotificationTemplates() {
  const { data } = await axios.get(BASEURL);
  return data.message;
}

/**
 * @description Get a network monitoring notification template by ID
 * @param {string} id
 * @returns {Promise<NetworkMonitoringNotificationTemplate>}
 */
export async function getNotificationTemplateById(id) {
  const { data } = await axios.get(`${BASEURL}/${id}`);
  return data.message;
}

/**
 * @description Create a new network monitoring notification template
 * @param {NetworkMonitoringNotificationTemplateRequest} body
 * @returns {Promise<NetworkMonitoringNotificationTemplate>}
 */
export async function createNotificationTemplate(body) {
  const { data } = await axios.post(BASEURL, body);
  return data.message;
}

/**
 * @description Update an existing network monitoring notification template
 * @param {string} id
 * @param {Partial<NetworkMonitoringNotificationTemplateRequest>} body
 * @returns {Promise<NetworkMonitoringNotificationTemplate>}
 */
export async function updateNotificationTemplate(id, body) {
  const { data } = await axios.put(`${BASEURL}/${id}`, body);
  return data.message;
}

/**
 * @description Delete a network monitoring notification template
 * @param {string} id
 * @returns {Promise<void>}
 */
export async function deleteNotificationTemplate(id) {
  await axios.delete(`${BASEURL}/${id}`);
}
