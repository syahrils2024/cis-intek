import { create } from 'zustand';

import { broadcastScheduleRepository } from 'src/repositories';

/**
 * @typedef {import('src/repositories/broadcastSchedule').BroadcastSchedule} BroadcastSchedule
 */

/**
 * @typedef {object} BroadcastScheduleStore
 * @property {BroadcastSchedule[]} data
 * @property {function(): Promise<void>} loadData
 */

export const useBroadcastScheduleStore = create((set) => ({
  data: [],
  loadData: async () => {
    const snapshot = await broadcastScheduleRepository.findAll();
    set({ data: snapshot });
  },
}));
