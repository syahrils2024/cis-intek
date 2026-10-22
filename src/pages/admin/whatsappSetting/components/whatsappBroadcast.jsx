import { toast } from 'sonner';
import { useRef, useEffect } from 'react';
import { Iconify } from '@components/iconify';
import { useConfirm } from 'material-ui-confirm';
import Overloading from '@components/overloading';

import { Stack, Button, useTheme, useMediaQuery } from '@mui/material';

import { broadcastScheduleRepository } from 'src/repositories';

import WhatsappBroadcastForm from './whatsappBroadcastForm';
import { BroadcastScheduleData } from './whatsappBroadcastData';
import { useBroadcastScheduleState } from '../states/broadcastSchedule.state';

/**
 * @typedef {import('src/repositories/broadcastSchedule').BroadcastSchedule} BroadcastSchedule
 */

export default function WhatsappBroadcastPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const formRef = useRef();
  const { loading, load, data } = useBroadcastScheduleState();
  const confirm = useConfirm();

  useEffect(() => {
    load();
  }, []);

  async function openForm() {
    await formRef.current.open();
    load();
  }

  /**
   * @param {BroadcastSchedule} item
   */
  async function edit(item) {
    await formRef.current.open(item._id);
    load();
  }

  async function toggleEnabled(item, enabled) {
    const promises = broadcastScheduleRepository.toggleEnabled(item._id, enabled);
    const loadingMessage = enabled ? 'Mengaktifkan...' : 'Menonaktifkan...';
    toast.promise(promises, {
      loading: loadingMessage,
      success: () => {
        load();
        return 'Berhasil menyimpan perubahan';
      },
      error: (error) => (error instanceof Error ? error.message : 'Gagal Menyimpan perubahan'),
    });
  }

  /**
   * @param {BroadcastSchedule} item
   */
  async function remove(item) {
    try {
      await confirm({
        title: 'Hapus Broadcast Schedule',
        description: `Apakah Anda yakin ingin menghapus schedule tanggal ${item.date}?`,
        confirmationText: 'Hapus',
        cancellationText: 'Batal',
        confirmationButtonProps: {
          color: 'error',
          variant: 'contained',
        },
        cancellationButtonProps: {
          variant: 'text',
          color: 'primary',
        },
      });

      const promises = broadcastScheduleRepository.remove(item._id);
      toast.promise(promises, {
        loading: 'Menghapus...',
        success: () => {
          load();
          return 'Berhasil menghapus';
        },
        error: (error) => (error instanceof Error ? error.message : 'Gagal Menghapus'),
      });
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }

  return (
    <>
      <Stack className="tw-w-full">
        <Stack
          className="tw-w-full"
          direction="row"
          alignItems="center"
          justifyContent="end"
          mb={2}
        >
          <Button color="success" variant="contained" onClick={() => openForm()}>
            <Iconify icon="mdi:plus" /> Tambah
          </Button>
        </Stack>
        <Stack className="tw-relative" spacing={1}>
          <Overloading loading={loading.value} />
          {isMobile ? (
            <BroadcastScheduleData.Mobile
              data={data}
              onEdit={(item) => edit(item)}
              onDelete={(item) => remove(item)}
              toggleEnabled={(item, enabled) => toggleEnabled(item, enabled)}
            />
          ) : (
            <BroadcastScheduleData.Table
              data={data}
              onEdit={(item) => edit(item)}
              onDelete={(item) => remove(item)}
              toggleEnabled={(item, enabled) => toggleEnabled(item, enabled)}
            />
          )}
        </Stack>
      </Stack>
      <WhatsappBroadcastForm ref={formRef} />
    </>
  );
}
