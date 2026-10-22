// @ts-nocheck
import { create } from 'zustand';

/**
 * @typedef {Object} AvailableDismantleStore
 * @property {import('src/repositories/subscription').AvailableDismantleSubscription[]} data - The list of available dismantle items.
 * @property {number} limit - The number of items per page.
 * @property {number} page - The current page number.
 * @property {number} total - The total number of available dismantle items.
 * @property {string|null} packageId - The ID of the selected package.
 * @property {string|null} areaId - The ID of the selected area.
 * @property {string} areaTitle - The title of the selected area.
 * @property {string} search - The search query string.
 * @property {number} minimumAmount - The minimum amount filter.
 * @property {(data: Partial<AvailableDismantleStore>) => void} setStore - Function to update the store state.
 */

export const useAvailableDismantleStore = create((set) => ({
  data: [],
  limit: 10,
  page: 0,
  total: 0,
  packageId: null,
  areaId: null,
  areaTitle: 'Semua',
  search: '',
  minimumAmount: 2,
  setStore: (data) => set(() => ({ ...data })),
}));
