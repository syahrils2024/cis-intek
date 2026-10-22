/**
 * @typedef {object} ResultCheckConnectionDetail
 * @property {string} user
 * @property {string} service
 * @property {number} mtu
 * @property {number} mru
 * @property {string} address
 * @property {string} uptime
 */

/**
 * @typedef {object} MikrotikActionLog
 * @property {string[]} errorMessage
 * @property {string[]} commands
 * @property {boolean} isSuccess
 * @property {string} _id
 * @property {string} customerFullname
 * @property {string} customer_id
 * @property {string} customerId
 * @property {string} remote
 * @property {string} type
 * @property {string} createdAt
 * @property {string} updatedAt
 * @property {string} [area]
 * @property {string} [createdUserFullname]
 * @property {string} [createdUserEmail]
 * @property {boolean} [isAutomatic]
 */

/**
 * @typedef {Object} TrafficStats
 * @property {string} [interface] - Name of the monitored interface.
 * @property {number} [rxPacketsPerSecond] - Packets received per second.
 * @property {number} [rxBitsPerSecond] - Bits received per second, in Mbps.
 * @property {number} [fpRxPacketsPerSecond] - FastPath packets received per second.
 * @property {number} [fpRxBitsPerSecond] - FastPath bits received per second, in Mbps.
 * @property {number} [rxDropsPerSecond] - Dropped received packets per second.
 * @property {number} [rxErrorsPerSecond] - Errors in received packets per second.
 * @property {number} [txPacketsPerSecond] - Packets transmitted per second.
 * @property {number} [txBitsPerSecond] - Bits transmitted per second, in Mbps.
 * @property {number} [fpTxPacketsPerSecond] - FastPath packets transmitted per second.
 * @property {number} [fpTxBitsPerSecond] - FastPath bits transmitted per second, in Mbps.
 * @property {number} [txDropsPerSecond] - Dropped transmitted packets per second.
 * @property {number} [txQueueDropsPerSecond] - Drops in the transmit queue per second.
 * @property {number} [txErrorsPerSecond] - Errors in transmitted packets per second.
 * @property {string} [time]
 * @property {string} [unit]
 */

/**
 * @typedef {object} ResultCheckConnection
 * @property {object} flags
 * @property {string} flags.X
 * @property {string} flags.D
 * @property {string} flags.R
 * @property {object[]} entries
 * @property {number} entries.index
 * @property {string[]} entries.flags
 * @property {ResultCheckConnectionDetail} entries.details
 */

/**
 * @typedef {object} ResultCheckConnectionStatus
 * @property {null} id
 * @property {string} flags
 * @property {string} name
 * @property {string} user
 * @property {string} service
 * @property {number} mtu
 * @property {number} mru
 * @property {string} remoteAddress
 * @property {string} encoding
 * @property {string} uptime
 */

import axios from '@commons/axios';

const APIURL = import.meta.env.VITE_API_URL;

/**
 * @param {string} customerId
 * @returns {Promise<ResultCheckConnectionStatus>}
 */
export async function checkConnection(customerId) {
  const url = `${APIURL}/admin/mikrotik/check-running/${customerId}`;
  const { data } = await axios.get(url);
  return data.message;
}

/**
 * @param {string} customerId
 * @returns {Promise<string[]>}
 */
export async function getLog(customerId) {
  const url = `${APIURL}/admin/mikrotik/log/${customerId}`;
  const { data } = await axios.get(url);
  return data.message;
}

/**
 *
 * @param {string} customer_id
 * @returns {Promise<string>}
 */
export async function rewritePPPoE(customer_id) {
  const url = `${APIURL}/admin/mikrotik/rewrite-pppoe/${customer_id}`;
  const { data } = await axios.post(url);
  return data.message;
}

/**
 *
 * @param {{page: number; limit: number; customerId: string; remote: string; find: string; area: string; start: string; until: string}} param0
 * @returns {Promise<{data: MikrotikActionLog[]; total: number}>}
 */
export async function getHistoryActionLog({
  page = 0,
  limit = 10,
  customerId,
  remote,
  find,
  area,
  start,
  until,
}) {
  const url = `${APIURL}/admin/mikrotik/action-log`;
  const { data } = await axios.get(url, {
    params: { page, limit, customerId, remote, find, area, start, until },
  });
  return data.message;
}

/**
 * @typedef {Object} AddIsolirFirewallRequest
 * @property {string} address - IP address to mikrotik.
 * @property {string} user - username mikrotik
 * @property {string} port - ssh port
 * @property {string} password - password mikrotik
 *
 * @param {AddIsolirFirewallRequest} body
 * @returns {Promise<void>}
 */
export async function addIsolirFirewall(body) {
  const { data } = await axios.post(`${APIURL}/admin/mikrotik/add-isolir-firewall`, body);
  return data.message;
}

/**
 * Check Mikrotik Is Online By Customer
 * @param {string} customerId
 * @returns {Promise<string>}
 */
export async function mikrotikIsOnline(customerId) {
  const { data } = await axios.get(`${APIURL}/admin/mikrotik/mikrotik-status/${customerId}`);
  return data.message;
}

/**
 * Redo Log Action
 * @param {string} id
 * @returns
 */
export async function redoLog(id) {
  const { data } = await axios.patch(`${APIURL}/admin/mikrotik/redo/${id}`);
  return data.message;
}
