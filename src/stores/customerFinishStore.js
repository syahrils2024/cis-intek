/**
 * @typedef {import("./areaConfiguration").Customer} Customer
 * @typedef {'customers' | 'status' | 'page' | 'limit' | 'start' | 'until' | 'order' | 'orderBy' | 'selectedArea'} KeyOfCustomerStore
 */

import { createSlice } from '@reduxjs/toolkit';

/**
 * @typedef {Object} CustomerFinishStore
 * @property {Customer[]} customers
 * @property {string} status
 * @property {string} find
 * @property {number} page
 * @property {number} limit
 * @property {number} totalItem
 * @property {string} orderBy
 * @property {string} order
 * @property {Date} start
 * @property {Date} until
 * @property {string} selectedArea
 */

/**
 * @type {CustomerFinishStore}
 */
const initialState = {
  customers: [],
  page: 0,
  limit: 10,
  find: '',
  totalItem: 0,
  order: 'asc',
  orderBy: 'customer',
  start: new Date(),
  until: new Date(),
  selectedArea: '',
};

const customerFinishSlice = createSlice({
  name: 'customerFinish',
  initialState,
  reducers: {
    /**
     * @param {CustomerFinishStore} state
     * @param {{payload: {key: string; value: any}}} body
     */
    customerFinishStoreSetState(state, body) {
      const { key, value } = body.payload;
      state[key] = value;
    },
    /**
     * @param {CustomerFinishStore} state
     * @param {{payload: {key: string; value: any}[]}} body
     */
    customerFinishStoreSetStateMulti(state, body) {
      body.payload.forEach((p) => {
        const { key, value } = p;
        state[key] = value;
      });
    },
  },
});

export const { customerFinishStoreSetState, customerFinishStoreSetStateMulti } =
  customerFinishSlice.actions;
export default customerFinishSlice.reducer;
