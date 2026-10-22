import axios from '@commons/axios';

const APIURL = import.meta.env.VITE_API_URL;
const BASEURL = `${APIURL}/admin/duitku-fee-profile`;

/** @typedef {import('./duitku').DuitkuFee} DuitkuFee */

/**
 * @typedef {Object} DuitkuFeeProfile
 * @property {string} _id
 * @property {string} name
 * @property {Object[]} area
 * @property {string} area._id
 * @property {string} area.title
 * @property {DuitkuFee[]} fees
 */

/**
 * @typedef {Object} DuitkuFeeProfileResponse
 * @property {number} total
 * @property {DuitkuFeeProfile[]} data
 */

/**
 * @typedef {Object} DuitkuFeeProfileFeeRequest
 * @property {string} code - The payment method code (e.g., "VA" for Virtual Account)
 * @property {string} paymentName - The display name of the payment method
 * @property {number} [fee=0] - The fixed fee amount for this payment method (nullable and optional)
 * @property {number} [feePercentage=0] - The percentage-based fee for this payment method (nullable and optional)
 * @property {string|null} [imageUrl=null] - The URL of the payment method's image (nullable and optional)
 * @property {boolean} [active=true] - Indicates whether the payment method is active or not (optional)
 */

/**
 * @typedef {Object} DuitkuFeeProfileRequest
 * @property {string} profileName - The name of the fee profile
 * @property {string[]} areaIds - An array of area IDs associated with the fee profile
 * @property {DuitkuFeeProfileFeeRequest[]} fees - An array of fee objects associated with the fee profile
 */

/**
 * Find all Fee Profiles
 * @param {Object} params
 * @param {number} params.page
 * @param {number} params.limit
 * @returns {Promise<DuitkuFeeProfileResponse>}
 */
export async function findAll({ page, limit }) {
  const { data } = await axios.get(BASEURL, {
    params: {
      page,
      limit,
    },
  });
  return data.message;
}

/** @returns {Promise<DuitkuFeeProfile>} */
export async function findDetail(id) {
  const { data } = await axios.get(`${BASEURL}/${id}`);
  return data.message;
}

/**
 * Create Fee Profile
 * @param {DuitkuFeeProfileRequest} body
 * @returns {Promise<string>}
 */
export async function create(body) {
  const { data } = await axios.post(BASEURL, body);
  return data.message;
}

/**
 *
 * @param {string} id
 * @param {DuitkuFeeProfileRequest} body
 * @returns {Promise<string>}
 */
export async function update(id, body) {
  const { data } = await axios.put(`${BASEURL}/${id}`, body);
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
