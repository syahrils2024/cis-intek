/**
 * @typedef {object} Ticket
 * @property {string} _id
 * @property {string} ticketId
 * @property {object[]} engineers
 * @property {string} engineers._id
 * @property {string} engineers.fullname
 * @property {string} customerId
 * @property {string} customer_id
 * @property {string} ticketType
 * @property {string} createdAt
 * @property {string} updatedAt
 * @property {number} __v
 * @property {string} customerFullname
 * @property {string} customerPhone
 * @property {string} customerAddress
 * @property {string} customerIpAddress
 * @property {string} description
 * @property {string} areaTitle
 * @property {string} area_id
 * @property {string} [createdUserFullname]
 */

/**
 * @typedef {object} TicketRequest
 * customerId, engineers, ticketType, description
 * @property {string} customerId
 * @property {string[]} engineers
 * @property {string} ticketType
 * @property {string} description
 * @property {File[]} images
 * @property {'true' | 'false'} [sendImage]
 */

/**
 * @typedef {object} GetListTicketParam
 * @property {string} find
 * @property {number} limit
 * @property {number} page
 * @property {string} status
 * @property {string} start
 * @property {string} until
 * @property {string} area
 * @property {string} ticketType
 * @property {string} sortBy
 * @property {string} createdBy
 * @property {'asc' | 'desc'} sort
 */

/**
 * @typedef {object} TicketDashboard
 * @property {number} processed
 * @property {number} finish
 * @property {number} pending
 * @property {number} waiting_finishing
 */

/**
 * @typedef {object} TicketStatistics
 * @property {number} total
 * @property {object} status
 * @property {number} status.pending
 * @property {number} status.processed
 * @property {number} status.waiting_finishing
 * @property {number} status.finish
 * @property {object[]} byDate
 * @property {number} byDate.total
 * @property {string} byDate.date
 * @property {string} byDate.status
 */

import axios from '@commons/axios';

const APIURL = import.meta.env.VITE_API_URL;
const V3 = `${APIURL}/v3/ticket`

/**
 * @param {GetListTicketParam} params
 * @returns {Promise<{data: Ticket[]; total: number}>}
 */
export async function getList(params) {
  const { data } = await axios.get(`${APIURL}/admin/ticket`, { params });
  return data.message;
}

/**
 * @param {TicketRequest} body
 * @returns {Promise<void>}
 */
export async function submit(body) {
  const fd = new FormData();
  Object.entries(body).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((item, index) => {
        if (typeof item === 'string') {
          fd.append(`[${key}][${index}]`, item);
        } else if (item instanceof File) {
          fd.append(key, item);
        }
      });
    } else {
      fd.append(key, value);
    }
  });
  const { data } = await axios.post(`${APIURL}/admin/ticket`, fd, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return data.message;
}

/**
 * @param {string} ticketId
 * @param {string[]} engineers
 * @returns {Promise<void>}
 */
export async function changeEngineer(ticketId, engineers) {
  const { data } = await axios.patch(`${APIURL}/admin/ticket/${ticketId}/change-engineer`, {
    engineers,
  });
  return data.message;
}

/**
 * @param {string} ticketId
 * @param {'pending' | 'processed' | 'waiting_finish' | 'finish'} status
 * @returns {Promise<void>}
 */
export async function changeStatus(ticketId, status) {
  const { data } = await axios.patch(`${APIURL}/admin/ticket/${ticketId}/status`, { status });
  return data.message;
}

/**
 * @param {string} ticketId
 * @returns {Promise<void>}
 */
export async function remove(ticketId) {
  const { data } = await axios.delete(`${APIURL}/admin/ticket/${ticketId}/remove`);
  return data.message;
}

/**
 * @param {string} ticketId
 * @returns {Promise<void>}
 */
export async function requestFinising(ticketId) {
  const { data } = await axios.patch(`${APIURL}/admin/ticket/${ticketId}/request-finishing`);
  return data.message;
}

/**
 * @param {{message: string; file: File}} data
 * @param {string} ticketId
 * @returns {Promise<void>}
 */
export async function sendLog(ticketId, { message, file } = {}) {
  const fd = new FormData();
  fd.append('images', file);
  fd.append('description', message);

  const { data } = await axios.post(`${APIURL}/admin/ticket/${ticketId}/ticket-log`, fd, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return data.message;
}

/**
 * Download report of ticket
 * @param {{start: string; until: string}} param0
 * @returns {Promise<Blob>}
 */
export async function getReport({ start, until } = {}) {
  const { data } = await axios.get(`${APIURL}/admin/ticket/report`, {
    params: { start, until },
    responseType: 'blob',
  });
  return data;
}

/**
 * @param {GetListTicketParam} params
 * @returns {Promise<TicketDashboard>}
 */
export async function getDashboard(params) {
  const { data } = await axios.get(`${APIURL}/admin/ticket/dashboard`, { params });
  return data.message;
}

/**
 * Get ticket statistics
 * @param {object} params
 * @param {string} params.start
 * @param {string} params.until
 * @param {string} params.area
 * @returns {Promise<TicketStatistics>}
 */
export async function getStatistics(params) {
  const { data } = await axios.get(`${V3}/statistics`, { params });
  return data.message;
}
