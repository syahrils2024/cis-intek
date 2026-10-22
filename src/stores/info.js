import { create } from 'zustand';

import { userRepository } from 'src/repositories';

/**
 * @typedef {Object} InfoStore
 * @property {number} invoiceTempPending - The number of pending temporary invoices.
 * @property {number} jobQueuePending - The number of pending jobs in the queue.
 * @property {number} customerTransactionPending - The number of pending customer transactions.
 * @property {number} ticketPending - The number of pending tickets.
 * @property {number} ticketProcessed - The number of processed tickets.
 * @property {number} ticketWaitingFinishing - The number of tickets waiting to be finished.
 * @property {number} customerPending
 * @property {number} installationRequest
 * @property {() => Promise<void>} refresh - Refreshes the store data by fetching from the server.
 */

export const useInfoStore = create((set) => ({
  invoiceTempPending: null,
  jobQueuePending: null,
  customerTransactionPending: null,
  ticketPending: null,
  ticketProcessed: null,
  ticketWaitingFinishing: null,
  customerPending: null,
  installationRequest: null,
  refresh: async () => {
    const snapshot = await userRepository.getInfo().catch(() => null);
    if (!snapshot) return;
    set({
      invoiceTempPending: snapshot.invoiceTempPending,
      jobQueuePending: snapshot.jobQueuePending,
      customerTransactionPending: snapshot.customerTransactionVerify,
      ticketPending: snapshot.ticketPending,
      ticketProcessed: snapshot.ticketProcessed,
      ticketWaitingFinishing: snapshot.ticketWaitingFinishing,
      customerPending: snapshot.customerPending,
      installationRequest: snapshot.installationRequest,
    });
  },
}));
