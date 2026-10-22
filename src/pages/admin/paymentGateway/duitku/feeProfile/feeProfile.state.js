import { toast } from 'sonner';
import { useRef } from 'react';
import { useConfirm } from 'material-ui-confirm';

import { useTheme, useMediaQuery } from '@mui/material';

import { duitkuFeeProfileRepository } from 'src/repositories';

import { useDuitkuStore } from '../duitku.store';

/** @typedef {import('../duitku.store').DuitkuStore} DuitkuStore */

export function useFeeProfileState() {
  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down('md'));
  const confirm = useConfirm();

  const formDialogRef = useRef();

  /** @type {DuitkuStore} */
  const store = useDuitkuStore();
  const { setFeeProfile } = store;
  const { data, limit, loading, page, search, total } = store.feeProfile;

  async function add() {
    await formDialogRef.current?.open();
    load();
  }

  async function onEdit(item) {
    await formDialogRef.current?.open(item._id);
    load();
  }

  async function onDuplicate(item){
    await formDialogRef.current?.open(item._id, true);
    load();
  }

  async function load() {
    setFeeProfile({ loading: true });
    try {
      const snapshot = await duitkuFeeProfileRepository.findAll({
        page,
        limit,
      });
      setFeeProfile({
        data: snapshot.data,
        total: snapshot.total,
      });
    } catch (e) {
      if (e instanceof Error) toast.error(e.message);
    } finally {
      setFeeProfile({ loading: false });
    }
  }

  /** @param {DuitkuFeeProfile} item */
  async function onRemove(item) {
    try {
      await confirm({
        title: 'Hapus Profile Biaya',
        description: `Apakah anda yakin ingin menghapus profile biaya "${item.name}"?`,
        confirmationText: 'Hapus',
        cancellationText: 'Batal',
        confirmationButtonProps: { color: 'error' },
      });
      const promises = duitkuFeeProfileRepository.remove(item._id);
      toast.promise(promises, {
        loading: 'Menghapus profile biaya...',
        success: () => {
          load();
          return 'Berhasil menghapus profile biaya';
        },
        error: 'Gagal menghapus profile biaya',
      });
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
    }
  }

  return {
    mobile,
    data,
    limit,
    loading,
    page,
    search,
    total,
    load,
    setFeeProfile,
    formDialogRef,
    add,
    onEdit,
    onRemove,
    onDuplicate,
  };
}
