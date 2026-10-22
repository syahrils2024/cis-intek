import { create } from 'zustand';

/**
 * Zustand store for managing WhatsApp log area state.
 *
 * @typedef {object} WhatsappLogAreaStore
 * @property {Array} log - The list of WhatsApp logs.
 * @property {number} total - The total number of logs.
 * @property {number} currentPage - The current page number.
 * @property {number} limit - The number of logs per page.
 * @property {boolean} isLoading - Indicates whether the logs are being loaded.
 * @property {string} fromWhatsappNode
 * @property {Date} start - The start date for filtering logs.
 * @property {Date} until - The end date for filtering logs.
 * @property {string} areaName - The name of the area.
 * @property {string} areaId - The ID of the area.
 * @property {function({areaName: string, areaId: string}):void} setArea - Sets the area name and ID.
 * @property {function(Array):void} setLog - Sets the log data.
 * @property {function(number):void} setTotal - Sets the total number of logs.
 * @property {function(number):void} setCurrentPage - Sets the current page number.
 * @property {function(number):void} setLimit - Sets the limit of logs per page.
 * @property {function(boolean):void} setIsLoading - Sets the loading state.
 * @property {function(string):void} setFromWhatsappNode
 * @property {function(Date):void} setStart - Sets the start date for filtering logs.
 * @property {function(Date):void} setUntil - Sets the end date for filtering logs.
 */

/**
 * @typedef {WhatsappLogAreaStore} WhatsappLogAreaStore
 */
export const useWhatsappLogAreaStore = create((set) => ({
  log: [],
  total: 0,
  currentPage: 0,
  limit: 10,
  isLoading: false,
  fromWhatsappNode: '',
  start: new Date(),
  until: new Date(),
  areaName: '',
  areaId: '',

  setLog: (log) => set({ log }),
  setTotal: (total) => set({ total }),
  setCurrentPage: (page) => set({ currentPage: page }),
  setLimit: (limit) => set({ limit }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setFromWhatsappNode: (fromWhatsappNode) => set({ fromWhatsappNode }),
  setStart: (start) => set({ start }),
  setUntil: (until) => set({ until }),
  setArea: ({ areaName, areaId }) => {
    if (areaName) set({ areaName });
    if (areaId) set({ areaId });
  },
}));
