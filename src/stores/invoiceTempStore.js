/**
 * @typedef {import("@/repositories/invoiceTemp").InvoiceTemp} InvoiceTemp
 */

import { addDays } from 'date-fns';
import { createSlice } from '@reduxjs/toolkit';

/**
 * @typedef {Object} InvoiceTempStore
 * @property {InvoiceTemp[]} invoiceTemporaries
 * @property {number} page
 * @property {number} limit
 * @property {string} find
 * @property {string} status
 * @property {number} totalItems
 * @property {string} orderBy
 * @property {string} order
 * @property {Date} start
 * @property {Date} until
 * @property {string} area
 * @property {string} depositMethod
 * @property {string} requestBy
 * @property {string} areaName
 */

/**
 * @typedef {keyof InvoiceTempStore} InvoiceTempStoreKey
 */

/**
 * @type {InvoiceTempStore}
 */
const initialState = {
  page: 0,
  limit: 10,
  find: '',
  status: 'all',
  totalItems: 0,
  invoiceTemporaries: [],
  orderBy: 'payment',
  order: 'desc',
  start: addDays(new Date(), -5),
  until: new Date(),
  area: '',
  areaName: 'Semua',
  depositMethod: '',
  requestBy: '',
};

const invoiceTempSlice = createSlice({
  name: 'invoiceTemp',
  initialState,
  reducers: {
    /**
     * @param {InvoiceTempStore} state
     * @param {{payload: {key: InvoiceTempStoreKey; value: any}}} body
     */
    setInvoiceTempStore: (state, body) => {
      const { key, value } = body.payload;
      state[key] = value;
    },
  },
});

export const { setInvoiceTempStore } = invoiceTempSlice.actions;
export default invoiceTempSlice.reducer;
