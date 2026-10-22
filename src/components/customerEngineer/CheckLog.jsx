/**
 * @typedef {import("src/repositories/customer").Customer} Customer
 */

import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { useBoolean } from '@hooks/use-boolean';
import Overloading from '@components/overloading';

import { mikrotikRepository } from 'src/repositories';

/**
 * @param {{customer: Customer}}
 */
export default function CheckLog({ customer }) {
  const [logs, setLogs] = useState([]);
  const loading = useBoolean(false);

  async function prefetch() {
    loading.onTrue();
    try {
      const result = await mikrotikRepository.getLog(customer._id);
      setLogs(result);
    } catch (error) {
      toast.error(error.message);
    } finally {
      loading.onFalse();
    }
  }

  useEffect(() => {
    if (!customer) {
      setLogs([]);
      return;
    }

    prefetch();
  }, [customer]);

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
}
