import dayjs from 'dayjs';
import { toast } from 'sonner';
import { addDays } from 'date-fns';
import { Iconify } from '@components/iconify';
import { useBoolean } from '@hooks/use-boolean';
import { useConfirm } from 'material-ui-confirm';
import BillingPicker from '@components/billing/BillingPicker';
import { useRef, useMemo, useState, forwardRef, useImperativeHandle } from 'react';

import { LoadingButton } from '@mui/lab';
import Grid from '@mui/material/Unstable_Grid2';
import { DatePicker, MobileDateTimePicker } from '@mui/x-date-pickers';
import {
  Chip,
  Alert,
  Stack,
  Button,
  Dialog,
  Tooltip,
  Checkbox,
  MenuItem,
  useTheme,
  TextField,
  IconButton,
  DialogTitle,
  DialogActions,
  DialogContent,
  useMediaQuery,
  FormControlLabel,
} from '@mui/material';

import {
  customerRepository,
  mikrotikRepository,
  jobQueueRespository,
  subscriptionRepository,
} from 'src/repositories';

/**
 * @typedef {import('src/repositories/subscription').Billing} Billing
 * @typedef {'pending' | 'error' | 'success'} ActionStatus
 * @typedef {import('@/repositories/customer').Customer} Customer
 */
const ProcessDialogRemoveIsolir = forwardRef((props, ref) => {
  const theme = useTheme();
  const confirm = useConfirm();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  /** @type {[ActionStatus, (v: ActionStatus) => void]} */
  const [statusMikrotik, setStatusMikrotik] = useState('pending');
  /** @type {[ActionStatus, (v: ActionStatus) => void]} */
  const [removeIsolirStatus, setRemoveIsolir] = useState('pending');
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
  const [isCheckPelunasan, setCheckPelunasan] = useState(false);
  const [tanggalPelunasan, setTanggalPelunasan] = useState(addDays(new Date(), 1)); // Default to tomorrow
  const [billingDate, setBillingDate] = useState(new Date());
  const [delayUntilNote, setDelayUntilNote] = useState(null);

  /** @type {['byDate' | 'byBilling', (category: 'byDate' | 'byBilling') => void]} */
  const [selectedScheduleIsolate, setSelectedScheduleIsolate] = useState('byBilling');

  /** @type {[Billing[], void]} */
  const [selectedBilling, setSelectedBilling] = useState([]);

  const billingPickerRef = useRef();

  const steps = useMemo(() => [
    {
      label: 'Check Mikrotik Server',
      value: statusMikrotik,
    },
    {
      label: 'Progress Buka Isolir',
      value: removeIsolirStatus,
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
      title: 'Lanjutkan Buka Isolir',
      content:
        'Apakah anda ingin melanjutkan buka isolir dengan membuka job queue yang masih aktif?',
      cancellationText: 'Batal',
      cancellationButtonProps: { color: 'error', variant: 'text' },
      confirmationText: 'Lanjutkan',
      confirmationButtonProps: { color: 'primary', variant: 'contained' },
    });
    await jobQueueRespository.cancelAll(customer._id);
  }

  async function removeIsolir() {
    try {
      await subscriptionRepository.unisolateNetwork(customer._id, { scheduled: isCheckPelunasan });
      if (isCheckPelunasan) {
        const billingPeriodeMonth = billingDate.getMonth() + 1;
        const billingPeriodeYear = billingDate.getFullYear();
        await subscriptionRepository.isolateNetwork(customer._id, {
          delayUntil: tanggalPelunasan,
          billingMonth: selectedScheduleIsolate === 'byDate' ? billingPeriodeMonth : null,
          billingYear: selectedScheduleIsolate === 'byDate' ? billingPeriodeYear : null,
          billingIds:
            selectedScheduleIsolate === 'byBilling' ? selectedBilling.map((b) => b._id) : null,
          delayUntilNote,
        });
      }

      // toast.success('Berhasil buka isolir');
      setSuccessMessage('Berhasil melakukan buka isolir pelanggan');
      setRemoveIsolir('success');
    } catch (error) {
      setErrorMessage(
        'Gagal melakukan buka Isolir, buka isolir akan dijadwalkan secara otomatis setelah server kembali online'
      );
      setRemoveIsolir('error');
    }
  }

  async function beforeIsolir() {
    if (isCheckPelunasan && !tanggalPelunasan) {
      toast.error('Janji Tanggal pelunasan harus diisi');
      return;
    }

    if (
      isCheckPelunasan &&
      selectedBilling.length <= 0 &&
      selectedScheduleIsolate === 'byBilling'
    ) {
      toast.error('Pilih minimal satu billing untuk pengecekan pelunasan');
      return;
    }

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
      await removeIsolir();

      const snapshotCustomer = await customerRepository.getCustomer(customer._id);
      setCustomer(snapshotCustomer);
    } catch (error) {
      if (error instanceof Error) setErrorMessage(error.message);
    } finally {
      isLoading.onFalse();
      disableSubmit.onTrue();
    }
  }

  async function open(customerId) {
    disableSubmit.onFalse();
    setCustomer(null);
    setDelayUntilNote(null);
    setSuccessMessage(null);
    setErrorMessage(null);
    setStatusMikrotik('pending');
    setRemoveIsolir('pending');
    setCustomer(null);
    setStepActive(-1);
    setSelectedBilling([]);
    setCheckPelunasan(false);
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

  async function pickBilling() {
    const currentBilling = selectedBilling.map((b) => b.billingId);
    const selected = await billingPickerRef.current.open(customer._id, currentBilling);
    if (!selected) return;
    setSelectedBilling(selected);
  }

  function close() {
    show.onFalse();
    setStatusMikrotik('pending');
    setRemoveIsolir('pending');
    resolver.current();
  }

  function removeBilling(index) {
    setSelectedBilling((prev) => {
      const newBilling = [...prev];
      newBilling.splice(index, 1);
      return newBilling;
    });
  }

  useImperativeHandle(ref, () => ({ open }));

  return (
    <>
      <Dialog
        open={show.value}
        fullWidth
        maxWidth="sm"
        fullScreen={isMobile}
        onClose={() => close()}
      >
        <DialogTitle>Buka Isolir Pelanggan</DialogTitle>
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
            <Grid xs={12} className="tw-space-y-2">
              <FormControlLabel
                control={
                  <Checkbox
                    checked={isCheckPelunasan}
                    onChange={(e) => {
                      setCheckPelunasan(!isCheckPelunasan);
                    }}
                  />
                }
                label={
                  <span className="tw-text-xs">
                    Penjadwalan Ulang Isolir (Akan diisolir apabila tagihan belum lunas dan melewati
                    waktu di bawah ini)
                  </span>
                }
              />

              <Stack spacing={2} className="tw-pt-4 tw-w-full">
                {/* Pick By Date or By Billing */}
                {isCheckPelunasan ? (
                  <TextField
                    label="Kategori Pengecekan"
                    value={selectedScheduleIsolate}
                    fullWidth
                    size="small"
                    select
                    onChange={(e) => setSelectedScheduleIsolate(e.target.value)}
                  >
                    {/* <MenuItem value="byDate">Periode</MenuItem> */}
                    <MenuItem value="byBilling">Billing</MenuItem>
                  </TextField>
                ) : null}
                {/* End By Date */}

                {/* Billings */}
                {isCheckPelunasan && selectedScheduleIsolate === 'byBilling' ? (
                  <div className="tw-rounded tw-ring-1 tw-ring-gray-400 tw-p-3 tw-w-full tw-flex tw-flex-col tw-gap-4">
                    {selectedBilling.map((item, index) => (
                      <Stack
                        key={item.billingId}
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                        className={`tw-p-3 tw-rounded-lg tw-cursor-pointer tw-ring-1 ${
                          ['unpaid', 'partially_paid'].includes(item.status) ? '' : 'tw-bg-gray-200'
                        }`}
                      >
                        <Stack
                          direction="row"
                          justifyItems="center"
                          alignItems="center"
                          spacing={0.4}
                        >
                          <Stack>
                            <span className="tw-text-xs">{item.services.join(', ')}</span>
                            <span className="tw-text-xs">{item.summaryPeriode}</span>
                          </Stack>
                        </Stack>
                        <Stack
                          direction="row"
                          justifyItems="center"
                          alignItems="center"
                          spacing={1}
                        >
                          <Stack
                            spacing={0.5}
                            justifyItems="end"
                            justifyContent="end"
                            alignItems="end"
                          >
                            <span className="tw-text-xs">{getChipStatus(item.status)}</span>
                            <span className="tw-text-xs">
                              Rp. {item.amount?.toString().toNumber().formatCurrency()}
                            </span>
                          </Stack>
                          <Tooltip title="Hapus">
                            <IconButton
                              color="error"
                              size="small"
                              onClick={() => removeBilling(index)}
                            >
                              <Iconify icon="mdi:delete" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </Stack>
                    ))}
                    <div className="tw-flex tw-flex-row tw-items-center tw-justify-end tw-w-full">
                      <Button
                        variant="soft"
                        color="success"
                        size="small"
                        onClick={() => pickBilling()}
                      >
                        Pilih Billing
                      </Button>
                    </div>
                  </div>
                ) : null}
                {/* End Billings */}

                {/* By Date */}
                {isCheckPelunasan && selectedScheduleIsolate === 'byDate' ? (
                  <DatePicker
                    value={dayjs(billingDate)}
                    label="Periode Billing yang dicek"
                    views={['year', 'month']}
                    slotProps={{ textField: { fullWidth: true, size: 'small' } }}
                    onChange={(value) => {
                      setBillingDate(value.toDate());
                    }}
                  />
                ) : null}
                {/* End By Date */}

                {/* Promise Date */}
                {isCheckPelunasan ? (
                  <>
                    <MobileDateTimePicker
                      onChange={(e) => setTanggalPelunasan(e)}
                      name="delayUntil"
                      label="Janji Tanggal Pelunasan"
                      slotProps={{ textField: { fullWidth: true, size: 'small' } }}
                      className="tw-bg-white"
                      value={dayjs(tanggalPelunasan)}
                    />
                    <TextField
                      value={delayUntilNote}
                      onChange={(e) => setDelayUntilNote(e.target.value)}
                      label="Catatan"
                      rows={3}
                      multiline
                      size="small"
                    />
                  </>
                ) : null}
                {/* End Promise Date */}
              </Stack>
            </Grid>
            <Grid xs={12}>
              <Stack spacing={2}>
                {steps.map((s, i) => (
                  <div
                    key={i}
                    className={`tw-flex tw-flex-row tw-items-center tw-gap-2 ${
                      s.value === 'pending'
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
            Buka Isolir
          </LoadingButton>
        </DialogActions>
      </Dialog>
      <BillingPicker ref={billingPickerRef} />
    </>
  );
});

/**
 * @param {string} status
 * @returns
 */
function getChipStatus(status) {
  // Switch case color
  const chipColor =
    {
      unpaid: 'warning',
      paid: 'success',
      canceled: 'error',
      partially_paid: 'warning',
    }[status] ?? 'warning';

  return <Chip color={chipColor} variant="soft" size="small" label={status} />;
}

export default ProcessDialogRemoveIsolir;
