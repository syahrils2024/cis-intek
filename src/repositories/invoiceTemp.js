import axios from 'src/commons/axios';

const BASEURL = import.meta.env.VITE_API_URL;

/**
 * @typedef {import("./customer").Customer} Customer
 * @typedef {import('./subscription').SubmitPaymentRequest} SubmitPaymentRequest
 */

/**
 * @typedef {object} InvoiceTemp
 * @property {string} _id
 * @property {string[]} paymentEvidences
 * @property {object[]} items
 * @property {string} items._id
 * @property {number} items.amount
 * @property {string} items.billing
 * @property {string} items.status
 * @property {number} items.month
 * @property {number} items.year
 * @property {array[]|string[]} items.services
 * @property {string} items.summaryPeriode
 * @property {string} date
 * @property {string} paymentMethod
 * @property {string} depositMethod
 * @property {string} recipient
 * @property {string} customer
 * @property {string} status
 * @property {number} amount
 * @property {number} duoDateCharge
 * @property {number} __v
 * @property {string} createdUser
 * @property {string} createdUserFullname
 * @property {string} actionUserFullname
 * @property {string} depositMethodTitle
 * @property {string} [rejectReason]
 * @property {Customer} customerData
 * @property {string} areaTitle
 * @property {string} [note]
 */

/**
 * @param {{
 * status: 'pending' | 'approve' | 'reject';
 * page: number;
 * limit: 0;
 * order: string;
 * orderBy: string;
 * start: string;
 * until: string;
 * requestBy: string;
 * area: string;
 * depositMethod: string;
 * }} params
 * @returns {Promise<{total: number; data: InvoiceTemp}>}
 */
export async function getList({
  status,
  page,
  limit,
  find,
  order,
  orderBy,
  area,
  depositMethod,
  requestBy,
  start,
  until,
} = {}) {
  const url = `${BASEURL}/admin/invoice-temp`;
  const { data } = await axios.get(url, {
    params: {
      status,
      page,
      limit,
      find,
      order,
      orderBy,
      area,
      depositMethod,
      requestBy,
      start,
      until,
    },
  });
  return data.message;
}

/**
 * Get detail of invoice temporary
 * @param {*} invoiceTempId
 * @returns {Promise<InvoiceTemp>}
 */
export async function getDetail(invoiceTempId) {
  const url = `${BASEURL}/admin/invoice-temp/${invoiceTempId}`;
  const { data } = await axios.get(url);
  return data.message;
}

/**
 * @param {*} invoiceTempId
 * @param {boolean} addBalanceToWallet digunakan apakah saat approve uang langsung masuk ke saldo user atau tidak
 */
export async function approve(invoiceTempId, addBalanceToWallet) {
  const url = `${BASEURL}/admin/invoice-temp/approve/${invoiceTempId}`;
  await axios.patch(url, { addBalanceWalletUser: addBalanceToWallet });
}

/**
 * @param {string} invoiceTempId
 */
export async function reject(invoiceTempId, reason) {
  const url = `${BASEURL}/admin/invoice-temp/reject/${invoiceTempId}`;
  await axios.patch(url, { reason });
}

/**
 * @param {SubmitPaymentRequest} body
 * @return {Promise<void>}
 */
export async function submit(body) {
  const url = `${BASEURL}/admin/invoice-temp`;
  const f = new FormData();
  f.append('customer', body.customer);
  f.append('amount', body.amount);
  f.append('date', body.date);
  f.append('time', body.time);
  f.append('paymentMethod', body.paymentMethod);
  f.append('depositMethod', body.depositMethod);
  f.append('duoDateCharge', body.duoDateCharge);
  if (!!body.note) f.append('note', body.note);
  body.billingList.forEach((b, i) => {
    const key = `billingList[${i}]`;
    const value = b;
    f.append(key, value);
  });

  body.paymentEvidence.forEach((p, i) => {
    f.append(`paymentEvidences`, p);
  });

  await axios.post(url, f, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}

/**
 * Update Invoice Temp
 * @param {string} id
 * @param {{depositMethod: string; note: string}} param1
 */
export async function update(id, { depositMethod, note }) {
  const url = `${BASEURL}/admin/invoice-temp/update/${id}`;
  await axios.patch(url, {
    depositMethod,
    note,
  });
}
