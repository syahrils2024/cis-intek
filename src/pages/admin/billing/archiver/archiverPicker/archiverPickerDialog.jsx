import dayjs from 'dayjs';
import { forwardRef, useImperativeHandle } from 'react';
import AreaPickerFilter from '@components/billing/areaPickerFilter';

import { LoadingButton } from '@mui/lab';
import { DatePicker } from '@mui/x-date-pickers';
import {
  Stack,
  Button,
  Dialog,
  TextField,
  DialogTitle,
  DialogActions,
  DialogContent,
} from '@mui/material';

import { useArchiverPickerDialogState } from './archiverPickerDialog.state';

const ArchivePickerDialog = forwardRef((props, ref) => {
  const {
    areaName,
    close,
    date,
    loading,
    open,
    show,
    setDate,
    submit,
    mobile,
    pickArea,
    areaPickerRef,
  } = useArchiverPickerDialogState();

  useImperativeHandle(ref, () => ({ open }));

  return (
    <Dialog open={show.value} fullScreen={mobile} fullWidth maxWidth="sm">
      <DialogTitle>Create Archive</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ paddingY: 2 }}>
          <DatePicker
            value={dayjs(date)}
            views={['year', 'month']}
            onChange={(value) => setDate(value.toDate())}
            slotProps={{ textField: { size: 'small' } }}
            label="Pilih Periode"
          />
          <TextField
            value={areaName}
            size="small"
            onClick={() => pickArea()}
            InputProps={{ readOnly: true }}
            label="Area"
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => close(null)} variant="text" color="error">
          Batal
        </Button>
        <LoadingButton
          onClick={() => submit()}
          color="success"
          variant="contained"
          loading={loading.value}
        >
          Submit
        </LoadingButton>
      </DialogActions>
      <AreaPickerFilter ref={areaPickerRef} />
    </Dialog>
  );
});

export default ArchivePickerDialog;
