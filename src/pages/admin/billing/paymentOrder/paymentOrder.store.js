import { toast } from 'sonner';
import { create } from 'zustand';
import { addDays } from 'date-fns';

import 'src/extension/date';
import { paymentOrderRepository } from 'src/repositories';

/**
 * @typedef {import('src/repositories/paymetOrder').PaymentGatewayOrder} PaymentOrder
 */

/**
 * @typedef {Object} PaymentOrderStore
 * @property {string} areaName - The name of the area.
 * @property {string} areaId - The ID of the area.
 * @property {number} page - The current page number for pagination.
 * @property {number} limit - The number of items per page.
 * @property {string} search - The search query string.
 * @property {string} status - The status filter for payment orders.
 * @property {Array<PaymentOrder>} data - The fetched data array.
 * @property {number} total - The total number of items available.
 * @property {boolean} loading - Indicates whether data is currently being loaded.
 * @property {Date} start - The start date for filtering payment orders.
 * @property {Date} until - The end date for filtering payment orders.
 * @property {() => Promise<void>} load - Function to load payment order data.
 * @property {(state: Partial<PaymentOrderStore>) => void} setStore - Function to update the store state.
 */

export const usePaymentOrderStore = create((set, get) => ({
  areaName: 'Semua',
  areaId: '',
  page: 0,
  limit: 10,
  status: 'success',
  search: '',
  data: [],
  loading: false,
  total: 0,
  start: addDays(new Date(), -3),
  until: new Date(),
  setStore: (state) => {
    set((currentState) => ({ ...currentState, ...state }));
  },
  load: async () => {
    set({ loading: true });
    /** @type {PaymentOrderStore} */
    const state = get();
    try {
      const snapshot = await paymentOrderRepository.getOrders({
        page: state.page,
        limit: state.limit,
        search: state.search,
        start: state.start.format('yyyy-MM-dd'),
        until: state.until.format('yyyy-MM-dd'),
        status: state.status,
        areaId: state.areaId,
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
