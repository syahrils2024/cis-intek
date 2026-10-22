/**
 * @typedef {import("src/repositories/duoDateCharge").DuoDateCharge} DuoDateCharge
 */

import { createSlice } from '@reduxjs/toolkit';

/**
 * @typedef {Object} DuoDateChargeStore
 * @property {DuoDateCharge[]} data
 */

const initialState = {
  data: [],
};

const duoDateChargeSlice = createSlice({
  name: 'duoDateCharge',
  initialState,
  reducers: {
    /**
     * @param {DuoDateChargeStore} state
     * @param {{payload: DuoDateCharge[]}} body
     */
    setData(state, body) {
      state.data = body.payload;
    },
  },
});

export const { setData } = duoDateChargeSlice.actions;
export default duoDateChargeSlice.reducer;
