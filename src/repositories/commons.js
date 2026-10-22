import axios from '@commons/axios';

import { commonsSchema } from 'src/types/commons.types';

const APIURL = import.meta.env.VITE_API_URL;
const BASEURL = `${APIURL}/admin/commons`;

/**
 * Get Commons Setting
 */
export async function getCommons() {
  const { data } = await axios.get(BASEURL);
  return commonsSchema.parse(data.message);
}

/**
 * Updates the commons settings.
 *
 * @param {{
 *   whatsapp: string;
 *   callCenter: string;
 * }} body - The body of the request matching the commonsSchema.
 * @returns {Promise<string>} The updated message from the server.
 */
export async function updateCommons(body) {
  const { data } = await axios.patch(BASEURL, body);
  return data.message;
}

/**
 * Uploads and updates the application logo.
 * @param {File} file
 * @returns {Promise<string>}
 */
export async function updateAppLogo(file) {
  const formData = new FormData();
  formData.append('appLogo', file);

  const { data } = await axios.post(`${BASEURL}/app-logo`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return data.message;
}
