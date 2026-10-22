/**
 * @typedef {import("../duitku.store").DuitkuStore} DuitkuStore
 */

import { toast } from 'sonner';
import { useMemo } from 'react';

import { duitkuRepository } from 'src/repositories';

import { useDuitkuStore } from '../duitku.store';

export function useFeeState() {
  /** @type {DuitkuStore} */
  const { fee, setFee } = useDuitkuStore();
  const { data, limit, loading, page, search } = fee;

  const filteredData = useMemo(() => {
    const s = search.toLowerCase().trim();
    const filteredItems = data.filter(
      (item) => item.paymentName.toLowerCase().includes(s) || item.code.toLowerCase().includes(s)
    );

    const start = page * limit;
    const end = start + limit;
    return filteredItems.slice(start, end);
  });

  async function prefetch() {
    setFee({ loading: true });
    try {
      const snapshot = await duitkuRepository.getFee();
      setFee({ data: snapshot });
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
    } finally {
      setFee({ loading: false });
    }
  }

  return {
    data,
    filteredData,
    limit,
    loading,
    page,
    search,
    prefetch,
    setState: setFee,
  };
}
