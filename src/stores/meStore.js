/**
 * @typedef {import("@/repositories/auth").CurrentAuth} CurrentAuth
 * @typedef {import("@/repositories/userProfile").UserProfile} UserProfile
 */

import { create } from 'zustand';
import { createSlice } from '@reduxjs/toolkit';

/**
 * @typedef {Object} MeStore
 * @property {CurrentAuth} me
 * @property {UserProfile} profile
 * @property {boolean} locked
 */
const initialState = {
  me: null,
  profile: null,
};

/** @deprecated prefer using useMeStore */
const meSlice = createSlice({
  name: 'me',
  initialState,
  reducers: {
    /**
     * @param {{payload: CurrentAuth}} data
     */
    setMe: (state, data) => {
      state.me = data.payload;
    },
    /**
     * @param {{payload: UserProfile}} data
     */
    setProfile: (state, data) => {
      state.profile = data.payload;
    },
  },
});

export const useMeStore = create((set, get) => ({
  me: null,
  profile: null,
  locked: () => get().me?.locked ?? false,
  setMe: (data) => set((state) => ({ me: data })),
  setProfile: (data) => set((state) => ({ profile: data })),
}));

export const { setMe, setProfile } = meSlice.actions;
export default meSlice.reducer;
