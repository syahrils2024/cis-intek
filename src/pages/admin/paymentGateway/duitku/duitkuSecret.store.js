import { toast } from 'sonner';
import { create } from 'zustand';

import { duitkuSecretRepository } from 'src/repositories';

/**
 * Zustand store for managing Duitku secrets.
 *
 * @typedef {Object} DuitkuSecretStore
 * @property {number} page - The current page number for pagination.
 * @property {number} limit - The number of items per page.
 * @property {string} search - The search query string.
 * @property {Array<Object>} data - The fetched data array.
 * @property {number} total - The total number of items available.
 * @property {boolean} loading - Indicates whether data is currently being loaded.
 * @property {() => Promise<void>} loadData - Function to load data from the repository.
 * @property {(state: Partial<DuitkuSecretStore>) => void} setStore - Function to update the store state.
 */

/**
 * @typedef {keyof DuitkuSecretStore} DuitkuSecretStoreKey
 */

/**
 * Zustand store for Duitku secrets.
 * @type {import('zustand').StoreApi<DuitkuSecretStore>}
 */
export const useDuitkuSecretStore = create((set, get) => ({
  page: 0,
  limit: 10,
  search: '',
  data: [],
  loading: false,
  total: 0,
  /** @param {Partial<DuitkuSecretStore>} state */
  setStore: (state) => {
    set((currentState) => ({ ...currentState, ...state }));
  },
  loadData: async () => {
    set({ loading: true });
    const state = get();
    try {
      const snapshot = await duitkuSecretRepository.findAll({
        page: state.page,
        limit: state.limit,
        search: state.search,
      });
      const fetchedData = snapshot.data;
      set({ data: fetchedData, total: snapshot.total });
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
    } finally {
      set({ loading: false });
    }
  },
}));
