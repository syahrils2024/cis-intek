import axios from '@commons/axios';

const APIURL = import.meta.env.VITE_API_URL;
const BASEURL = `${APIURL}/admin/whatsapp-group`;

/**
 * @typedef {Object} WhatsappGroup
 * @property {string} _id
 * @property {string} name
 */

/**
 * @returns {Promise<WhatsappGroup[]>}
 */
export const getWhatsappGroup = async () => {
  const { data } = await axios.get(`${BASEURL}`);
  return data.message;
}

export const createWhatsappGroup = async (name) => {
  await axios.post(`${BASEURL}`, { name });
}

export const updateWhatsappGroup = async (id, name) => {
  await axios.put(`${BASEURL}/${id}`, { name });
}

export const deleteWhatsappGroup = async (id) => {
  await axios.delete(`${BASEURL}/${id}`);
}




