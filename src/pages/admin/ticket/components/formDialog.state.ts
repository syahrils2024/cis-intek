// @ts-nocheck

import { z } from 'zod';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { useBoolean } from '@hooks/use-boolean';
import { useAppPicker } from '@hooks/use-app-picker';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRef, useMemo, useState, useEffect } from 'react';

import { ticketRepository, customerRepository } from 'src/repositories';

const schemaValidator = z.object({
  description: z.string(),
  ticketType: z.string(),
});

/**
 * @typedef {import('src/repositories/customer').CustomerListFromEngineer} CustomerListFromEngineer
 * @typedef {import('src/repositories/user').User} User
 */

export function useTicketFormDialogState() {
  const appPicker = useAppPicker();
  const customerPickerRef = useRef();
  const show = useBoolean(false);
  const resolver = useRef();
  const loading = useBoolean(false);
  const deactivateDialogRef = useRef();
  const sendImage = useBoolean(true);

  /** @type {[User[], Function]} */
  const [engineers, setEngineers] = useState([]);

  const ticketTypes = [
    { label: 'Lainnya', value: 'other' },
    { label: 'Perbaikan', value: 'maintenance' },
    { label: 'Kendala Jaringan', value: 'internet_trouble' },
    { label: 'Upgrade Internet', value: 'upgrade_request' },
    {
      label: 'Dismantle / Nonaktifkan Pelanggan',
      value: 'dismantle',
    },
  ];

  const [images, setImages] = useState([]);
  const [preview, setPreview] = useState([]);

  /** @type {[CustomerListFromEngineer, void]} */
  const [customer, setCustomer] = useState(null);

  async function fetchCustomer(customerId) {
    loading.onTrue();
    try {
      const snapshot = await customerRepository.getCustomer(customerId);
      setCustomer(snapshot);
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
    } finally {
      loading.onFalse();
    }
  }

  const engineerList = useMemo(
    () =>
      engineers
        .filter((e) => e.status !== 'inactive')
        .map((e) => ({ label: e.fullname, value: e._id })),
    [engineers]
  );

  const customerHeader = useMemo(
    () => [
      {
        label: 'ID',
        value: customer?.customerId ?? '-',
      },
      {
        label: 'Nama Lengkap',
        value: customer?.fullname ?? '-',
      },
      {
        label: 'ODP',
        value: customer?.odpName ?? customer?.ODPName ?? '-',
      },
      {
        label: 'POP',
        value: customer?.areaData?.title ?? customer?.areaName ?? '-',
      },
    ],
    [customer]
  );

  // async function prefetchEngineer() {
  //   try {
  //     const snapshotUser = await userRepository.getUserByPrivilege('engineer');
  //     setEngineer(snapshotUser);
  //   } catch (error) {
  //     toast.error(error.message);
  //   }
  // }

  /** @param {File} f */
  function onAddImage(f) {
    setImages((prev) => [...prev, f]);
    const reader = new FileReader();
    reader.onload = () => {
      setPreview((prev) => [...prev, reader.result]);
    };
    reader.readAsDataURL(f);
  }

  function onRemoveImage(index) {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreview((prev) => prev.filter((_, i) => i !== index));
  }

  const defaultValues = {
    description: '',
    ticketType: 'maintenance',
  };

  const methods = useForm({ defaultValues, resolver: zodResolver(schemaValidator) });
  const { handleSubmit } = methods;

  function reset() {
    methods.reset();
    setImages([]);
    setPreview([]);
    setCustomer(null);
    setEngineers([]);
    sendImage.onTrue();
  }

  function open(customer_id) {
    show.onTrue();
    reset();
    // prefetchEngineer();
    if (customer_id) {
      fetchCustomer(customer_id);
    }
    return new Promise((resolve) => {
      resolver.current = resolve;
    });
  }

  function close() {
    show.onFalse();
    resolver.current();
  }

  async function pickCustomer() {
    const c = await customerPickerRef.current.open();
    if (!c) return;
    setCustomer(c);
  }

  const submit = handleSubmit(async (data) => {
    try {
      if (!customer) throw new Error('Pilih Pelanggan');
      const engineersId = engineers.map((e) => e._id);
      const promises = ticketRepository.submit({
        customerId: customer._id,
        description: data.description,
        engineers: engineersId.join(','),
        ticketType: data.ticketType,
        images,
        sendImage: sendImage.value ? 'true' : 'false',
      });

      toast.promise(promises, {
        loading: 'Mengirim Ticket...',
        success: () => {
          close();
          return 'Ticket berhasil dikirim';
        },
        error: (err) => err.message,
      });
    } catch (error) {
      toast.error(error.message);
    } finally {
      loading.onFalse();
    }
  });

  async function openCustomerDeactivateDialog(customerId) {
    close();
    await deactivateDialogRef.current?.open(customerId);
  }

  function listenToDismantle() {
    const isDismantle = methods.getValues('ticketType') === 'dismantle';
    const customerId = customer?._id;
    if (isDismantle && customerId) openCustomerDeactivateDialog(customerId);
  }

  async function pickEngineer() {
    const selectedEngineers = engineers.map((e) => e._id);
    const snapshotEngineer = await appPicker.engineer.open(true, {
      currentEngineerId: selectedEngineers,
      areaId: customer?.area,
    });
    if (!snapshotEngineer) return;
    setEngineers(snapshotEngineer);
  }

  methods.watch(listenToDismantle);

  useEffect(listenToDismantle, [customer]);

  return {
    state: {
      customerPickerRef,
      deactivateDialogRef,
      show,
      loading,
      customer,
      images,
      preview,
      ticketTypes,
      engineerList,
      customerHeader,
      methods,
      engineers,
      sendImage,
    },
    handlers: {
      open,
      close,
      pickCustomer,
      submit,
      onAddImage,
      onRemoveImage,
      pickEngineer,
    },
  };
}
