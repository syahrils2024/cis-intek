/**
 * @typedef {import("./areaConfiguration").Customer} Customer
 * @typedef {'customers' | 'status' | 'page' | 'limit'} KeyOfCustomerStore
 */

import { createSlice } from '@reduxjs/toolkit';

/**
 * @typedef {Object} CustomerQueueStore
 * @property {Customer[]} customers
 * @property {string} status
 * @property {string} find
 * @property {number} page
 * @property {number} limit
 * @property {number} totalItem
 * @property {string} orderBy
 * @property {string} order
 */

/**
 * @type {CustomerQueueStore}
 */
const initialState = {
  customers: [],
  status: 'all',
  page: 0,
  limit: 10,
  find: '',
  totalItem: 0,
  order: 'asc',
  orderBy: 'customer',
};

const customerQueueSlice = createSlice({
  name: 'customerQueue',
  initialState,
  reducers: {
    /**
     * @param {CustomerQueueStore} state
     * @param {{payload: {key: string; value: any}}} body
     */
    customerQueueStoreSetState(state, body) {
      const { key, value } = body.payload;
      state[key] = value;
    },
    /**
     * @param {CustomerQueueStore} state
     * @param {{payload: {key: string; value: any}[]}} body
     */
    customerQueueStoreSetStateMulti(state, body) {
      body.payload.forEach((p) => {
        const { key, value } = p;
        state[key] = value;
      });
    },
  },
});

export const { customerQueueStoreSetState, customerQueueStoreSetStateMulti } =
  customerQueueSlice.actions;
export default customerQueueSlice.reducer;
