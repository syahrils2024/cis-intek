import { toast } from 'sonner';
import { useBoolean } from '@hooks/use-boolean';
import { useRef, useMemo, useState } from 'react';
import { useAppPicker } from '@hooks/use-app-picker';

import { useTheme, useMediaQuery } from '@mui/material';

import { customerRepository, oltDeviceRepository } from 'src/repositories';

/**
 * @typedef {import("src/repositories/oltDevice").UnbindSerialNumber} UnbindSerialNumber
 */

export function useUnbindSerialNumberState() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const appPicker = useAppPicker();
  const bindSerialNumberConfirmRef = useRef();

  /** @type {[UnbindSerialNumber[], Function]} */
  const [data, setData] = useState([]);

  /** @type {[string, Function]} */
  const [search, setSearch] = useState('');

  const loading = useBoolean(false);

  const filteredData = useMemo(() => {
    if (!search) return data;
    return data.filter(
      (item) =>
        item.SerialNumber.toLowerCase().includes(search.toLowerCase()) ||
        item.OltAddress.toLowerCase().includes(search.toLowerCase()) ||
        item.OltName.toLowerCase().includes(search.toLowerCase()) ||
        item.OltModel.toLowerCase().includes(search.toLowerCase()) ||
        item.OltPort.toString().toLowerCase().includes(search.toLowerCase())
    );
  });

  async function load() {
    loading.onTrue();
    try {
      const snapshot = await oltDeviceRepository.getUnbindSerialNumber();
      const mapData = snapshot.map((item, index) => ({ id: index + 1, ...item }));
      setData(mapData);
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
    } finally {
      loading.onFalse();
    }
  }

  function reset() {
    setData([]);
    setSearch('');
  }

  /** @param {UnbindSerialNumber} item */
  async function bindToCustomer(item) {
    const customer = await appPicker.customer.pick();
    if (!customer) return;

    const result = await bindSerialNumberConfirmRef.current.open({
      serialNumber: item.SerialNumber,
      customer,
    });
    if (!result) return;

    toast.promise(
      customerRepository.partialUpdate(customer._id, {
        serialNumber: item.SerialNumber,
      }),
      {
        loading: 'Binding Serial Number...',
        success: () => {
          load();
          return 'Serial Number successfully bind to customer.';
        },
        error: (err) => err?.message || 'Failed to bind Serial Number.',
      }
    );
  }

  return {
    state: {
      data,
      search,
      loading,
      filteredData,
      isMobile,
    },
    ref: {
      bindSerialNumberConfirmRef,
    },
    handlers: {
      setSearch,
      load,
      reset,
      bindToCustomer,
    },
  };
}
