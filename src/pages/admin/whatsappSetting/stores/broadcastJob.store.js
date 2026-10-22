import { toast } from 'sonner';
import { create } from 'zustand';

import { broadcastJobRunnerRepository } from 'src/repositories';

/**
 * @typedef {import('src/repositories/broadcastJobRunner').BroadcastJobRunner} BroadcastJobRunner
 *
 * initital state
 * @typedef {Object} BroadcastJobStore
 * @property {number} page - current page number
 * @property {number} limit - number of items per page
 * @property {number} total - total number of items
 * @property {string} messageCategory - filter by message category
 * @property {string} whatsappNode - filter by WhatsApp node
 * @property {boolean} loading - loading state
 * @property {Array<BroadcastJobRunner>} data - array of broadcast job data
 * @property {() => Promise<void>} loadData - function to load data
 * @property {(param: {key: keyof BroadcastJobStore, value: any}) => void} setState - function to set state
 */

/**
 * @type {BroadcastJobStore}
 */
export const useBroadcastJobStore = create((set, get) => ({
  page: 0,
  limit: 10,
  total: 0,
  messageCategory: '',
  whatsappNode: '',
  data: [],
  loading: false,
  loadData: async () => {
    set(() => ({ loading: true }));
    try {
      /** @type {BroadcastJobStore} */
      const state = get();

      const snapshot = await broadcastJobRunnerRepository.findAll({
        page: state.page,
        limit: state.limit,
      });

      set(() => ({
        data: snapshot.data,
        total: snapshot.total,
        loading: false,
      }));
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
    }
  },
  /** @param {{key: BroadcastJobStore, value: any}} */
  setState: ({ key, value }) => set(() => ({ [key]: value })),
}));
