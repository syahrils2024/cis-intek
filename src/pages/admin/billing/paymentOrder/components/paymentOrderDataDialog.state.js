/**
 * @typedef {import("src/repositories/customer").Customer} Customer
 * @typedef {import("src/repositories/paymetOrder").PaymentGatewayOrder} PaymentGatewayOrder
 */

import { toast } from 'sonner';
import { useBoolean } from '@hooks/use-boolean';
import { useRef, useMemo, useState } from 'react';

import { useTheme, useMediaQuery } from '@mui/material';

import { customerRepository, paymentOrderRepository } from 'src/repositories';

export function usePaymentOrderDataDialogState() {
  const theme = useTheme()
  const mobile = useMediaQuery(theme.breakpoints.down('sm'))

  /** @type {[Customer, function(Customer|null): void]} */
  const [customerData, setCustomerData] = useState(null);

  /** @type {[PaymentGatewayOrder, function(PaymentGatewayOrder|null): void]} */
  const [orderData, setOrderData] = useState(null);

  const show = useBoolean(false);
  const loading = useBoolean(false);
  const promises = useRef();

  const customerHeaders = useMemo(
    () => [
      {
        label: 'ID',
        value: customerData?.customerId ?? '-',
      },
      {
        label: 'Nama',
        value: customerData?.fullname ?? '-',
      },
      {
        label: 'Whatsapp',
        value: customerData?.phoneNumber ?? '-',
      },
      {
        label: 'Alamat',
        value: customerData?.address ?? '-',
      },
      {
        label: 'Area',
        value: customerData?.areaName ?? '-',
      },
      {
        label: 'Reference ID',
        value: orderData?.referenceOrderId ?? '-',
      },
    ],
    [customerData]
  );

  async function fetchCustomerData(id) {
    loading.onTrue();
    try {
      const snapshotCustomer = await customerRepository.getCustomer(id);
      setCustomerData(snapshotCustomer);
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
    } finally {
      loading.onFalse();
    }
  }

  async function recheckOrderStatus() {
    loading.onTrue();
    try {
      const snapshotOrder = await paymentOrderRepository.recheckOrder(orderData?._id);
      setOrderData(snapshotOrder);
      toast.success('Status order berhasil diperbarui');
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
    } finally {
      loading.onFalse();
    }
  }

  function open(orderItem) {
    show.onTrue();
    setOrderData(orderItem);
    fetchCustomerData(orderItem.customerId);
    return new Promise((resolve) => {
      promises.current = resolve;
    });
  }

  function close(){
    show.onFalse();
    promises.current?.();
  }

  return { customerData, customerHeaders, orderData, show, recheckOrderStatus, open, close, mobile, loading };
}
