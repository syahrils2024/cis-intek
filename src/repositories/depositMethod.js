import axios from '@commons/axios';

const APIURL = import.meta.env.VITE_API_URL;
const BASEURL = `${APIURL}/admin/deposit-method`;

/**
 * @typedef {import('./mutasiBank').IMutasiBankAccount} MutasiBankAccount
 */

/** @typedef {object} PaymentMethod
 * @property {string} _id
 * @property {string} paymentMethod
 * @property {string} title
 * @property {string} status
 * @property {boolean} isDefault
 * @property {number} __v
 * @property {string} [mutasiBankId]
 * @property {MutasiBankAccount} [mutasiBankData]
 * @property {string} [bankName]
 * @property {string} [bankNumber]
 * @property {string} [bankUsername]
 * @property {boolean} [showAndroid]
 * @property {boolean} [isManual]
 * @property {boolean} [isAuto]
 * @property {number} [internalCode]
 */

/**
 * @param {'transfer' | 'cash'} method
 * @returns {Promise<PaymentMethod[]>}
 */
export const getPaymentMethod = async (method) => {
  const { data } = await axios.get(`${BASEURL}/${method}`);
  return data.message;
};

/**
 * @param {PaymentMethod} body
 */
export const upsertPaymentMethod = async (body) => {
  const { data } = await axios.post(BASEURL, body);
};

export const removePaymentMethod = async (id) => {
  await axios.delete(`${BASEURL}/${id}`);
};
