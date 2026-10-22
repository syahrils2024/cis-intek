import { create } from 'zustand';
import { createSlice } from '@reduxjs/toolkit';

import { broadcastTemplateRepository } from 'src/repositories';

/**
 * @typedef {import("@/repositories/broadcastTemplate").BroadcastTemplate} BroadcastTemplate
 * @typedef {object} BroadcastStore
 * @property {BroadcastTemplate[]} data
 * @property {(data: BroadcastTemplate[]) => void} setData
 * @property {() => Promise<void>} loadData
 */

/**
 * @type {BroadcastStore}
 */
export const useBroadcastStore = create((set, get) => ({
  data: [],
  setData: (data) => set({ data }),
  loadData: async () => {
    const result = await broadcastTemplateRepository.getBroadcastTemplate();
    set({ data: result });
  },
}));

/**
 * @type {BroadcastStore}
 */
const initialState = {
  data: [],
};

const broadcastSlice = createSlice({
  name: 'broadcast',
  initialState,
  reducers: {
    /**
     *
     * @param {BroadcastStore} state
     * @param {{payload: BroadcastStore[]}} body
     */
    setData: (state, body) => {
      state.data = body.payload;
    },
  },
});

export const { setData } = broadcastSlice.actions;
export default broadcastSlice.reducer;
