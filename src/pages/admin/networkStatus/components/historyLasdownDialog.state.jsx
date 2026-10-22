import { toast } from 'sonner';
import { addDays } from 'date-fns';
import { useTheme } from '@emotion/react';
import { useBoolean } from '@hooks/use-boolean';
import { useDebouncedCallback } from 'use-debounce';
import { useMemo, useState, useEffect } from 'react';

import { useMediaQuery } from '@mui/material';

import 'src/extension/date';
import 'src/extension/string';
import { customerRepository } from 'src/repositories';

/**
 * @typedef {import('src/repositories/customer').Customer} Customer
 * @typedef {import('src/repositories/customer').HistoryLastdown} HistoryLastdown
 */

export function useHistoryLastdownDialogState() {
  const now = new Date();

  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down('md'));

  /** @type {[Customer, Function]} */
  const [customer, setCustomer] = useState(null);

  const [start, setStart] = useState(addDays(now, -7));
  const [end, setEnd] = useState(now);

  /** @type {[HistoryLastdown[], Function]} */
  const [data, setData] = useState([]);

  const loading = useBoolean(false);
  const show = useBoolean(false);

  const customerData = useMemo(() => {
    const d = {
      ID: customer?.customerId ?? '-',
      Pelanggan: customer?.fullname ?? '-',
      'Nomor Telepon': customer?.phone ?? '-',
      Alamat: customer?.address ?? '-',
      'Area / POP': customer?.areaName ?? '-',
      'Serial Number': customer?.routerSerialNumber ?? '-',
    };

    return Object.entries(d).map(([key, value]) => ({ label: key, value }));
  }, [customer]);

  const dataGridColumns = [
    {
      field: 'Timestamp',
      headerName: 'Timestamp',
      flex: 1,
      renderCell: (params) => (
        <span className="tw-text-xs">
          {params.row.Timestamp.toDate().format('dd MMM yyyy, HH:mm:ss')}
        </span>
      ),
    },
    { field: 'LastDownReason', headerName: 'Lastdown Reason', flex: 1 },
  ];

  const debounceReload = useDebouncedCallback(() => {
    loadData(customer?._id);
  }, 500);

  function reset() {
    setData([]);
    setCustomer(null);
    setStart(addDays(now, -7));
    setEnd(now);
  }

  async function loadData(customerId) {
    loading.onTrue();
    try {
      const s = start.format('yyyy-MM-dd');
      const e = end.format('yyyy-MM-dd');
      const promisesCustomer = customerRepository.getCustomer(customerId);
      const promisesData = customerRepository.getHistoryLastdown(customerId, s, e);

      const [snapshotCustomer, snapshotData] = await Promise.all([promisesCustomer, promisesData]);
      setCustomer(snapshotCustomer);
      setData(snapshotData);
    } catch (error) {
      toast.error(error?.message || 'Error fetching customer data');
    } finally {
      loading.onFalse();
    }
  }

  function close() {
    reset();
    show.onFalse();
  }

  function open(customerId) {
    reset();
    show.onTrue();
    loadData(customerId);
  }

  useEffect(() => {
    if (!customer) return;
    debounceReload();
  }, [start, end]);

  return {
    state: {
      customer,
      data,
      start,
      end,
      loading,
      show,
      mobile,
      customerData,
      dataGridColumns,
    },
    method: {
      setCustomer,
      setData,
      setStart,
      setEnd,
      loadData,
      open,
      close,
    },
  };
}
