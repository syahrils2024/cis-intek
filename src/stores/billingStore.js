/**
 * @typedef {import("./subscriptionStore").Statistics} Statistics
 * @typedef {import("./areaStore").PPPOEItems} PPPoEItem
 * @typedef {import("./subscriptionStore").Subscription} Subscription
 * @typedef {import("./customerFormStore").Package} Package
 * @typedef {import('./areaStore').Area} Area
 */

import { createSlice } from '@reduxjs/toolkit';

/**
 * @typedef { 'subscription' | 'statistics' |
 * 'packageFilter' | 'oltList' |
 * 'year' | 'month' |
 * 'selectedPaymentStatus' | 'selectedUserStatus' |
 * 'selectedPackageId' | 'selectedAreaId' | 'status' | 'order' | 'orderBy' | 'page' | 'limit' | 'addons'
 *  } KeyOfBillingStore
}
 */

/**
 * @typedef {object} BillingStore
 * @property {Statistics | null} statistics
 * @property {Subscription[]} subscription
 * @property {Package[]} packageFilter
 * @property {Area[]} oltList
 * @property {number} year
 * @property {number} month
 * @property {string} selectedPaymentStatus
 * @property {string} selectedUserStatus
 * @property {string} selectedPackageId
 * @property {string} selectedAreaId
 * @property {string} selectedAreaName
 * @property {string} status
 * @property {number} limit
 * @property {number} page
 * @property {number} totalItem
 * @property {string} orderBy
 * @property {string} order
 * @property {string} isolated
 * @property {string} addons
 * @property {string} customerNote
 * @property {boolean} filterByTagihan
 */

/**
 * @type {BillingStore}
 */
const initialState = {
  subscription: [],
  statistics: {},
  packageFilter: [],
  oltList: [],
  year: new Date().getFullYear(),
  month: new Date().getMonth() + 1,
  selectedPaymentStatus: 'all',
  selectedUserStatus: 'active',
  selectedPackageId: 'all',
  selectedAreaId: 'all',
  status: 'active',
  limit: 10,
  page: 0,
  totalItem: 0,
  order: 'asc',
  orderBy: 'customer',
  isolated: 'all',
  selectedAreaName: '',
  addons: 'all',
  customerNote: 'all',
  filterByTagihan: false,
  special: false
};

const billingSlice = createSlice({
  name: 'billing',
  initialState,
  reducers: {
    /**
     * @param {BillingStore} state
     * @param {{payload: {key: KeyOfBillingStore, value: any}}} body
     */
    setBillingState(state, body) {
      state[body.payload.key] = body.payload.value;
    },
    /**
     * @param {BillingStore} state
     * @param {{payload: {key: KeyOfBillingStore, value: any}[]}} body
     */
    setBillingStateMulti(state, body) {
      body.payload.forEach((p) => {
        const { key, value } = p;
        state[key] = value;
      });
    },
  },
});

export const { setBillingState, setBillingStateMulti } = billingSlice.actions;
export default billingSlice.reducer;
