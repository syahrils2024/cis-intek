import axios from '@commons/axios';

const APIURL = import.meta.env.VITE_API_URL;
const BASEURL = `${APIURL}/admin/duo-date-charge`;

/**
 * @typedef {Object} DuoDateCharge
 * @property {string} _id
 * @property {string} name
 * @property {number} charge
 */

/**
 *
 * @returns {Promise<DuoDateCharge>}
 */
export const findAll = async () => {
  const { data } = await axios.get(BASEURL);
  return data.message;
};

/**
 * @param {DuoDateCharge} body
 * @returns {Promise<void>}
 */
export const insert = async (body) => {
  const { data } = await axios.post(BASEURL, body);
  return data.message;
};

/**
 * @param {DuoDateCharge} body
 * @returns {Promise<void>}
 */
export const update = async (id, body) => {
  const { data } = await axios.post(`${BASEURL}/${id}`, body);
  return data.message;
};

/**
 * @param {DuoDateCharge} body
 * @returns {Promise<void>}
 */
export const remove = async (id) => {
  const { data } = await axios.delete(`${BASEURL}/${id}`);
  return data.message;
};
