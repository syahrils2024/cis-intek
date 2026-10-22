import { useRef } from 'react';
import { useDebouncedCallback } from 'use-debounce';

import { useTheme, useMediaQuery } from '@mui/material';

import { usePaymentOrderStore } from './paymentOrder.store';

/**
 * @typedef {import('./paymentOrder.store').PaymentOrderStore} PaymentOrderStore
 * @typedef {import('src/repositories/paymetOrder').PaymentGatewayOrder} PaymentGatewayOrder
 */

export function usePaymentOrderState() {
  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down('md'));
  const detailDialogRef = useRef();
  const areaPickerRef = useRef();

  /** @type {PaymentOrderStore} */
  const {
    data,
    limit,
    page,
    search,
    load,
    loading,
    setStore,
    start,
    until,
    total,
    status,
    areaId,
    areaName,
  } = usePaymentOrderStore();

  const debounceLoad = useDebouncedCallback(() => {
    load();
  }, 500);

  /** @param {PaymentGatewayOrder} order */
  async function openDetail(order) {
    if (detailDialogRef.current) {
      await detailDialogRef.current.open(order);
      load();
    }
  }

  async function openAreaPicker() {
    const result = await areaPickerRef.current?.open(areaId);
    if (!result) return;
    setStore({ areaId: result._id, areaName: result.name });
  }

  return {
    data,
    limit,
    page,
    search,
    status,
    load,
    loading,
    setStore,
    start,
    until,
    total,
    mobile,
    detailDialogRef,
    openDetail,
    debounceLoad,
    openAreaPicker,
    areaName,
    areaPickerRef,
  };
}
