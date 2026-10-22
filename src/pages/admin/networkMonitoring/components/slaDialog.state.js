import dayjs from 'dayjs';
import { toast } from 'sonner';
import { useRef, useState } from 'react';
import { useBoolean } from '@hooks/use-boolean';

import 'src/extension/number';
import { getSlaDevice } from 'src/repositories/networkMonitoring';

/**
 * @typedef {import('src/repositories/networkMonitoring').NetworkMonitoringDevice} NetworkMonitoringDevice
 */

export function useSlaDialogState() {
  const resolver = useRef();

  const open = useBoolean(false);
  const loading = useBoolean(false);

  /** Summary of SLA statuses */
  const [summarySla, setSummarySla] = useState({
    UP: 0,
    DOWN: 0,
  });

  const [percentageSla, setPercentageSla] = useState({
    upPercentage: 0,
    downPercentage: 0,
  });

  /** @type {[NetworkMonitoringDevice | null, Function]} */
  const [device, setDevice] = useState(null);

  /** @type {[Array<{ from: string, to: string, status: 'connected' | 'disconnected', durationMs: number }>, Function]} */
  const [stateChanges, setStateChanges] = useState([]);

  const [start, setStart] = useState(null);
  const [end, setEnd] = useState(null);
  const [ipAddress, setIpAddress] = useState('');

  function openDialog(currentDevice) {
    open.onTrue();
    setDevice(currentDevice);
    setIpAddress(currentDevice?.ip_address ?? '');
    // Default: 7 hari terakhir
    setStart(dayjs().subtract(7, 'day').startOf('day').toDate());
    setEnd(dayjs().endOf('day').toDate());

    fetchSla({
      start: dayjs().subtract(7, 'day').startOf('day').toDate(),
      end: dayjs().endOf('day').toDate(),
      ipAddress: currentDevice?.ip_address ?? '',
    });

    return new Promise((resolve) => {
      resolver.current = resolve;
    });
  }

  function closeDialog() {
    open.onFalse();
    setDevice(null);
    setStateChanges([]);
    setStart(null);
    setEnd(null);
    setIpAddress('');
    resolver.current?.(true);
  }

  async function fetchSla({ start: s, end: e, ipAddress: ip } = {}) {
    if (!device?.id) return;
    loading.onTrue();
    try {
      const params = {};
      if (s) params.start = dayjs(s).toISOString().substring(0, 10);
      if (e) params.end = dayjs(e).toISOString().substring(0, 10);
      if (ip) params.ipAddress = ip;

      const result = await getSlaDevice(device.id, params);
      setStateChanges(result.sla?.stateChanges ?? []);

      setPercentageSla({
        upPercentage: result.sla.totals.upPercentage,
        downPercentage: result.sla.totals.downPercentage,
      });

      setSummarySla({
        UP: result.sla.totals.upDurationMs.summarySLAFormat(),
        DOWN: result.sla.totals.downDurationMs.summarySLAFormat(),
      });
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
      setStateChanges([]);
    } finally {
      loading.onFalse();
    }
  }

  function applyFilter() {
    fetchSla({ start, end, ipAddress });
  }

  return {
    state: {
      open,
      loading,
      device,
      stateChanges,
      start,
      end,
      ipAddress,
      summarySla,
      percentageSla,
    },
    handlers: {
      openDialog,
      closeDialog,
      setStart,
      setEnd,
      setIpAddress,
      applyFilter,
    },
  };
}
