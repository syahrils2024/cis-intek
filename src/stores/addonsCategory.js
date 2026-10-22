import { create } from 'zustand';

/**
 * @typedef {import('src/repositories/addons').AddonsCategory} AddonsCategory
 */

/**
 * @typedef {Object} AddonsCategoryStore
 * @property {AddonsCategory[]} data
 * @property {(d: AddonsCategory[]) => void} setData
 */

export const useAddonsCategory = create((set) => ({
  data: [],
  setData: (d) => set((state) => ({ data: d })),
}));
