// @ts-nocheck

import { useEffect } from 'react';

import { useDashboardStore } from '../dashboard.store';

export function useDashboardData() {
  const data = useDashboardStore((state) => state.data);
  const date = useDashboardStore((state) => state.date);
  const loading = useDashboardStore((state) => state.loading);
  const fetchData = useDashboardStore((state) => state.fetchData);
  const setDate = useDashboardStore((state) => state.setDate);

  useEffect(() => {
    fetchData();
  }, [fetchData, date]);

  return {
    state: {
      data,
      date,
      loading,
    },
    handler: {
      fetchData,
      setDate,
    },
  };
}
