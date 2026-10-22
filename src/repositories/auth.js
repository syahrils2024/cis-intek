import { UAParser } from 'ua-parser-js';

import axios from 'src/commons/axios';

const BASEURL = import.meta.env.VITE_API_URL;

/**
 * @typedef {object} CurrentUserPermission
 * @property {boolean} allowCreateUser
 * @property {boolean} allowEditUser
 * @property {boolean} allowCreateAreaConfig
 * @property {boolean} allowEditAreaConfig
 * @property {boolean} allowEditBilling
 * @property {boolean} allowShowFinanceData
 * @property {boolean} allowSimplePSB
 * @property {boolean} allowAccessWhatsappPanel
 * @property {boolean} allowAccessNetworkMonitoring
 * @property {boolean} allowEditNetworkMonitoring
 */

/**
 * @typedef {object} CurrentAuth
 * @property {string[]} areas
 * @property {string} registrationDate
 * @property {string} _id
 * @property {string} email
 * @property {string} phone
 * @property {string} fullname
 * @property {string} address
 * @property {string} status
 * @property {string[]} privilege
 * @property {CurrentUserPermission} [permission]
 * @property {string[]} [networkMonitoringGroupId]
 * @property {object} defaultData
 * @property {string} defaultData.transferDepositMethodId
 * @property {string} defaultData.cashDepositMethodId
 * @property {string} profile
 */

/**
 * Getting Access From Authentication Login
 * @param {string} email
 * @param {string} password
 *
 * @typedef {object} authResponse
 * @property {string} token
 * @property {string} urlPrefix
 * @property {object} info
 * @property {string} info.registrationDate
 * @property {string} info._id
 * @property {string} info.email
 * @property {string} info.phone
 * @property {string} info.fullname
 * @property {string} info.address
 * @property {string} info.status
 * @property {string[]} info.privilege
 * @property {string} info.password
 * @property {number} info.__v
 *
 * @returns {Promise<authResponse>}
 */
export async function login(email, password) {
  const body = { email, password };
  const response = await axios.post(`${BASEURL}/auth`, body);
  return response.data.message;
}

/**
 * Login with OTP
 * fill otp to validate otp
 * @param {{email: string; otp: string}} param0
 * @returns {Promise<{token: string} extends authResponse>}
 */
export async function loginOtp({ email, otp }) {
  const userAgent = new UAParser();
  const uaResult = userAgent.getResult().ua;
  const body = { email, otp };
  const { data } = await axios.post(`${BASEURL}/auth-otp`, body);
  return data.message;
}

/**
 * @returns {Promise<CurrentAuth>}
 */
export const getCurrentUser = async () => {
  const { data } = await axios.get(`${BASEURL}/me`);
  return data.message;
};

/**
 * @param {CurrentAuth} body
 * @returns {Promise<void>}
 */
export const updateCurrentUser = async (body) => {
  const { data } = await axios.post(`${BASEURL}/me`, body);
  return data.message;
};

export async function logout() {
  await axios.post(`${BASEURL}/logout`);
}
