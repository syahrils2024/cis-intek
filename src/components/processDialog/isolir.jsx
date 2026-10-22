import { toast } from 'sonner';
import { Iconify } from '@components/iconify';
import { useBoolean } from '@hooks/use-boolean';
import { useConfirm } from 'material-ui-confirm';
import React, { useRef, useMemo, useState, forwardRef, useImperativeHandle } from 'react';

import { LoadingButton } from '@mui/lab';
import Grid from '@mui/material/Unstable_Grid2';
import {
  Chip,
  Alert,
  Stack,
  Dialog,
  Button,
  useTheme,
  DialogTitle,
  DialogContent,
  useMediaQuery,
  DialogActions,
} from '@mui/material';

import {
  customerRepository,
  mikrotikRepository,
  jobQueueRespository,
  subscriptionRepository,
} from 'src/repositories';

/**
 * @typedef {'pending' | 'error' | 'success'} ActionStatus
 * @typedef {import('@/repositories/customer').Customer} Customer
 */
const ProcessDialogIsolir = forwardRef((props, ref) => {
  const theme = useTheme();
  const confirm = useConfirm();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  /** @type {[ActionStatus, (v: ActionStatus) => void]} */
  const [statusMikrotik, setStatusMikrotik] = useState('pending');
  /** @type {[ActionStatus, (v: ActionStatus) => void]} */
  const [isolirStatus, setIsolirStatus] = useState('pending');
  /** @type {[Customer, void]} */
  const [customer, setCustomer] = useState(null);
  const show = useBoolean(false);
  const isLoading = useBoolean(false);
  const queueAlive = useBoolean(false);
  const isErrorAndWillRunQueue = useBoolean(false);
  const [stepActive, setStepActive] = useState(-1);
  const resolver = useRef();
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const disableSubmit = useBoolean(false);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 16));

  const steps = useMemo(() => [
    {
      label: 'Check Mikrotik Server',
      value: statusMikrotik,
    },
    {
      label: 'Progress Isolir',
      value: isolirStatus,
    },
  ]);

  async function checkQueueAlive(customerId) {
    try {
      const isAlive = await jobQueueRespository.isQueueAlive(customerId);
      if (isAlive) {
        queueAlive.onTrue();
      } else {
        queueAlive.onFalse();
      }
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
    }
  }

  async function checkClearQueue() {
    if (!queueAlive.value) return;
    await confirm({
      title: 'Lanjutkan Isolir',
      content: 'Apakah anda ingin melanjutkan isolir dengan menghapus job queue yang masih aktif?',
      cancellationText: 'Batal',
      cancellationButtonProps: { color: 'error', variant: 'text' },
      confirmationText: 'Lanjutkan',
      confirmationButtonProps: { color: 'primary', variant: 'contained' },
    });
    await jobQueueRespository.cancelAll(customer._id);
  }

  async function isolir() {
    try {
      // console.log(isCheckPelunasan ? tanggalPelunasan : null);
      // await subscriptionRepository.isolateNetwork(customer._id, isCheckPelunasan ? tanggalPelunasan : null);
      await subscriptionRepository.isolateNetwork(customer._id);
      // toast.success('Berhasil isolir pelanggan');
      setIsolirStatus('success');
      setSuccessMessage('Berhasil melakukan isolir pelanggan');
    } catch (error) {
      console.error(error);
      setErrorMessage(
        'Gagal melakukan Isolir, isolir akan dijadwalkan secara otomatis setelah server kembali online'
      );
      setIsolirStatus('error');
    }
  }

  async function beforeIsolir() {
    setSuccessMessage(null);
    setErrorMessage(null);
    isLoading.onTrue();
    try {
      await checkQueueAlive(customer._id);
      await checkClearQueue();
      setStepActive(0);

      const mikrotikActive = await mikrotikRepository
        .mikrotikIsOnline(customer._id)
        .catch(() => false);
      if (mikrotikActive) {
        setStatusMikrotik('success');
      } else {
        setStatusMikrotik('error');
      }

      setStepActive(1);
      await isolir();

      const snapshotCustomer = await customerRepository.getCustomer(customer._id);
      setCustomer(snapshotCustomer);
    } catch (error) {
      console.error(error);
      if (error instanceof Error) setErrorMessage(error.message);
    } finally {
      isLoading.onFalse();
      disableSubmit.onTrue();
    }
  }

  async function open(customerId) {
    disableSubmit.onFalse();
    setStatusMikrotik('pending');
    setIsolirStatus('pending');
    setCustomer(null);
    setSuccessMessage(null);
    setErrorMessage(null);
    setStepActive(-1);
    isLoading.onTrue();
    show.onTrue();
    try {
      // Todo Fetch customer
      await checkQueueAlive(customerId);
      const snapshotCustomer = await customerRepository.getCustomer(customerId);
      setCustomer(snapshotCustomer);
    } catch (error) {
      toast.error(error.message);
    } finally {
      isLoading.onFalse();
    }

    return new Promise((resolve) => {
      resolver.current = resolve;
    });
  }

  function close() {
    show.onFalse();
    setStatusMikrotik('pending');
    setIsolirStatus('pending');
    setCustomer(null);
    resolver.current();
  }

  useImperativeHandle(ref, () => ({ open }));

  return (
    <Dialog open={show.value} fullWidth maxWidth="sm" fullScreen={isMobile} onClose={() => close()}>
      <DialogTitle>Isolir Pelanggan</DialogTitle>
      <DialogContent>
        <Grid container rowSpacing={2}>
          <Grid xs={6}>
            <div className="tw-flex tw-flex-col">
              <span className="tw-text-xs tw-text-gray-500">ID</span>
              <span className="tw-text-xs tw-font-semibold">{customer?.customerId ?? '-'}</span>
            </div>
          </Grid>
          <Grid xs={6}>
            <div className="tw-flex tw-flex-col">
              <span className="tw-text-xs tw-text-gray-500">Pelanggan</span>
              <span className="tw-text-xs tw-font-semibold">{customer?.fullname ?? '-'}</span>
            </div>
          </Grid>
          <Grid xs={6}>
            <div className="tw-flex tw-flex-col tw-gap-1">
              <span className="tw-text-xs tw-text-gray-500">Status</span>
              <Chip
                label={customer?.isolated ? 'Isolir' : 'Open'}
                color={customer?.isolated ? 'error' : 'success'}
                variant="soft"
                size="small"
                className="tw-w-min"
              />
            </div>
          </Grid>
          <Grid xs={6}>
            <div className="tw-flex tw-flex-col">
              <span className="tw-text-xs tw-text-gray-500">Whatsapp</span>
              <span className="tw-text-xs tw-font-semibold">{customer?.phone ?? '-'}</span>
            </div>
          </Grid>
          <Grid xs={6}>
            <div className="tw-flex tw-flex-col">
              <span className="tw-text-xs tw-text-gray-500">POP / Area</span>
              <span className="tw-text-xs tw-font-semibold">{customer?.areaName ?? '-'}</span>
            </div>
          </Grid>
          <Grid xs={6}>
            <div className="tw-flex tw-flex-col">
              <span className="tw-text-xs tw-text-gray-500">ODP</span>
              <span className="tw-text-xs tw-font-semibold">{customer?.ODPName ?? '-'}</span>
            </div>
          </Grid>
          <Grid xs={12}>
            <div className="tw-flex tw-flex-col">
              <span className="tw-text-xs tw-text-gray-500">Address</span>
              <span className="tw-text-xs tw-font-semibold">{customer?.address ?? '-'}</span>
            </div>
          </Grid>
          {/* <Grid xs={12} className="tw-space-y-2">
            <FormControlLabel
              control={
                <Checkbox
                  onChange={(e) => {
                    setCheckPelunasan(!isCheckPelunasan);
                  }}
                />
              }
              label={<span className="tw-text-xs">Penjadwalan Isolir (Akan diisolir apabila melewati tanggal pelunasan)</span>}
            />
            {isCheckPelunasan &&
              <MobileDateTimePicker
                onChange={(e) => setTanggalPelunasan(e)}
                name="delayUntil"
                label="Tanggal Pelunasan"
                slotProps={{ textField: { fullWidth: true, size: 'small' } }}
                className="tw-bg-white"
              />
            }
          </Grid> */}
          {/* <Grid xs={12}>
            <div className="tw-flex tw-flex-row">
              <TextField
                label="Auto Schedule Billing"
                size="small"
                fullWidth
                value={date}
                onChange={(e) => setDate(e.target.value)}
                type='datetime-local'
                // defaultValue={m.date}
                // onChange={(e) => setDateSchedule(i, e.target.value)}
              />
            </div>
          </Grid> */}
          <Grid xs={12}>
            <Stack spacing={2}>
              {steps.map((s, i) => (
                <div
                  key={i}
                  className={`tw-flex tw-flex-row tw-items-center tw-gap-2 ${s.value === 'pending'
                    ? 'tw-text-orange-600'
                    : s.value === 'error'
                      ? 'tw-text-error'
                      : 'tw-text-green-600'
                    }`}
                >
                  <Iconify
                    icon={
                      s.value === 'pending'
                        ? 'material-symbols:timer-outline'
                        : s.value === 'error'
                          ? 'material-symbols:error-rounded'
                          : 'ep:success-filled'
                    }
                  />
                  <span className="tw-text-xs">
                    {s.label}{' '}
                    {s.value === 'error' ? ': Gagal' : s.value === 'success' ? ': Berhasil' : ''}
                  </span>
                </div>
              ))}
            </Stack>
          </Grid>
          {queueAlive.value && (
            <Grid xs={12}>
              <Alert severity="warning">Terdapat Job Queue yang masih aktif</Alert>
            </Grid>
          )}
          {errorMessage && (
            <Grid xs={12}>
              <Alert severity="warning">{errorMessage}</Alert>
            </Grid>
          )}
          {successMessage && (
            <Grid xs={12}>
              <Alert severity="success">{successMessage}</Alert>
            </Grid>
          )}
        </Grid>
      </DialogContent>
      <DialogActions>
        {!isLoading.value && (
          <Button onClick={() => close()} color="error" variant="text">
            Tutup
          </Button>
        )}
        <LoadingButton
          loading={isLoading.value}
          color="primary"
          variant="contained"
          onClick={() => beforeIsolir()}
          disabled={disableSubmit.value}
        >
          Isolir
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
});

export default ProcessDialogIsolir;
