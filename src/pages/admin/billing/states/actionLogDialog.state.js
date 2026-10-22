import { toast } from 'sonner';
import { useState } from 'react';
import { useBoolean } from '@hooks/use-boolean';

import { customerRepository, subscriptionRepository } from 'src/repositories';

/**
 * @typedef {import("src/repositories/subscription").BillingActionLog} BillingActionLog
 * @typedef {import('src/repositories/customer').Customer} Customer
 */

export function useBillingActionLogDialogState() {
  const show = useBoolean(false);
  const loading = useBoolean(false);
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(0);
  const [customerId, setCustomerId] = useState(null);
  const [customer, setCustomer] = useState(/** @type {Customer|null} */ (null));

  /** @typedef {[BillingActionLog[], Function]} */
  const [data, setData] = useState([]);

  /**
   * Reset State
   */
  function reset() {
    setLimit(10);
    setPage(0);
    setCustomerId(null);
    setCustomer(null);
    setData([]);
    setTotal(0);
  }

  /**
   * Load customer details by ID
   * @param {string} customer_id
   */
  async function loadCustomer(customer_id) {
    setCustomerId(customer_id);
    try {
      const snapshot = await customerRepository.getCustomer(customer_id);
      setCustomer(snapshot);
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
    }
  }

  /**
   * Load billing action logs for the current customer
   * @returns {Promise<void>}
   */
  async function loadData(customer_id) {
    const id = customer_id ?? customerId;
    if (!id) return;
    loading.onTrue();
    try {
      const snapshot = await subscriptionRepository.getBillingActionLogs({
        customerId: id,
        limit,
        page,
      });
      setData(snapshot.data);
      setTotal(snapshot.total);
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
    } finally {
      loading.onFalse();
    }
  }

  return {
    show,
    loading,
    limit,
    setLimit,
    page,
    setPage,
    customerId,
    customer,
    data,
    loadCustomer,
    loadData,
    reset,
    total,
  };
}
