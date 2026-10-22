import axios from 'src/commons/axios';
/**
 * @typedef {object} AcsDeviceConnect
 * @property {string} macAddress
 * @property {string} ipAddress
 * @property {string} hostname
 * @property {string} rssi
 * @property {string} frequencyWidth
 * @property {string} noise
 * @property {string} quality
 */

/**
 * @typedef {object} AcsStatus
 * @property {string} lastInform
 * @property {string} acsRegister
 * @property {string} deviceType
 * @property {string} uptime
 * @property {string} hardwareVersion
 * @property {string} manufacture
 * @property {string} linkType
 * @property {string} macAddress
 * @property {string} opticRxPower
 * @property {string} oui
 * @property {string} password
 * @property {string} pppoeIp
 * @property {string} pppoeUsername
 * @property {string} pppoePassword
 * @property {string} serialNumber
 * @property {string} softwareVersion
 * @property {string} ssid
 * @property {string} temperature
 * @property {number} deviceActive
 * @property {AcsSSID[]} ssidList
 * @property {AcsDeviceConnect[]} deviceConnectList
 */

/**
 * @typedef {Object} AcsSSID
 * @property {string} _object
 * @property {string} ssid
 * @property {boolean} autoChannelEnable
 * @property {number} channel
 * @property {number} deviceConnected
 * @property {string} password
 * @property {string} security
 * @property {number} transmitPower
 * @property {boolean} active
 * @property {AcsDeviceConnect[] | null} devices
 */

/**
 * @typedef {Object} AcsUpdateSSID
 * @property {string} ssid
 * @property {string} password
 * @property {boolean} active
 * @property {number} iteration
 */

/**
 * @typedef {object} ACSSecurity
 * @property {string} label - The display label of the security type (e.g., "WPA2").
 * @property {string} value - The value representing the security type (e.g., "WPA/WPA2").
 */

/**
 * @typedef {Object} AcsStatusSummary
 * @property {number} off1Hour
 * @property {number} off24Hours
 * @property {number} off3Days
 * @property {number} off30Minutes
 * @property {number} off7Days
 * @property {number} off1Months
 * @property {number} off3Months
 * @property {number} online
 * @property {number} total
 */

/**
 * @typedef {Object} AcsAreaOnlineStatus
 * @property {string} _id
 * @property {string} title
 * @property {string} prefixCustomer
 * @property {AcsStatusSummary} statusSummary
 * @property {string|null} errorMessage
 * @property {string[] | null} error
 */

const BASEURL = import.meta.env.VITE_API_URL;
const url = `${BASEURL}/admin/acs`;

/**
 *
 * @param {string} customerId
 * @returns {Promise<AcsStatus>}
 */
export async function getStatus(customerId) {
  const u = `${url}/status/${customerId}`;
  const { data } = await axios.get(u);
  return data.message;
}

/**
 * Summon the device to inform the ACS server
 * @param {string} customerId
 * @returns
 */
export async function summon(customerId) {
  const u = `${url}/summon/${customerId}`;
  const { data } = await axios.patch(u);
  return data.message;
}

/**
 * Reboot router customer from ACS Server
 * @param {string} customerId
 * @returns
 */
export async function reboot(customerId) {
  const u = `${url}/reboot/${customerId}`;
  const { data } = await axios.patch(u);
  return data.message;
}

/**
 *
 * @param {string} customerId
 * @param {AcsUpdateSSID} body
 * @returns
 */
export async function updateSSID(customerId, body) {
  const u = `${url}/update-ssid/${customerId}`;
  const { data } = await axios.patch(u, body);
  return data.message;
}

/**
 * Get available security types for ACS devices
 * @returns {Promise<ACSSecurity[]>}
 */
export async function getSecurityList() {
  const u = `${url}/security-list`;
  const { data } = await axios.get(u);
  return data.message;
}

/**
 * Get online status summary for an area
 * @param {string} areaId Area Category ID or Area ID
 * @returns {Promise<AcsAreaOnlineStatus[]>}
 */
export async function getOnlineStatus(areaId) {
  const u = `${url}/online-status/${areaId}`;
  const { data } = await axios.get(u);
  return data.message;
}
