import axios from '@commons/axios';

const APIURL = import.meta.env.VITE_API_URL;
const BASE_URL = `${APIURL}/admin/information-banner`;

/**
 * @typedef {Object} BannerInformation
 * @property {string} _id - Unique identifier (hex string).
 * @property {'error' | 'info' | 'warning' | 'success' | string} type - Banner type/category.
 * @property {{
 *  _id: string,
 *  title: string
 * }[]} area - Array of area IDs the banner applies to.
 * @property {boolean} show - Whether the banner is visible.
 * @property {string} title - Banner title.
 * @property {string} description - Banner description/content.
 */

/**
 * @typedef {Object} BannerInformationCreate
 * @property {'error' | 'info' | 'warning' | 'success' | string} type - Banner type/category.
 * @property {string[]} area - Array of area IDs the banner applies to.
 * @property {boolean} show - Whether the banner is visible.
 * @property {string} title - Banner title.
 * @property {string} description - Banner description/content.
 */

/**
 * Creates a new banner information entry.
 * @param {BannerInformationCreate} body
 * @returns
 */
export async function create(body) {
  const url = BASE_URL;
  const { data } = await axios.post(url, body);
  return data.message;
}

/**
 * find all banner information with optional filters.
 * @param {{
 *  area?: string,
 *  limit?: number,
 *  page?: number,
 *  show?: boolean,
 *  search?: string,
 *  type?: string
 * }} param0
 * @returns {Promise<{total: number, data: BannerInformation[]}>}
 */
export async function findAll({ area, limit, page, show, search, type }) {
  const url = BASE_URL;
  const { data } = await axios.get(url, {
    params: {
      area,
      limit,
      page,
      show,
      search,
      type,
    },
  });
  return data.message;
}

/**
 * Find a banner information by its ID.
 * @param {string} id
 * @param {BannerInformationCreate} body
 * @returns
 */
export async function update(id, body) {
  const url = `${BASE_URL}/${id}`;
  const { data } = await axios.put(url, body);
  return data.message;
}

/**
 * Deletes a banner information by its ID.
 * @param {string} id
 * @returns
 */
export async function remove(id) {
  const url = `${BASE_URL}/${id}`;
  const { data } = await axios.delete(url);
  return data.message;
}
