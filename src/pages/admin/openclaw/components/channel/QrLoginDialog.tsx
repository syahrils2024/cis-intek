import React from 'react';

import {
  Stack,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from '@mui/material';

import QRCodeDisplay from '../QRCodeDisplay';

import type { QrLoginDialogProps } from '../../openclaw.types';

export default function QrLoginDialog({ loginChannelId, qrDataUrl, polling, onClose }: QrLoginDialogProps) {
  return (
    <Dialog open={!!loginChannelId} onClose={onClose}>
      <DialogTitle>Scan QR Code</DialogTitle>
      <DialogContent>
        <Stack className="tw-flex tw-flex-col tw-items-center tw-justify-center">
          {qrDataUrl ? (
            <QRCodeDisplay qrDataUrl={qrDataUrl} />
          ) : (
            <CircularProgress className="tw-mx-auto" />
          )}
          <div className="tw-mt-2 tw-text-sm tw-text-gray-600">
            {polling ? 'Waiting for scan...' : 'Generating QR...'}
          </div>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
