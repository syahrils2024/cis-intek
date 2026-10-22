import axios from 'src/commons/axios';

const BASEURL = import.meta.env.VITE_API_URL;

/**
 * @typedef {Object} OltDevice
 * @property {string} ipAddress - The IP address of the OLT device
 * @property {number} port - The port number for the OLT device
 * @property {string} communityWrite - SNMP community write string
 * @property {string} communityRead - SNMP community read string
 * @property {string|null} deviceName - The name of the device
 * @property {string|null} deviceModel - The model of the device
 * @property {string} area - Reference to the area ObjectId
 * @property {string} areaTitle - Area title
 * @property {string} areaCategory - Creation timestamp
 * @property {string} _id - MongoDB document ID
 */

/**
 * @typedef {Object} OltDeviceRequest
 * @property {string} ipAddress - The IP address of the OLT device
 * @property {number} port - The port number for the OLT device
 * @property {string} communityWrite - SNMP community write string
 * @property {string} communityRead - SNMP community read string
 * @property {string} area - Reference to the area ObjectId
 * @property {string} deviceName - The name of the device
 */

/**
 * @typedef {Object} OltDeviceQueryResult
 * @property {number} Id
 * @property {string} IpAddress
 * @property {string} DeviceName
 * @property {string} DeviceModel
 */

/**
 * @typedef {Object} DuplicatedOnuData
 * @property {string} SerialNumber
 * @property {string} OltIpAddress
 * @property {number} OltPort
 * @property {string} OltDeviceName
 * @property {string} OltModel
 */

/**
 * @typedef {Object} UnbindSerialNumber
 * @property {string} SerialNumber
 * @property {string} OltAddress
 * @property {number} OltPort
 * @property {string} OltName
 * @property {string} OltModel
 */

/**
 * Fetch all OLT devices
 * @returns {Promise<OltDevice[]>}
 */
export async function findOltDevice() {
  const url = `${BASEURL}/admin/olt-device`;
  const { data } = await axios.get(url);
  return data.message;
}

/**
 * Fetch a single OLT device by ID
 * @param {*} id
 * @returns {Promise<OltDevice>}
 */
export async function findOneOltDevice(id) {
  const url = `${BASEURL}/admin/olt-device/${id}`;
  const { data } = await axios.get(url);
  return data.message;
}

/**
 * Update an existing OLT device
 * @param {OltDeviceRequest} payload
 * @returns {Promise<string>}
 */
export async function createOltDevice(payload) {
  console.log('create');
  const url = `${BASEURL}/admin/olt-device`;
  const { data } = await axios.post(url, payload);
  return data.message;
}

/**
 * Delete an OLT device by ID
 * @param {string} id
 * @param {Promise<string>} payload
 * @returns
 */
export async function updateOltDevice(id, payload) {
  console.log('update');
  const url = `${BASEURL}/admin/olt-device/${id}`;
  const { data } = await axios.patch(url, payload);
  return data.message;
}

/**
 * Delete an OLT device by ID
 * @param {string} id
 * @returns {Promise<string>}
 */
export async function deleteOltDevice(id) {
  const url = `${BASEURL}/admin/olt-device/${id}`;
  const { data } = await axios.delete(url);
  return data.message;
}

/**
 * Query OLT device information
 * @param {string} id
 * @returns {Promise<OltDeviceQueryResult[]>}
 */
export async function queryOltDevice(id) {
  const url = `${BASEURL}/admin/olt-device/query/${id}`;
  const { data } = await axios.get(url);
  return data.message;
}

/**
 * Find duplicated ONU data across OLT devices
 * @returns {Promise<DuplicatedOnuData[]>}
 */
export async function findDuplicatedOnuData() {
  const url = `${BASEURL}/admin/olt-device/duplicated-onu`;
  const { data } = await axios.get(url);
  return data.message;
}

/**
 * Rebuild ONU database by rescanning all OLT devices
 * @returns
 */
export async function rebuildOnuDatabase(oltId) {
  const url = `${BASEURL}/admin/olt-device/${oltId}/rebuild`;
  const { data } = await axios.patch(url);
  return data.message;
}

/**
 * Get unbind serial numbers from OLT devices
 * @returns {Promise<UnbindSerialNumber[]>}
 */
export async function getUnbindSerialNumber() {
  const url = `${BASEURL}/admin/olt-device/unbind-serial-number`;
  const { data } = await axios.get(url);
  return data.message;
}
