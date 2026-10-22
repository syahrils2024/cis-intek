import { Iconify } from '@components/iconify';
import Overloading from '@components/overloading';
import { useRef, forwardRef, useImperativeHandle } from 'react';

import Grid2 from '@mui/material/Unstable_Grid2';
import {
  Stack,
  Alert,
  Dialog,
  Button,
  Select,
  useTheme,
  Checkbox,
  MenuItem,
  TextField,
  DialogTitle,
  useMediaQuery,
  DialogContent,
  DialogActions,
  OutlinedInput,
  FormHelperText,
  FormControlLabel,
} from '@mui/material';

/** @typedef {import('src/stores/meStore').MeStore} MeStore */

import { LoadingButton } from '@mui/lab';

import { useMeStore } from 'src/stores/meStore';

import { useCustomerDeactivateDialogState } from './DeactivateDialog.state';

const CustomerDeactivateDialog = forwardRef((props, ref) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  /** @type {MeStore} */
  const { me } = useMeStore();

  const {
    prefetch,
    showDialog,
    loading,
    clear,
    customerInformations,
    allowSubmit,
    checkedUser,
    steps,
    loadingSubmit,
    deactivateError,
    mikrotikError,
    submit,
    engineers,
    selectedEngineers,
    setSelectedEngineers,
    option,
    setOption,
    isDeliverOffice,
    setIsDeliverOffice,
    withoutEngineer,
    description,
    setDescription,
  } = useCustomerDeactivateDialogState();

  const resolver = useRef();

  function open(customerId) {
    showDialog.onTrue();
    prefetch(customerId);

    return new Promise((resolve) => {
      resolver.current = resolve;
    });
  }

  function close() {
    showDialog.onFalse();
    clear();
    resolver.current();
  }

  useImperativeHandle(ref, () => ({ open, close }));

  return (
    <Dialog open={showDialog.value} fullWidth maxWidth="sm" fullScreen={isMobile}>
      <DialogTitle>Nonaktifkan Pelanggan</DialogTitle>
      <DialogContent>
        <Stack className="tw-py-2 tw-relative" spacing={2}>
          <Overloading loading={loading.value} />
          <Grid2 container gap={1}>
            {customerInformations.map((info, index) => (
              <Grid2 xs={5.5} key={index}>
                <Stack spacing={0.2}>
                  <span className="tw-text-xs tw-text-gray-500">{info.title}</span>
                  <span className="tw-text-xs tw-font-semibold">{info.value}</span>
                </Stack>
              </Grid2>
            ))}
          </Grid2>
          <Stack spacing={0.5}>
            <span className="tw-text-xs">Opsi Dismantle Perangkat ONU/ONT/Modem</span>
            <Select
              value={option}
              input={<OutlinedInput size="small" />}
              onChange={(e) => {
                setIsDeliverOffice(e.target.value === 'true');
                setOption(e.target.value);
              }}
            >
              <MenuItem value="false">Penjemputan ke Rumah - Open Ticket</MenuItem>
              <MenuItem value="true">Diantar ke Kantor - Ticket Finish</MenuItem>
              <MenuItem value="DISMAINTENANCE_NO_TICKET">
                Sudah Diambil ke Rumah - Tanpa Ticket
              </MenuItem>
            </Select>
          </Stack>
          {option === 'false' ? (
            <FormControlLabel
              label="Teknisi Belum ditentukan"
              control={
                <Checkbox
                  checked={withoutEngineer.value}
                  onChange={(e) => withoutEngineer.setValue(e.target.checked)}
                />
              }
            />
          ) : null}
          {!isDeliverOffice && option === 'false' && !withoutEngineer.value ? (
            <Stack spacing={0.5}>
              <span className="tw-text-xs">Tim Dismantle / Pencabutan Alat</span>
              <Select
                multiple
                value={selectedEngineers}
                input={<OutlinedInput size="small" />}
                onChange={(e) => {
                  const { value } = e.target;
                  setSelectedEngineers(typeof value === 'string' ? value.split(',') : value);
                }}
              >
                {engineers.map((e, i) => (
                  <MenuItem key={i} value={e._id}>
                    {e.fullname}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>
                Pilih Tim Dismantle / Pencabutan Alat. Ticket akan dibuat otomatis untuk tim yang
                telah ditentukan
              </FormHelperText>
            </Stack>
          ) : null}
          {option !== 'DISMAINTENANCE_NO_TICKET' ? (
            <TextField
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              label="Deskripsi"
              multiline
              minRows={3}
              maxRows={5}
              fullWidth
              size="small"
            />
          ) : null}
          <Stack spacing={2}>
            {steps.map((s, i) => (
              <div
                key={i}
                className={`tw-flex tw-flex-row tw-items-center tw-gap-2 ${s.className}`}
              >
                <Iconify icon={s.iconName} />
                <span className="tw-text-xs">
                  {s.label} {s.labelStatus}
                </span>
              </div>
            ))}
          </Stack>
          {deactivateError && (
            <Alert severity="warning">
              <span className="tw-text-xs">{deactivateError}</span>
            </Alert>
          )}
          {mikrotikError && (
            <Alert severity="warning">
              <span className="tw-text-xs">{mikrotikError}</span>
            </Alert>
          )}
          <FormControlLabel
            label={`${me?.fullname} menyetujui untuk menonaktifkan pelanggan ini`}
            control={
              <Checkbox
                checked={checkedUser.value}
                onChange={(e) => checkedUser.setValue(e.target.checked)}
              />
            }
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button color="error" variant="text" onClick={() => close()}>
          Tutup
        </Button>
        <LoadingButton
          loading={loadingSubmit.value}
          disabled={!allowSubmit.value || !checkedUser.value}
          onClick={() => submit(isDeliverOffice)}
          color="primary"
          variant="contained"
        >
          Nonaktfikan
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
});

export default CustomerDeactivateDialog;
