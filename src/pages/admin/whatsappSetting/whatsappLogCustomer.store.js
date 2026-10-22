import { toast } from 'sonner';
import { create } from 'zustand';
import { format } from 'date-fns';

import { whatsappLogRepository } from 'src/repositories';

/**
 * @typedef {import('src/repositories/whatsappLog').WhatsappLogCustomer} WhatsappLogCustomer
 */

/**
 * Zustand store for managing WhatsApp customer logs.
 *
 * @typedef {Object} WhatsappLogCustomerStore
 * @property {boolean} loading - Indicates whether data is being fetched.
 * @property {WhatsappLogCustomer[]} data - The list of WhatsApp customer logs.
 * @property {number} total - The total number of logs.
 * @property {number} page - The current page number for pagination.
 * @property {number} limit - The number of logs per page.
 * @property {Date} start - The start date for filtering logs.
 * @property {Date} until - The end date for filtering logs.
 * @property {number} totalFailed - The total number of failed logs.
 * @property {number} totalSuccess - The total number of successful logs.
 * @property {number} pendingJobs - The number of pending jobs.
 * @property {string} search - The search term for filtering logs.
 * @property {string} status - The status filter for logs (e.g., 'success', 'failed').
 * @property {string} fromWhatsappNode - The WhatsApp node from which the logs are fetched.
 * @property {string} messageCategory - The category of the message (e.g., 'broadcast', 'auto_reply').
 * @property {() => Promise<void>} fetchData - Fetches the WhatsApp customer logs.
 * @property {({ start: string, until: string }) => void} setDateRange - Sets the date range for filtering logs.
 * @property {({ page: number, limit: number }) => void} setPagination - Sets the pagination parameters.
 * @property {({
 * search: string,
 * status: string,
 * fromWhatsappNode: string,
 * messageCategory: string,
 * }) => void} setSearch - Sets the search term and status filter.
 */

export const useWhatsappLogCustomerStore = create((set, get) => ({
  loading: false,
  data: [],
  total: 0,
  totalFailed: 0,
  totalSuccess: 0,
  pendingJobs: 0,
  search: '',
  status: '',
  fromWhatsappNode: '',
  page: 0,
  limit: 10,
  start: new Date(),
  until: new Date(),
  messageCategory: '',
  fetchData: async () => {
    set({ loading: true });
    try {
      const state = get();
      const snapshot = await whatsappLogRepository.getWhatsappLogCustomer({
        page: state.page,
        limit: state.limit,
        start: format(state.start, 'yyyy-MM-dd'),
        until: format(state.until, 'yyyy-MM-dd'),
        search: state.search,
        status: state.status,
        fromWhatsappNode: state.fromWhatsappNode,
        messageCategory: state.messageCategory,
      });
      set({
        data: snapshot.data,
        total: snapshot.total,
        totalFailed: snapshot.totalFailed,
        totalSuccess: snapshot.totalSuccess,
        pendingJobs: snapshot.pendingJob,
      });
    } catch (error) {
      console.error('Error fetching WhatsApp customer logs:', error);
      toast.error(error.message);
    } finally {
      set({ loading: false });
    }
  },
  setDateRange: ({ start, until }) => {
    if (start) set({ start: new Date(start) });
    if (until) set({ until: new Date(until) });
  },
  setPagination: ({ page, limit }) => {
    if (typeof page === 'number') set({ page });
    if (typeof limit === 'number') set({ limit });
  },
  setSearch: ({ search, status, fromWhatsappNode, messageCategory }) => {
    if (search !== undefined) set({ search });
    if (status !== undefined) set({ status });
    if (fromWhatsappNode !== undefined) set({ fromWhatsappNode });
    if (messageCategory !== undefined) set({ messageCategory });
  },
}));
