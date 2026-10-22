import axios from 'src/commons/axios';

const BASEURL = import.meta.env.VITE_API_URL;
const url = `${BASEURL}/admin/faq`;
/**
 * @typedef {Object} Faq
 * @property {string} _id - The unique identifier of the FAQ.
 * @property {string} question - The FAQ question.
 * @property {string} answer - The answer to the FAQ question.
 * @property {boolean} isActive - Indicates whether the FAQ is active/visible.
 * @property {boolean} isTechnical - Indicates whether the FAQ is technical in nature.
 */

/**
 * @typedef {Object} FaqRequest
 * @property {string} title - The title of the FAQ.
 * @property {string} content - The content of the FAQ.
 * @property {boolean} isActive - Indicates whether the FAQ is active/visible.
 * @property {boolean} isTechnical - Indicates whether the FAQ is technical in nature.
 */

/**
 * Fetches all FAQs from the server.
 * @returns {Promise<Faq[]>} - Returns a promise that resolves to an array of FAQs.
 */
export async function findAll() {
  const { data } = await axios.get(url);
  return data.message;
}

/**
 * Fetches a single FAQ by its ID.
 * @param {string} id
 * @returns {Promise<Faq>} - Returns a promise that resolves to a single FAQ object.
 */
export async function findDetail(id) {
  const { data } = await axios.get(`${url}/${id}`);
  return data.message;
}

/**
 * Creates a new FAQ.
 * @param {FaqRequest} body
 * @returns {Promise<Faq>} - Returns a promise that resolves to the created FAQ object.
 */
export async function create(body) {
  const { data } = await axios.post(url, body);
  return data.message;
}

/**
 * Updates an existing FAQ by its ID.
 * @param {string} id
 * @param {FaqRequest} body
 * @returns {Promise<Faq>} - Returns a promise that resolves to the updated FAQ object.
 */
export async function update(id, body) {
  const { data } = await axios.put(`${url}/${id}`, body);
  return data.message;
}

/**
 * Deletes an FAQ by its ID.
 * @param {string} id
 * @returns {Promise<string>} - Returns a promise that resolves to a success message.
 */
export async function remove(id) {
  const { data } = await axios.delete(`${url}/${id}`);
  return data.message;
}
