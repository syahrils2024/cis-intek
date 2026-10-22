import { toast } from 'sonner';
import { useTheme } from '@emotion/react';
import { useChart } from '@components/chart';
import { addDays, formatDate } from 'date-fns';
import { useBoolean } from '@hooks/use-boolean';
import { useDebouncedCallback } from 'use-debounce';
import { useMemo, useState, useEffect } from 'react';

import { useMediaQuery } from '@mui/material';

import 'src/extension/date';
import 'src/extension/string';
import { customerRepository } from 'src/repositories';

/**
 * @typedef {import("src/repositories/customer").Customer} Customer
 * @typedef {import("src/repositories/customer").CustomerOnuHistoryData} CustomerOnuHistoryData
 */

export function useOnuChartState() {
  const now = new Date();

  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down('md'));

  /** @type {[Customer, Function]} */
  const [customer, setCustomer] = useState(null);

  /** @type {[CustomerOnuHistoryData[], Function]} */
  const [historyData, setHistoryData] = useState([]);

  const [start, setStart] = useState(addDays(now, -7));
  const [end, setEnd] = useState(now);
  const loading = useBoolean(false);
  const openDialog = useBoolean(false);

  const chartData = useMemo(() => {
    const categories = historyData.map(
      (item) => item.FormattedDate.toDate().format('dd MMM')
      // formatDate(new Date(item.FormattedDate), 'dd MMM')
    );

    // * Map data and make all values positive
    const data = historyData.map((item) =>
      Math.abs(parseFloat(item.FormattedReceivedOpticalPower))
    );

    return { categories, series: [{ name: 'RX', data }] };
  }, [historyData]);

  const chartOptions = useChart({
    stroke: {
      width: 1,
      colors: ['transparent'],
    },
    xaxis: {
      categories: chartData.categories,
    },
    yaxis: {
      labels: {
        formatter: (value) => `${(value * -1).toFixed(2)}`, // Invert back to negative for display
        maxWidth: 100,
      },
    },
    legend: {
      show: true,
    },
    tooltip: {
      enabled: true,
      theme: 'light',
      y: {
        formatter: (value) => `${(value * -1).toFixed(2)}`, // Invert back to negative for display
      },
    },
  });

  const customerData = useMemo(() => {
    const data = {
      ID: customer?.customerId ?? '-',
      Pelanggan: customer?.fullname ?? '-',
      'Nomor Telepon': customer?.phone ?? '-',
      Alamat: customer?.address ?? '-',
      'Area / POP': customer?.areaName ?? '-',
      'Serial Number': customer?.routerSerialNumber ?? '-',
    };

    return Object.entries(data).map(([key, value]) => ({ label: key, value }));
  }, [customer]);

  function reset() {
    setCustomer(null);
    setHistoryData([]);
    setStart(addDays(now, -7));
    setEnd(now);
    loading.onFalse();
    openDialog.onFalse();
  }

  async function loadHistoryData(customerId) {
    loading.onTrue();

    try {
      const promisesCustomer = customerRepository.getCustomer(customerId);
      const promisesHistoryData = customerRepository.getCustomerOnuHistoryData(
        customerId,
        formatDate(start, 'yyyy-MM-dd'),
        formatDate(end, 'yyyy-MM-dd')
      );

      const [snapshotCustomer, snapshotHistory] = await Promise.all([
        promisesCustomer,
        promisesHistoryData,
      ]);

      setCustomer(snapshotCustomer);
      setHistoryData(snapshotHistory);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load ONU history data');
    } finally {
      loading.onFalse();
    }
  }

  function open(customerId) {
    reset();
    openDialog.onTrue();
    loadHistoryData(customerId);
  }

  function close() {
    openDialog.onFalse();
    reset();
  }

  const debounceReload = useDebouncedCallback(() => {
    if (!customer) return;
    loadHistoryData(customer._id);
  }, 400);

  useEffect(() => debounceReload(), [start, end]);

  return {
    state: {
      customer,
      historyData,
      start,
      end,
      loading,
      openDialog,
      mobile,
      customerData,
      chartData,
      chartOptions,
    },
    method: {
      setCustomer,
      setHistoryData,
      setStart,
      setEnd,
      loadHistoryData,
      open,
      close,
    },
  };
}
