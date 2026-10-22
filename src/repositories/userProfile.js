import axios from '@commons/axios';

const APIURL = import.meta.env.VITE_API_URL;
const BASEURL = `${APIURL}/admin/user-profile`;

/**
 * @typedef {object} ProfilePermission
 * @property {boolean} allowEditUser
 * @property {boolean} allowCreateUser
 * @property {boolean} allowEditAreaConfig
 * @property {boolean} allowCreateAreaConfig
 * @property {boolean} allowEditBilling
 * @property {boolean} allowSimplePSB
 * @property {boolean} allowAccessWhatsappPanel
 * @property {boolean} allowAccessNetworkMonitoring
 * @property {boolean} allowEditNetworkMonitoring
 */

/**
 * @typedef {object} UserProfile
 * @property {string} _id
 * @property {string} title
 * @property {string[]} areas
 * @property {ProfilePermission} permission
 * @property {object} [areaData]
 * @property {string} areaData._id
 * @property {string} areaData.title
 * @property {string[]} [networkMonitoringGroupId]
 */

/**
 * @typedef {object} UserProfileRequest
 * @property {string} title
 * @property {string[]} areas
 * @property {ProfilePermission} permission
 * @property {string[]} [networkMonitoringGroupId]
 */

/**
 *
 * @returns {Promise<UserProfile[]>}
 */
export async function list() {
  const { data } = await axios.get(BASEURL);
  return data.message;
}

/**
 *
 * @returns {Promise<UserProfile>}
 */
export async function findOne(id) {
  const { data } = await axios.get(`${BASEURL}/${id}`);
  return data.message;
}

/**
 * @param {string} id
 * @param {UserProfileRequest} body
 * @returns {Promise<UserProfile>}
 */
export async function update(id, body) {
  const { data } = await axios.post(`${BASEURL}/${id}`, body);
  return data.message;
}

/**
 * @param {UserProfileRequest} body
 * @returns {Promise<UserProfile>}
 */
export async function submit(body) {
  const { data } = await axios.post(`${BASEURL}`, body);
  return data.message;
}

/**
 * @param {string} id
 * @returns {Promise<string>}
 */
export async function remove(id) {
  const { data } = await axios.delete(`${BASEURL}/${id}`);
  return data.message;
}
