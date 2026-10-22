import { useRef } from 'react';
import { toast } from 'sonner';
import { useConfirm } from 'material-ui-confirm';

import { useTheme, useMediaQuery } from '@mui/material';

import { duitkuSecretRepository } from 'src/repositories';

import { useDuitkuSecretStore } from '../duitkuSecret.store';

/**
 * @typedef {import('src/repositories/duitkuSecret').DuitkuSecret} DuitkuSecret
 * @typedef {import('../duitkuSecret.store').DuitkuSecretStore} DuitkuSecretStore
 */
export function useDuitkuSecretState() {
  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down('md'));
  const confirm = useConfirm();

  /** @type {DuitkuSecretStore} */
  const { data, limit, loadData, loading, page, search, setStore, total } = useDuitkuSecretStore();

  const dialogRef = useRef();

  async function add() {
    await dialogRef.current?.open();
    loadData();
  }

  async function onEdit(id) {
    await dialogRef.current?.open(id);
    loadData();
  }

  /** @param {DuitkuSecret} item */
  async function onRemove(item) {
    try {
      await confirm({
        title: 'Hapus Secret Duitku',
        description: `Apakah anda yakin ingin menghapus Secret Profile ${item.secretName} ?`,
        confirmationText: 'Hapus',
        confirmationButtonProps: { color: 'error' },
        cancellationText: 'Batal',
      });

      const promises = duitkuSecretRepository.remove(item._id);
      toast.promise(promises, {
        loading: 'Menghapus secret duitku...',
        success: () => {
          loadData();
          return 'Berhasil menghapus secret duitku';
        },
        error: (err) => err.message || 'Gagal menghapus secret duitku',
      });
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
    }
  }

  return {
    data,
    limit,
    loadData,
    loading,
    page,
    search,
    total,
    setStore,
    dialogRef,
    add,
    mobile,
    onEdit,
    onRemove,
  };
}
