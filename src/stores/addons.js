import { create } from 'zustand';

/**
 * @typedef {import('src/repositories/addons').Addons} Addons
 */

/**
 * @callback SetAddonsStore
 * @param {{page: number; limit: number; search: string; data: Addons[]}}
 */

/**
 * @typedef {Object} AddonsStore
 * @property {number} page
 * @property {number} limit
 * @property {number} search
 * @property {Addons[]} data
 * @property {SetAddonsStore} setAddonsStore
 */

/** @type {AddonsStore} */
export const useAddonsStore = create((set) => ({
  page: 0,
  limit: 10,
  search: '',
  data: [],
  setAddonsStore: ({ page, limit, search, data }) =>
    set((state) => {
      const obj = {};
      if (typeof page === 'number') Object.assign(obj, { page });
      if (typeof limit === 'number') Object.assign(obj, { limit });
      if (typeof search === 'string') Object.assign(obj, { search });
      if (data) Object.assign(obj, { data });

      return obj;
    }),
}));
