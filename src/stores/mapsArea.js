/**
 * @typedef {import("src/repositories/area").Area} Area
 * @typedef {import("src/repositories/area").Odp} Odp
 * @typedef {import('src/repositories/customer').Customer} Customer
 * @typedef {import('src/repositories/area').AreaCategory} AreaCategory
 */

import { createSlice } from '@reduxjs/toolkit';

/**
 * @typedef {Object} MapsAreaStore
 * @property {Area[]} areas
 * @property {Area[]} allAreas
 * @property {Odp[]} odps
 * @property {Customer[]} customers
 * @property {number[]} center
 * @property {Area[]} searchAreas
 * @property {AreaCategory[]} searchAreaCategories
 * @property {Odp[]} searchOdps
 * @property {Customer[]} searchCustomers
 * @property {'mikrotik' | 'odp' | 'customer'} searchType
 * @property {string} search
 * @property {boolean} showCustomer
 * @property {boolean} showOdp
 * @property {boolean} showLabel
 * @property {string} selectedAreaId
 */

/**
 * @typedef {'areas' | 'odps' | 'customers' | 'center' | 'searchAreas' | 'searchOdps' | 'searchCustomer' | 'search' | 'searchType' | 'showCustomer' | 'showOdp' | 'searchAreaCategories' | 'showLabel' | 'allAreas' | 'selectedAreaId'} mapsAreaStoreKey
 */

/**
 * @type {MapsAreaStore}
 */
const initialState = {
  areas: [],
  odps: [],
  customers: [],
  center: null,
  searchAreas: [],
  searchOdps: [],
  searchCustomers: [],
  searchAreaCategories: [],
  allAreas: [],
  selectedAreaId: '',
  search: '',
  searchType: 'customer',
  showCustomer: true,
  showOdp: true,
  showLabel: false,
};

const mapsAreaSlice = createSlice({
  name: 'mapsArea',
  initialState,
  reducers: {
    /**
     * @param {MapsAreaStore} state
     * @param {{payload: {key: mapsAreaStoreKey; value: any}}} body
     */
    setMapsAreaStore: (state, body) => {
      const { value, key } = body.payload;
      state[key] = value;
    },
    /**
     * @param {MapsAreaStore} state
     * @param {{payload: Odp[]}} body
     */
    setOdp: (state, body) => {
      state.odps = body.payload;
    },
    /**
     * @param {MapsAreaStore} state
     * @param {{payload: Area[]}} body
     */
    setAreas: (state, body) => {
      state.areas = body.payload;
    },
    /**
     * @param {MapsAreaStore} state
     * @param {{payload: Customer[]}} body
     */
    setCustomers: (state, body) => {
      state.customers = body.payload;
    },
    /**
     * @param {MapsAreaStore} state
     * @param {{payload: number[]}} body
     */
    setCenter: (state, body) => {
      state.center = body.payload;
    },
  },
});

export const { setAreas, setOdp, setCustomers, setCenter, setMapsAreaStore } =
  mapsAreaSlice.actions;
export default mapsAreaSlice.reducer;
