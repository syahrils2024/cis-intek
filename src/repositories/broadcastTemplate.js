import axios from 'src/commons/axios';

const APIURL = import.meta.env.VITE_API_URL;
const BASEURL = `${APIURL}/admin/broadcast-template`;

/** @typedef {object} BroadcastTemplate
 * @property {string} _id
 * @property {string} title
 * @property {string} notificationTitle
 * @property {string} content
 * @property {string} createdAt
 * @property {string} updatedAt
 * @property {number} __v
 * @returns {Promise<BroadcastTemplate[]>}
 */
export const getBroadcastTemplate = async () => {
  const { data } = await axios.get(BASEURL);
  return data.message;
};

/**
 * @typedef {object} BroadcastTemplateRequest
 * @property {string | undefined} _id
 * @property {string} title
 * @property {string} content
 * @param {BroadcastTemplateRequest} data
 */
export const insertBroadcastTemplate = async (body) => {
  const { data } = await axios.post(BASEURL, body);
  return data;
};

/**
 * @param {string} id
 */
export const removeTemplate = async (id) => {
  await axios.delete(`${BASEURL}/${id}`);
};

/**
 * @typedef {Object} BroadcastRequest
 * @property {string} [template]
 * @property {string} [message]
 * @property {string[]} target
 * @property {string} [area]
 * @property {string} [area]
 * @property {number} year
 * @property {number} month
 * @property {boolean} sendInvoice
 * @property {boolean} special // Special Customer
 *
 * @param {BroadcastRequest} body
 * @returns {Promise<void}
 */
export const broadcastMessage = async (body) => {
  const { data } = await axios.post(`${APIURL}/broadcast`, body);

  return data.message;
};
