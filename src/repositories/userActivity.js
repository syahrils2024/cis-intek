import axios from '@commons/axios';

const APIURL = import.meta.env.VITE_API_URL;

/**
 * @typedef {Object} UserActivity
 * @property {string} method - HTTP method used for the activity.
 * @property {string} path - Path of the activity.
 * @property {string} description - Description of the activity.
 * @property {string} _id - Unique identifier for the activity.
 * @property {string} user - Unique identifier for the user.
 * @property {string} createdAt - Timestamp when the activity was created.
 * @property {string} updatedAt - Timestamp when the activity was last updated.
 */

const url = `${APIURL}/user-activity`;

/**
 * @param {{user: string; page: number; limit: number; start: string; until: string}} param0
 * @returns {Promise<UserActivity[]>}
 */
export async function getList({ user, page, limit, start, until } = {}) {
  const { data } = await axios.get(url, {
    params: {
      user,
      page,
      limit,
      start,
      until,
    },
  });
  return data.message;
}

/**
 * @param {{user: string; start: string; until: string}} param0
 * @returns {Promise<Blob>}
 */
export async function exportToExcel({ user, start, until } = {}) {
  const { data } = await axios.get(`${url}/export`, {
    responseType: 'blob',
    params: {
      user,
      start,
      until,
    },
  });
  return data;
}

/**
 * @param {{description: string; createdAt: string}} body
 * @returns {Promise<string>}
 */
export async function createActivity(body) {
  const { data } = await axios.post(url, body);
  return data.message;
}
