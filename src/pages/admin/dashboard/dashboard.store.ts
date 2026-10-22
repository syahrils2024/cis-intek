// @ts-nocheck

import { toast } from 'sonner';
import { create } from 'zustand';

import { dashboardRepository } from 'src/repositories';

/** @typedef {import('src/repositories/dashboard').responseGetDashboardStatistics} ResponseGetDashboardStatistics */

/**
 * @typedef {Object} DashboardStore
 * @property {ResponseGetDashboardStatistics|{}} data - Latest dashboard statistic snapshot
 * @property {Date} date - Selected period (year/month) used for the query
 * @property {string|null} fetchedPeriod - Period (`YYYY-MM`) currently held in `data`
 * @property {boolean} loading - Loading state
 * @property {(data: ResponseGetDashboardStatistics|{}) => void} setStore - Replace the dashboard data
 * @property {(date: Date) => void} setDate - Update the selected period
 * @property {() => Promise<void>} fetchData - Fetch dashboard statistic from the V3 endpoint
 */

export const useDashboardStore = create((set, get) => ({
  data: {},
  date: new Date(),
  fetchedPeriod: null,
  loading: false,
  setStore: (data) => set(() => ({ data })),
  setDate: (date) => set(() => ({ date, fetchedPeriod: null })),
  fetchData: async () => {
    const { date } = get();

    const [year, month] = date.toISOString().slice(0, 10).split('-');
    const period = `${year}-${month}`;

    // Keep the previously loaded snapshot for the same period.
    if (get().fetchedPeriod === period) return;

    set({ loading: true });

    try {
      const snapshot = await dashboardRepository.getDashboardStatistics({ year, month });
      set({ data: snapshot, fetchedPeriod: period });
    } catch (error) {
      if (error instanceof Error) toast.error(`Gagal memuat data dashboard: ${error.message}`);
    } finally {
      set({ loading: false });
    }
  },
}));
