import { create } from 'zustand';

import { mutasiBankRepository } from 'src/repositories';

/**
 * @typedef {import('@/repositories/mutasiBank').IMutasiBankAccount} IMutasiBankAccount
 */

/**
 * @typedef {Object} MutasiBankStore
 * @property {IMutasiBankAccount[]} accounts
 * @property {() => Promise<void> } prefetch
 */

/**
 * @type {MutasiBankStore}
 */
export const useMutasiBankAccount = create((set) => ({
  accounts: [],
  prefetch: async () => {
    const snapshot = await mutasiBankRepository.accountList().catch(() => []);
    return set((state) => ({ accounts: snapshot }));
  },
}));
