import { toast } from 'sonner';
import { useBoolean } from '@hooks/use-boolean';

import { useBroadcastScheduleStore } from '../stores/broadcastSchedule.store';

export function useBroadcastScheduleState() {
  const loading = useBoolean(false);
  const { data, loadData } = useBroadcastScheduleStore();

  async function load() {
    loading.onTrue();
    try {
      await loadData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal memuat data');
    } finally {
      loading.onFalse();
    }
  }

  return { loading, load, data };
}
