/**
 * @typedef {import("src/repositories/ticket").Ticket} Ticket
 */

import { createSlice } from '@reduxjs/toolkit';

/**
 * @typedef {'page' | 'limit' | 'find' | 'data' | 'totalItems'} TicketStoreKey
 */

/**
 * @typedef {Object} TicketStore
 * @property {number} page
 * @property {number} limit
 * @property {string} find
 * @property {Ticket[]} data
 * @property {number} totalItems
 * @property {string} status
 */

/**
 * @type {TicketStore}
 */
const initialState = {
  page: 0,
  limit: 10,
  find: '',
  data: [],
  totalItems: 0,
  status: 'all',
};

const ticketSlice = createSlice({
  name: 'ticketStore',
  initialState,
  reducers: {
    /**
     * @param {TicketStore} state
     * @param {payload: {key: TicketStoreKey; value: any}} body
     */
    setTicketStore(state, body) {
      const { key, value } = body.payload;
      state[key] = value;
    },
  },
});

export const { setTicketStore } = ticketSlice.actions;
export default ticketSlice.reducer;
