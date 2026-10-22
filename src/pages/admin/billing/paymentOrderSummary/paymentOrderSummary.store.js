import { toast } from 'sonner';
import { create } from 'zustand';
import { addDays } from 'date-fns';

import 'src/extension/date';
import { paymentOrderRepository } from 'src/repositories';

/**
 * @typedef {import('src/repositories/paymetOrder').PaymentGatewaySummaryArea} PaymentGatewaySummaryArea
 */

/**
 * Payment Order Summary Store
 * @typedef {Object} PaymentOrderSummaryStore
 * @property {PaymentGatewaySummaryArea[]} data - Array of payment order summaries by area
 * @property {Date} start - The start date for the summary
 * @property {Date} until - The end date for the summary
 * @property {boolean} loading - Loading state
 * @property {string} search - Search query
 * @property {number} limit - Number of items per page
 * @property {number} page - Current page number
 * @property {() => Promise<void>} load - Function to load the summary data
 * @property {(obj: Partial<PaymentOrderSummaryStore>) => void} setStore - Function to set store values
 */

export const usePaymentOrderSummaryStore = create((set, get) => ({
  data: [],
  start: addDays(new Date(), -7),
  until: new Date(),
  loading: false,
  search: '',
  limit: 10,
  page: 0,
  load: async () => {
    const state = get();
    set({ loading: true });
    try {
      const snapshot = await paymentOrderRepository.getSummaryArea({
        start: state.start.format('yyyy-MM-dd'),
        until: state.until.format('yyyy-MM-dd'),
      });
      set({ data: snapshot });
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
    } finally {
      set({ loading: false });
    }
  },
  setStore: (obj) => {
    set({ ...obj });
  },
}));
