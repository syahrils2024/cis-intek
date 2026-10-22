import { create } from 'zustand';

/**
 * @typedef {import('@/repositories/jobQueue').JobQueue} JobQueue
 */

/**
 * @typedef {Object} JobQueueSetter
 * @property {string} find
 * @property {number} limit
 * @property {number} page
 * @property {JobQueue[]} data
 * @property {string} area
 * @property {string} type
 * @property {string} mikrotikType
 * @property {number} totalItems
 * @property {string} areaName
 * @property {boolean} activeOnly
 */

/**
 * @typedef {Object} JobQueueStore
 * @property {string} find
 * @property {number} limit
 * @property {number} page
 * @property {JobQueue[]} data
 * @property {string} area
 * @property {string} type
 * @property {string} mikrotikType
 * @property {number} totalItems
 * @property {string} areaName
 * @property {boolean} activeOnly
 * @property {(data: JobQueueSetter) => void} setQueueStore
 */

/**
 * @type {JobQueueStore}
 */
export const useJobQueueStore = create((set) => ({
  find: '',
  limit: 10,
  page: 0,
  data: [],
  area: '',
  areaName: 'Semua',
  type: '',
  mikrotikType: '',
  totalItems: 0,
  activeOnly: false,
  /**
   * @param {JobQueueSetter} data
   */
  setQueueStore: (data) =>
    set((state) => {
      const obj = {};
      if (data.data) obj.data = data.data;
      if (typeof data.area === 'string') obj.area = data.area;
      if (typeof data.find === 'string') obj.find = data.find;
      if (data.limit) obj.limit = data.limit;
      if (data.mikrotikType) obj.mikrotikType = data.mikrotikType;
      if (data.type) obj.type = data.type;
      if (typeof data.page === 'number') obj.page = data.page;
      if (typeof data.totalItems === 'number') obj.totalItems = data.totalItems;
      if (data.areaName) obj.areaName = data.areaName;
      if (typeof data.activeOnly === 'boolean') obj.activeOnly = data.activeOnly;
      return obj;
    }),
}));
