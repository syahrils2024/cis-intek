import { toast } from 'sonner';
import { create } from 'zustand';

import { whatsappNodeRepository, whatsappGroupRepository } from 'src/repositories';

import { defaultState } from './whatsappSetting.state';

/** @type {import('./whatsappSetting.state').WhatsappSettingState} */
const useWhatsappSettingStore = create((set, get) => ({
  /** @type {boolean} */
  loading: false,

  /** @type {import("@/repositories/whatsappGroup").WhatsappGroup[]} */
  whatsappGroups: [],

  /** @type {import("@/repositories/whatsappNode").WhatsappNode[]} */
  whatsappNodes: [],

  fetchWhatsappGroups: async () => {
    try {
      set({ loading: true });
      const data = await whatsappGroupRepository.getWhatsappGroup();
      set({ whatsappGroups: data, loading: false });
    } catch (error) {
      set({ loading: false });
      toast.error(error.message);
    }
  },

  fetchWhatsappNodes: async () => {
    try {
      set({ loading: true });
      const data = await whatsappNodeRepository.getWhatsappNode();
      set({ whatsappNodes: data, loading: false });
    } catch (error) {
      set({ loading: false });
      toast.error(error.message);
    }
  },

  /**
   * @param {import('@/repositories/whatsappNode').WhatsappNode} node
   * @param {string} status
   * */
  changeStatusWhatsappNode: async (node, status) => {
    try {
      set({ loading: true });
      await whatsappNodeRepository.changeStatusWhatsappNode(node._id, status);
      set({ loading: false });
    } catch (error) {
      set({ loading: false });
      toast.error(error.message);
    }
  },

  changeOnlineStatus: (node, isOnline) => {
    const index = get().whatsappNodes.findIndex((i) => i._id === node._id);
    if (index !== -1) {
      const updatedNodes = [...get().whatsappNodes];
      updatedNodes[index] = { ...updatedNodes[index], isOnline };
      set({ whatsappNodes: updatedNodes });
    }
  },

  /** @param {import('./whatsappSetting.state').Tab[]} tabs */
  dispose: () => set(defaultState),
}));

export default useWhatsappSettingStore;
