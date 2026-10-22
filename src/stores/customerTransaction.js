import { create } from 'zustand';

/**
 * @typedef {Object} CustomerTransactionStore
 * @property {import('src/repositories/customerTransaction').ICheckCustomerResponse} customerData
 * @property {import('src/repositories/depositMethod').PaymentMethod[]} availableDepositMethod
 * @property {import('src/repositories/customerTransaction').ICustomerTransaction} customerTransaction
 * @property {import('src/repositories/subscription').Billing} billingList
 * @property {(d) => void} setCustomerData
 * @property {(d) => void} setAvailableDepositMethod
 * @property {(d) => void} setCustomerTransaction
 * @property {(d) => void} setBillingList
 * @property {() => void} reset
 */
export const useCustomerTransaction = create((set) => ({
  customerData: null,
  availableDepositMethod: [],
  customerTransaction: null,
  billingList: [],
  setCustomerData: (d) => set((state) => ({ customerData: d })),
  setAvailableDepositMethod: (d) => set((state) => ({ availableDepositMethod: d })),
  setCustomerTransaction: (d) => set((state) => ({ customerTransaction: d })),
  setBillingList: (d) => set((state) => ({ billingList: d })),
  reset: () =>
    set((state) => ({
      customerTransaction: null,
      customerData: null,
      billingList: [],
    })),
}));
