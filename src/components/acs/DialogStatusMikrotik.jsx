import { toast } from 'sonner';
import { useBoolean } from '@hooks/use-boolean';
import Overloading from '@components/overloading';
import { useEffect, forwardRef, useImperativeHandle } from 'react';

import { mikrotikRepository } from 'src/repositories';
import { useMikrotikStore } from 'src/stores/mikrotikStatus';

/**
 * @typedef {import('src/repositories/mikrotik').ResultCheckConnection} ResultCheckConnection
 * @typedef {import('@/stores/mikrotikStatus').MikrotikStore} MikrotikStore
 */

const AcsDialogStatusMikrotik = forwardRef(({ customerId }, ref) => {
  /**
   * @type {MikrotikStore}
   */
  const { status, setStatus } = useMikrotikStore();
  const loading = useBoolean(false);

  async function refresh({ customer_id: custId }) {
    loading.onTrue();
    try {
      const result = await mikrotikRepository.checkConnection(custId ?? customerId);
      setStatus(result);
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
    } finally {
      loading.onFalse();
    }
  }

  useEffect(() => {
    if (status === null) refresh();
  }, []);

  useImperativeHandle(ref, () => ({ refresh }));

  return (
    <div className="tw-flex tw-flex-col tw-gap-2 tw-relative">
      <Overloading loading={loading.value} />

      <div className="tw-flex tw-flex-col">
        <span className="tw-text-gray-400 tw-text-xs">Uptime</span>
        <span className="tw-text-xs tw-font-medium">{status?.uptime}</span>
      </div>
      <div className="tw-flex tw-flex-col">
        <span className="tw-text-gray-400 tw-text-xs">Status Perangkat</span>
        <span
          className={`tw-text-xs tw-font-medium ${
            status?.flags.includes('R') ? 'tw-text-green-600' : 'tw-text-red-600'
          }`}
        >
          {status?.flags.includes('R') ? 'Running / Connected' : 'Tidak Running / Disconnected'}
        </span>
      </div>
      <div className="tw-flex tw-flex-col">
        <span className="tw-text-gray-400 tw-text-xs">User</span>
        <span className="tw-text-xs tw-font-medium">{status?.user}</span>
      </div>
      <div className="tw-flex tw-flex-col">
        <span className="tw-text-gray-400 tw-text-xs">Interface</span>
        <span className="tw-text-xs tw-font-medium">{status?.name}</span>
      </div>
      <div className="tw-flex tw-flex-col">
        <span className="tw-text-gray-400 tw-text-xs">Service</span>
        <span className="tw-text-xs tw-font-medium">{status?.service}</span>
      </div>
      <div className="tw-flex tw-flex-col">
        <span className="tw-text-gray-400 tw-text-xs">Mac Address</span>
        <span className="tw-text-xs tw-font-medium">{status?.remoteAddress}</span>
      </div>
    </div>
  );
});

export default AcsDialogStatusMikrotik;
