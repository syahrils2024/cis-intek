// @ts-nocheck
/** @typedef {import("./oltList.store").OltStore} OltStore */

import { toast } from 'sonner';
import { useConfirm } from 'material-ui-confirm';
import { useRef, useMemo, useState, useEffect } from 'react';

import { useTheme, useMediaQuery } from '@mui/material';

import { oltDeviceRepository } from 'src/repositories';

import { useOltStore } from './oltList.store';

export function useOltListState() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const confirm = useConfirm();
  const [selectedArea, setSelectedArea] = useState('');
  const [selectedAreaName, setSelectedAreaName] = useState('Semua');

  /** @type {OltStore} */
  const { setStore, limit, loading, oltList, page, fetchOlt } = useOltStore();

  const formDialogRef = useRef();
  const duplicatedOnuDialogRef = useRef();
  const areaPickerRef = useRef();

  const filteredOltList = useMemo(() => {
    if (!selectedArea) return oltList;
    return oltList.filter((olt) => olt.area === selectedArea || olt.areaCategory === selectedArea);
  }, [oltList, selectedArea]);

  async function pickArea() {
    const area = await areaPickerRef.current.open(selectedArea);
    if (!area) return;
    setSelectedArea(area._id);
    setSelectedAreaName(area.name);
  }

  function openDuplicatedOnuDialog() {
    duplicatedOnuDialogRef.current?.open();
  }

  async function add() {
    await formDialogRef.current.open();
    await fetchOlt();
  }

  /** @param {OltDevice} item  */
  async function edit(item) {
    await formDialogRef.current.open(item._id);
    await fetchOlt();
  }

  /** @param {OltDevice} item  */
  async function remove(item) {
    try {
      await confirm({
        title: 'Hapus Perangkat OLT',
        description: `Apakah anda yakin ingin menghapus perangkat OLT ${item.deviceName}?`,
        confirmationText: 'Hapus',
        confirmationButtonProps: { color: 'error', variant: 'contained' },
        cancellationText: 'Batal',
      });

      toast.promise(oltDeviceRepository.deleteOltDevice(item._id), {
        loading: 'Menghapus perangkat OLT...',
        success: () => {
          fetchOlt();
          return 'Perangkat OLT berhasil dihapus';
        },
        error: 'Gagal menghapus perangkat OLT',
      });
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
    }
  }

  /** @param {OltDevice} item  */
  async function query(item) {
    toast.promise(oltDeviceRepository.queryOltDevice(item._id), {
      loading: 'Mengambil data perangkat OLT...',
      success: (data) => {
        fetchOlt();
        return 'Berhasil';
      },
      error: 'Gagal mengambil data perangkat OLT',
    });
  }

  /** @param {OltDevice} item  */
  async function rebuild(item) {
    try {
      await confirm({
        title: 'Rebuild Database ONU',
        description: `Apakah anda ingin melakukan rebuild database ONU pada perangkat OLT ${item.deviceName}? Proses ini akan menghapus dan merescan semua Serial Number ONU pada perangkat OLT tersebut.`,
        confirmationText: 'Rebuild',
        confirmationButtonProps: { color: 'warning', variant: 'contained' },
        cancellationText: 'Batal',
      });

      toast.promise(oltDeviceRepository.rebuildOnuDatabase(item._id), {
        loading: 'Melakukan rebuild database ONU...',
        success: () =>
          'Rebuild database ONU berhasil silahkan tunggu 2-10 menit selama proses rescan Serial Number ONU berlangsung',
        error: 'Rebuild database ONU gagal',
      });
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
    }
  }

  const paginatedData = useMemo(() => {
    const start = page * limit;
    const end = start + limit;
    return oltList.slice(start, end);
  }, [oltList, page, limit]);

  useEffect(() => {
    fetchOlt();
  }, []);

  return {
    state: {
      oltList: paginatedData,
      loading,
      page,
      limit,
      isMobile,
      selectedArea,
      selectedAreaName,
      filteredOltList,
    },
    ref: {
      formDialogRef,
      duplicatedOnuDialogRef,
      areaPickerRef,
    },
    handlers: {
      setStore,
      fetchOlt,
      add,
      edit,
      remove,
      query,
      openDuplicatedOnuDialog,
      rebuild,
      pickArea,
    },
  };
}
