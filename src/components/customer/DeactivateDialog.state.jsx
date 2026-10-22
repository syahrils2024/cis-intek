/**
 * @typedef {import("src/repositories/customer").Customer} Customer
 * @typedef {import('src/repositories/area').Area} Area
 */

import { toast } from 'sonner';
import { useMemo, useState } from 'react';
import { useBoolean } from '@hooks/use-boolean';

import { Chip } from '@mui/material';

import 'src/extension/string';
import 'src/extension/number';
import 'src/extension/date';
import {
  areaRepository,
  userRepository,
  customerRepository,
  mikrotikRepository,
  subscriptionRepository,
} from 'src/repositories';

/**
 * @typedef {import('src/repositories/user').User} User
 */

export const useCustomerDeactivateDialogState = () => {
  /** @type {[Customer, void]} */
  const [customer, setCustomer] = useState(null);

  /** @type {[Area, void]} */
  const [area, setArea] = useState(null);

  /** @type {[User[], void]} */
  const [engineers, setEngineers] = useState([]);

  /** @type {[string[], void]} */
  const [selectedEngineers, setSelectedEngineers] = useState([]);

  const withoutEngineer = useBoolean(false);

  const loading = useBoolean(false);
  const loadingSubmit = useBoolean(false);
  const showDialog = useBoolean(false);

  const allowSubmit = useBoolean(true);
  const checkedUser = useBoolean(false);

  const [mikrotikStatus, setMikrotikStatus] = useState('pending');
  const [deactiveStatus, setDeactiveStatus] = useState('pending');

  const [deactivateError, setDeactivateError] = useState(null);
  const [mikrotikError, setMikrotikError] = useState(null);

  const [isDeliverOffice, setIsDeliverOffice] = useState(false);
  const [option, setOption] = useState('DISMAINTENANCE_NO_TICKET');

  const [description, setDescription] = useState('PENONAKTIFKAN PELANGGAN DAN PENCABUTAN ALAT');

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
      label: 'Progress Nonaktifkan Pelanggan',
      value: deactiveStatus,
      className:
        deactiveStatus === 'pending'
          ? 'tw-text-orange-600'
          : deactiveStatus === 'error'
            ? 'tw-text-error'
            : 'tw-text-green-600',
      iconName:
        deactiveStatus === 'pending'
          ? 'material-symbols:timer-outline'
          : deactiveStatus === 'error'
            ? 'material-symbols:error-rounded'
            : 'ep:success-filled',
      labelStatus:
        deactiveStatus === 'error' ? ': Gagal' : deactiveStatus === 'success' ? ': Berhasil' : '',
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
      value: area?.duoDate ?? '-',
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
    allowSubmit.onTrue();
    checkedUser.onFalse();
    setMikrotikStatus('pending');
    setDeactiveStatus('pending');
    setEngineers([]);
    setSelectedEngineers([]);
    withoutEngineer.onFalse();
    setDescription('PENONAKTIFKAN PELANGGAN DAN PENCABUTAN ALAT');
  }

  async function prefetch(customerId) {
    loading.onTrue();
    try {
      const c = await customerRepository.getCustomer(customerId);
      setCustomer(c);

      const snapshotArea = await areaRepository.getAreaDetail(c.area);
      setArea(snapshotArea);

      const snapshotEngineer = await userRepository.getUserByPrivilege('engineer', {
        area: c.area,
      });
      setEngineers(snapshotEngineer);
    } catch (error) {
      toast.error(error.message);
    } finally {
      loading.onFalse();
    }
  }

  async function submit(isDiantar) {
    if (!customer) return;
    if (
      !withoutEngineer.value &&
      selectedEngineers.length <= 0 &&
      !isDiantar &&
      option !== 'DISMAINTENANCE_NO_TICKET'
    ) {
      toast.error('Pilih minimal 1 Tim Dismantle');
      return;
    }

    setMikrotikError(null);
    setDeactivateError(null);
    setDeactiveStatus('pending');
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

      const ticketType = option === 'DISMAINTENANCE_NO_TICKET' ? option : 'dismaintenance';
      const isUsingTicket = ticketType !== 'DISMAINTENANCE_NO_TICKET';
      await subscriptionRepository.turnOffCustomer(customer._id, {
        engineers: isDiantar || withoutEngineer.value ? [] : selectedEngineers,
        ticketType: ticketType.toLowerCase(),
        isUsingTicket,
        description: ticketType === 'DISMAINTENANCE_NO_TICKET' ? null : description,
        withoutEngineer: withoutEngineer.value,
      });
      setDeactiveStatus('success');
    } catch (error) {
      setDeactiveStatus('error');
      setDeactivateError(error.message);
      allowSubmit.onTrue();
    } finally {
      loading.onFalse();
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
    deactivateError,
    mikrotikError,
    engineers,
    setEngineers,
    selectedEngineers,
    setSelectedEngineers,
    isDeliverOffice,
    setIsDeliverOffice,
    option,
    setOption,
    setMikrotikStatus,
    loadingSubmit,
    deactiveStatus,
    setDeactiveStatus,
    clear,
    prefetch,
    submit,
    withoutEngineer,
    description,
    setDescription,
  };
};
