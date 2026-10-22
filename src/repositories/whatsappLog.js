import axios from '@commons/axios';

const APIURL = import.meta.env.VITE_API_URL;
const BASEURL = `${APIURL}/admin/whatsapp/area-logs`;

/**
 * @typedef {Object} WhatsappLog
 * @property {string} _id
 * @property {string} message
 * @property {boolean} isSuccess
 * @property {string} createdAt
 * @property {string} errorReason
 * @property {string} fromWhatsappNode
 * @property {string} fromWhatsappNodeName
 * @property {string} fromWhatsappNodeNumber
 */

/**
 * @typedef {Object} WhatsappLogCustomer
 * @property {string} _id
 * @property {string} message - The message sent to the customer.
 * @property {boolean} success - Indicates whether the operation was successful.
 * @property {string | null} errorReason - The reason for failure, if any.
 * @property {string} createdAt - The timestamp when the log was created.
 * @property {string} fromWhatsappNode - The name of the WhatsApp node.
 * @property {string} fromWhatsappNodePhone - The phone number of the WhatsApp node.
 * @property {string} timestamp - The timestamp of the log.
 * @property {string} customerId - The ID of the customer.
 * @property {string} customerFullname
 * @property {string} customerPhone
 * @property {string | null} messageCategory
 */

/**
 * @typedef {Object} WhatsappLogResponse
 * @property {WhatsappLog[]} data
 * @property {number} total
 */

/**
 * Fetches WhatsApp logs from the server.
 * @param {Object} params - The parameters for fetching logs.
 * @param {number} params.page - The page number for pagination.
 * @param {number} params.limit - The number of logs per page.
 * @param {string} [params.start] - The start date for filtering logs.
 * @param {string} [params.until] - The end date for filtering logs.
 * @param {string} [params.areaId] - The ID of the area to filter logs.
 * @param {string} [params.fromWhatsappNode] - The WhatsApp node to filter logs.
 * @returns {Promise<WhatsappLogResponse>}
 */
export const getWhatsappLog = async ({ page, limit, start, until, areaId, fromWhatsappNode }) => {
  const { data } = await axios.get(BASEURL, {
    params: { page, limit, start, until, areaId, fromWhatsappNode },
  });
  return data.message;
};

/**
 * Fetches WhatsApp logs for a specific customer from the server.
 *
 * @param {Object} params - The parameters for fetching customer logs.
 * @param {number} [params.page=0] - The page number for pagination.
 * @param {number} [params.limit=10] - The number of logs per page.
 * @param {string} [params.start] - The start date for filtering logs.
 * @param {string} [params.until] - The end date for filtering logs.
 * @param {string} [params.customerId] - The ID of the customer to filter logs.
 * @param {string} [params.messageCategory] - The ID of the customer to filter logs.
 * @param {string} [params.fromWhatsappNode] - The ID of the customer to filter logs.
 * @returns {Promise<{
 * total: number;
 * data: WhatsappLogCustomer[];
 * totalFailed: number;
 * totalSuccess: number;
 * pendingJob: number;
 * search: string;
 * status: string;
 * }>} The list of WhatsApp logs for the customer.
 */
export async function getWhatsappLogCustomer({
  page = 0,
  limit = 10,
  start,
  until,
  customerId,
  search,
  status,
  fromWhatsappNode = '',
  messageCategory = '',
}) {
  const url = `${APIURL}/admin/whatsapp/customer-logs`;
  const { data } = await axios.get(url, {
    params: {
      page,
      limit,
      start,
      until,
      customerId,
      search,
      status,
      fromWhatsappNode,
      messageCategory,
    },
  });
  return data.message;
}

/**
 * Resend Failed Log
 * @param {string} id
 * @returns
 */
export async function resendWhatsappLogCustomer(id) {
  const url = `${APIURL}/admin/whatsapp/customer-logs/resend/${id}`;
  const { data } = await axios.patch(url);
  return data.message;
}

/**
 * Fetches WhatsApp logs for a specific customer from the server.
 *
 * @param {Object} params - The parameters for fetching customer logs.
 * @param {number} [params.page=0] - The page number for pagination.
 * @param {number} [params.limit=10] - The number of logs per page.
 * @param {string} [params.start] - The start date for filtering logs.
 * @param {string} [params.until] - The end date for filtering logs.
 * @param {string} [params.customerId] - The ID of the customer to filter logs.
 * @returns {Promise<{
 * total: number;
 * data: WhatsappLogCustomer[];
 * totalFailed: number;
 * totalSuccess: number;
 * pendingJob: number
 * }>} The list of WhatsApp logs for the customer.
 */
export async function resendWhatsappLogCustomerBatch({ start, until, customerId }) {
  const url = `${APIURL}/admin/whatsapp/customer-logs/resend-batch`;
  const { data } = await axios.patch(
    url,
    {},
    {
      params: { start, until, customerId },
    }
  );
  return data.message;
}
