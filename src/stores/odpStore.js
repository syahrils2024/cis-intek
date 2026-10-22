/**
 * @typedef {import("src/repositories/area").Odp} Odp
 * @typedef {'areaId' | 'odps' | 'selectedOdp' | 'totalItem' | 'totalPage' | 'currentPage' | 'search' |'limit' | 'orderBy' | 'order'} OdpStoreKey
 */

import { createSlice } from '@reduxjs/toolkit';

/**
 * @typedef {Object} FilteredOdpsSelector
 * @property {number} limit
 * @property {number} totalItems
 * @property {number} totalPages
 * @property {Odp[]} items
 */

/**
 * @typedef {Object} OdpStore
 * @property {string} areaId
 * @property {string} search
 * @property {Odp[]} odps
 * @property {Odp} [selectedOdp]
 * @property {number} totalItem
 * @property {number} totalPage
 * @property {number} currentPage
 * @property {number} limit
 * @property {string} orderBy
 * @property {string} order
 */

/**
 * @type {OdpStore}
 */
const initialState = {
  areaId: '',
  search: '',
  odps: [],
  selectedOdp: null,
  currentPage: 0,
  limit: 10,
  orderBy: 'title',
  order: 'asc',
};

const odpSlice = createSlice({
  name: 'odpAddon',
  initialState,
  reducers: {
    /**
     * @param {OdpStore} state
     * @param {{payload: {key: OdpStoreKey; value: any}}} body
     */
    setOdpStore: (state, body) => {
      const { key, value } = body.payload;
      state[key] = value;

      if (['areaId', 'search', 'limit'].includes(key)) {
        state.currentPage = 0;
      }
    },
  },
});

/**
 * @param {OdpStore} state
 */
export const filteredOdps = (state) => {
  const { order, orderBy } = state;
  const s = state.search.toLowerCase();

  const copyState = JSON.parse(JSON.stringify(state.odps));

  copyState.sort((a, b) => {
    if (orderBy === 'port') {
      return order === 'asc' ? a.port - b.port : b.port - a.port;
    }

    if (orderBy === 'totalCustomers') {
      return order === 'asc'
        ? a.totalCustomers - b.totalCustomers
        : b.totalCustomers - a.totalCustomers;
    }

    return order === 'asc'
      ? a.name.toLowerCase().localeCompare(b.name.toLowerCase())
      : b.name.toLowerCase().localeCompare(a.name.toLowerCase());
  });

  const odps = copyState.filter(
    (a) => a.name.toLowerCase().includes(s) || a.description?.toLowerCase().includes(s)
  );

  const { limit, currentPage } = state;
  const totalItems = odps.length;
  const totalPages = Math.ceil(totalItems / limit);

  const start = currentPage * totalPages;
  const end = start + limit;

  const items = odps.slice(start, end);

  return {
    limit,
    totalItems,
    totalPages,
    items,
  };
};

export const { setOdpStore } = odpSlice.actions;
export default odpSlice.reducer;
