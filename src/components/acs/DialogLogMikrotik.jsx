import { toast } from 'sonner';
import { useBoolean } from '@hooks/use-boolean';
import Overloading from '@components/overloading';
import { forwardRef, useImperativeHandle } from 'react';

import { mikrotikRepository } from 'src/repositories';
import { useMikrotikStore } from 'src/stores/mikrotikStatus';

/**
 * @typedef {import("src/stores/mikrotikStatus").MikrotikStore} MikrotikStore
 */

const AcsDialogMikrotikLog = forwardRef(({ customer_id }, ref) => {
  /**
   * @type {MikrotikStore}
   */
  const { logs, setLogs } = useMikrotikStore();
  const loading = useBoolean(false);

  async function prefetch({ customerId }) {
    loading.onTrue();
    try {
      const result = await mikrotikRepository.getLog(customerId ?? customer_id);
      setLogs(result);
    } catch (error) {
      toast.error(error.message);
    } finally {
      loading.onFalse();
    }
  }

  useImperativeHandle(ref, () => ({ prefetch }));

  return (
    <div className="tw-flex tw-flex-col tw-w-full tw-relative tw-text-xs">
      <Overloading loading={loading.value} />
      <ol className="tw-gap-2 tw-list-decimal tw-px-5">
        {logs.map((log, i) => (
          <li key={i}>{log}</li>
        ))}
      </ol>
    </div>
  );
});

export default AcsDialogMikrotikLog;
