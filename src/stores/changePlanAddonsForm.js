import { create } from 'zustand';

/**
 * @typedef {Object} AddonsForm
 * @property {string} variantId
 * @property {string} price
 * @property {Dayjs} start
 */

/**
 * @typedef {Object} ChangePlanAddonsFormStore
 * @property {AddonsForm[]} customerAddons
 * @property {(data: AddonsForm[]) => void} setCustomerAddons
 * @property {() => void} reset
 */

export const useChangePlanAddonsFormStore = create((set) => ({
  customerAddons: [],
  setCustomerAddons: (items) => set((state) => ({ customerAddons: items })),
  reset: () => set((state) => ({ customerAddons: [] })),
}));
