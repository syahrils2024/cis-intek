/** @typedef {import("@/repositories/notification").CustomerNotification} CustomerNotification */

import { useState } from 'react';
import { useBoolean } from '@hooks/use-boolean';

import { customerNotificationRepository } from 'src/repositories';

export function useAppNotificationState() {
  const loading = useBoolean(false);
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [total, setTotal] = useState(0);
  const [areaName, setAreaName] = useState('Semua');
  const [area, setArea] = useState(null);
  /** @type {CustomerNotification[], void} */
  const [notifications, setNotifications] = useState([]);

  async function loadNotifications() {
    loading.onTrue();
    try {
      const snapshot = await customerNotificationRepository.getCustomerNotifications({
        page,
        limit,
        search,
        area,
      });

      setNotifications(snapshot.data);
      setTotal(snapshot.total);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      loading.onFalse();
    }
  }

  return {
    loading,
    search,
    setSearch,
    page,
    setPage,
    limit,
    setLimit,
    total,
    notifications,
    loadNotifications,
    setNotifications,
    setTotal,
    areaName,
    setAreaName,
    area,
    setArea,
  };
}
