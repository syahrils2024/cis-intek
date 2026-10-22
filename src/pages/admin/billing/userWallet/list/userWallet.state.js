import { toast } from 'sonner';
import { useRef, useState } from 'react';
import { useBoolean } from '@hooks/use-boolean';

import { userWalletRepository } from 'src/repositories';
/**
 * @typedef {import("src/repositories/userWallet").UserWallet} UserWallet
 */

export function useWalletState() {
  const privilege = 'engineer';

  const loading = useBoolean(false);
  const [data, setData] = useState([]);
  const [search, setSearch] = useState('');

  const logDialogRef = useRef();
  const withdrawConfirmRef = useRef();

  async function load() {
    loading.onTrue();
    try {
      const result = await userWalletRepository.getUserWalletList(privilege);
      const snapshot = result.map((item) => ({ ...item, id: item._id }));
      setData(snapshot);
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
    } finally {
      loading.onFalse();
    }
  }

  function replaceItem(newItem) {
    setData((prev) => {
      const index = prev.findIndex((item) => item._id === newItem._id);
      if (index === -1) return prev;
      const newData = [...prev];
      newData[index] = { ...newItem, id: newItem._id };
      return newData;
    });
  }

  /**
   * Open Mutasi Kas Kolektor
   * @param {UserWallet} item
   */
  function showLog(item) {
    logDialogRef.current?.open(item);
  }

  /**
   * Tarik Kas Kolektor
   * @param {UserWallet} item
   */
  async function withdraw(item) {
    const result = await withdrawConfirmRef.current?.open(item);
    if (result) load();
  }

  /**
   * Refresh Saldo User Wallet
   * @param {UserWallet} item
   */
  async function refreshBalance(item) {
    const promise = userWalletRepository.syncBalance(item._id);
    toast.promise(promise, {
      loading: 'menghitung mutasi saldo...',
      success: (result) => {
        replaceItem(result);
        return 'Berhasil';
      },
      error: 'Gagal menyinkronkan saldo',
    });
  }

  return {
    state: {
      loading,
      data,
      search,
    },
    ref: {
      logDialogRef,
      withdrawConfirmRef,
    },
    handlers: {
      load,
      setData,
      setSearch,
      refreshBalance,
      showLog,
      withdraw,
    },
  };
}
