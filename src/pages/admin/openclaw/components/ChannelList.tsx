import { toast } from 'sonner';
import { Iconify } from '@components/iconify';
import { useConfirm } from 'material-ui-confirm';
import React, { useState, useEffect } from 'react';

import { Alert, Button, CircularProgress } from '@mui/material';

import { useSocketStore } from 'src/stores/socketStore';

import useChannels from '../hooks/useChannels';
import ChannelTable from './channel/ChannelTable';
import QrLoginDialog from './channel/QrLoginDialog';
import AddChannelDialog from './channel/AddChannelDialog';

import type { SocketStoreShape, AddChannelPayload } from '../openclaw.types';

type QrReadyPayload = { qrCode: string };
type QrDonePayload = { exitCode: number };

export default function ChannelList() {
  const {
    channels,
    error,
    fetchChannels,
    addChannel,
    deleteChannel,
    logoutChannel,
  } = useChannels();
  const socket = (useSocketStore as unknown as () => SocketStoreShape)();
  const confirm = useConfirm();

  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [loginChannelId, setLoginChannelId] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [polling, setPolling] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    if (loginChannelId && !socket.client) socket.connect();
  }, [loginChannelId, socket]);

  useEffect(() => {
    const {client} = socket;
    if (!loginChannelId || !socket.isConnected || !client) return undefined;

    const handleQrReady = ({ qrCode }: QrReadyPayload) => {
      setQrDataUrl(qrCode);
      setPolling(true);
    };
    const handleQrDone = ({ exitCode }: QrDonePayload) => {
      setPolling(false);
      setLoginChannelId(null);
      setQrDataUrl(null);
      if (exitCode === 0) {
        fetchChannels();
        toast.success('WhatsApp connected successfully');
      }
    };

    client.on('openclaw:qr:ready', handleQrReady);
    client.on('openclaw:qr:done', handleQrDone);
    client.emit('openclaw:qr:scan', { accountId: loginChannelId });

    return () => {
      client.emit('openclaw:qr:stop', { accountId: loginChannelId });
      client.off('openclaw:qr:ready', handleQrReady);
      client.off('openclaw:qr:done', handleQrDone);
    };
  }, [loginChannelId, socket.client, socket.isConnected, fetchChannels]);

  useEffect(() => {
    (async () => {
      await fetchChannels();
      setInitialLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAdd = async (payload: AddChannelPayload) => {
    await addChannel(payload);
    setOpenAddDialog(false);
    await fetchChannels();
  };

  const handleDelete = async (id: string) => {
    try {
      await confirm({
        title: 'Hapus Whatsapp Channel',
        description: 'pastikan anda ingin menghapus channel ini ?',
        confirmationText: 'Hapus',
        cancellationText: 'Batal',
      });
    } catch (err) {
      if (err instanceof Error) toast.error(err.message);
      return;
    }

    const deletePromise = deleteChannel(id).then(fetchChannels);
    toast.promise(deletePromise, {
      loading: 'Menghapus WhatsApp channel...',
      success: 'WhatsApp channel berhasil dihapus',
      error: (err) => err.message || 'Gagal menghapus WhatsApp channel',
    });
  };

  const handleLogout = async (id: string) => {
    try {
      await confirm({
        title: 'Logout Whatsapp Channel',
        description: 'pastikan anda ingin logout channel ini ?',
        confirmationText: 'Logout',
        cancellationText: 'Batal',
      });
    } catch (err) {
      if (err instanceof Error) toast.error(err.message);
      return;
    }

    const logoutPromise = logoutChannel(id).then(fetchChannels);
    toast.promise(logoutPromise, {
      loading: 'Logging out WhatsApp channel...',
      success: 'WhatsApp channel logged out successfully',
      error: (err) => err.message || 'Failed to logout WhatsApp channel',
    });
  };

  const handleStartLogin = async (id: string) => {
    setLoginChannelId(id);
    setQrDataUrl(null);
  };

  const closeQrDialog = () => {
    setLoginChannelId(null);
    setQrDataUrl(null);
    setPolling(false);
  };

  if (initialLoading) {
    return (
      <div className="tw-flex tw-justify-center tw-items-center tw-h-64">
        <CircularProgress />
      </div>
    );
  }

  return (
    <div>
      {error && <Alert severity="error" className="tw-mb-4">{error}</Alert>}
      <div className="tw-flex tw-justify-end tw-mb-4">
        <Button
          variant="contained"
          color="primary"
          startIcon={<Iconify icon="mdi:plus" />}
          onClick={() => setOpenAddDialog(true)}
        >
          Add Channel
        </Button>
      </div>

      <ChannelTable
        channels={channels}
        loginChannelId={loginChannelId}
        polling={polling}
        onLogin={handleStartLogin}
        onLogout={handleLogout}
        onDelete={handleDelete}
      />

      <AddChannelDialog
        open={openAddDialog}
        onClose={() => setOpenAddDialog(false)}
        onAdd={handleAdd}
      />

      <QrLoginDialog
        loginChannelId={loginChannelId}
        qrDataUrl={qrDataUrl}
        polling={polling}
        onClose={closeQrDialog}
      />
    </div>
  );
}
