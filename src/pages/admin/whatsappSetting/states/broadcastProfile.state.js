import { toast } from 'sonner';
import { useBoolean } from '@hooks/use-boolean';
import { useConfirm } from 'material-ui-confirm';
import { useRef, useState, useEffect } from 'react';

import { useTheme, useMediaQuery } from '@mui/material';

import { broadcastOptionTemplateRepository } from 'src/repositories';

/**
 * @typedef {import('src/repositories/broadcastOptionTemplate').BroadcastOptionTemplate} BroadcastOptionTemplate
 */

export function useBroadcastProfileState() {
  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down('md'));
  const confirm = useConfirm();
  const broadcastProfileTemplateFormRef = useRef();

  /** @typedef {[BroadcastOptionTemplate[], Function]} */
  const [data, setData] = useState([]);
  const loading = useBoolean(false);

  async function loadData() {
    loading.onTrue();
    try {
      const snapshotData = await broadcastOptionTemplateRepository.findAll();
      const mappedData = snapshotData.map((item, i) => ({
        ...item,
        id: i,
      }));
      setData(mappedData);
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
    } finally {
      loading.onFalse();
    }
  }

  /** @param {BroadcastOptionTemplate} item */
  async function edit(item) {
    await broadcastProfileTemplateFormRef.current.open(item._id);
    loadData();
  }

  async function add() {
    await broadcastProfileTemplateFormRef.current.open();
    loadData();
  }

  /** @param {BroadcastOptionTemplate} item */
  async function remove(item) {
    try {
      await confirm({
        title: 'Hapus Broadcast Profile',
        description: `Apakah anda ingin menghapus broadcast profile ${item.name}?`,
        confirmationText: 'Hapus',
        confirmationButtonProps: { color: 'error', variant: 'contained' },
        cancellationText: 'Batal',
      });
      const promise = broadcastOptionTemplateRepository.remove(item._id);
      toast.promise(promise, {
        loading: 'Menghapus broadcast profile...',
        success: () => {
          loadData();
          return 'Berhasil menghapus broadcast profile';
        },
        error: 'Gagal menghapus broadcast profile',
      });
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  return {
    state: {
      data,
      loading: loading.value,
      mobile,
    },
    ref: {
      broadcastProfileTemplateFormRef,
    },
    handlers: {
      loadData,
      remove,
      edit,
      add,
    },
  };
}
