// @ts-nocheck
import { toast } from 'sonner';
import { create } from 'zustand';

import { findOltDevice } from 'src/repositories/oltDevice';

/** @typedef {import('src/repositories/oltDevice').OltDevice} OltDevice */

/**
 * @typedef {Object} OltStore
 * @property {OltDevice[]} oltList - List of OLT devices
 * @property {number} page - Current page number
 * @property {number} limit - Number of items per page
 * @property {boolean} loading - Loading state
 * @property {(data: Partial<OltStore>) => void} setStore - Function to set the OLT device list
 * @property {() => Promise<void>} fetchOlt - Function to fetch OLT devices
 */

export const useOltStore = create((set) => ({
  oltList: [],
  page: 0,
  limit: 10,
  loading: false,
  setStore: (payload) => set((state) => ({ ...payload })),
  fetchOlt: async () => {
    set({ loading: true });
    try {
      const oltList = await findOltDevice();
      set({ oltList });
    } catch (error) {
      if (error instanceof Error) toast.error(`Gagal memuat data OLT: ${error.message}`);
    } finally {
      set({ loading: false });
    }
  },
}));
