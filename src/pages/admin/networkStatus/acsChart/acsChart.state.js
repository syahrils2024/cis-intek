/**
 * @typedef {import("src/repositories/acs").AcsAreaOnlineStatus} AcsAreaOnlineStatus
 */

import { toast } from 'sonner';
import { useBoolean } from '@hooks/use-boolean';
import { useAppPicker } from '@hooks/use-app-picker';
import { useMemo, useState, useEffect } from 'react';

import { acsRepository } from 'src/repositories';

export function useAcsChartState() {
  const appPicker = useAppPicker();

  /** @type {[AcsAreaOnlineStatus[], Function]} */
  const [data, setData] = useState([]);
  const [areaName, setAreaName] = useState('');
  const [areaId, setAreaId] = useState('');
  const loading = useBoolean(false);

  const areaErrorMessage = useMemo(() => {
    if (areaId !== '') return null;
    return 'Pilih Area';
  }, [areaId]);

  async function loadData() {
    loading.onTrue();
    try {
      const snapshot = await acsRepository.getOnlineStatus(areaId);
      setData(snapshot);
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
    } finally {
      loading.onFalse();
    }
  }

  async function pickArea() {
    const snapshot = await appPicker.area.open(areaId, true);
    if (!snapshot) return;

    setAreaId(snapshot._id);
    setAreaName(snapshot.title);
  }

  useEffect(() => {
    if (areaId === '') return;
    loadData();
  }, [areaId]);

  return {
    state: {
      data,
      areaId,
      areaName,
      loading,
      areaErrorMessage,
    },
    handlers: {
      pickArea,
      loadData,
    },
  };
}
