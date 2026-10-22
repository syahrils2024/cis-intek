import axios from '@commons/axios';

const APIURL = import.meta.env.VITE_API_URL;
const BASEURL = `${APIURL}/admin/user-wallet`;

/**
 * @typedef {Object} UserWallet
 * @property {string} _id - The unique identifier of the user wallet.
 * @property {string} email - The email address of the user.
 * @property {string} phone - The phone number of the user.
 * @property {string} fullname - The full name of the user.
 * @property {number} balance - The current balance in the user's wallet.
 */

/**
 * @typedef {Object} UserWalletLog
 * @property {string} _id - The unique identifier of the wallet log.
 * @property {string} actionUser - The ID of the user who performed the action.
 * @property {string} user - The ID of the user whose wallet was affected.
 * @property {number} amount - The amount of the transaction (positive or negative).
 * @property {"WITHDRAWAL"|"DEPOSIT"} type - The type of transaction.
 * @property {string} description - A description of the transaction.
 * @property {string} createdAt - The timestamp when the transaction was created.
 * @property {number} __v - The version key of the document.
 * @property {string} actionUserFullname - The full name of the user who performed the action.
 * @property {string} actionUserPhone - The phone number of the user who performed the action.
 * @property {string} actionUserEmail - The email address of the user who performed the action.
 * @property {number} lastBalance - The balance of the wallet before the transaction was applied.
 * @property {string[]} evidences - An array of URLs pointing to evidence files related to the transaction.
 */

/**
 * @typedef {Object} WithdrawRequest
 * @property {string} userId - The ID of the user requesting the withdrawal.
 * @property {number} amount - The amount to withdraw.
 * @property {string} description - A description of the withdrawal request.
 * @property {File[]} evidences - An array of files serving as evidence for the withdrawal request.
 */

/**
 * Get the list of user wallets.
 * @param {"engineer" | "admin"} privilege
 * @returns {Promise<UserWallet[]>} An array of user wallets.
 */
export async function getUserWalletList(privilege) {
  const url = `${BASEURL}`;
  const { data } = await axios.get(url, { params: { privilege } });
  return data.message;
}

/**
 * Get the wallet logs for a specific user within a specified date range.
 * @param {object} options
 * @param {string} options.userId - The ID of the user whose wallet logs to retrieve.
 * @param {string} options.start - The start of date
 * @param {string} options.until - The end of date
 * @returns {Promise<{data: UserWalletLog[]; total: number}>}
 */
export async function getUserWalletLog(options) {
  const url = `${BASEURL}/log`;
  const { data } = await axios.get(url, { params: options });
  return data.message;
}

/**
 * Withdraw a specified amount from the user's wallet.
 * @param {WithdrawRequest} body
 */
export async function withdraw(body) {
  const url = `${BASEURL}/withdraw`;

  const fd = new FormData();
  fd.append('userId', body.userId);
  fd.append('amount', body.amount);
  fd.append('description', body.description);
  body.evidences.forEach((file, i) => fd.append(`evidences`, file));

  await axios.patch(url, fd, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}

/**
 * Sync the user wallet balance and get result
 * @param {string} userId
 * @returns {Promise<UserWallet>} the updated user wallet data after syncing balance
 */
export async function syncBalance(userId) {
  const url = `${BASEURL}/sync-balance/${userId}`;
  const { data } = await axios.patch(url);
  return data.message;
}
