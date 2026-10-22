import axios from '@commons/axios';

const APIURL = import.meta.env.VITE_API_URL;
const BASEURL = `${APIURL}/admin/customer-notification`;

/**
 * @typedef {object} CustomerNotification
 * @property {string} _id
 * @property {null} summary
 * @property {number} readStatus
 * @property {string} status
 * @property {string} customer
 * @property {string} title
 * @property {string} body
 * @property {string} createdAt
 * @property {string} customerFullname
 * @property {string} customerPhone
 * @property {string} customerId
 * @property {string} customerArea
 */

/**
 * Gets a list of customer notifications.
 * @param {{
 * page: number;
 * limit: number;
 * search: string;
 * area?: string;
 * }} param0
 * @returns {Promise<{total: number; data: CustomerNotification[]}>}
 */
export async function getCustomerNotifications({ page, limit, search, area }) {
  const { data } = await axios.get(BASEURL, {
    params: {
      page,
      limit,
      search,
      area,
    },
  });

  return data.message;
}
