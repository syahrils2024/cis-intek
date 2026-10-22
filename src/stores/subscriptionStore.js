import { createSlice } from '@reduxjs/toolkit';

/**
 * @typedef {import("@/repositories/subscription").Subscription} Subscription
 * @typedef {import("@/repositories/area").Area} Area
 * @typedef {import("@/repositories/dashboard").responseGetDashboardStatistics} Statistics
 * @typedef {import("@/repositories/package").ResultPackageSummary} PackageSummary
 */

/**
 * @typedef {object} SubscriptionStore
 * @property {Date} date -- Selected Date (month and year)
 * @property {Subscription[]} subscriptions -- List of subscriptions Billing
 * @property {Area[]} area -- List of area
 * @property {PackageSummary[]} package -- List of Package
 * @property {string} paymentStatus -- Payment status for filter
 * @property {string} userStatus -- user status for filter
 * @property {string} packageId -- selected Package id for filter
 * @property {string} areaId -- selected area id for filter
 * @property {number} page -- page of table
 * @property {number} limit -- limit each page
 * @property {number} totalPage -- totalPage
 */

/**
 * @type {SubscriptionStore}
 */
const initialState = {
  date: new Date(),
  subscriptions: [],
  area: [],
  package: [],
  paymentStatus: 'All',
  userStatus: 'Active',
  packageId: '',
  areaId: '',
  page: 0,
  limit: 10,
  totalPage: 0,
};

const subscriptionSlice = createSlice({
  name: 'subscription',
  initialState,
  reducers: {
    /**
     * @param {SubscriptionStore} state
     * @param {{payload: Date}} body
     */
    setDate: (state, body) => {
      state.date = body.payload;
    },
    /**
     * @param {SubscriptionStore} state
     * @param {{payload: Subscription[]}} body
     */
    setSubscription: (state, body) => {
      state.subscriptions = body.payload;
    },
    /**
     * @param {SubscriptionStore} state
     * @param {{payload: Area[]}} body
     */
    setArea: (state, body) => {
      state.area = body.payload;
    },
    /**
     * @param {SubscriptionStore} state
     * @param {{payload: PackageSummary[]}} body
     */
    setPackage: (state, body) => {
      state.package = body.payload;
    },
    /**
     * @param {SubscriptionStore} state
     * @param {{payload: string}} body
     */
    setFilterPaymentStatus: (state, body) => {
      state.paymentStatus = body.payload;
    },
    /**
     * @param {SubscriptionStore} state
     * @param {{payload: string}} body
     */
    setFilterUserStatus: (state, body) => {
      state.userStatus = body.payload;
    },
    /**
     * @param {SubscriptionStore} state
     * @param {{payload: string}} body
     */
    setFilterPackageId: (state, body) => {
      state.packageId = body.payload;
    },
    /**
     * @param {SubscriptionStore} state
     * @param {{payload: string}} body
     */
    setFilterAreaId: (state, body) => {
      state.areaId = body.payload;
    },
    /**
     * @param {SubscriptionStore} state
     * @param {{payload: number}} body
     */
    setPage: (state, body) => {
      state.page = body.payload;
    },
    /**
     * @param {SubscriptionStore} state
     * @param {{payload: number}} body
     */
    setLimitItem: (state, body) => {
      state.limit = body.payload;
    },
    /**
     * @param {SubscriptionStore} state
     * @param {{payload: number}} body
     */
    setTotalPage: (state, body) => {
      state.totalPage = body.payload;
    },
  },
});

export const {
  setArea,
  setDate,
  setFilterAreaId,
  setFilterPackageId,
  setFilterPaymentStatus,
  setFilterUserStatus,
  setLimitItem,
  setPackage,
  setPage,
  setSubscription,
  setTotalPage,
} = subscriptionSlice.actions;
export default subscriptionSlice.reducer;
