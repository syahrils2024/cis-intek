import axios from '@commons/axios';

/**
 * @typedef {object} CustomerTransactionAdmin
 * @property {string} _id
 * @property {string} [payAt]
 * @property {string} [description]
 * @property {string[]} evidences
 * @property {number} accountId
 * @property {string} module
 * @property {string} accountName
 * @property {string} accountNumber
 * @property {string} accountBank
 * @property {number} amount
 * @property {number} suffixDigit
 * @property {number} totalAmount
 * @property {string} status
 * @property {string} expiredAt
 * @property {string} createdAt
 * @property {string} customer_id
 * @property {string} customerId
 * @property {string} customerFullname
 * @property {string} customerPhone
 * @property {string} customerAddress
 * @property {string} customerArea
 * @property {string} customerAreaTitle
 * @property {string} customerKtp
 * @property {object[]} billings
 * @property {string[]} billings.services
 * @property {number} billings.month
 * @property {number} billings.year
 * @property {number} billings.amount
 * @property {string} [note]
 * @property {string} [actionUser]
 * @property {string} [actionUserFullname]
 * @property {string} [rejectReason]
 * @property {string} [rejectAt]
 * @property {string} [approveAt]
 * @property {string} [summaryPeriode]
 * @property {string} [actionAt]
 * @property {string} [senderName]
 * @property {string} depositMethod
 */

const APIURL = import.meta.env.VITE_API_URL;
const BASEURL = `${APIURL}/admin/customer-transaction`;
const BASEURLV3 = `${APIURL}/v3/customer-transaction-admin`;

/**
 *
 * @param {{start: string; until: string; status: string; area: string; page: number; limit: number; find: string}} param0
 * @returns {Promise<{data: CustomerTransactionAdmin[]; total: number}>}
 */
export async function list({ start, until, status, area, page, limit, find }) {
  const { data } = await axios.get(BASEURL, {
    params: { start, until, status, area, page, limit, find },
  });

  return data.message;
}

/**
 * Get the details of a specific customer transaction by its ID.
 * @param {string} transactionId
 * @returns {Promise<CustomerTransactionAdmin>}
 */
export async function detail(transactionId) {
  const { data } = await axios.get(`${BASEURLV3}/${transactionId}`);
  return data.message;
}

/**
 * Approve Customer Transaction
 * @param {string} transactionId
 */
export async function approve(transactionId, { customerNote, depositMethodId }) {
  await axios.patch(`${BASEURL}/${transactionId}/approve`, { customerNote, depositMethodId });
}

/**
 * Reject Customer Transaction
 * @param {string} transactionId
 * @param {{ rejectReason: string }} param1
 */
export async function reject(transactionId, { rejectReason }) {
  await axios.patch(`${BASEURLV3}/${transactionId}/reject`, { rejectReason });
}

/**
 * Update Transaction Before Approve
 * @param {string} transactionId
 * @param {{depositMethodId: string}} param1
 */
export async function update(transactionId, { depositMethodId }) {
  await axios.patch(`${BASEURL}/${transactionId}/update`, { depositMethodId });
}

/**
 * Update Evidence for a Customer Transaction
 * if mode is 'append', the evidence will be added to the existing evidence; if 'replace', it will replace the existing evidence.
 * @param {string} transactionId
 * @param {object} body
 * @param {File} body.evidences
 * @param {'append' | 'replace'} body.mode
 *
 */
export async function updateEvidence(transactionId, body) {
  const fd = new FormData();
  const keys = Object.keys(body);
  keys.forEach((key) => {
    fd.append(key, body[key]);
  });

  await axios.patch(`${BASEURLV3}/${transactionId}/evidence`, fd, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}
