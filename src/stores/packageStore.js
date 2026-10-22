import { create } from 'zustand';
import { createSlice } from '@reduxjs/toolkit';

import 'src/repositories/package';
import { packagePlanRepository } from 'src/repositories';

/**
 * @typedef {import('src/repositories/package').IPackageFindResult} IPackageFindResult
 * @typedef {import('src/repositories/package').ResultPackageList} ResultPackageList
 * @typedef {'packagePlans' | 'orderBy' | 'order'} PackageStoreKey
 *
 * @typedef {object} PackageStoreReducer
 * @property {ResultPackageList[]} packagePlans - An array of package plans.
 * @property {string} orderBy
 * @property {string} order
 */

/**
 * @type {PackageStoreReducer}
 */
const initialData = {
  packagePlans: [],
  orderBy: 'title',
  order: 'asc',
};

const packageSlice = createSlice({
  name: 'packagePlan',
  initialState: initialData,
  reducers: {
    /**
     * @param {PackageStoreReducer} state
     * @param {{payload: {key: PackageStoreKey; value: any}}} body
     */
    setPackageStore(state, body) {
      const { key, value } = body.payload;
      state[key] = value;
    },
    /**
     * @typedef {import('src/repositories/package').ResultPackageList} ResultPackageList
     * @param {Object} state - The current state of the store.
     * @param {Object} body - The body object containing the payload.
     * @param {Object} body.payload - The payload object.
     * @param {ResultPackageList[]} body.payload.packagePlans - The array of package plans.
     */
    setPackage(state, body) {
      state.packagePlans = body.payload;
    },
  },
});

// Zustand Store
/**
 * @typedef {object} PackageStore
 * @property {IPackageFindResult[]} packagePlans - An array of package plans.
 * @property {function} setPackagePlans - A function to set the package plans.
 * @property {function} fetchPackagePlans - A function to fetch package plans from the repository.
 */
export const usePackageStore = create((set) => ({
  packagePlans: [],
  setPackagePlans: (packagePlans) => set({ packagePlans }),
  fetchPackagePlans: async () => {
    const result = await packagePlanRepository.getPackageListV2();
    set({ packagePlans: result });
  },
}));

// Export the actions and reducer

export const { setPackage, setPackageStore } = packageSlice.actions;
export default packageSlice.reducer;
