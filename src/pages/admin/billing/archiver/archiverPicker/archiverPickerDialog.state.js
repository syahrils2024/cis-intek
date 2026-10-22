import { toast } from 'sonner';
import { useRef, useState } from 'react';
import { useBoolean } from '@hooks/use-boolean';

import { useTheme, useMediaQuery } from '@mui/material';

import { subscriptionRepository } from 'src/repositories';

export function useArchiverPickerDialogState() {
  const [date, setDate] = useState(new Date());
  const [areaName, setAreaName] = useState('Semua');
  const [areaId, setAreaId] = useState('');
  const loading = useBoolean(false);
  const show = useBoolean(false);

  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down('md'));

  const resoler = useRef();
  const areaPickerRef = useRef();

  function reset() {
    setDate(new Date());
    setAreaName('Semua');
    setAreaId('');
    loading.onFalse();
  }

  function open() {
    show.onTrue();
    return new Promise((resolve) => {
      resoler.current = resolve;
    });
  }

  function close(value) {
    show.onFalse();
    resoler.current?.(value);
    reset();
  }

  async function submit() {
    loading.onTrue();
    console.log(date);
    try {
      const result = await subscriptionRepository.archiveInvoices({
        month: date.getMonth() + 1,
        year: date.getFullYear(),
        area: areaId,
      });
      toast.success(`Berhasil membuat arsip: ${result.archiveFilename}`);
      close(result);
    } catch (err) {
      if (err instanceof Error) toast.error(err.message);
    } finally {
      loading.onFalse();
    }
  }

  async function pickArea() {
    if (areaPickerRef.current) {
      const result = await areaPickerRef.current.open(areaId);
      if (result) {
        setAreaId(result._id);
        setAreaName(result.name);
      }
    }
  }

  return {
    submit,
    open,
    close,
    reset,
    date,
    setDate,
    areaName,
    setAreaName,
    setAreaId,
    loading,
    show,
    mobile,
    pickArea,
    areaPickerRef,
  };
}
