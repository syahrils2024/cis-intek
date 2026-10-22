/**
 * @typedef {import("src/repositories/installation").InstallationRequest} InstallationRequest
 */

import { createSlice } from '@reduxjs/toolkit';

/**
 * @typedef {Object} InstallationRequestStore
 * @property {InstallationRequest[]} requests
 * @property {string} sortBy
 * @property {string} sort
 */

/**
 * @typedef {'requests' | 'sortBy' | 'sort'} InstallationRequestStoreKey
 */

/** @type {InstallationRequestStore} */
const initialState = {
  requests: [],
  sortBy: 'customer',
  sort: 'asc',
};

const installationRequestSlice = createSlice({
  name: 'installation-request',
  initialState,
  reducers: {
    /**
     * @param {InstallationRequestStore} state
     * @param {{payload: {key: InstallationRequestStoreKey; value: any}}} body
     */
    setInstallationRequestState(state, body) {
      const { key, value } = body.payload;
      state[key] = value;
    },
    /**
     * @param {InstallationRequestStore} state
     * @param {{payload: InstallationRequest[]}} body
     */
    setInstallationRequest(state, body) {
      state.requests = body.payload;
    },
  },
});

export const { setInstallationRequest, setInstallationRequestState } =
  installationRequestSlice.actions;
export default installationRequestSlice.reducer;
