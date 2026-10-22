import axios from 'src/commons/axios';

const BASEURL = import.meta.env.VITE_API_URL;
const url = `${BASEURL}/v3/openclaw`;

/**
 * @typedef {Object} WhatsAppChannel
 * @property {string} id
 * @property {string} name
 * @property {string} workspace
 * @property {string} status
 * @property {string} phoneNumber
 */

/**
 * @typedef {Object} CreateChannelResponse
 * @property {string} channelId
 * @property {string} [qrCode]
 */

/**
 * @typedef {Object} LoginStartResponse
 * @property {string} qrDataUrl
 * @property {string} message
 */

/**
 * @typedef {Object} LoginWaitResponse
 * @property {boolean} connected
 * @property {string} message
 * @property {string} [qrDataUrl]
 */

/**
 * @typedef {Object} OpenclawGatewayStatus
 * @property {boolean} running
 * @property {boolean} ok
 */

/**
 * Get the soul markdown content
 * @returns {Promise<string>} The markdown content of soul.md
 */
export async function getSoul() {
  const { data } = await axios.get(`${url}/soul`);
  return data.message;
}

/**
 * Update the soul markdown content (overwrites entire file)
 * @param {string} content - The full markdown content to write
 * @returns {Promise<string>} Success message
 */
export async function updateSoul(content) {
  const { data } = await axios.put(`${url}/soul`, { content });
  return data.message;
}

/**
 * Get list of WhatsApp channels
 * @returns {Promise<WhatsAppChannel[]>} Array of channels
 */
export async function getWhatsAppChannels() {
  const { data } = await axios.get(`${url}/whatsapp/channels`);
  return data.message;
}

/**
 * Create a new WhatsApp channel
 * @param {Object} params
 * @param {string} params.workspace - The workspace name
 * @param {string} [params.channelName] - Optional channel display name
 * @returns {Promise<CreateChannelResponse>} Contains channelId and optional qrCode
 */
export async function createWhatsAppChannel({ workspace, channelName }) {
  const { data } = await axios.post(`${url}/whatsapp/channels`, { workspace, channelName });
  return data.message;
}

/**
 * Get status of a specific WhatsApp channel
 * @param {string} id - The channel ID
 * @returns {Promise<string>} Status: connected|disconnected|qr_ready|authenticating|unknown
 */
export async function getWhatsAppChannelStatus(id) {
  const { data } = await axios.get(`${url}/whatsapp/channels/${id}/status`);
  return data.message;
}

/**
 * Logout a WhatsApp channel
 * @param {string} id - The channel ID
 * @returns {Promise<string>} Success message
 */
export async function logoutWhatsAppChannel(id) {
  const { data } = await axios.post(`${url}/whatsapp/channels/${id}/logout`);
  return data.message;
}

/**
 * Delete a WhatsApp channel
 * @param {string} id - The channel ID
 * @returns {Promise<string>} Success message
 */
export async function deleteWhatsAppChannel(id) {
  const { data } = await axios.delete(`${url}/whatsapp/channels/${id}`);
  return data.message;
}

/**
 * Start login process for a WhatsApp channel (generates QR)
 * @param {Object} params
 * @param {string} params.id - The channel ID
 * @param {boolean} [params.force=false] - Force refresh QR
 * @param {number} [params.timeoutMs=30000] - Timeout in milliseconds
 * @returns {Promise<LoginStartResponse>} Contains qrDataUrl and message
 */
export async function startWhatsAppLogin({ id, force = false, timeoutMs = 30000 }) {
  const { data } = await axios.post(`${url}/whatsapp/channels/${id}/login/start`, { force, timeoutMs });
  return data.message;
}

/**
 * Wait for QR scan completion (polling endpoint)
 * @param {Object} params
 * @param {string} params.id - The channel ID
 * @param {string} [params.currentQrDataUrl] - The last displayed QR to detect refresh
 * @param {number} [params.timeoutMs=30000] - Polling timeout in milliseconds
 * @returns {Promise<LoginWaitResponse>} Contains connected status, message, and optional new qrDataUrl
 */
export async function waitWhatsAppLogin({ id, currentQrDataUrl, timeoutMs = 30000 }) {
  const { data } = await axios.post(`${url}/whatsapp/channels/${id}/login/wait`, { currentQrDataUrl, timeoutMs });
  return data.message;
}

/**
 * Get openclaw.json configuration
 * @returns {Promise<Object>} Configuration object
 */
export async function getConfig(){
  const { data } = await axios.get(`${url}/config`);
  return data.message;
}

/**
 * Update openclaw.json configuration
 * @param {Object} config - The full configuration object
 * @returns {Promise<Object>} Updated configuration
 */
export async function updateConfig(config) {
  const { data } = await axios.put(`${url}/config`, config);
  return data.message;
}


/**
 * Get the status of the Openclaw gateway
 * @returns {Promise<OpenclawGatewayStatus>} Gateway status object
 */
export async function getGatewayStatus() {
  const { data } = await axios.get(`${url}/gateway/status`);
  return data.message;
}

/**
 * Restart the Openclaw gateway
 * @returns {Promise<void>}
 */
export async function restartGateway() {
  const { data } = await axios.post(`${url}/gateway/restart`);
  return data.message;
}

/**
 * Stop the Openclaw gateway
 * @returns {Promise<void>}
 */
export async function stopGateway() {
  const { data } = await axios.post(`${url}/gateway/stop`);
  return data.message;
}
