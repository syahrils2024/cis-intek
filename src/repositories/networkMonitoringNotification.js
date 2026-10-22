import axios from 'axios';
import { interceptAxiosRequest, interceptAxiosResponse } from '@commons/axios';

const APIURL = import.meta.env.VITE_API_URL;

const http = axios.create({
  baseURL: `${APIURL}/admin/network-monitoring-notification-whatsapp`,
});
http.interceptors.request.use(interceptAxiosRequest);
http.interceptors.response.use(interceptAxiosResponse);

/**
 * @typedef {Object} NetworkMonitoringNotification
 * @property {string} _id
 * @property {string} deviceId
 * @property {string} alias
 * @property {string} whatsappNode
 * @property {string} to
 */

/**
 * @typedef {Object} NetworkMonitoringNotificationRequestItem
 * @property {string} to
 * @property {string} whatsappNode
 */

/**
 * @typedef {Object} NetworkMonitoringNotificationRequest
 * @property {string} deviceId
 * @property {NetworkMonitoringNotificationRequestItem[]} items
 */

/**
 * @description Add a new network monitoring notification whatsapp
 * @param {string} deviceId
 * @returns {Promise<NetworkMonitoringNotification[]>}
 */
export async function getByDevice(deviceId) {
  const { data } = await http.get(`/${deviceId}`);
  return data.message;
}

/**
 * @description Add or update network monitoring notification whatsapp
 * @param {NetworkMonitoringNotificationRequest} request
 * @returns {Promise<NetworkMonitoringNotification[]>}
 */
export async function upsertNotifications(request) {
  const { data } = await http.put('', request);
  return data.message;
}

/**
 * @description Test send whatsapp notification
 * @param {Object} param0
 * @param {string} param0.to Tujuan nomor whatsapp | group id
 * @param {string} param0.whatsappNode Whatsapp node id
 * @returns {Promise<string>} Response message from server
 */
export async function testSend({ to, whatsappNode }) {
  const { data } = await http.post('/callback-test', { to, whatsappNode });
  return data.message;
}
