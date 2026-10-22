// @ts-nocheck
import { toast } from 'sonner';
import { useMemo, useState } from 'react';
import { Iconify } from '@components/iconify';
import { useBoolean } from '@hooks/use-boolean';

import { Stack, useTheme, useMediaQuery } from '@mui/material';

import { oltDeviceRepository } from 'src/repositories';

import { useOltStore } from '../oltList.store';

/**
 * @typedef {import("src/repositories/oltDevice").DuplicatedOnuData} DuplicatedOnuData
 */

export function useDuplicatedOnuDialogState() {
  /** @type {import('../oltList.store').OltStore} */
  const { oltList } = useOltStore();

  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down('md'));
  const show = useBoolean(false);
  const loading = useBoolean(false);
  /** @type {[DuplicatedOnuData[], Function]} */
  const [duplicatedOnuData, setDuplicatedOnuData] = useState([]); // Array of DuplicatedOnuData
  const [selectedOlt, setSelectedOltId] = useState(null);
  const [search, setSearch] = useState('');

  const filteredDuplicatedOnuData = useMemo(
    () =>
      duplicatedOnuData
        .filter((data) => (!!selectedOlt ? data.OltIpAddress === selectedOlt.ipAddress : true))
        .filter((data) => (!!selectedOlt ? data.OltPort === selectedOlt.port : true))
        .filter((data) => {
          if (!search) return true;
          return data.SerialNumber.toLowerCase().includes(search.toLowerCase());
        }),
    [selectedOlt, duplicatedOnuData, search]
  );

  const columns = [
    { field: 'SerialNumber', headerName: 'Serial Number', flex: 1 },
    { field: 'OltDeviceName', headerName: 'OLT', flex: 1 },
    {
      field: 'OltIpAddress',
      headerName: 'OLT IP Address',
      flex: 1,
      renderCell: (params) => `${params.row.OltIpAddress}:${params.row.OltPort}`,
    },
    { field: 'OltModel', headerName: 'OLT Model', flex: 1 },
  ];

  const mobileColumns = [
    {
      field: 'SerialNumber',
      headerName: 'Data',
      flex: 1,
      renderCell: (param) => (
        <Stack direction="row" spacing={1} alignItems="center">
          <span className="tw-text-xs">{param.row.SerialNumber}</span>{' '}
          <Iconify icon="mdi:arrow-right" />
          <Stack>
            <span className="tw-text-xs">{param.row.OltDeviceName}</span>
            <span className="tw-text-xs">
              {param.row.OltIpAddress}:{param.row.OltPort}
            </span>
          </Stack>
        </Stack>
      ),
    },
  ];

  function reset() {
    setSelectedOltId(null);
    setSearch('');
    setDuplicatedOnuData([]);
  }

  function open() {
    show.onTrue();
    loadData();
  }

  function close() {
    show.onFalse();
    reset();
  }

  async function loadData() {
    loading.onTrue();
    try {
      const snapshot = await oltDeviceRepository.findDuplicatedOnuData();
      const snapshotWithIndex = snapshot.map((data, index) => ({ ...data, id: index }));
      setDuplicatedOnuData(snapshotWithIndex);
    } catch (error) {
      toast.error(error.message);
    } finally {
      loading.onFalse();
    }
  }

  return {
    state: {
      mobile,
      show,
      duplicatedOnuData,
      loading,
      columns,
      selectedOltId: selectedOlt,
      oltList,
      filteredDuplicatedOnuData,
      search,
      mobileColumns,
    },
    methods: {
      open,
      close,
      loadData,
      reset,
      setSelectedOltId,
      setSearch,
    },
  };
}
