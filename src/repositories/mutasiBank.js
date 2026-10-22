import axios from '@commons/axios';

/**
 * Interface representing a Mutasi Bank Transaction.
 *
 * @typedef {object} MutasiBankTransaction
 * @property {number} id - The unique identifier for the transaction.
 * @property {number} amount - The amount of the transaction.
 * @property {string} description - The description of the transaction.
 * @property {string} type - The type of the transaction (e.g., debit, credit).
 * @property {string} transaction_date - The date of the transaction.
 * @property {string} system_date - The date the transaction was recorded in the system.
 */
/**
 * Interface representing a Mutasi Bank Account.
 *
 * @typedef {object} IMutasiBankAccount
 * @property {number} id - The unique identifier for the bank account.
 * @property {string} bank - The name of the bank.
 * @property {string} module - The module associated with the bank account.
 * @property {string} account_no - The account number.
 * @property {string} account_name - The name associated with the bank account.
 * @property {number} balance - The current balance of the bank account.
 * @property {string} last_bot_activity - The timestamp of the last bot activity.
 * @property {string} next_bot_process - The timestamp of the next bot process.
 * @property {string} url_callback - The URL for callback notifications.
 * @property {number} is_active - The status of the bank account (active or inactive).
 */

const APIURL = import.meta.env.VITE_API_URL;

const BASE_URL = `${APIURL}/admin/mutasi-bank`;

/**
 * Get Daftar Rekening Mutasi Bank
 * @returns {Promise<IMutasiBankAccount[]>}
 */
export async function accountList() {
  const { data } = await axios.get(`${BASE_URL}/accounts`);
  return data.message;
}

/**
 * Validasi Data Transaksi
 * @param {*} transactionId
 * @returns {Promise<MutasiBankTransaction>}
 */
export async function validateTransaction(transactionId) {
  const { data } = await axios.get(`${APIURL}/validate/${transactionId}`);
  return data.message;
}
