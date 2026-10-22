/**
 * @typedef {import("@/repositories/customer").CustomerListFromEngineer} CustomerListFromEngineer
 * @typedef {import('@/repositories/package').ResultPackageList} PackageList
 * @typedef {import('@/repositories/area').AreaCategory} AreaCategory
 * @typedef {import('@/repositories/area').Area} Area
 */

import { createSlice } from '@reduxjs/toolkit';

/**
 * @typedef {'customers' |
 * 'total' |
 * 'page' |
 * 'limit' |
 * 'search' |
 * 'area' |
 * 'areaCategory' |
 * 'packet' |
 * 'areaCategories' |
 * 'areas' |
 * 'packets' |
 * 'order' |
 * 'orderBy'} KeyOfCustomerEngineerStore
 */

/**
 * @typedef {Object} CustomerEngineerStore
 * @property {CustomerListFromEngineer[]} customers
 * @property {number} total
 * @property {number} page
 * @property {number} limit
 * @property {string} search
 * @property {string} area
 * @property {string} areaCategory
 * @property {string} packet
 * @property {PackageList[]} packets
 * @property {AreaCategory[]} areaCategories
 * @property {Area[]} areas
 * @property {string} order
 * @property {string} orderBy
 */

/**
 * @type {CustomerEngineerStore}
 */
const initialState = {
  customers: [],
  total: 0,
  page: 0,
  limit: 10,
  search: '',
  area: 'all',
  areaCategory: '',
  packet: '',
  areaCategories: [],
  packets: [],
  areas: [],
  order: 'asc',
  orderBy: 'customer',
};

const customerEngineerSlice = createSlice({
  name: 'customerEngineer',
  initialState,
  reducers: {
    /**
     * @param {CustomerEngineerStore} state
     * @param {{payload: {key: KeyOfCustomerEngineerStore; value: any}}} body
     */
    setCustomerEngineerStore(state, body) {
      const { key, value } = body.payload;
      state[key] = value;
    },
  },
});

export const { setCustomerEngineerStore } = customerEngineerSlice.actions;
export default customerEngineerSlice.reducer;
