/**
 * @typedef {import("src/repositories/subscription").Subscription} Subscription
 * @typedef {import('src/repositories/subscription').Billing} Billing
 * @typedef {import('src/repositories/customer').CustomerDetail} CustomerDetail
 * @typedef {import('src/stores/paymentMethodStore').PaymentMethodStore} PaymentMethodStore
 * @typedef {import('src/repositories/depositMethod').PaymentMethod} PaymentMethod
 * @typedef {import('src/repositories/subscription').SubmitPaymentRequest} SubmitPaymentRequest
 * @typedef {import('src/repositories/duoDateCharge').DuoDateCharge} DuoDateCharge
 * @typedef {import('src/repositories/auth').CurrentAuth} CurrentAuth
 * @typedef {import('src/stores/meStore').MeStore} MeStore
 * @typedef {import('src/repositories/area').Area} Area
 * @typedef {import('src/repositories/geo').ODP} ODP
 * @typedef {import('src/repositories/package').ResultPackageList} ResultPackageList
 */

import { z } from 'zod';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { Iconify } from '@components/iconify';
import { useBoolean } from '@hooks/use-boolean';
import { useConfirm } from 'material-ui-confirm';
import { createSelector } from '@reduxjs/toolkit';
import Overloading from '@components/overloading';
import { Form, Field } from '@components/hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { usePrivilege } from '@auth/hooks/privileges';
import { useDispatch, useSelector } from 'react-redux';
import { useRef, useMemo, useState, useEffect } from 'react';
import { format, addMonths, differenceInDays } from 'date-fns';

import { LoadingButton } from '@mui/lab';
import Grid from '@mui/material/Unstable_Grid2';
import {
  Stack,
  Table,
  Button,
  Dialog,
  Divider,
  useTheme,
  TableRow,
  Checkbox,
  MenuItem,
  TableHead,
  TableCell,
  TableBody,
  Accordion,
  TextField,
  IconButton,
  DialogTitle,
  DialogActions,
  DialogContent,
  useMediaQuery,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';

import 'src/extension/date';
import 'src/extension/string';
import 'src/extension/number';
import { BILL_URL } from 'src/commons/constant';
import { useMeStore } from 'src/stores/meStore';
import { setData } from 'src/stores/duoDateChargeStore';
import { paymentMethodStoreSetStateMulti } from 'src/stores/paymentMethodStore';
import {
  areaRepository,
  customerRepository,
  invoiceTempRepository,
  packagePlanRepository,
  subscriptionRepository,
  depositMethodRepository,
  duoDateChargeRepository,
} from 'src/repositories';

import PartiallyPaidForm from './partiallyPaidForm';
import BillingUpdateForm from './billingUpdateForm';
import BillingGenerateMonthlyDialog from './GenerateMonthlyDialog';

const schemaValidator = z.object({
  paymentMethod: z.string().min(1, 'tidak boleh kosong'),
  depositMethod: z.string().min(1, 'Tidak boleh kosong'),
  paymentDate: z.string().min(1, 'Tidak boleh kosong'),
  proofPayment: z.array(z.instanceof(File)).nullable(),
  note: z.string().nullable().optional(),
});
/**
 * @param {{subscription: Subscription; show: boolean; onClose: void; submitLabel: string}} props -- react props
 */
export function PaymentFormDialog({ subscription, show, onClose, submitLabel = 'Bayar Penuh' }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const confirm = useConfirm();
  const { isAdmin } = usePrivilege();
  const billingUpdateFormRef = useRef();
  const billingMonthlyDialogRef = useRef();
  const prefetchLoading = useBoolean(false);

  /** @type {{current: {open: Promise<{billing: string; amount: number}[]>}}} */
  const partiallyPaidFormRef = useRef();

  const dispatch = useDispatch();
  /**
   * @type {PaymentMethodStore}
   */
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('cash');
  const paymentMethodStore = useSelector((state) => state.paymentMethodStore);
  const availableCash = paymentMethodStore.cash.filter((c) => c.status === 'active');
  const availableTransfer = paymentMethodStore.transfer.filter((t) => t.status === 'active');
  /** @type {PaymentMethod[]} */
  const availableDeposit = selectedPaymentMethod === 'cash' ? availableCash : availableTransfer;

  /** @type {CurrentAuth} */
  const me = useMeStore((state) => state.me);
  const duoDateChargeSelector = createSelector(
    [(state) => state.duoDateChargeStore],
    (duoDateChargeStore) => duoDateChargeStore.data
  );
  /** @type {DuoDateCharge[]} */
  const duoDateList = useSelector(duoDateChargeSelector);
  /**
   * @type [Billing[], void]
   */
  const [billingList, setBillingList] = useState([]);

  /**
   * @type {[CustomerDetail, void]}
   */
  const [customer, setCustomer] = useState(null);

  /**
   * @type {[Area, void]}
   */
  const [area, setArea] = useState(null);

  /**
   * @type {[ODP, void]}
   */
  const [odp, setOdp] = useState(null);

  /**
   * @type {[ResultPackageList, void]}
   */
  const [packagePlan, setPackagePlan] = useState(null);

  const paymentMethodList = ['cash', 'transfer'];
  const allowPay = billingList.filter((b) => b.checked).length >= 1;
  const showDuoDateCharge = useBoolean(false);

  const [thumbnailImage, setThumbnailImage] = useState([]);
  const [images, setImages] = useState([]);

  /** @type {[DuoDateCharge, void]} */
  const [selectedDuoDateId, setSelectedDuoDate] = useState(null);

  const [duoDateChargeName, setDuoDateChargeName] = useState('');
  const currentDuoDate = selectedDuoDateId
    ? duoDateList.find((d) => d._id === selectedDuoDateId)
    : null;
  const loading = useBoolean();
  const total =
    billingList
      ?.filter((b) => b.checked)
      .map((b) => b.amount)
      .reduce((a, b) => a + b, 0) ?? 0;
  const finalTotal = total + (currentDuoDate?.charge ?? 0);

  const defaultValues = {
    paymentMethod: 'cash',
    depositMethod: '',
    paymentDate: '',
    proofPayment: [],
    note: null,
  };

  const methods = useForm({ defaultValues, resolver: zodResolver(schemaValidator) });
  const { handleSubmit, watch } = methods;

  methods.watch((data) => {
    const blobList = data.proofPayment.map((p) => URL.createObjectURL(p));
    setThumbnailImage(blobList);
    setImages(data.proofPayment);
    if (data.paymentMethod !== selectedPaymentMethod) setSelectedPaymentMethod(data.paymentMethod);
  });

  const headers = ['', 'Periode', 'Paket', 'Status', 'Jumlah', 'Action'];

  const billingStoreSelector = createSelector([(state) => state.billingStore], (billingStore) => ({
    month: billingStore.month,
    year: billingStore.year,
  }));

  /** @type {{month: number; year: number}} */
  const { month, year } = useSelector(billingStoreSelector);

  /**
   * @param {Billing} item
   */
  const onCancel = async (item) => {
    try {
      const date = new Date(`${item.year}-${item.month}-1`).formatSummaryDateMonthYear();
      await confirm({
        title: 'Batalkan Billing',
        content: `Apakah anda yakin ingin membatalkan biling pada bulan ${date}`,
        confirmationText: 'Batalkan',
        confirmationButtonProps: { color: 'error' },
        cancellationText: 'Tidak',
      });

      await subscriptionRepository.cancelBilling(item._id);
      await prefetch();
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
    }
  };

  /**
   * @param {Billing} item
   */
  const onRestore = async (item) => {
    try {
      const date = new Date(`${item.year}-${item.month}-1`).formatSummaryDateMonthYear();
      await confirm({
        title: 'Pulihkan Billing',
        content: `Apakah anda yakin ingin memulihkan biling pada bulan ${date}`,
        confirmationText: 'Pulihkan',
        confirmationButtonProps: { color: 'primary' },
        cancellationText: 'Tidak',
      });

      await subscriptionRepository.restoreBilling(item._id);
      await prefetch();
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
    }
  };

  const onSubmit = async (data) => {
    loading.onTrue();
    try {
      const date = data.paymentDate.substring(0, 10);
      const time = data.paymentDate.substring(11, 16);
      const b = billingList.filter((billing) => billing.checked).map((billing) => billing._id);
      /** @type {SubmitPaymentRequest} */
      const request = {
        amount: total,
        billingList: b,
        customer: customer._id,
        date,
        time,
        depositMethod: data.depositMethod,
        paymentEvidence: data.proofPayment,
        paymentMethod: data.paymentMethod,
        duoDateCharge: currentDuoDate?.charge ?? 0,
        note: data.note,
      };

      if (isAdmin) {
        await subscriptionRepository.submitPayment(request);
      } else {
        await invoiceTempRepository.submit(request);
      }
      toast.success('Berhasil mengirim pembayaran');
      onClose(true);
    } catch (error) {
      toast.error(error.message);
    } finally {
      loading.onFalse();
    }
  };

  const prefetch = async () => {
    prefetchLoading.onTrue();
    try {
      const currentPaymentMethod = methods.getValues('paymentMethod');
      if (currentPaymentMethod === 'cash') {
        methods.setValue('depositMethod', me?.defaultData?.cashDepositMethodId ?? '');
      } else if (currentPaymentMethod === 'transfer') {
        methods.setValue('depositMethod', me?.defaultData?.transferDepositMethodId ?? '');
      }

      methods.setValue('paymentDate', format(new Date(), `yyyy-MM-dd'T'HH:mm:ss`));
      showDuoDateCharge.onFalse();
      const now = new Date();
      const snapshotBillling = await subscriptionRepository.getBillingList(subscription._id);
      const snapshotCustomer = await customerRepository.getCustomer(subscription._id);
      const snapshotArea = await areaRepository
        .getAreaDetail(snapshotCustomer.area)
        .catch(() => null);
      const snapshotOdp = await areaRepository.getODPData(snapshotCustomer.ODP).catch(() => null);
      const snapshotPackage = await packagePlanRepository
        .getSomePackage(snapshotCustomer.activePackage.package)
        .catch(() => null);
      setCustomer(snapshotCustomer);
      setOdp(snapshotOdp);
      setArea(snapshotArea);
      setPackagePlan(snapshotPackage);
      const addPropertyCheckedBilling = snapshotBillling.billings.map((b) => {
        if (b.status !== 'canceled') b.checked = true;
        b.editable = false;
        return b;
      });

      if (addPropertyCheckedBilling.length >= 1 && addPropertyCheckedBilling[0].duoDate) {
        /** @type {Billing} */
        const b = addPropertyCheckedBilling[0];
        const range = differenceInDays(now, new Date(b.duoDate));
        if (range >= 1) {
          setDuoDateChargeName(`Denda`);
          showDuoDateCharge.onTrue();
        }
      }

      setBillingList(addPropertyCheckedBilling);

      if (paymentMethodStore.cash.length <= 0 || paymentMethodStore.transfer.length <= 0) {
        const snapshotCash = await depositMethodRepository.getPaymentMethod('cash');
        const snapshotTransfer = await depositMethodRepository.getPaymentMethod('transfer');
        dispatch(
          paymentMethodStoreSetStateMulti([
            { key: 'cash', value: snapshotCash },
            { key: 'transfer', value: snapshotTransfer },
          ])
        );
      }

      if (duoDateList.length <= 0) {
        const snapshotDuoDate = await duoDateChargeRepository.findAll();
        dispatch(setData(snapshotDuoDate));
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    } finally {
      prefetchLoading.onFalse();
    }
  };

  /**
   * @param {number} index
   */
  const toggleChecked = (index) => {
    const items = [...billingList];
    items[index].checked = !items[index].checked;
    setBillingList(items);
  };

  const handleRemoveFile = (inputFile) => {
    const filesFiltered = methods
      .getValues('proofPayment')
      .filter((fileFiltered) => fileFiltered !== inputFile);
    methods.setValue('proofPayment', filesFiltered);
    // setFiles(filesFiltered);
  };

  /**
   * @param {Billing} billing
   */
  const toSummaryPeriode = (billing) => {
    if (billing.services[0].toLowerCase().includes('pemasangan')) return '';
    const dateMonth = new Date(billing.startSubscribe).getDate();
    const periode = new Date(billing.year, billing.month, dateMonth);
    const start = format(addMonths(periode, -1), 'MMMM');
    const end = format(periode, 'MMMM');
    return `${start}`;
  };

  const generateBilling = async () => {
    try {
      await confirm({
        content: `Apakah anda yakin ingin, membuat tagihan untuk user ${subscription.fullname}`,
        cancellationText: 'Batal',
        confirmationText: 'Ya',
        confirmationButtonProps: { color: 'primary', variant: 'contained' },
      });

      await subscriptionRepository.generateCustomerBilling({
        customer: subscription._id,
        month,
        year,
      });

      toast.success('Berhasil membuat tagihan');

      prefetch();
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
    }
  };

  const dynamicHeaders = useMemo(() => {
    if (isAdmin) return headers;
    headers.splice(headers.length - 1, 1);
    return headers;
  });

  useEffect(() => {
    if (!show) {
      setCustomer(null);
      setOdp(null);
      setArea(null);
      methods.setValue('proofPayment', []);
      methods.reset();
      return;
    }
    prefetch();
  }, [show]);

  /**
   * @param {Billing} billingData
   */
  async function updateSomeBilling(billingData) {
    const result = await billingUpdateFormRef.current.open(billingData._id, {
      amount: billingData.amount,
      summaryPeriode: billingData.summaryPeriode,
      services: billingData.services,
    });
    if (result) prefetch();
  }

  const submitPartially = handleSubmit(async (data) => {
    const billingDataList = billingList.filter((b) => b.checked);
    const result = await partiallyPaidFormRef.current.open(billingDataList);
    if (!result) return;

    try {
      const date = data.paymentDate.substring(0, 10);
      const time = data.paymentDate.substring(11, 16);
      const b = billingList.filter((billing) => billing.checked).map((billing) => billing._id);
      /** @type {SubmitPaymentRequest} */
      const request = {
        amount: total,
        billingList: result.map((r) => r.billing),
        amountList: result.map((r) => r.amount),
        customer: customer._id,
        date,
        time,
        depositMethod: data.depositMethod,
        paymentEvidence: data.proofPayment,
        paymentMethod: data.paymentMethod,
        duoDateCharge: currentDuoDate?.charge ?? 0,
        note: data.note,
      };

      if (isAdmin) {
        await subscriptionRepository.submitPayment(request);
      } else {
        await invoiceTempRepository.submit(request);
      }
      toast.success('Berhasil mengirim pembayaran');
      onClose(true);
    } catch (error) {
      toast.error(error.message);
    } finally {
      loading.onFalse();
    }
  });

  function copyLink(text) {
    // copyText(text);
    // toast.info('Copy to clipboard');
    window.open(text, '_blank');
  }

  async function handleGenerateBillingMonthly() {
    /** @type{{month: number; year: number}[]} */
    const result = await billingMonthlyDialogRef.current.open();
    if (!result) return;

    const promises = result.map(async (r) => {
      try {
        await subscriptionRepository.generateCustomerBilling({
          customer: subscription._id,
          month: r.month,
          year: r.year,
        });
      } catch (error) {
        toast.error(error.message);
      }
    });

    toast.promise(Promise.allSettled(promises), {
      loading: 'Generate billing...',
      finally: () => {
        prefetch();
        toast.success('Berhasil membuat tagihan');
      },
    });

    // await Promise.allSettled(promises);
    // prefetch();
  }

  return (
    <>
      {' '}
      <Form methods={methods}>
        <Dialog
          open={show}
          onClose={onClose}
          fullWidth
          maxWidth="md"
          fullScreen={isMobile}
          className="tw-relative"
        >
          <Overloading loading={prefetchLoading.value} />

          <DialogTitle>Form Pembayaran</DialogTitle>
          <DialogContent className="tw-bg-slate-100 tw-relative">
            <Grid container spacing={2} sx={{ paddingY: 1.5 }}>
              {/* Customer Identity */}
              <Grid xs={6} sm={6} md={4}>
                <Stack>
                  <span className="tw-text-xs tw-text-gray-500">ID</span>
                  <span className="tw-text-xs tw-font-medium">{customer?.customerId}</span>
                </Stack>
              </Grid>
              <Grid xs={6} sm={6} md={4}>
                <Stack>
                  <span className="tw-text-xs tw-text-gray-500">Nama Pelanggaan</span>
                  <span className="tw-text-xs tw-font-medium">{customer?.fullname}</span>
                </Stack>
              </Grid>
              <Grid xs={6} sm={6} md={4}>
                <Stack>
                  <span className="tw-text-xs tw-text-gray-500">Nomor Telepon</span>
                  <span className="tw-text-xs tw-font-medium">{customer?.phone}</span>
                </Stack>
              </Grid>
              <Grid xs={6} sm={6} md={4}>
                <Stack>
                  <span className="tw-text-xs tw-text-gray-500">Alamat</span>
                  <span className="tw-text-xs tw-font-medium">{customer?.address}</span>
                </Stack>
              </Grid>
              <Grid xs={6} sm={6} md={4}>
                <Stack>
                  <span className="tw-text-xs tw-text-gray-500">Tanggal Registrasi</span>
                  <span className="tw-text-xs tw-font-medium">
                    {customer?.activePackage?.start?.toDate().format('dd MMM yyyy') ?? ''}
                  </span>
                </Stack>
              </Grid>
              <Grid xs={6} sm={6} md={4}>
                <Stack>
                  <span className="tw-text-xs tw-text-gray-500">Area / POP</span>
                  <span className="tw-text-xs tw-font-medium">{area?.title ?? '-'}</span>
                </Stack>
              </Grid>
              <Grid xs={6} sm={6} md={4}>
                <Stack>
                  <span className="tw-text-xs tw-text-gray-500">ODP</span>
                  <span className="tw-text-xs tw-font-medium">{odp?.name ?? '-'}</span>
                </Stack>
              </Grid>
              <Grid xs={6} sm={6} md={4}>
                <Stack>
                  <span className="tw-text-xs tw-text-gray-500">Paket Saat ini</span>
                  <span className="tw-text-xs tw-font-medium">{packagePlan?.title ?? '-'}</span>
                </Stack>
              </Grid>
              <Grid xs={6} sm={6} md={4}>
                <Stack>
                  <span className="tw-text-xs tw-text-gray-500">Biaya Bulanan</span>
                  <span className="tw-text-xs tw-font-medium">
                    {customer?.activePackage?.price?.formatCurrency() ?? '-'}
                  </span>
                </Stack>
              </Grid>
              <Grid xs={6} sm={6} md={4}>
                <Stack>
                  <span className="tw-text-xs tw-text-gray-500">Jenis Layanan</span>
                  <span className="tw-text-xs tw-font-medium">
                    {area?.isPrePaid ? 'Prabayar / Bayar didepan' : 'Pascabayar / Bayar dibelakang'}
                  </span>
                </Stack>
              </Grid>
              <Grid xs={6} sm={6} md={4}>
                <Stack>
                  <span className="tw-text-xs tw-text-gray-500">Tanggal Jatuh Tempo</span>
                  <span className="tw-text-xs tw-font-medium">
                    {customer?.activePackage?.start?.toDate().format('dd') ?? '-'}
                  </span>
                </Stack>
              </Grid>
              {/* End Customer Identity */}
              <Grid xs={12}>
                <div className="tw-flex tw-flex-row tw-items-center tw-justify-between">
                  <span className="tw-text-xs tw-text-gray-500">Item Pembayaran</span>
                  {isAdmin && (
                    <Button
                      // onClick={() => generateBilling()}
                      onClick={() => handleGenerateBillingMonthly()}
                      variant="outlined"
                      color="primary"
                      className="tw-flex-none"
                      size="small"
                    >
                      Generate Billing
                    </Button>
                  )}
                </div>
              </Grid>
              {/* Table Content */}
              <Grid xs={12}>
                {isMobile ? (
                  <Stack spacing={2}>
                    {billingList.map((b, i) => (
                      <MobileItem
                        billing={b}
                        key={i}
                        onToggleCheck={() => toggleChecked(i)}
                        onCancel={!me?.permission?.allowEditBilling ? undefined : () => onCancel(b)}
                        onRestore={
                          !me?.permission?.allowEditBilling ? undefined : () => onRestore(b)
                        }
                        onEdit={
                          !me?.permission?.allowEditBilling ? undefined : () => updateSomeBilling(b)
                        }
                        onCopy={(text) => copyLink(text)}
                      />
                    ))}
                  </Stack>
                ) : (
                  <Table className="tw-bg-white">
                    <TableHead>
                      <TableRow>
                        {dynamicHeaders.map((h, i) => (
                          <TableCell key={i}>{h}</TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {billingList.map((b, i) => (
                        <TableRow key={i}>
                          <TableCell sx={{ py: 0 }}>
                            <Checkbox
                              disabled={b.status === 'canceled'}
                              checked={b.checked}
                              onClick={(e) => toggleChecked(i)}
                            />
                          </TableCell>
                          <TableCell sx={{ py: 0 }}>
                            {b.summaryPeriode ? (
                              <span className="tw-text-xs">{b.summaryPeriode}</span>
                            ) : (
                              <span className="tw-text-xs">{toSummaryPeriode(b)}</span>
                            )}
                          </TableCell>
                          <TableCell sx={{ py: 0 }}>
                            <div className="tw-flex tw-flex-wrap tw-gap-2 tw-items-center">
                              {b.services.map((s, j) => (
                                <span className="tw-text-xs" key={j}>
                                  {s}
                                </span>
                                // <Chip label={s} key={j} size="small" className="tw-text-xs" />
                              ))}
                              {/* {b.summaryPeriode ? (
                                <span className="tw-text-xs">{b.summaryPeriode}</span>
                              ) : (
                                <span className="tw-text-xs">{toSummaryPeriode(b)}</span>
                              )} */}
                            </div>
                          </TableCell>
                          <TableCell sx={{ py: 0 }}>
                            <span className="tw-text-xs tw-whitespace-nowrap">
                              {b.status?.toCapitalCase()}
                            </span>
                          </TableCell>
                          <TableCell sx={{ py: 0 }}>
                            <span className="tw-text-xs tw-whitespace-nowrap">
                              Rp. {b.amount?.formatCurrency() ?? '-'}
                            </span>
                          </TableCell>
                          <TableCell sx={{ py: 0 }}>
                            <div className="tw-flex tw-flex-row tw-gap-2">
                              {b.status === 'canceled' ? (
                                <IconButton
                                  disabled={!me?.permission?.allowEditBilling}
                                  variant="contained"
                                  size="small"
                                  color="primary"
                                  onClick={() => onRestore(b)}
                                >
                                  <Iconify icon="mdi:restore" />
                                  {/* Pulihkan */}
                                </IconButton>
                              ) : (
                                isAdmin && (
                                  <>
                                    <IconButton
                                      disabled={!me?.permission?.allowEditBilling}
                                      variant="contained"
                                      size="small"
                                      color="error"
                                      onClick={() => onCancel(b)}
                                    >
                                      <Iconify icon="mdi:cancel" />
                                      {/* Batal */}
                                    </IconButton>
                                    <IconButton
                                      disabled={!me?.permission?.allowEditBilling}
                                      variant="contained"
                                      size="small"
                                      color="success"
                                      onClick={() => updateSomeBilling(b)}
                                    >
                                      <Iconify icon="mdi:pencil" />

                                      {/* Edit */}
                                    </IconButton>
                                  </>
                                )
                              )}
                              <IconButton
                                variant="contained"
                                size="small"
                                color="primary"
                                onClick={() => copyLink(`${BILL_URL}/invoice/${b._id}`)}
                              >
                                <Iconify icon="mdi:web" />
                                {/* Salin */}
                              </IconButton>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </Grid>
              {/* End Table Content */}
              <Grid xs={12}>
                <span className="tw-text-xs">Keterangan</span>
              </Grid>
              {/* Addon Form */}
              {showDuoDateCharge.value && (
                <>
                  <Grid xs={12} sm={6} md={4}>
                    <TextField
                      fullWidth
                      label="Keterangan Denda"
                      value={duoDateChargeName}
                      inputProps={{ readOnly: true }}
                      size="small"
                      className="tw-bg-white"
                    />
                  </Grid>
                  <Grid xs={12} sm={6} md={4}>
                    <TextField
                      select
                      fullWidth
                      label="Denda"
                      value={selectedDuoDateId}
                      onChange={(e) => setSelectedDuoDate(e.target.value)}
                      size="small"
                      className="tw-bg-white"
                    >
                      {duoDateList.map((d, i) => (
                        <MenuItem key={i} value={d._id}>
                          {d.name} | Rp. {d.charge.formatCurrency()}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                </>
              )}
              <Grid xs={12} sm={6} md={4}>
                <Field.Select
                  name="paymentMethod"
                  label="Metode Pembayaran"
                  size="small"
                  className="tw-bg-white"
                  onChange={(e) => {
                    const oldValue = methods.getValues('paymentMethod');
                    const { value } = e.target;
                    methods.setValue('paymentMethod', e.target.value);
                    if (oldValue === value) return;
                    if (value === 'cash') {
                      methods.setValue('depositMethod', me?.defaultData?.cashDepositMethodId ?? '');
                    } else if (value === 'transfer') {
                      methods.setValue(
                        'depositMethod',
                        me?.defaultData?.transferDepositMethodId ?? ''
                      );
                    }
                  }}
                >
                  {paymentMethodList.map((p, i) => (
                    <MenuItem key={i} value={p}>
                      {p}
                    </MenuItem>
                  ))}
                </Field.Select>
              </Grid>
              <Grid xs={12} sm={6} md={4}>
                <Field.Select
                  name="depositMethod"
                  label="Metode Deposit"
                  size="small"
                  className="tw-bg-white"
                >
                  {availableDeposit.map((d, i) => (
                    <MenuItem key={i} value={d._id}>
                      {d.title}
                    </MenuItem>
                  ))}
                </Field.Select>
              </Grid>
              <Grid xs={12} sm={6} md={4}>
                <Field.MobileDateTimePicker
                  name="paymentDate"
                  label="Waktu Pembayaran"
                  slotProps={{ textField: { fullWidth: true, size: 'small' } }}
                  className="tw-bg-white"
                />
              </Grid>
              <Grid xs={12}>
                <Field.Text
                  fullWidth
                  label="Catatan"
                  size="small"
                  name="note"
                  className="tw-bg-white"
                  multiline
                  rows={3}
                />
              </Grid>
            </Grid>
            <Grid xs={12}>
              <div className="tw-my-5">
                <Divider />
              </div>
            </Grid>
            <Grid xs={12}>
              <div className="tw-w-full tw-grid tw-grid-cols-1 md:tw-grid-cols-3 tw-gap-3">
                <div className="tw-w-full tw-col-span-3 md:tw-col-span-1">
                  <Field.Upload
                    multiple
                    onRemove={handleRemoveFile}
                    onRemoveAll={() => methods.setValue('proofPayment', [])}
                    name="proofPayment"
                    helperText="Upload Bukti Pembayaran"
                    showRender={false}
                  />
                </div>
                <div className="tw-w-full tw-grid tw-col-span-3 md:tw-grid-cols-2 tw-gap-2 md:tw-col-span-2">
                  {thumbnailImage.map((t, i) => (
                    <div key={i} className="tw-relative">
                      <button
                        type="button"
                        className="tw-absolute tw-top-3 tw-right-1 tw-bg-white/80 tw-rounded-full tw-w-7 tw-h-7 tw-flex tw-items-center tw-justify-center"
                        onClick={() => handleRemoveFile(images[i])}
                      >
                        <Iconify icon="mdi:close" />
                      </button>
                      <img
                        src={t}
                        className="tw-w-full tw-aspect-video tw-rounded-lg  tw-object-cover tw-object-center"
                        alt="Thumbnail"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </Grid>
            <Grid xs={12}>
              <div className="tw-flex tw-flex-col tw-items-end tw-gap-1">
                <span className="tw-text-xs tw-text-gray-500">Total Pembayaran</span>
                <span className="tw-text-xs tw-font-medium">
                  Rp. {finalTotal?.formatCurrency()}
                </span>
              </div>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={onClose} color="error">
              Batal
            </Button>
            {isAdmin && (
              <LoadingButton
                // disabled={!allowPay}
                loading={loading.value}
                color="success"
                variant="outlined"
                onClick={submitPartially}
              >
                Bayar Partially
              </LoadingButton>
            )}
            <LoadingButton
              // disabled={!allowPay}
              loading={loading.value}
              color="success"
              variant="contained"
              onClick={handleSubmit(onSubmit)}
            >
              {submitLabel}
            </LoadingButton>
          </DialogActions>
          <BillingUpdateForm ref={billingUpdateFormRef} />
        </Dialog>
      </Form>
      <PartiallyPaidForm ref={partiallyPaidFormRef} />
      <BillingGenerateMonthlyDialog ref={billingMonthlyDialogRef} />
    </>
  );
}

/**
 * @param {{billing: Billing; onToggleCheck: void; onCancel: void; onRestore: void; onEdit: void; onCopy: (text: string) => void}} props -- react props
 */
const MobileItem = ({ billing, onToggleCheck, onCancel, onRestore, onEdit, onCopy }) => {
  /**
   * @param {Billing} billing
   */
  const toSummaryPeriode = () => {
    const periode = new Date(billing.year, billing.month);
    if (billing.services[0].toLowerCase().includes('pemasangan'))
      return billing.services.join(' - ');

    const start = format(addMonths(periode, -1), 'dd MMMM');
    const end = format(periode, 'dd MMMM');
    return `${start} - ${end}`;
  };

  return (
    <div className="tw-ring-2 tw-ring-gray-300 tw-rounded-lg">
      <Accordion expanded>
        <AccordionSummary sx={{ height: 0 }}>
          <div className="tw-flex flex-row tw-items-center tw-w-full tw-justify-between">
            <div className="tw-flex flex-row tw-items-center">
              <Checkbox
                disabled={billing.status === 'canceled'}
                checked={billing.checked}
                onClick={onToggleCheck}
              />
              <span className="tw-text-xs tw-font-medium">
                {billing.summaryPeriode ? billing.summaryPeriode : toSummaryPeriode()}
              </span>
            </div>
            <div className="tw-flex tw-flex-row tw-items-center tw-justify-end">
              {billing.status === 'canceled' ? (
                <Button variant="contained" size="small" color="primary" onClick={onRestore}>
                  Pulihkan
                </Button>
              ) : (
                <>
                  {onCancel && (
                    <IconButton variant="contained" size="small" color="error" onClick={onCancel}>
                      <Iconify icon="mdi:close" />
                    </IconButton>
                  )}
                  {onEdit && (
                    <IconButton variant="contained" size="small" color="success" onClick={onEdit}>
                      <Iconify icon="mdi:pencil" />
                    </IconButton>
                  )}
                </>
              )}{' '}
              <IconButton
                variant="contained"
                size="small"
                color="primary"
                onClick={() => onCopy(`${BILL_URL}/invoice/${billing._id}`)}
              >
                <Iconify icon="mdi:web" />
              </IconButton>
            </div>
          </div>
        </AccordionSummary>
        <AccordionDetails sx={{ paddingTop: 0, paddingBottom: 1 }}>
          <div className="tw-w-full tw-h-[0.5px] tw-bg-gray-300 tw-mb-2" />
          <Stack>
            <Grid container>
              <Grid xs={4}>
                <span className="tw-text-xs tw-font-medium">Paket :</span>
              </Grid>
              <Grid xs={8}>
                <ul className="tw-list-disc">
                  {billing.services.map((s, j) => (
                    <li label={s} key={j} className="tw-text-xs tw-font-medium">
                      {s}
                    </li>
                  ))}
                </ul>
              </Grid>
              <Grid xs={4}>
                <span className="tw-text-xs tw-font-medium">Status :</span>
              </Grid>
              <Grid xs={8}>
                <span className="tw-text-xs tw-font-medium">{billing.status}</span>
              </Grid>
              <Grid xs={4}>
                <span className="tw-text-xs tw-font-medium">Jumlah :</span>
              </Grid>
              <Grid xs={8}>
                <span className="tw-text-xs tw-font-medium">
                  Rp. {billing.amount.formatCurrency()}
                </span>
              </Grid>
            </Grid>
          </Stack>
        </AccordionDetails>
      </Accordion>
    </div>
  );
};
