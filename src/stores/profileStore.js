import { createSlice } from '@reduxjs/toolkit';

/**
 * @typedef {Object} ProfileStore
 * @property {boolean} show
 */
const initialState = {
  show: false,
};

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    /**
     * @param {ProfileStore} state
     * @param {{payload: boolean}} body
     */
    setShow(state, body) {
      state.show = body.payload;
    },
  },
});

export const { setShow } = profileSlice.actions;
export default profileSlice.reducer;
