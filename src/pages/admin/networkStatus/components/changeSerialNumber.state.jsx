/**
 * @typedef {import("src/repositories/customer").Customer} Customer
 * @typedef {import('src/repositories/customer').PartialCustomerUpdateLog} PartialCustomerUpdateLog
 */

import { toast } from 'sonner';
import { useBoolean } from '@hooks/use-boolean';
import { useRef, useMemo, useState } from 'react';

import { useTheme, useMediaQuery } from '@mui/material';

import 'src/extension/date';
import 'src/extension/string';
import { customerRepository } from 'src/repositories';

export function useChangeSerialNumberState() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [customer, setCustomer] = useState(null);
  const [serialNumber, setSerialNumber] = useState('');
  const loading = useBoolean(false);
  const show = useBoolean(false);
  const resolver = useRef();
  const loadingSubmit = useBoolean(false);

  const [tab, setTab] = useState(0);
  const tabs = ['Update Serial Number', 'Log Perubahan'];

  /** @type {[PartialCustomerUpdateLog[], Function]} */
  const [logChanges, setLogChanges] = useState([]);

  const customerData = useMemo(() => {
    const d = {
      ID: customer?.customerId ?? '-',
      Pelanggan: customer?.fullname ?? '-',
      'Nomor Telepon': customer?.phone ?? '-',
      Alamat: customer?.address ?? '-',
      'Area / POP': customer?.areaName ?? '-',
    };

    return Object.entries(d).map(([key, value]) => ({ label: key, value }));
  }, [customer]);

  function reset() {
    setCustomer(null);
    setSerialNumber('');
    loading.onFalse();
    show.onFalse();
    setLogChanges([]);
  }

  /**
   * @param {string} customerId
   * @param {Object} options
   * @param {string} options.defaultValue
   * @returns {Promise<void>}
   */
  function open(customerId, options) {
    show.onTrue();
    load(customerId, options?.defaultValue);
    return new Promise((resolve) => {
      resolver.current = resolve;
    });
  }

  function close() {
    reset();
    resolver.current?.();
  }

  /**
   *
   * @param {string} customerId
   * @param {string|null} defaultValue
   */
  async function load(customerId, defaultValue = null) {
    loading.onTrue();
    try {
      const promisesSnapshotCustomer = customerRepository.getCustomer(customerId);
      const promisesLog = customerRepository.getPartialCustomerUpdateLog(customerId, {
        existSerialNumber: 'true',
      });

      const [snapshotCustomer, log] = await Promise.all([promisesSnapshotCustomer, promisesLog]);
      setCustomer(snapshotCustomer);
      setSerialNumber(defaultValue ?? snapshotCustomer.routerSerialNumber ?? '');
      setLogChanges(log);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load customer');
    } finally {
      loading.onFalse();
    }
  }

  async function submit() {
    loadingSubmit.onTrue();
    try {
      await customerRepository.partialUpdate(customer._id, { serialNumber });
      toast.success('Berhasil menyimpan');
      close();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to change serial number');
    } finally {
      loadingSubmit.onFalse();
    }
  }

  return {
    state: {
      customer,
      serialNumber,
      loading,
      show,
      loadingSubmit,
      customerData,
      isMobile,
      logChanges,
      tab,
      tabs,
    },
    methods: {
      setSerialNumber,
      open,
      close,
      submit,
      setTab,
    },
  };
}
