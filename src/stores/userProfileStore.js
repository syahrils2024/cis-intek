/**
 * @typedef {import("src/repositories/userProfile").UserProfile} UserProfile
 */

import { createSlice } from '@reduxjs/toolkit';

/**
 * @typedef {object} UserProfileStore
 * @property {UserProfile[]} data
 */

/**
 * @typedef {'data'} UserProfileStoreKey
 */

/** @type {UserProfileStore} */
const initialState = {
  data: [],
};

const userProfileSlice = createSlice({
  name: 'userProfile',
  initialState,
  reducers: {
    /**
     * @param {UserProfileStore} state
     * @param {{payload: {key: UserProfileStoreKey; value: any}}} body
     */
    setUserProfileStore: (state, body) => {
      const { key, value } = body.payload;
      state[key] = value;
    },
  },
});

export const { setUserProfileStore } = userProfileSlice.actions;
export default userProfileSlice.reducer;
