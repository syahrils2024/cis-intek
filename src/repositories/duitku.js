import axios from '@commons/axios';

const APIURL = import.meta.env.VITE_API_URL;
const BASEURL = `${APIURL}/admin/duitku`;

/**
 * @typedef {Object} DuitkuFee
 * @property {string} _id - The unique identifier for the Duitku fee record
 * @property {string} code - The payment method code (e.g., "VA" for Virtual Account)
 * @property {string} paymentName - The display name of the payment method
 * @property {number} fee - The fixed fee amount for this payment method
 * @property {number} feePercentage - The percentage-based fee for this payment method
 * @property {string} imageUrl - The URL of the payment method's image
 * @property {boolean} active - Indicates whether the payment method is active or not
 * @property {number} __v - The version key (MongoDB versioning field)
 */

/**
 * @typedef {Object} UpdateDuitkuFeePayload
 * @property {number} fee - The fixed fee amount for this payment method
 * @property {number} feePercentage - The percentage-based fee for this payment method
 * @property {string} imageUrl - The URL of the payment method's image
 * @property {string} paymentName - The display name of the payment method
 * @property {string} code - The payment method code (e.g., "VA" for Virtual Account)
 * @property {boolean} [active] - Indicates whether the payment method is active or not (optional)
 */

/**
 * Fetches the Duitku fees from the API.
 * @returns {Promise<DuitkuFee[]>}
 */
export async function getFee() {
  const url = `${BASEURL}/fee`;
  const { data } = await axios.get(url);
  return data.data;
}

/**
 * Updates a specific Duitku fee by its ID.
 * @param {UpdateDuitkuFeePayload} body - The payload containing the updated fee details.
 * @returns {Promise<DuitkuFee>}
 */
export async function updateFee(body) {
  const url = `${BASEURL}/fee`;
  const { data } = await axios.patch(url, body);
  return data.data;
}
