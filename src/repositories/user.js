import axios from '@commons/axios';

const APIURL = import.meta.env.VITE_API_URL;
const BASEURL = `${APIURL}/admin/user`;

/** @typedef {object} UserPermission
 * @property {boolean} allowEditUser
 * @property {boolean} allowCreateUser
 */

/** @typedef {object} User
 * @property {string} registrationDate
 * @property {string} _id
 * @property {string} email
 * @property {string} address
 * @property {string} phone
 * @property {string} fullname
 * @property {string} status
 * @property {string[]} privilege
 * @property {string} password
 * @property {string[]} areasTitle
 * @property {string[]} areas
 * @property {UserPermission} [permission]
 * @property {string} [profile]
 * @property {string} [profileTitle]
 * @property {object} defaultData
 * @property {string} defaultData.cashDepositMethodId
 * @property {string} defaultData.transferDepositMethodId
 * @property {string} parentUser
 * @property {number} __v
 */

/**
 * @typedef {Object} UserRequest
 * @property {string} id - The unique identifier for the user.
 * @property {string} area - The area associated with the user.
 * @property {string} email - The user's email address.
 * @property {string} phone - The user's phone number.
 * @property {string} fullname - The user's full name.
 * @property {string} address - The user's address.
 * @property {string} password - The user's password.
 * @property {string} status - The current status of the user (e.g., active, inactive).
 * @property {string[]} privileges - The current status of the user (e.g., active, inactive).
 * @property {boolean} allowEditUser
 * @property {boolean} allowCreateUser
 */

/**
 * @typedef {Object} InfoUser
 * @property {number} invoiceTempPending - The number of pending temporary invoices.
 * @property {number} jobQueuePending - The number of pending jobs in the queue.
 * @property {number} customerTransactionVerify - The number of pending customer transactions.
 * @property {number} ticketPending - The number of pending tickets.
 * @property {number} ticketProcessed - The number of processed tickets.
 * @property {number} ticketWaitingFinishing - The number of tickets waiting to be finished.
 * @property {number} customerPending
 * @property {number} installationRequest
 */

/**
 * @typedef {object} UserCheck
 * @property {boolean} exists
 */

/**
 * @param {'admin' | 'engineer' | 'marketing' | 'liaison_officer'} privilege -- privilege of user
 * @returns {Promise<User[]>}
 */
export const getUserByPrivilege = async (privilege, { area } = {}) => {
  const { data } = await axios.get(`${BASEURL}/${privilege}`, {
    params: { area: area ?? undefined },
  });
  return data.message;
};

/**
 * @param {string} id -- id user
 * @returns {Promise<User>}
 */
export const getUserById = async (id) => {
  const { data } = await axios.get(`${BASEURL}/detail/${id}`);
  return data.message;
};

/**
 * @param {UserRequest} body
 */
export const createUser = async (body) => {
  await axios.post(BASEURL, body);
};

/**
 * @param {string} phone
 * @returns {Promise<UserCheck>}
 */
export const validatePhoneNumber = async (phone) => {
  const { data } = await axios.post(`${BASEURL}/validate-phone-number`, { phone });
  return data.message;
};

/**

 * @param {string} email
 * @returns {Promise<UserCheck>}
 */
export const validateEmail = async (email) => {
  const { data } = await axios.post(`${BASEURL}/validate-email`, { email });
  return data.message;
};

/**
 * Remove User
 * @param {string} id
 * @returns {Promise<void>}
 */
export async function removeUser(id) {
  const { data } = await axios.delete(`${BASEURL}/${id}`);
  return data.message;
}

/**
 * Fetches user information.
 * @returns {Promise<InfoUser>}
 */
export async function getInfo() {
  const { data } = await axios.get(`${BASEURL}/info`);
  return data.message;
}

/**
 * Locks a user account.
 * @param {string} id - The ID of the user to lock.
 * @returns {Promise<string>} - A message indicating the result of the operation.
 */
export async function lockUser(id) {
  const { data } = await axios.patch(`${BASEURL}/${id}/lock`);
  return data.message;
}

/**
 * Unlocks a user account.
 * @param {string} id - The ID of the user to unlock.
 * @returns {Promise<string>} - A message indicating the result of the operation.
 */
export async function unlockUser(id) {
  const { data } = await axios.patch(`${BASEURL}/${id}/unlock`);
  return data.message;
}
