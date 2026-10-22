import { Iconify } from '@components/iconify';
import { forwardRef, useImperativeHandle } from 'react';
import AreaPickerFilter from '@components/billing/areaPickerFilter';

import { LoadingButton } from '@mui/lab';
import {
  Stack,
  Button,
  Dialog,
  TextField,
  DialogTitle,
  DialogActions,
  DialogContent,
} from '@mui/material';

import { useDuitkuSecretFormDialogState } from './formDialog.state';

const DuitkuFormDialog = forwardRef((props, ref) => {
  const {
    addArea,
    area,
    merchantCode,
    removeArea,
    secretKey,
    secretName,
    open,
    reset,
    show,
    loading,
    mobile,
    close,
    setSecretName,
    setMerchantCode,
    areaPickerRef,
    setSecretKey,
    submit,
  } = useDuitkuSecretFormDialogState();

  useImperativeHandle(ref, () => ({
    open,
    reset,
  }));

  return (
    <Dialog open={show.value} maxWidth="sm" fullWidth fullScreen={mobile}>
      <DialogTitle>Secret Form</DialogTitle>
      <DialogContent>
        <Stack spacing={2} className="tw-py-2">
          <TextField
            label="Secret Name"
            value={secretName}
            onChange={(e) => setSecretName(e.target.value)}
            size="small"
          />
          <TextField
            label="Merchant Code"
            value={merchantCode}
            onChange={(e) => setMerchantCode(e.target.value)}
            size="small"
          />
          <TextField
            label="API Key"
            value={secretKey}
            onChange={(e) => setSecretKey(e.target.value)}
            size="small"
          />
          <div className="tw-flex tw-flex-col tw-p-4 tw-ring-1 tw-ring-gray-400 tw-rounded-md tw-gap-4">
            <div className="tw-flex tw-flex-col tw-gap-2">
              {area.map((a, i) => (
                <div
                  key={i}
                  className="tw-w-full tw-ring-1 tw-flex tw-flex-row tw-p-2 tw-rounded-md tw-items-center tw-justify-between tw-pl-4"
                >
                  <span className="tw-flex-1 tw-text-xs">{a.title}</span>
                  <Button color="error" variant="text" onClick={() => removeArea(i)}>
                    <Iconify icon="eva:close-fill" />
                  </Button>
                </div>
              ))}
            </div>
            <div className="tw-flex tw-flex-row tw-items-center tw-justify-end tw-gap-2">
              <Button variant="soft" onClick={() => addArea()} color="primary">
                <Iconify icon="eva:plus-fill" /> Tambah Area
              </Button>
            </div>
          </div>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button variant="text" color="error" onClick={() => close()}>
          Tutup
        </Button>
        <LoadingButton
          loading={loading.value}
          variant="contained"
          color="primary"
          onClick={() => submit()}
        >
          Simpan
        </LoadingButton>
      </DialogActions>
      <AreaPickerFilter ref={areaPickerRef} />
    </Dialog>
  );
});

export default DuitkuFormDialog;
