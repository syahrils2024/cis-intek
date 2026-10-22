/**
 * @typedef {import("@/repositories/area").Area} Area
 * @typedef {import('@/repositories/area').AreaCategory} AreaCategory
 *
 * @typedef {import("@/repositories/area").PPPOEItems} PPPOEItems
 *
 * @typedef {object} AreaStore
 * @property {Area[]} all
 * @property {Category[]} category
 * @property {{key: string; items: PPPOEItems[]}[]} pppoeItems
 */

import { createSlice } from '@reduxjs/toolkit';

/**
 * @type {AreaStore}
 */
const initialState = {
  all: [],
  category: [],
  pppoeItems: [],
};

const areaSlice = createSlice({
  name: 'area',
  initialState,
  reducers: {
    /**
     * @param {AreaStore} state
     * @param {{payload: Area[]}} body
     */
    setArea: (state, body) => {
      state.all = body.payload;
    },
    /**
     * @param {AreaStore} state
     * @param {{payload: AreaCategory[]}} body
     */
    setAreaCategory: (state, body) => {
      state.category = body.payload;
    },
    /**
     * @param {AreaStore} state
     * @param {{payload: {key: string; items: PPPOEItems[]; price?: number; profile: string}}} body
     */
    upsertPppoe: (state, body) => {
      const index = state.pppoeItems.findIndex((p) => p.key === body.payload.key);
      if (index === -1) {
        state.pppoeItems.push({
          key: body.payload.key,
          items: body.payload.items,
        });
      } else {
        state.pppoeItems[index].items = body.payload.items;
      }
    },
    /**
     * @param {AreaStore} state
     * @param {{payload: {parentIndex: number; index: number; price: number}}} body
     */
    setPricePppoeItems(state, body) {
      const { index, price, parentIndex } = body.payload;
      state.all[parentIndex].area[index].price = price;
    },
    /**
     * @param {AreaStore} state
     * @param {{payload: {parentIndex: number; index: number; profile: string}}} body
     */
    setSelectedPppoeProfile(state, body) {
      const { index, profile, parentIndex } = body.payload;
      state.all[parentIndex].area[index].profile = profile;
    },
    /**
     *
     * @param {AreaStore} state
     * @param {{payload: {parentIndex: number; index: number}}} body
     */
    removeLoading(state, body) {
      const { index, parentIndex } = body.payload;
      state.all[parentIndex].area[index].loading = false;
    },
  },
});

export const {
  setArea,
  upsertPppoe,
  setPricePppoeItems,
  setSelectedPppoeProfile,
  setAreaCategory,
  removeLoading,
} = areaSlice.actions;
export default areaSlice.reducer;
