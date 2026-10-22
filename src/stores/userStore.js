import { createSlice } from '@reduxjs/toolkit';

/**
 * @typedef {import('@/repositories/user').User} User
 */

/**
 * @typedef {object} UserStore
 * @property {User[]} admin
 * @property {User[]} engineer
 * @property {User[]} marketing
 * @property {User[]} noc
 * @property {User[]} lo
 */

/**
 * @type {UserStore}
 */
const initialState = {
  admin: [],
  engineer: [],
  marketing: [],
  noc: [],
  lo: [],
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    /**
     * @param {UserStore} state
     * @param {{payload: User[]}} data
     */
    setAdmin: (state, data) => {
      state.admin = data.payload;
    },
    /**
     * @param {UserStore} state
     * @param {{payload: User[]}} data
     */
    setEngineer: (state, data) => {
      state.engineer = data.payload;
    },
    /**
     * @param {UserStore} state
     * @param {{payload: User[]}} data
     */
    setMarketing: (state, data) => {
      state.marketing = data.payload;
    },
    /**
     * @param {UserStore} state
     * @param {{payload: User[]}} data
     */
    setNoc: (state, data) => {
      state.noc = data.payload;
    },
    /**
     * @param {UserStore} state
     * @param {{payload: User[]}} data
     */
    setLo: (state, data) => {
      state.lo = data.payload;
    },
  },
});

export const { setAdmin, setEngineer, setMarketing, setNoc, setLo } = userSlice.actions;
export default userSlice.reducer;
