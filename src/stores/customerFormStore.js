import { createSlice } from '@reduxjs/toolkit';
import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
/**
 * @typedef {import('./areaStore').Area} Area
 * @typedef {import('./areaStore').PPPOEItems} PPPoEItems
 * @typedef {import('@/repositories/area').Odp} Odp
 * @typedef {import('./packageStore').ResultPackageList} Package
 *
 * @typedef {'fullname' | 'phone' | 'address' | 'lat' | 'long' | 'serverAreaId' | 'serverOdpId' | 'vlanId' | 'ipRemote' | 'PPPoEName' | 'PPPoEPassword' | 'packetPlanId' | 'price' | 'start'} SetField
 *
 * Initial state object for user data.
 * @typedef {Object} CustomerFormStore
 * @property {string} fullname - Full name of the user.
 * @property {string} phone - Phone number of the user.
 * @property {string} address - Address of the user.
 * @property {string} lat - Latitude coordinates of the user's location.
 * @property {string} long - Longitude coordinates of the user's location.
 * @property {string} serverAreaId - Server area identifier.
 * @property {string} serverOdpId - Server ODP identifier.
 * @property {string} vlanId - VLAN (Virtual Local Area Network) identifier.
 * @property {string} ipRemote - Remote IP address.
 * @property {string} PPPoEName - PPPoE (Point-to-Point Protocol over Ethernet) username.
 * @property {string} PPPoEPassword - PPPoE password.
 * @property {string} packetPlanId - Packet plan identifier for the user's plan.
 * @property {number} price - Price for the selected packet plan.
 * @property {string} start - Start date of the service or plan.
 * @property {string} birth - Start date of the service or plan.
 * @property {null | File} ktpImage - Start date of the service or plan.
 * @property {Area[]} areaList -
 * @property {Odp[]} odpList -
 * @property {PPPoEItems[]} vlanList -
 * @property {Package[]} packageList -
 */

const persistConfig = {
  key: 'customerFormStore',
  storage,
};

/**
 * @type {CustomerFormStore}
 */
export const initialState = {
  fullname: '',
  phone: '',
  address: '',
  birth: '',
  lat: 0,
  long: 0,
  ktpImage: null,
  serverAreaId: '',
  serverOdpId: '',
  vlanId: '',
  ipRemote: '',
  PPPoEName: '',
  PPPoEPassword: '',
  packetPlanId: '',
  price: 0,
  start: '',
  areaList: [],
  vlanList: [],
  odpList: [],
  packageList: [],
};

const customerFormSlice = createSlice({
  name: 'customerForm',
  initialState,
  reducers: {
    /**
     * @param {CustomerFormStore} state
     * @param {{payload: {key: SetField, value: string | number}}} body
     */
    setFormState(state, body) {
      state[body.payload.key] = body.payload.value;
    },
    reset(state) {
      state.fullname = '';
      state.phone = '';
      state.address = '';
      state.birth = '';
      state.lat = '';
      state.long = '';
      state.serverAreaId = '';
      state.serverOdpId = '';
      state.vlanId = '';
      state.ipRemote = '';
      state.PPPoEName = '';
      state.PPPoEPassword = '';
      state.packetPlanId = '';
      state.price = 0;
      state.start = '';
    },
    /**
     * @param {CustomerFormStore} state
     * @param {{payload: Area[]}} body
     */
    setArea(state, body) {
      state.areaList = body.payload;
    },
    /**
     * @param {CustomerFormStore} state
     * @param {{payload: string}} body
     */
    setSelectedAreaId(state, body) {
      state.serverAreaId = body.payload;
    },
    /**
     * @param {CustomerFormStore} state
     * @param {{payload: PPPoEItems[]}} body
     */
    setVlan(state, body) {
      state.vlanList = body.payload;
    },
    /**
     * @param {CustomerFormStore} state
     * @param {{payload: Odp[]}} body
     */
    setOdp(state, body) {
      state.odpList = body.payload;
    },
    /**
     * @param {CustomerFormStore} state
     * @param {{payload: Package[]}} body
     */
    setPackage(state, body) {
      state.packageList = body.payload;
    },
  },
});

export const { setFormState, reset, setArea, setOdp, setPackage, setVlan, setSelectedAreaId } =
  customerFormSlice.actions;
export default persistReducer(persistConfig, customerFormSlice.reducer);
