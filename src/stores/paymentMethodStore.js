/**
 * @typedef {import("src/repositories/depositMethod").PaymentMethod} PaymentMethod
 */

import { create } from 'zustand';
import { createSlice } from '@reduxjs/toolkit';

import { depositMethodRepository } from 'src/repositories';

/**
 * @typedef {Object} PaymentMethodStore
 * @property {PaymentMethod[]} cash
 * @property {PaymentMethod[]} transfer
 * @property {PaymentMethod[]} ewallet
 * @property {() => Promise<void>} loadPaymentMethods
 */

export const usePaymentMethodStore = create((set) => ({
  cash: [],
  transfer: [],
  ewallet: [],
  loadPaymentMethods: async () => {
    const snapshotCash = await depositMethodRepository.getPaymentMethod('cash').catch(() => []);
    const snapshotTransfer = await depositMethodRepository
      .getPaymentMethod('transfer')
      .catch(() => []);
    const snapshotEwallet = await depositMethodRepository
      .getPaymentMethod('ewallet')
      .catch(() => []);

    set({
      cash: snapshotCash.filter((item) => item.status === 'active'),
      transfer: snapshotTransfer.filter((item) => item.status === 'active'),
      ewallet: snapshotEwallet.filter((item) => item.status === 'active'),
    });
  },
}));

/**
 * @type {PaymentMethodStore}
 */
const initialState = {
  cash: [],
  transfer: [],
  ewallet: [],
};

const paymentMethodSlice = createSlice({
  name: 'paymentMethod',
  initialState,
  reducers: {
    /**
     * @param {PaymentMethodStore} state
     * @param {{payload: {key: 'cash' | 'transfer', value: any}}} body
     */
    paymentMethodStoreSetState(state, body) {
      const { key, value } = body.payload;
      state[key] = value;
    },
    /**
     * @param {PaymentMethodStore} state
     * @param {{payload: {key: 'cash' | 'transfer' | 'ewallet', value: any}[]}} body
     */
    paymentMethodStoreSetStateMulti(state, body) {
      body.payload.forEach((p) => {
        const { key, value } = p;
        state[key] = value;
      });
    },
  },
});

export const { paymentMethodStoreSetState, paymentMethodStoreSetStateMulti } =
  paymentMethodSlice.actions;
export default paymentMethodSlice.reducer;
