import axios from 'axios';
import { interceptAxiosRequest } from '@commons/axios';

const APIURL = import.meta.env.VITE_API_NETWORK_MONITORING_URL;

const http = axios.create({
  baseURL: APIURL,
});
http.interceptors.request.use(interceptAxiosRequest);

// #region NetworkMonitoringDevice

/**
 * @typedef {Object} NetworkMonitoringDevicePrimaryIpStatus
 * @property {string} ip_address
 * @property {string} [label]
 * @property {string} [last_pinged_at]
 * @property {number} [response_time_ms]
 */

/**
 * @typedef {Object} NetworkMonitoringDeviceSecondaryIpStatus
 * @property {string} id
 * @property {string} ip_address
 * @property {string} [label]
 * @property {string} [last_pinged_at]
 * @property {number} [response_time_ms]
 */

/**
 * @typedef {Object} NetworkMonitoringDevice
 * @property {string} id
 * @property {string} ip_address
 * @property {string} ip_label
 * @property {string} alias
 * @property {string} [parent_id]
 * @property {string} [group_id]
 * @property {string} category
 * @property {description} [description]
 * @property {string} last_status
 * @property {string} last_pinged_at
 * @property {number} last_response_time_ms
 * @property {NetworkMonitoringDevicePrimaryIpStatus} primary_ip_status
 * @property {NetworkMonitoringDeviceSecondaryIpStatus[]} secondary_ip_addresses
 * @property {string} [icon]
 */

/**
 * @typedef {Object} NetworkMonitoringDeviceLegacy
 * @property {string} id
 * @property {string} ip_address
 * @property {string} alias
 * @property {string|null} parent_id
 * @property {string} created_at
 * @property {string} updated_at
 * @property {string} last_status
 * @property {string} last_pinged_at
 * @property {number} last_response_time_ms
 * @property {string} group_id
 * @property {string} description
 * @property {string} [category]
 * @property {string} [icon]
 */

/**
 * @typedef {Object} NetworkMonitoringDevicePingRecords
 * @property {string} deviceId
 * @property {string} ipAddress
 * @property {'primary'|'secondary'} ipRole
 * @property {string|null} secondaryIpId - terisi hanya jika ipRole === 'secondary'
 * @property {string} status
 * @property {string} pingedAt
 * @property {number} [responseTimeMs]
 */

/**
 * @typedef {Object} NetworkMonitoringDeviceSecondaryIpRequest
 * @property {string} [id] - Existing secondary IP ID (for updates)
 * @property {string} ip_address - Secondary IP address
 * @property {string} [label] - Optional description for the secondary IP
 */

/**
 * @typedef {Object} NetworkMonitoringDeviceRequest
 * @property {string} ip_address
 * @property {string} alias
 * @property {string|null} parent_id
 * @property {string} group_id
 * @property {string} description
 * @property {string} [category]
 * @property {string} [icon]
 * @property {NetworkMonitoringDeviceSecondaryIpRequest[]} [secondary_ip_addresses]
 */

/**
 * @typedef {Object} NetworkMonitoringIcon
 * @property {string} name
 * @property {'connected' | 'disconnected' | 'unknown'} states
 */

/**
 * @typedef {Object} NetworkMonitoringSLARecord
 * @property {string} deviceId
 * @property {string} ipAddress
 * @property {string} pingedAt
 * @property {string} status
 * @property {number} [responseTimeMs]
 * @property {number} value
 */

/**
 * @typedef {Object} NetworkMonitoringSLAResponse
 * @property {Object} sla
 * @property {string} sla.deviceId
 * @property {string} sla.ipAddress
 *
 * @property {Object} sla.window
 * @property {string} sla.window.start
 * @property {string} sla.window.end
 *
 * @property {Object} sla.totals
 * @property {number} sla.totals.upDurationMs
 * @property {number} sla.totals.downDurationMs
 * @property {number} sla.totals.totalDurationMs
 * @property {number} sla.totals.upPercentage
 * @property {number} sla.totals.downPercentage
 *
 * @property {Object[]} sla.stateChanges
 * @property {string} sla.stateChanges.from - Date timestamp
 * @property {string} sla.stateChanges.to - Date timestamp
 * @property {string} sla.stateChanges.status - 'connected' or 'disconnected'
 * @property {number} sla.stateChanges.durationMs - Duration in milliseconds
 *
 * @property {NetworkMonitoringSLARecord[]} records
 */

/**
 * @description Fetch all network monitoring devices
 * @param {Object} [options]
 * @param {string} [options.group] Optional group id to filter devices by group
 * @returns {Promise<NetworkMonitoringDevice[]>}
 */
export async function getDevices({ group }) {
  const { data } = await http.get('/devices', { params: { group } });
  return data;
}

/**
 * @description Add a new network monitoring device
 * @param {NetworkMonitoringDeviceRequest} deviceRequest
 * @returns {Promise<NetworkMonitoringDevice>}
 */
export async function addDevice(deviceRequest) {
  const { data } = await http.post('/devices', deviceRequest);
  return data;
}

/**
 * @description Update an existing network monitoring device
 * @param {string} id
 * @param {Partial<NetworkMonitoringDeviceRequest>} deviceRequest
 * @returns {Promise<NetworkMonitoringDevice>}
 */
export async function updateDevice(id, deviceRequest) {
  const { data } = await http.put(`/devices/${id}`, deviceRequest);
  return data;
}

/**
 * @description Delete a network monitoring device
 * @param {string} id
 * @returns {Promise<void>}
 */
export async function deleteDevice(id) {
  await http.delete(`/devices/${id}`);
}

/**
 * Get SLA data for a specific device within a given time range.
 * @param {string} id - DeviceId
 * @param {Object} options
 * @param {string} [options.start] - Start date for SLA data (ISO 8601 format)
 * @param {string} [options.end] - End date for SLA data (ISO 8601 format)
 * @param {string} [options.ipAddress] - specific IP address to filter SLA data (optional)
 * @returns {Promise<NetworkMonitoringSLAResponse>}
 */
export async function getSlaDevice(id, options) {
  const { data } = await http.get(`/devices/${id}/sla`, { params: options });
  return data;
}

// #endregion

// #region Network Monitoring Groups

/**
 * @typedef {Object} NetworkMonitoringGroup
 * @property {string} id
 * @property {string} name
 * @property {string} created_at
 * @property {string} updated_at
 */

/**
 * @typedef {Object} NetworkMonitoringGroupRequest
 * @property {string} name
 */

/**
 * @description Fetch all network monitoring groups
 * @returns {Promise<NetworkMonitoringGroup[]>}
 */
export async function getGroups() {
  const { data } = await http.get('/groups');
  return data;
}

/**
 * @description Add a new network monitoring group
 * @param {NetworkMonitoringGroupRequest} groupRequest
 * @returns {Promise<NetworkMonitoringGroup>}
 */
export async function addGroup(groupRequest) {
  const { data } = await http.post('/groups', groupRequest);
  return data;
}

/**
 * @description Update an existing network monitoring group
 * @param {string} id
 * @param {NetworkMonitoringGroupRequest} groupRequest
 * @returns {Promise<NetworkMonitoringGroup>}
 */
export async function updateGroup(id, groupRequest) {
  const { data } = await http.put(`/groups/${id}`, groupRequest);
  return data;
}

/**
 * @description Delete a network monitoring group
 * @param {string} id
 * @returns {Promise<void>}
 */
export async function deleteGroup(id) {
  await http.delete(`/groups/${id}`);
}

// #endregion

// #region Network Monitoring Icons

/**
 * @description Fetch all network monitoring icons
 * @returns {Promise<NetworkMonitoringIcon[]>}
 */
export async function getIcons() {
  const { data } = await http.get('/icons');
  return data;
}

/**
 * @description Fetch a network monitoring icon by name and state
 * @param {string} name
 * @param {'connected' | 'disconnected' | 'unknown'} [state]
 * @returns {Promise<Blob>} The icon image as a Blob
 */
export async function getIconByName(name, state) {
  const { data } = await http.get(`/icons/${name}`, { params: { state }, responseType: 'blob' });
  return data;
}

// #endregion
