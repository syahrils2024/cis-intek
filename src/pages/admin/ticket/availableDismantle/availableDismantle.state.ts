// @ts-nocheck

/**
 * @typedef {import("./availableDismantle.store").AvailableDismantleStore} AvailableDismantleStore
 * @typedef {import('src/repositories/subscription').AvailableDismantleSubscription} AvailableDismantleSubscription
 */

import { toast } from 'sonner';
import { useRef, useEffect } from 'react';
import { useBoolean } from '@hooks/use-boolean';
import { useDebouncedCallback } from 'use-debounce';
import { useAppPicker } from '@hooks/use-app-picker';

import { useTheme, useMediaQuery } from '@mui/material';

import { subscriptionRepository } from 'src/repositories';

import { useAvailableDismantleStore } from './availableDismantle.store';

export function useAvailableDismantleState() {
  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down('md'));
  const paymentDialogRef = useRef();
  const deactivateDialogRef = useRef();

  /** @type {AvailableDismantleStore} */
  const {
    areaId,
    areaTitle,
    data,
    limit,
    packageId,
    page,
    total,
    search,
    setStore,
    minimumAmount,
  } = useAvailableDismantleStore();
  const { area } = useAppPicker();

  const loading = useBoolean(false);

  async function load() {
    loading.onTrue();
    try {
      const snapshot = await subscriptionRepository.getAvailableDismantleSubscriptions({
        area: areaId,
        limit,
        packages: packageId,
        page,
        search,
        minimumAmount,
      });
      setStore({
        data: snapshot.data,
        total: snapshot.total,
      });
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
    } finally {
      loading.onFalse();
    }
  }

  /** @param {AvailableDismantleSubscription} item */
  async function deactivate(item) {
    await deactivateDialogRef.current.open(item._id);
    load();
  }

  /** @param {AvailableDismantleSubscription} item */
  async function openPaymentDialog(item) {
    await paymentDialogRef.current.open(item._id);
    load();
  }

  async function pickArea() {
    const result = await area.open(areaId, true);
    if (!result) return;
    setStore({
      areaId: result._id,
      areaTitle: result.title,
    });
  }

  const debounceLoad = useDebouncedCallback(() => {
    load();
  }, 500);

  // On mounted lifecycle
  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    debounceLoad();
  }, [page]);

  useEffect(() => {
    setStore({ page: 0 });
    debounceLoad();
  }, [areaId, packageId, search, minimumAmount]);

  return {
    state: {
      areaId,
      areaTitle,
      data,
      limit,
      packageId,
      page,
      total,
      search,
      loading,
      mobile,
      minimumAmount,
    },
    ref: {
      paymentDialogRef,
      deactivateDialogRef,
    },
    handler: {
      setStore,
      load,
      pickArea,
      openPaymentDialog,
      deactivate,
    },
  };
}
