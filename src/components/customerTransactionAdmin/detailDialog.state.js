import Viewer from 'viewerjs';
import { toast } from 'sonner';
import { useBoolean } from '@hooks/use-boolean';
import { useConfirm } from 'material-ui-confirm';
import { useRef, useMemo, useState } from 'react';
import { useAppPicker } from '@hooks/use-app-picker';

import { useTheme, useMediaQuery } from '@mui/material';

import 'src/extension/date';
import 'src/extension/string';
import 'src/extension/number';
import { customerTransactionAdminRepository } from 'src/repositories';

/**
 * @typedef {import('src/repositories/customerTransactionAdmin').CustomerTransactionAdmin} CustomerTransactionAdmin
 */

export const useDetailDialogState = () => {
  const customerTransactionRejectDialogRef = useRef();
  const availableDepositMethodPickerRef = useRef();
  const confirmApproveRef = useRef();
  const resolver = useRef();
  const { imageViewerDialog } = useAppPicker();
  const overlayLoading = useBoolean(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const confirm = useConfirm();
  const viewerRef = useRef();
  const evidencePickerRef = useRef();

  /** @type {[CustomerTransactionAdmin, void]} */
  const [data, setData] = useState(null);
  const showDialog = useBoolean(false);
  const isLoading = useBoolean(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const evidences = useMemo(() => {
    if (!data || !data.evidences) return [];
    return data.evidences.map(
      (evidence) => `/public/uploads/${evidence.replaceAll('/public/uploads', '')}`
    );
  });

  const displayEvidence = useMemo(
    () => evidences[selectedImageIndex],
    [evidences, selectedImageIndex]
  );

  const textColorStatus = (status) => {
    const statusColor =
      {
        expired: 'tw-text-red-600',
        reject: 'tw-text-red-600',
        cancel: 'tw-text-red-600',
        unpaid: 'tw-text-warning-600',
        verify: 'tw-text-primary',
        paid: 'tw-text-green-600',
      }[status] ?? 'tw-text-blank';

    return statusColor;
  };

  const labelStatus = (status) => {
    const statusLabel =
      {
        expired: 'Expired',
        reject: 'Ditolak',
        cancel: 'Batal',
        unpaid: 'Pending',
        verify: 'Verifikasi',
        paid: 'Selesai',
      }[status] ?? status;

    return statusLabel;
  };

  const close = () => {
    showDialog.onFalse();
    setData(null);
    resolver.current();
  };

  const pickDepositMethod = async () => {
    /** @type {{ category: string, data: DepositMethod } | null} */
    const result = await availableDepositMethodPickerRef.current.open();
    if (!result) return;

    const copy = { ...data };
    copy.accountBank = result.data.bankName;
    copy.accountName = result.data.bankUsername;
    copy.accountNumber = result.data.bankNumber;
    copy.depositMethod = result.data._id;
    setData(copy);
  };

  /** @param {CustomerTransactionAdmin} transactionData */
  const open = (transactionData) => {
    setData(transactionData);
    showDialog.onTrue();
    fetchTransactionDetail(transactionData._id);
    return new Promise((resolve) => {
      resolver.current = resolve;
    });
  };

  async function fetchTransactionDetail(transactionId = data?._id) {
    overlayLoading.onTrue();
    try {
      const detailData = await customerTransactionAdminRepository.detail(transactionId);
      setData(detailData);
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
    } finally {
      overlayLoading.onFalse();
    }
  }

  const reject = async () => {
    isLoading.onTrue();
    try {
      const rejectReason = await customerTransactionRejectDialogRef.current.open();
      if (typeof rejectReason !== 'string') {
        return;
      }

      await customerTransactionAdminRepository.reject(data?._id, {
        rejectReason: !!rejectReason ? rejectReason : null,
      });
      const copyData = { ...data };
      copyData.status = 'reject';
      setData(copyData);
      toast.info('Berhasil');
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
    } finally {
      isLoading.onFalse();
    }
  };

  const approve = async () => {
    if (!data) return;
    const depositMethodId = data?.depositMethod;

    const approveConfirm = await confirmApproveRef.current.open();
    if (!approveConfirm) return;

    isLoading.onTrue();
    try {
      const promise = Promise.allSettled([
        customerTransactionAdminRepository.update(data._id, {
          depositMethodId,
        }),
        customerTransactionAdminRepository.approve(data._id, {
          customerNote: approveConfirm.customerNote,
          depositMethodId,
        }),
      ]);

      toast.promise(promise, {
        loading: 'Approving...',
        success: () => {
          const copyData = { ...data };
          copyData.status = 'paid';
          setData(copyData);
          return 'Berhasil';
        },
        error: (err) => err.message || 'Gagal menyetujui transaksi',
      });
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
    } finally {
      isLoading.onFalse();
    }
  };

  const updateEvidence = async (mode, evidence) => {
    if (!data || data.status === 'paid' || !evidence) return;

    const promise = customerTransactionAdminRepository.updateEvidence(data._id, {
      evidences: evidence,
      mode,
    });
    toast.promise(promise, {
      loading: 'Memperbarui bukti pembayaran...',
      success: () => {
        fetchTransactionDetail();
        return 'Berhasil';
      },
      error: (err) => err.message || 'Gagal memperbarui bukti pembayaran',
    });
  };

  const pickEvidence = (mode) => {
    if (data?.status === 'paid') return;
    evidencePickerRef.current.dataset.mode = mode;
    evidencePickerRef.current.click();
  };

  const showEvidence = (image) => {
    setTimeout(() => {
      const tag = document.querySelector('#viewerImage');
      viewerRef.current = new Viewer(tag);
      tag.click();
    }, 300);
    // imageViewerDialog.open([image], 'Bukti Pembayaran');
  };

  const customerData = useMemo(
    () => [
      {
        label: 'ID',
        value: data?.customerId ?? '-',
      },
      {
        label: 'Nama',
        value: data?.customerFullname ?? '-',
      },
      {
        label: 'Whatsapp',
        value: data?.customerPhone ?? '-',
      },
      {
        label: 'Alamat',
        value: data?.customerAddress ?? '-',
      },
      {
        label: 'Area / POP',
        value: data?.customerAreaTitle ?? '-',
      },
      {
        label: 'Status',
        value: labelStatus(data?.status ?? ''),
        textColor: textColorStatus(data?.status ?? ''),
      },
      {
        label: 'Nama Rekening Pengirim',
        value: data?.senderName ?? '-',
      },
    ],
    [data]
  );

  return {
    // Refs
    customerTransactionRejectDialogRef,
    availableDepositMethodPickerRef,
    confirmApproveRef,
    // State
    data,
    showDialog,
    isLoading,
    isMobile,
    customerData,
    evidences,
    displayEvidence,
    selectedImageIndex,
    setSelectedImageIndex,
    overlayLoading,

    // Methods
    open,
    close,
    reject,
    approve,
    pickDepositMethod,
    showEvidence,
    pickEvidence,
    evidencePickerRef,
    updateEvidence,
    textColorStatus,
    labelStatus,
  };
};
