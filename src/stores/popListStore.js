/**
 * @typedef {import("src/repositories/area").GetAllAreaWithCategory} Area
 */

import { createSlice } from '@reduxjs/toolkit';

/**
 * @typedef {Object} PopListStore
 * @property {Area[]} pop
 * @property {string} search
 * @property {string} orderBy
 * @property {string} order
 */

/**
 * @typedef {'pop' | 'search' | 'orderBy' | 'order'} PopListStoreKey
 */

/**
 * @type {PopListStore}
 */
const initialState = {
  pop: [],
  search: '',
  orderBy: 'title',
  order: 'asc',
};

const popListStoreSlice = createSlice({
  name: 'popListStore',
  initialState,
  reducers: {
    /**
     * @param {PopListStore} state
     * @param {{payload: {key: PopListStoreKey, value: any}}} body
     */
    setPopListStore: (state, body) => {
      const { key, value } = body.payload;
      state[key] = value;
    },
  },
});

export const { setPopListStore } = popListStoreSlice.actions;
export default popListStoreSlice.reducer;
