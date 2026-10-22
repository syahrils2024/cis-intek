/**
 * @typedef {import("src/repositories/customer").CustomerListFromEngineer} CustomerListFromEngineer
 * @typedef {import('src/repositories/package').ResultPackageList} PackageList
 * @typedef {import('src/repositories/area').AreaCategory} AreaCategory
 * @typedef {import('src/repositories/area').Area} Area
 * @typedef {import('src/repositories/subscription').Subscription} Subscription
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
 * 'orderBy'} KeyOfCustomerEngineerV2Store
 */

/**
 * @typedef {Object} CustomerEngineerV2Store
 * @property {CustomerListFromEngineer[]} customers
 * @property {Subscription[]} subscription
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
 * @property {number} pppTotal
 * @property {number} pppActive
 * @property {number} pppInactive
 * @property {number} totalIsolated
 * @property {number} totalUnisolated
 * @property {boolean} differenceNetworkConfiguration
 */

/**
 * @type {CustomerEngineerV2Store}
 */
const initialState = {
  customers: [],
  subscription: [],
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
  selectedPaymentStatus: 'all',
  selectedUserStatus: 'active',
  selectedPackageId: 'all',
  selectedAreaId: 'all',
  status: 'active',
  isolated: 'all',
  packageFilter: [],
  addons: 'all',
  selectedAreaName: '',
  pppTotal: 0,
  pppActive: 0,
  pppInactive: 0,
  totalIsolated: 0,
  totalUnisolated: 0,
  differenceNetworkConfiguration: false,
};

const customerEngineerV2Slice = createSlice({
  name: 'customerEngineerV2',
  initialState,
  reducers: {
    /**
     * @param {CustomerEngineerV2Store} state
     * @param {{payload: {key: KeyOfCustomerEngineerV2Store; value: any}}} body
     */
    setCustomerEngineerV2Store(state, body) {
      const { key, value } = body.payload;
      state[key] = value;
    },
  },
});

export const { setCustomerEngineerV2Store } = customerEngineerV2Slice.actions;
export default customerEngineerV2Slice.reducer;
