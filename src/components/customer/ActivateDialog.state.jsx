/**
 * @typedef {import("src/repositories/customer").Customer} Customer
 * @typedef {import('src/repositories/area').Area} Area
 * @typedef {import('src/repositories/subscription').ISimulateActivateBilling} SimulateActivateBilling
 */

import { toast } from 'sonner';
import { useMemo, useState } from 'react';
import { useBoolean } from '@hooks/use-boolean';
import { useDebouncedCallback } from 'use-debounce';

import { Chip } from '@mui/material';

import 'src/extension/string';
import 'src/extension/number';
import 'src/extension/date';
import {
  areaRepository,
  customerRepository,
  mikrotikRepository,
  subscriptionRepository,
} from 'src/repositories';

export const useCustomerActivateDialogState = () => {
  /** @type {[Customer, void]} */
  const [customer, setCustomer] = useState(null);
  const simulateHeaders = ['Keterangan', 'Periode', 'Paket', 'Biaya'];

  /** @type {[Area, void]} */
  const [area, setArea] = useState(null);

  const loading = useBoolean(false);
  const loadingSubmit = useBoolean(false);
  const showDialog = useBoolean(false);

  const allowSubmit = useBoolean(true);
  const checkedUser = useBoolean(false);
  const disabledSubmit = useBoolean(false);

  const usingInstallationFee = useBoolean(false);
  const isUsingFee = useBoolean(false);
  const [fee, setFee] = useState([{ name: 'Biaya Admin', amount: 0 }]);

  const [mikrotikStatus, setMikrotikStatus] = useState('pending');
  const [activateStatus, setActivateStatus] = useState('pending');

  const [activateError, setActivateError] = useState(null);
  const [mikrotikError, setMikrotikError] = useState(null);

  /** @type {[SimulateActivateBilling[], void]} */
  const [simulateBilling, setSimulateBilling] = useState([]);
  const isSimulateBillingLoading = useBoolean(false);
  const getSimulateBillingDebounce = useDebouncedCallback(getSimulateBilling, 700);

  const simulateBody = useMemo(() => {
    const total = simulateBilling.reduce((prev, current) => prev + current.amount, 0);
    const items = simulateBilling;
    return { total, items };
  });

  const steps = useMemo(() => [
    {
      label: 'Check Mikrotik Server',
      value: mikrotikStatus,
      className:
        mikrotikStatus === 'pending'
          ? 'tw-text-orange-600'
          : mikrotikStatus === 'error'
            ? 'tw-text-error'
            : 'tw-text-green-600',
      iconName:
        mikrotikStatus === 'pending'
          ? 'material-symbols:timer-outline'
          : mikrotikStatus === 'error'
            ? 'material-symbols:error-rounded'
            : 'ep:success-filled',
      labelStatus:
        mikrotikStatus === 'error' ? ': Gagal' : mikrotikStatus === 'success' ? ': Berhasil' : '',
    },
    {
      label: 'Progress Aktivasi Ulang Pelanggan',
      value: activateStatus,
      className:
        activateStatus === 'pending'
          ? 'tw-text-orange-600'
          : activateStatus === 'error'
            ? 'tw-text-error'
            : 'tw-text-green-600',
      iconName:
        activateStatus === 'pending'
          ? 'material-symbols:timer-outline'
          : activateStatus === 'error'
            ? 'material-symbols:error-rounded'
            : 'ep:success-filled',
      labelStatus:
        activateStatus === 'error' ? ': Gagal' : activateStatus === 'success' ? ': Berhasil' : '',
    },
  ]);

  const customerInformations = useMemo(() => [
    {
      title: 'ID',
      value: customer?.customerId ?? '-',
    },
    {
      title: 'Pelanggan',
      value: customer?.fullname ?? '-',
    },
    {
      title: 'Area / POP',
      value: area?.title ?? '-',
    },
    {
      title: 'ODP',
      value: customer?.ODPName ?? '-',
    },
    {
      title: 'Paket Saat ini',
      value: customer?.packageData?.title ?? '-',
    },
    {
      title: 'Biaya Bulanan',
      value: customer?.activePackage?.price
        ? `Rp. ${customer?.activePackage?.price.formatCurrency()}`
        : '-',
    },
    {
      title: 'Jenis Layanan',
      value:
        area == null
          ? '-'
          : area.isPrePaid
            ? 'Prabayar / Bayar depan'
            : 'Pascabayar / Bayar Belakang',
    },
    {
      title: 'Tanggal Jatuh Tempo',
      value: customer?.activePackage?.start?.toDate().format('dd') ?? '-',
    },
    {
      title: 'Status Pembayaran',
      value: !customer ? (
        '-'
      ) : customer?.totalUnpaidBilling ? (
        <Chip
          label="Memiliki Tunggakan"
          variant="soft"
          color="error"
          className="tw-w-min"
          size="small"
        />
      ) : (
        <Chip label="Lunas" variant="soft" color="success" className="tw-w-min" size="small" />
      ),
    },
    {
      title: 'Tunggakan',
      value: !customer
        ? '-'
        : (customer?.totalUnpaidBilling ?? 0) > 0
          ? `Rp. ${customer?.totalUnpaidBilling.formatCurrency()}`
          : 'Tidak ada',
    },
  ]);

  function clear() {
    setCustomer(null);
    setArea(null);
    checkedUser.onFalse();
    allowSubmit.onTrue();
    setMikrotikStatus('pending');
    setActivateStatus('pending');
    setMikrotikError(null);
    setActivateError(null);
    setFee([{ name: 'Biaya admin', amount: 0 }]);
    setSimulateBilling([]);
    usingInstallationFee.onFalse();
    usingInstallationFee.onFalse();
    isSimulateBillingLoading.onFalse();
  }

  async function prefetch(customerId) {
    loading.onTrue();
    try {
      const c = await customerRepository.getCustomer(customerId);
      setCustomer(c);

      const snapshotArea = await areaRepository.getAreaDetail(c.area);
      setArea(snapshotArea);

      getSimulateBillingDebounce();
    } catch (error) {
      toast.error(error.message);
    } finally {
      loading.onFalse();
    }
  }

  async function submit() {
    if (!customer) return;
    setMikrotikError(null);
    setActivateError(null);
    setActivateStatus('pending');
    setMikrotikStatus('pending');
    allowSubmit.onFalse();
    loading.onTrue();
    try {
      const mikrotikIsActive = await mikrotikRepository
        .mikrotikIsOnline(customer._id)
        .catch((err) => {
          setMikrotikStatus('error');
          setMikrotikError(err.message);
          return undefined;
        });
      if (mikrotikIsActive) setMikrotikStatus('success');

      await subscriptionRepository.activateCustomer({
        id: customer._id,
        fee: isUsingFee.value ? fee : [],
        isUsingInstallationCharge: usingInstallationFee.value,
      });
      setActivateStatus('success');
    } catch (error) {
      setActivateStatus('error');
      setActivateError(error.message);
    } finally {
      loading.onFalse();
    }
  }

  function addFee() {
    setFee((state) => [...state, { name: '', amount: 0 }]);
  }

  function removeFee(index) {
    const copy = [...fee];
    if (copy.length <= 1) return;
    copy.splice(index, 1);
    setFee(copy);
    getSimulateBillingDebounce();
  }

  function setFeeItems(index, { name, amount }) {
    const copy = [...fee];
    if (typeof name === 'string') copy[index].name = name;
    if (typeof amount === 'number') copy[index].amount = amount;
    setFee(copy);
    getSimulateBillingDebounce();
  }

  async function getSimulateBilling() {
    isSimulateBillingLoading.onTrue();
    try {
      const snapshotSimulate = await subscriptionRepository.simulateActivationBilling({
        id: customer._id,
        fee: isUsingFee.value ? fee : [],
        isUsingInstallationCharge: usingInstallationFee.value,
      });
      setSimulateBilling(snapshotSimulate);
    } catch (error) {
      toast.error(error.message);
    } finally {
      isSimulateBillingLoading.onFalse();
    }
  }

  return {
    customer,
    area,
    loading,
    showDialog,
    steps,
    customerInformations,
    allowSubmit,
    setCustomer,
    setArea,
    mikrotikStatus,
    checkedUser,
    deactivateError: activateError,
    mikrotikError,
    isUsingFee,
    usingInstallationFee,
    fee,
    isSimulateBillingLoading,
    addFee,
    removeFee,
    setFeeItems,
    setMikrotikStatus,
    loadingSubmit,
    activateStatus,
    setActivateStatus,
    clear,
    prefetch,
    submit,
    simulateBilling,
    getSimulateBillingDebounce,
    simulateBody,
    simulateHeaders,
  };
};
