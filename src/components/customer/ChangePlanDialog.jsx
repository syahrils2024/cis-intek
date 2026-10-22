import { z } from 'zod';
import dayjs from 'dayjs';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { useForm } from 'react-hook-form';
import { Iconify } from '@components/iconify';
import { useBoolean } from '@hooks/use-boolean';
import { useConfirm } from 'material-ui-confirm';
import Overloading from '@components/overloading';
import { Form, Field } from '@components/hook-form';
import { useDebouncedCallback } from 'use-debounce';
import { zodResolver } from '@hookform/resolvers/zod';
import PaymentDialogBilling from '@components/billing/components/paymentDialogBilling';
import { useRef, useMemo, useState, useEffect, forwardRef, useImperativeHandle } from 'react';

import Grid from '@mui/material/Unstable_Grid2';
import { TabList, TabPanel, TabContext, LoadingButton } from '@mui/lab';
import {
  Tab,
  Tabs,
  Stack,
  Alert,
  Table,
  Button,
  Dialog,
  useTheme,
  MenuItem,
  Checkbox,
  TableRow,
  TableHead,
  TableCell,
  TableBody,
  DialogTitle,
  DialogActions,
  DialogContent,
  useMediaQuery,
  FormControlLabel,
} from '@mui/material';

import 'src/extension/date';
import 'src/extension/number';
import 'src/extension/string';
import { useMeStore } from 'src/stores/meStore';
import { useChangePlanAddonsFormStore } from 'src/stores/changePlanAddonsForm';
import {
  areaRepository,
  customerRepository,
  mikrotikRepository,
  packagePlanRepository,
  subscriptionRepository,
} from 'src/repositories';

import ChangePlanDialogAddons from './ChangePlanDialogAddons';

/**
 * @typedef {import('src/repositories/package').AvailableChangePlan} AvailableChangePlan
 * @typedef {import('src/repositories/customer').CustomerDetail} CustomerDetail
 * @typedef {import('src/repositories/subscription').ISimulateChangePackage} ISimulateChangePackage
 * @typedef {'pending' | 'error' | 'success'} ActionStatus
 * @typedef {import('src/stores/changePlanAddonsForm').ChangePlanAddonsFormStore} ChangePlanAddonsFormStore
 * @typedef {import('src/repositories/subscription').AddonsRequestItem} AddonsRequestItem
 * @typedef {import('src/stores/meStore').MeStore} MeStore
 * @typedef {import('src/repositories/subscription').BillingSummary} BillingSummary
 * @typedef {import('src/repositories/area').Area} Area
 */

const validatorForm = z.object({
  packageId: z.string().min(1, 'Tidak boleh kosong'),
  price: z.string().min(1, 'Tidak boleh kosong'),
});

const CustomerChangePlanDialog = forwardRef((props, ref) => {
  const [parentTab, setParentTab] = useState('change.plan');
  const [parentTabList] = useState([
    {
      title: 'Perubahan Service',
      value: 'change.plan',
      icon: 'fluent:cloud-arrow-up-16-filled',
    },
    {
      title: 'Current Billing',
      value: 'billing.list',
      icon: 'basil:invoice-solid',
    },
  ]);

  const [tab, setTab] = useState('internet');
  const [tabs] = useState([
    {
      title: 'Internet',
      value: 'internet',
    },
    {
      title: 'Addons',
      value: 'addons',
    },
  ]);

  /** @type {[CustomerDetail, void]} */
  const [customer, setCustomer] = useState(null);

  /** @type {[Area, void]} */
  const [area, setArea] = useState(null);

  /** @type {[AvailableChangePlan[], void]} */
  const [packages, setPackages] = useState([]);

  const [simulateErrorMessage, setSimulateErrorMessage] = useState(null);
  const [simulateMessage, setSimulateMessage] = useState(null);
  const simulateIsLoading = useBoolean(false);
  const [checkConfirm, setCheckConfirm] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const paymentDialogBillingRef = useRef();

  /** @type {[ActionStatus, (v: ActionStatus) => void]} */
  const [statusMikrotik, setStatusMikrotik] = useState('pending');
  /** @type {[ActionStatus, (v: ActionStatus) => void]} */
  const [changePlanStatus, setChangePlanStatus] = useState('pending');

  /** @type {ChangePlanAddonsFormStore} */
  const { reset, customerAddons, setCustomerAddons } = useChangePlanAddonsFormStore();
  /** @type {MeStore} */
  const { me } = useMeStore();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const loading = useBoolean(false);
  const loadingButton = useBoolean(false);
  const show = useBoolean(false);
  const resolver = useRef();
  const confirm = useConfirm();
  const disabledSubmit = useBoolean(false);
  const [delayMessage, setDelayMessage] = useState(null);

  const showSummary = useBoolean(false);

  /** @type {[BillingSummary, void]} */
  const [oldBillingSummary, setOldBillingSummary] = useState(null);

  /** @type {[BillingSummary, void]} */
  const [newBillingSummary, setNewBillingSummary] = useState(null);

  const summaryHeaders = ['Deskripsi', 'Periode', 'Paket', 'Jumlah'];
  const summaryItems = useMemo(() => {
    if (!showSummary.value) return null;
    if (!newBillingSummary) return null;

    const items = [];
    if (oldBillingSummary) {
      items.push([
        'Berjalan',
        oldBillingSummary.summary,
        oldBillingSummary.service?.join(', ') ?? '-',
        `Rp. ${oldBillingSummary.amount.formatCurrency()}`,
      ]);
    }

    items.push([
      'Baru',
      newBillingSummary.summary,
      newBillingSummary.service.join(', '),
      `Rp. ${newBillingSummary.amount.formatCurrency()}`,
    ]);

    return items;
  });

  const initialState = {
    packageId: '',
    price: '0',
  };

  const methods = useForm({ defaultValues: initialState, resolver: zodResolver(validatorForm) });
  const { handleSubmit } = methods;

  const headersData = useMemo(() => [
    {
      label: 'ID',
      value: customer?.customerId ?? '-',
    },
    {
      label: 'Pelanggan',
      value: customer?.fullname ?? '-',
    },
    {
      label: 'Area / POP',
      value: customer?.areaName ?? '-',
    },
    {
      label: 'ODP',
      value: customer?.ODPName ?? '-',
    },
    {
      label: 'Paket saat ini',
      value: customer?.packageData?.title ?? '-',
    },
    {
      label: 'Biaya Bulanan',
      value: `Rp. ${customer?.activePackage?.price.formatCurrency()}` ?? '-',
    },
    {
      label: 'Jenis Layanan',
      value: customer?.isPrepaid ? 'Prabayar / Bayar Depan' : 'Pascabayar / Bayar Belakang',
    },
    {
      label: 'Tanggal Jatuh Tempo',
      value: area?.duoDate ?? '-',
    },
    {
      label: 'Status Pembayaran',
      value: !!customer && (customer?.totalUnpaidBilling ? 'Memiliki Tunggakan' : 'Lunas'),
    },
    {
      label: 'Tunggakan',
      value: !customer
        ? '-'
        : (customer?.totalUnpaidBilling ?? 0) > 0
          ? `Rp. ${customer?.totalUnpaidBilling.formatCurrency()}`
          : 'Tidak ada',
    },
  ]);

  const steps = useMemo(() => [
    {
      label: 'Check Mikrotik Server',
      value: statusMikrotik,
    },
    {
      label: 'Progress Perubahan Paket',
      value: changePlanStatus,
    },
  ]);

  const getSimulationDebouncer = useDebouncedCallback(() => {
    getSimulation();
  }, 500);

  async function getSimulation() {
    setSimulateErrorMessage(null);
    setSimulateMessage(null);
    setDelayMessage(null);
    simulateIsLoading.onTrue();
    showSummary.onFalse();
    setNewBillingSummary(null);
    setOldBillingSummary(null);
    try {
      const packageId = methods.getValues('packageId');
      if (!packageId) return;
      const price = methods.getValues('price');
      const result = await subscriptionRepository.simulateChangePackageSubscription({
        customerId: customer._id,
        packageId,
        price: price.toNumber(),
      });

      setOldBillingSummary(result.latestBillingSummary ?? null);
      setNewBillingSummary(result.newBillingSummary ?? null);

      showSummary.onTrue();
    } catch (error) {
      setSimulateErrorMessage(error.message);
    } finally {
      simulateIsLoading.onFalse();
    }
  }

  async function prefetch(customerId) {
    loading.onTrue();
    try {
      const snapshotCustomer = await customerRepository.getCustomer(customerId);
      setCustomer(snapshotCustomer);

      const snapshotPackages = await packagePlanRepository.availableChangePlanList(customerId);
      setPackages(snapshotPackages);

      const addonsItems = snapshotCustomer.addons?.map((item) => ({
        variantId: item.addons,
        price: item.price.formatCurrency(),
        start: dayjs(new Date(item.start)),
      }));

      setCustomerAddons(addonsItems);

      const snapshotArea = await areaRepository.getAreaDetail(snapshotCustomer.area);
      setArea(snapshotArea);
      paymentDialogBillingRef.current?.loadData(customerId);
    } catch (error) {
      toast.error(error.message);
    } finally {
      loading.onFalse();
    }
  }

  function open(customerId) {
    loadingButton.onFalse();
    setCheckConfirm(false);
    setParentTab('change.plan');
    reset();
    methods.reset();
    setErrorMessage(null);
    setSimulateMessage(null);
    setStatusMikrotik('pending');
    setChangePlanStatus('pending');
    showSummary.onFalse();
    setNewBillingSummary(null);
    setOldBillingSummary(null);
    setArea(null);
    disabledSubmit.onFalse();
    show.onTrue();
    prefetch(customerId);

    return new Promise((resolve) => {
      resolver.current = resolve;
    });
  }

  function close() {
    resolver.current();
    show.onFalse();
  }

  function setPackage(packageId) {
    const currentPackage = packages.find((p) => p._id === packageId);
    methods.setValue('packageId', packageId);
    methods.setValue('price', currentPackage?.price.toString().toNumber().formatCurrency() ?? 0);
    getSimulationDebouncer();
  }

  async function submitAddons() {
    loading.onTrue();
    try {
      /** @type {AddonsRequestItem[]} */
      const items = customerAddons.map((item, i) => {
        if (item.variantId === '') throw new Error(`Pilih addons no ${i + 1}`);
        return {
          start: format(item.start.toDate(), "yyyy-MM-dd'T'HH:mm:ss"),
          price: item.price.toString().toNumber(),
          variantId: item.variantId,
        };
      });
      await subscriptionRepository.updateSubscriptionAddons(customer._id, items);
      toast.success('Berhasil');
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
    } finally {
      loading.onFalse();
    }
  }

  const submit = handleSubmit(async (data) => {
    setErrorMessage(null);
    setChangePlanStatus('pending');
    setStatusMikrotik('pending');
    loadingButton.onTrue();
    try {
      const currentPackage = packages.find((p) => p._id === data.packageId);
      const price = data.price.toString().toNumber();
      if (price < 0) throw new Error('Harga tidak boleh kosong');
      const mikrotikActive = await mikrotikRepository
        .mikrotikIsOnline(customer._id)
        .catch(() => false);
      if (mikrotikActive) {
        setStatusMikrotik('success');
      } else {
        setStatusMikrotik('error');
      }

      await subscriptionRepository.changePackageSubscription({
        customerId: customer._id,
        packageId: data.packageId,
        price,
      });
      setChangePlanStatus('success');
    } catch (error) {
      setChangePlanStatus('error');
      console.log(error.message.includes('ditentukan'));
      if (error.message.includes('ditentukan')) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage(
          'Gagal, perubahan service akan dijadwalkan secara otomatis setelah server kembali online'
        );
      }
      console.log(error);

      // if (error instanceof Error) toast.error(error.message);
    } finally {
      disabledSubmit.onTrue();
      loadingButton.onFalse();
    }
  });

  useEffect(() => {
    if (tab === 'payment.form') paymentDialogBillingRef.current?.loadData(customer?._id);
  }, [tab]);

  useImperativeHandle(ref, () => ({ open }));

  return (
    <Form methods={methods}>
      <Dialog open={show.value} fullWidth maxWidth="md" fullScreen={isMobile}>
        <DialogTitle>
          <Tabs value={parentTab} onChange={(e, value) => setParentTab(value)}>
            {parentTabList.map((t, i) => (
              <Tab key={i} value={t.value} label={t.title} icon={<Iconify icon={t.icon} />} />
            ))}
          </Tabs>
        </DialogTitle>
        {/* Billing List */}
        <PaymentDialogBilling
          hidden={parentTab !== 'billing.list'}
          hideForm
          onRefresh={() => getSimulation()}
          ref={paymentDialogBillingRef}
          onClose={() => close()}
        />
        {parentTab === 'billing.list' ? null : (
          <DialogActions sx={{ display: parentTab !== 'billing.list' ? 'none' : 'flex' }} />
        )}
        {/* End Billing List */}
        <DialogContent hidden={parentTab !== 'change.plan'} dividers>
          <Stack spacing={2} className="tw-relative">
            <Overloading loading={loading.value} />
            <Grid container rowSpacing={2}>
              {headersData.map((h, i) => (
                <Grid xs={6} key={i}>
                  <Stack>
                    <span className="tw-text-xs tw-text-gray-500">{h.label}</span>
                    <span className="tw-text-xs tw-font-semibold">{h.value}</span>
                  </Stack>
                </Grid>
              ))}
            </Grid>
            {/* Form Content */}
            <TabContext value={tab}>
              <TabList onChange={(e, value) => setTab(value)}>
                {tabs.map((t, i) => (
                  <Tab key={i} value={t.value} label={t.title} />
                ))}
              </TabList>
              <TabPanel
                value="internet"
                sx={{ padding: 0 }}
                className="tw-flex tw-flex-col tw-gap-4"
              >
                <Field.Select
                  name="packageId"
                  variant="filled"
                  label="Paket"
                  size="small"
                  onChange={(e) => setPackage(e.target.value)}
                >
                  <MenuItem value={null}>Pilih Paket</MenuItem>
                  {packages.map((p, i) => (
                    <MenuItem value={p._id} key={i}>
                      <span className="tw-text-xs">
                        {p.title}{' '}
                        <span className="tw-ml-2 tw-text-gray-500">
                          (Rp. {p.price.toString().toNumber().formatCurrency()})
                        </span>
                      </span>
                    </MenuItem>
                  ))}
                </Field.Select>
                {/* <Field.Text
                  name="price"
                  label="Harga"
                  size="small"
                  variant="filled"
                  onChange={(e) => {
                    methods.setValue(
                      'price',
                      e.target.value.toString().toNumber().formatCurrency()
                    );
                    getSimulationDebouncer();
                  }}
                /> */}
                {/* End Form Content */}
                {simulateIsLoading.value && (
                  <Alert severity="warning">
                    <span className="tw-text-xs">Mengitung simulasi pembayaran</span>
                  </Alert>
                )}
                {simulateErrorMessage && (
                  <Alert severity="warning">
                    <span className="tw-text-xs">{simulateErrorMessage}</span>
                  </Alert>
                )}
                {!!summaryItems && (
                  <Stack spacing={1}>
                    <span className="tw-text-xs">Simulasi Billing :</span>
                    {area.isPrePaid === true ? (
                      <span className="tw-text-xs">
                        Apabila jenis layanan prabayar dan pelanggan masih memiliki tagihan berjalan
                        dan belum jatuh tempo, anda dapat melakukan cancel tagihan berjalan pada tab
                        Current Billing
                      </span>
                    ) : null}

                    <Table>
                      <TableHead>
                        <TableRow>
                          {summaryHeaders.map((h) => (
                            <TableCell key={h}>{h}</TableCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {summaryItems.map((item, i) => (
                          <TableRow key={i}>
                            {item.map((value) => (
                              <TableCell key={value}>
                                <span className="tw-text-xs">{value}</span>
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Stack>
                )}
                {/* {simulateMessage && (
                  <Alert severity="success">
                    <span className="tw-whitespace-pre-line tw-text-xs">{simulateMessage}</span>
                  </Alert>
                )} */}
                <Alert severity="warning">
                  <span className="tw-text-xs">
                    Perubahan paket internet existing / berjalan akan dihitung prorata berdasarkan
                    tanggal perubahan service
                  </span>
                </Alert>
                {/* {customer?.isPrepaid && (
                  <Alert severity="warning">
                    <span className="tw-text-xs">
                      Khusus pelanggan Prabayar / bayar didepan, penyesuaian paket akan berlaku
                      ketika pelanggan membayar tagihan penyesuaian yang telah terbit (apabila
                      melakukan upgrade)
                    </span>
                  </Alert>
                )} */}
                {delayMessage && (
                  <Alert severity="warning">
                    <span className="tw-text-xs">{delayMessage}</span>
                  </Alert>
                )}
                {(statusMikrotik === 'error' || changePlanStatus === 'error') && (
                  <Alert severity="warning">
                    <span className="tw-text-xs">{errorMessage}</span>
                  </Alert>
                )}
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
                        {s.value === 'error'
                          ? ': Gagal'
                          : s.value === 'success'
                            ? ': Berhasil'
                            : ''}
                      </span>
                    </div>
                  ))}
                </Stack>
              </TabPanel>
              <TabPanel value="addons" sx={{ padding: 0 }}>
                <ChangePlanDialogAddons customerId={customer?._id} addons={customer?.addons} />
              </TabPanel>
            </TabContext>

            <FormControlLabel
              sx={{ display: tab === 'payment.form' ? 'none' : 'flex' }}
              hidden={tab === 'payment.form'}
              control={
                <Checkbox
                  checked={checkConfirm}
                  onChange={(e) => setCheckConfirm(e.target.checked)}
                />
              }
              label={`${me?.fullname} menyetujui perubahan service ${tab === 'internet' ? 'Internet' : 'Addons'}`}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ display: parentTab !== 'change.plan' ? 'none' : 'flex' }}>
          {tab !== 'payment.form' ? (
            <>
              <Button color="error" variant="text" onClick={() => close()}>
                Tutup
              </Button>
              <LoadingButton
                loading={loadingButton.value}
                variant="contained"
                color="primary"
                onClick={tab === 'internet' ? submit : submitAddons}
                disabled={!checkConfirm || disabledSubmit.value}
              >
                Ubah Service
              </LoadingButton>
            </>
          ) : null}
        </DialogActions>
      </Dialog>
    </Form>
  );
});

export default CustomerChangePlanDialog;
