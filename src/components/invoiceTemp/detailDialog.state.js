/**
 * @typedef {import("src/repositories/invoiceTemp").InvoiceTemp} InvoiceTemp
 * @typedef {import('src/stores/paymentMethodStore').PaymentMethodStore} PaymentMethodStore
 */

import { toast } from 'sonner';
import { useBoolean } from '@hooks/use-boolean';
import { useConfirm } from 'material-ui-confirm';
import { useRef, useMemo, useState } from 'react';
import { usePrivilege } from '@auth/hooks/privileges';

import { useTheme, useMediaQuery } from '@mui/material';

import { invoiceTempRepository } from 'src/repositories';
import { usePaymentMethodStore } from 'src/stores/paymentMethodStore';

export function useInvoiceTempDialogState() {
  /** @type {PaymentMethodStore} */
  const paymentMethodStore = usePaymentMethodStore();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const show = useBoolean(false);
  const resolver = useRef();
  const confirm = useConfirm();
  const rejectDialogRef = useRef();
  const loading = useBoolean(false);
  const viewerImageRef = useRef();
  const loadingData = useBoolean(false);
  const [depositMethod, setDepositMethod] = useState('');
  const [note, setNote] = useState('');
  const [addBalanceToWallet, setAddBalanceToWallet] = useState(null);

  /**
   * @type {[InvoiceTemp, void]}
   */
  const [data, setData] = useState(null);
  const { isAdmin } = usePrivilege();

  const isDepositMethodCash = useMemo(
    () => paymentMethodStore.cash.some((item) => item._id === depositMethod),
    [data, depositMethod, paymentMethodStore.cash]
  );
  const showUserWallet = useMemo(
    () => isAdmin && data?.status === 'pending' && isDepositMethodCash,
    [data, isAdmin, isDepositMethodCash]
  );

  function reset() {
    setAddBalanceToWallet(null);
    setData(null);
    setNote('');
    setDepositMethod('');
    loading.onFalse();
    loadingData.onFalse();
  }

  function close(isPrefetch) {
    show.onFalse();
    setData(null);
    resolver.current?.(!!isPrefetch);
  }

  async function loadPaymentMethods() {
    const d = [
      ...paymentMethodStore.cash,
      ...paymentMethodStore.transfer,
      ...paymentMethodStore.ewallet,
    ];
    if (d.length > 0) return;

    loadingData.onTrue();
    loading.onTrue();
    await paymentMethodStore.loadPaymentMethods();
    loadingData.onFalse();
    loading.onFalse();
  }

  async function prefetch(invoiceTempId) {
    loadingData.onTrue();
    try {
      const invoiceTemp = await invoiceTempRepository.getDetail(invoiceTempId);
      setData(invoiceTemp);
      setNote(invoiceTemp?.note);
      setDepositMethod(invoiceTemp?.depositMethod);
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
    } finally {
      loadingData.onFalse();
    }
  }

  /**
   * @param {InvoiceTemp} invoiceTempData
   */
  function open(invoiceTempData) {
    reset();

    const invoiceTempDataIsID = typeof invoiceTempData === 'string';
    if (invoiceTempDataIsID) {
      prefetch(invoiceTempData);
    } else {
      setData(invoiceTempData);
      setNote(invoiceTempData?.note);
      setDepositMethod(invoiceTempData?.depositMethod);
      // if (invoiceTempData?.paymentMethod?.toLowerCase() === 'cash') {
      //   addBalanceToWallet.onTrue();
      // }
    }

    show.onTrue();
    loadPaymentMethods();

    return new Promise((resolve) => {
      resolver.current = resolve;
    });
  }

  async function onApprove() {
    loading.onTrue();
    try {
      if (isDepositMethodCash && addBalanceToWallet === null) {
        toast.error('Silahkan pilih opsi kas kolektor atau tanpa kas kolektor');
        return;
      }

      await confirm({
        title: 'Approve',
        content: 'Apakah anda ingin melanjutkan approve pembayaran',
        cancellationText: 'Batal',
        confirmationText: 'Approve',
        confirmationButtonProps: { color: 'success', variant: 'contained' },
      });

      if (note !== data.note && depositMethod !== data.depositMethod) {
        await invoiceTempRepository.update(data._id, { depositMethod, note });
      }

      await invoiceTempRepository.approve(data._id, addBalanceToWallet ?? false);
      toast.success('Approve pembayaran berhasil');
      close(true);
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
    } finally {
      loading.onFalse();
    }
  }

  async function onReject() {
    loading.onTrue();
    try {
      const reason = await rejectDialogRef.current?.open();
      if (!reason) return;

      await invoiceTempRepository.reject(data._id, reason);
      toast.success('Reject pembayaran berhasil');
      close(true);
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
    } finally {
      loading.onFalse();
    }
  }

  const state = useMemo(
    () => ({
      paymentMethodStore,
      isMobile,
      show: show.value,
      loading: loading.value,
      loadingData: loadingData.value,
      depositMethod,
      note,
      data,
      isAdmin,
      rejectDialogRef,
      viewerImageRef,
      addBalanceToWallet,
      showUserWallet,
    }),
    [
      data,
      depositMethod,
      isAdmin,
      isMobile,
      loading.value,
      loadingData.value,
      note,
      paymentMethodStore,
      show.value,
      addBalanceToWallet,
      showUserWallet,
    ]
  );

  const handlers = useMemo(
    () => ({
      open,
      close,
      onApprove,
      onReject,
      setDepositMethod,
      setNote,
      setAddBalanceToWallet,
    }),
    [close, onApprove, onReject, open]
  );

  return { state, handlers };
}
