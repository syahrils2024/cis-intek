import axios from '@commons/axios';

/**
 * @typedef {import("./depositMethod").PaymentMethod} PaymentMethod
 * @typedef {import('./subscription').Billing} Billing
 */

/**
 * @typedef {Object} ICustomerTransaction
 * @property {{billing: string; amount: number}[]} billings - List of billings with billing name and amount
 * @property {number} accountId - Mutasi Bank Account ID
 * @property {string} module - Mutasi Bank Module (nama bank)
 * @property {string} accountName - Mutasi bank (rekening penerima)
 * @property {string} accountNumber - Mutasi bank (nomor rekening penerima)
 * @property {number} amount - Jumlah Pembayaran
 * @property {number} totalAmount - Jumlah Pembayaran + Suffix Digit
 * @property {number} suffixDigit - Digit belakang nominal
 * @property {string} [accountBank]
 * @property {"cancel" | "expired" | "paid" | "verify" | "unpaid" | string} status - Status of the transaction
 * @property {string} expiredAt - Expiration date of the transaction
 * @property {string} [payAt] - Payment date of the transaction
 * @property {string | null} description - Description of the transaction
 * @property {string} customerId - Customer ID
 * @property {string[]} evidences - List of evidence URLs
 */

/**
 * @typedef {Object} CustomerTransactionCreate
 * @property {string[]} billings
 * @property {string} customer_id
 * @property {string} depositMethodId
 */

/**
 * @typedef {Object} ICheckCustomerResponse
 * @property {string} _id
 * @property {string} customerId
 * @property {string} fullname
 * @property {string} phone
 * @property {string} address
 * @property {string} areaName
 * @property {string} status
 * @property {string} [companyName]
 * @property {string} [companyLogo]
 * @property {string} [companyAddress]
 */

const APIURL = import.meta.env.VITE_API_URL;
const BASE_URL = `${APIURL}/customer-transaction`;
const BASE_URL_V3 = `${APIURL}/v3/customer-transaction`;

/**
 *
 * @param {*} search - customer id | phone
 * @returns {Promise<ICheckCustomerResponse>}
 */
export async function checkCustomer(search) {
  const { data } = await axios.get(`${BASE_URL}/customer/${search}`);
  return data.message;
}

/**
 * Get Available Deposit Method
 * @returns {Promise<PaymentMethod[]>}
 */
export async function availableDepositMethod() {
  const { data } = await axios.get(`${BASE_URL}/deposit-method`);
  return data.message;
}

/**
 * Get Billing Customer
 * @param {*} customerId
 * @returns {Promise<Billing[]>}
 */
export async function getBillingList(customerId) {
  const { data } = await axios.get(`${BASE_URL}/billing/${customerId}`);
  return data.message;
}

/**
 * Get Billing Customer
 * @param {*} customerId
 * @returns {Promise<ICustomerTransaction>}
 */
export async function getActiveTransaction(customerId) {
  const { data } = await axios.get(`${BASE_URL}/active/${customerId}`);
  return data.message;
}

/**
 * Create Customer Transaction
 * @param {CustomerTransactionCreate} body
 * @returns {Promise<ICustomerTransaction>}
 */
export async function createTransaction(body) {
  const { data } = await axios.post(BASE_URL, body);
  return data.message;
}

/**
 * Cancel Transaction
 * @param {*} param0
 * @returns {Promise<ICustomerTransaction>}
 */
export async function cancelTransaction({ customer_id, transactionId } = {}) {
  const { data } = await axios.patch(`${BASE_URL}/cancel`, { customer_id, transactionId });
  return data.message;
}

/**
 * Upload Evidences
 * @param {{_id: string; files: File[]}} param0
 * @returns {Promise<ICustomerTransaction>}
 */
export async function uploadEvidences({ _id, files } = {}) {
  const fd = new FormData();
  fd.append('_id', _id);
  files.forEach((f, i) => {
    fd.append(`evidences`, f);
  });

  const { data } = await axios.patch(`${BASE_URL}/uploads`, fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return data.message;
}
