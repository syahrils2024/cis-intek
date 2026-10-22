import axios from '@commons/axios';

const APIURL = import.meta.env.VITE_API_URL;
const BASEURL = `${APIURL}/admin/whatsapp`;

/**
 * @typedef {Object} WhatsappCheckResult
 * @property {boolean} valid
 * @property {string} [jidGroup]
 * @property {string} [jidUser]
 */

/**
 *
 * @param {'phone' | 'group'} type
 * @param {string} whatsappId
 * @param {string} whatsappNodeId - The WhatsApp ID to check, which can be a phone number or group ID.
 * @returns {Promise<WhatsappCheckResult>}
 */

export async function checkWhatsapp(type, whatsappId, whatsappNodeId) {
  const { data } = await axios.post(`${BASEURL}/check`, { type, whatsappId, whatsappNodeId });
  return data.message;
}

export async function testWhatsapp(number, whatsappNodeId) {
  const { data } = await axios.post(`${BASEURL}/test-send`, { number, id: whatsappNodeId });
  return data.message;
}
