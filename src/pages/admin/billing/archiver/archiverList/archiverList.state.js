import { toast } from 'sonner';
import { useRef, useState } from 'react';
import { useBoolean } from '@hooks/use-boolean';
import { useConfirm } from 'material-ui-confirm';

import { useTheme, useMediaQuery } from '@mui/material';

import { subscriptionRepository } from 'src/repositories';

/**
 * @typedef {import("src/repositories/subscription").ArchiveInvoice} ArchiveInvoice
 */

export function useArchiverListState() {
  const confirm = useConfirm();
  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down('md'));
  const archiveDetailRef = useRef();
  const archivePickerRef = useRef();

  /** @type {[ArchiveInvoice], Function} */
  const [data, setData] = useState([]);
  const show = useBoolean(false);
  const loading = useBoolean(false);

  async function load() {
    loading.onTrue();
    try {
      const snapshot = await subscriptionRepository.getArchiveInvoices();
      setData(snapshot);
    } catch (err) {
      if (err instanceof Error) toast.error(err.message);
    } finally {
      loading.onFalse();
    }
  }

  function open() {
    show.onTrue();
    load();
  }

  /** @param {ArchiveInvoice} item */
  async function openDetail(item) {
    await archiveDetailRef.current?.open(item._id);
    load();
  }

  async function openPicker() {
    const result = await archivePickerRef.current?.open();
    if (!result) return;

    await openDetail(result);
  }

  /** @param {ArchiveInvoice} item */
  async function remove(item) {
    try {
      await confirm({
        title: 'Hapus Archive Invoice',
        description: `Apakah anda yakin ingin menghapus archive invoice ${item.archiveFilename}?`,
        confirmationText: 'Hapus',
        cancellationText: 'Batal',
        confirmationButtonProps: { color: 'error' },
      });

      const promises = subscriptionRepository.archiveInvoiceRemove(item._id);
      toast.promise(promises, {
        loading: 'Menghapus...',
        success: () => {
          load();
          return 'berhasil dihapus';
        },
        error: (err) => `Gagal menghapus archive invoice. ${err.message}`,
      });
    } catch (err) {
      if (err instanceof Error) toast.error(err.message);
    }
  }

  /** @param {ArchiveInvoice} item */
  const download = (item) => subscriptionRepository.archiveInvoicedownload(item._id);

  return {
    data,
    load,
    open,
    openDetail,
    loading,
    show,
    mobile,
    archiveDetailRef,
    archivePickerRef,
    openPicker,
    download,
    remove,
  };
}
