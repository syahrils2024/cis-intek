import axios from '@commons/axios';

const APIURL = import.meta.env.VITE_API_URL;
const BASEURL = `${APIURL}/admin/duitku-secret`;

/**
 * @typedef {Object} DuitkuSecret
 * @property {string} _id
 * @property {string} secretName
 * @property {string} merchantCode
 * @property {string} merchantKey
 * @property {string} createdAt
 * @property {Object[]} areas
 * @property {string} areas._id
 * @property {string} areas.title
 */

/**
 * @typedef {Object} DuitkuSecretResponse
 * @property {number} total
 * @property {DuitkuSecret[]} data
 */

/**
 * @typedef {Object} DuitkuSecretRequest
 * @property {string} secretName
 * @property {string} merchantCode
 * @property {string} merchantKey
 * @property {string[]} areaIds
 */

/**
 * Fetch duitku secrets with pagination and search.
 * @returns {Promise<DuitkuSecretResponse>}
 */
export async function findAll({ page = 0, limit = 10, search = '' } = {}) {
  const { data } = await axios.get(BASEURL, {
    params: { page, limit, search },
  });
  return data.message;
}

/**
 * Create a new duitku secret.
 * @param {DuitkuSecretRequest} body
 * @returns {Promise<string>}
 */
export async function create(body) {
  const { data } = await axios.post(BASEURL, body);
  return data.message;
}

/**
 * Fetch a duitku secret by ID.
 * @param {string} id
 * @returns {Promise<DuitkuSecret>}
 */
export async function detail(id) {
  const { data } = await axios.get(`${BASEURL}/${id}`);
  return data.message;
}

/**
 * Update a duitku secret by ID.
 * @param {string} id
 * @param {DuitkuSecretRequest} body
 * @returns {Promise<string>}
 */
export async function update(id, body) {
  const { data } = await axios.put(`${BASEURL}/${id}`, body);
  return data.message;
}

/**
 * Remove a duitku secret by ID.
 * @param {string} id
 * @returns {Promise<string>}
 */
export async function remove(id) {
  const { data } = await axios.delete(`${BASEURL}/${id}`);
  return data.message;
}
