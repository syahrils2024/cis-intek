import { forwardRef, useImperativeHandle } from 'react';

import { LoadingButton } from '@mui/lab';
import {
  Dialog,
  Button,
  TextField,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';

import { useGroupFormDialogState } from './groupFormDialog.state';

const NetworkMonitoringGroupFormDialog = forwardRef((props, ref) => {
  const { handlers, state } = useGroupFormDialogState();

  useImperativeHandle(ref, () => ({
    open: (group) => handlers.openDialog(group),
  }));

  return (
    <Dialog open={state.open.value} onClose={() => handlers.close()} maxWidth="xs" fullWidth>
      <DialogTitle>{state.currentData ? 'Edit Group' : 'Tambah Group'}</DialogTitle>
      <DialogContent>
        <div className="tw-flex tw-flex-col tw-py-2">
          <TextField
            autoFocus
            fullWidth
            size="small"
            label="Nama Group"
            value={state.name}
            onChange={(e) => handlers.setName(e.target.value)}
            className="tw-mt-2"
          />
        </div>
      </DialogContent>
      <DialogActions>
        <Button variant="text" color="error" onClick={() => handlers.close()}>
          Tutup
        </Button>
        <LoadingButton
          variant="soft"
          color="primary"
          loading={state.loading.value}
          onClick={() => handlers.submit()}
        >
          Simpan
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
});

export default NetworkMonitoringGroupFormDialog;
