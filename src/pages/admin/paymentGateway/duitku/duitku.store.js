import { create } from 'zustand';

/**
 * @typedef {import('src/repositories/duitku').DuitkuFee} DuitkuFee
 * @typedef {import('src/repositories/duitkuFeeProfile').DuitkuFeeProfile} DuitkuFeeProfile
 */

/**
 * @typedef {Object} DuitkuStoreFee
 * @property {DuitkuFee[]} data - Array of Duitku fee objects
 * @property {boolean} loading - Loading state for fetching fees
 * @property {number} limit - Number of items per page
 * @property {number} page - Current page number
 * @property {string} search
 */

/**
 * @typedef {Object} DuitkuFeeProfileStore
 * @property {DuitkuFeeProfile[]} data - Array of Duitku fee profile objects
 * @property {boolean} loading - Loading state for fetching fee profiles
 * @property {number} limit - Number of items per page
 * @property {number} page - Current page number
 * @property {number} total
 * @property {string} search
 */

/**
 * @typedef {'data' | 'loading' | 'limit' | 'page' | 'search'} DuitkuStoreFeeKey
 * @property {DuitkuStoreFee[key]} value - The value to set for the fee state
 */

/**
 * @typedef {Object} DuitkuStore
 * @property {DuitkuStoreFee} fee - State related to Duitku fees
 * @property {(data: { [key in DuitkuStoreFeeKey]: DuitkuStoreFee[key] }) => void} [setFee] - Function to update the Fee state
 * @property {DuitkuFeeProfileStore} feeProfile - State related to Duitku fee profiles
 * @property {(data: Partial<DuitkuFeeProfileStore>) => void} [setFeeProfile] - Function to update the Fee Profile state
 */

export const useDuitkuStore = create((set) => ({
  fee: {
    data: [],
    loading: false,
    limit: 10,
    page: 0,
    search: '',
  },
  feeProfile: {
    data: [],
    loading: false,
    limit: 10,
    page: 0,
    search: '',
    total: 0,
  },
  /** @param { { [key in DuitkuStoreFeeKey]: DuitkuStoreFee[key] } } value */
  setFee: (value) => {
    set((state) => ({ fee: { ...state.fee, ...value } }));
  },
  /** @param {Partial<DuitkuFeeProfileStore>} */
  setFeeProfile: (value) => {
    set((state) => ({ feeProfile: { ...state.feeProfile, ...value } }));
  },
}));
