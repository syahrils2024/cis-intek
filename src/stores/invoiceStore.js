/**
 * @typedef {import("@/repositories/subscription").InvoiceHistory} InvoiceHistory
 */

import { addDays } from 'date-fns';
import { createSlice } from '@reduxjs/toolkit';

/**
 * @typedef {'page' | 'limit' | 'data' | 'order' | 'orderBy' | 'total' | 'start' |'until' |'depositMethod'} InvoiceStoreKey
 */

/**
 * @typedef {Object} InvoiceStore
 * @property {number} page
 * @property {number} limit
 * @property {InvoiceHistory[]} data
 * @property {'asc' | 'desc'} order
 * @property {string} orderBy
 * @property {Date} start
 * @property {Date} until
 * @property {number} total
 * @property {string} depositMethod
 * @property {string} area
 */

const initialState = {
  page: 0,
  limit: 10,
  data: [],
  order: 'asc',
  orderBy: 'customer',
  start: addDays(new Date(), -2),
  until: new Date(),
  total: 0,
  depositMethod: '',
  area: '',
};

const invoiceSlice = createSlice({
  name: 'invoiceStore',
  initialState,
  reducers: {
    /**
     * @param {InvoiceStore} state
     * @param {{payload: {key: InvoiceStoreKey; value: any}}} body
     */
    setInvoiceStore: (state, body) => {
      const { value, key } = body.payload;
      state[key] = value;
    },
  },
});

export const { setInvoiceStore } = invoiceSlice.actions;
export default invoiceSlice.reducer;
