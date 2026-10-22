/**
 * @typedef {import("src/repositories/subscription").PaymentHistory} PaymentHistory
 */

import { toast } from 'sonner';
import { useState } from 'react';
import { useBoolean } from '@hooks/use-boolean';
import { useConfirm } from 'material-ui-confirm';
import { usePrivilege } from '@auth/hooks/privileges';

import { subscriptionRepository } from 'src/repositories';

export function useHistoryPaymentState() {
  const confirm = useConfirm();

  /** @type {[string, Function]} */
  const [customer_id, setCustomer_id] = useState(null);

  /** @type {[PaymentHistory[], Function]} */
  const [histories, setHistories] = useState([]);
  const { isAdmin } = usePrivilege();
  const loading = useBoolean(false);
  const allowCancel = isAdmin;

  /**
   *
   * @param {string} c_id - Customer ID
   */
  async function load(c_id) {
    setCustomer_id(c_id);
    loading.onTrue();
    try {
      const snapshot = await subscriptionRepository.getPaymentHistory(c_id);
      setHistories(snapshot);
    } catch (error) {
      toast.error(error.message);
    } finally {
      loading.onFalse();
    }
  }

  /**
   * @param {PaymentHistory} item
   */
  function onPrint(item) {
    const PAYMENT_URL = import.meta.env.VITE_PAYMENT_URL;
    const url = `${PAYMENT_URL}/${item._id}`;
    window.open(url, '_blank');
  }

  /**
   * @param {PaymentHistory} history
   */
  async function removeInvoice(history) {
    try {
      const formatDate = new Date(history.date).formatSummaryDate();
      await confirm({
        title: 'Batalkan Pembayaran',
        content: `Apakah anda ingin menghapus pembayaran ${history.customer} pada ${formatDate}`,
        cancellationText: 'Tidak',
        cancellationButtonProps: { color: 'primary' },
        confirmationText: 'Ya',
        confirmationButtonProps: { color: 'error' },
      });
      const promises = subscriptionRepository.removeSomeInvoice(history._id);

      loading.onTrue();
      toast.promise(promises, {
        loading: 'Membatalkan Pembayaran...',
        success: () => {
          load(customer_id);
          return 'Berhasil Membatalkan Pembayaran';
        },
        error: 'Gagal membatalkan pembayaran',
        finally: () => loading.onFalse(),
      });
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
    }
  }

  function reset() {
    setCustomer_id(null);
    setHistories([]);
  }

  return {
    histories,
    loading,
    allowCancel,
    load,
    onPrint,
    removeInvoice,
    reset,
  };
}
