import { toast } from 'sonner';
import { useRef, useState } from 'react';
import { useBoolean } from '@hooks/use-boolean';

import { addGroup, updateGroup } from 'src/repositories/networkMonitoring';

/**
 * @typedef {import("src/repositories/networkMonitoring").NetworkMonitoringGroup} NetworkMonitoringGroup
 */

export function useGroupFormDialogState() {
  const open = useBoolean(false);
  const loading = useBoolean(false);

  /** @type {[NetworkMonitoringGroup|null, function]} */
  const [currentData, setCurrentData] = useState(null);
  const [name, setName] = useState('');

  const resolver = useRef();

  /**
   * @param {NetworkMonitoringGroup} [group]
   * @returns {Promise<boolean>}
   */
  function openDialog(group) {
    open.onTrue();
    setCurrentData(group ?? null);
    setName(group?.name ?? '');

    return new Promise((resolve) => {
      resolver.current = resolve;
    });
  }

  async function submit() {
    loading.onTrue();
    try {
      if (!name.trim()) {
        throw new Error('Group name is required');
      }

      let result;
      if (currentData?.id) {
        result = await updateGroup(currentData.id, { name: name.trim() });
      } else {
        result = await addGroup({ name: name.trim() });
      }

      toast.success('Berhasil menyimpan group');
      close(result);
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
    } finally {
      loading.onFalse();
    }
  }

  function close(groupData = null) {
    setCurrentData(null);
    setName('');
    open.onFalse();
    resolver.current?.(groupData);
  }

  return {
    state: {
      open,
      loading,
      currentData,
      name,
    },
    handlers: {
      openDialog,
      submit,
      close,
      setName,
    },
  };
}
