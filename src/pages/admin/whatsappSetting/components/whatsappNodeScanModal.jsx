/* eslint-disable consistent-return */
import { useState, useEffect } from 'react';
import Overloading from '@components/overloading';

import { Stack, Button, Dialog, DialogTitle, DialogActions, DialogContent } from '@mui/material';

import { useSocketStore } from 'src/stores/socketStore';

export default function WhatsappNodeScanModal({ show, onClose, selectedItem, onSuccess }) {
  const [qrCode, setQrCode] = useState(null);
  const socket = useSocketStore();
  const eventEmit = 'whatsapp.scan.qr';
  const eventListen = 'whatsapp.listen.qr';

  useEffect(() => {
    if (show) socket.connect();
    return socket.disconnect;
  }, [show]);

  useEffect(() => {
    if (socket.client) {
      socket.client.emit(eventEmit, { _id: selectedItem._id });
      socket.client.once(eventListen, (data) => {
        console.log('QR Code:', data.qr);
        setQrCode(data.qr);
      });
    }
  }, [socket.isConnected]);

  return (
    <Dialog
      open={show}
      onClose={onClose}
      fullWidth
      className="tw-w-[400px] tw-justify-self-center"
      scroll="paper"
    >
      <DialogTitle>Scan QR</DialogTitle>
      <DialogContent>
        <Stack spacing={2} className="tw-py-1 tw-relative tw-flex tw-items-center tw-text-center">
          <Overloading loading={qrCode == null} />
          <div className="tw-w-[200px]">
            <img
              className="tw-w-[200px] tw-inline-flex"
              src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrCode)}`}
              alt="QR Code"
            />
          </div>
        </Stack>
      </DialogContent>
      <DialogActions>
      <Button color="success" onClick={onSuccess}>
          Selesai Scan
        </Button>
        <Button color="error" onClick={onClose}>
          Tutup
        </Button>
      </DialogActions>
    </Dialog>
  );
}
