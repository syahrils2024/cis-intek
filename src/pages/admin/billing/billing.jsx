/**
 * @typedef {import("src/stores/billingStore").BillingStore} BillingStore
 * @typedef {import('src/stores/billingStore').Subscription} Subscription
 * @typedef {import('src/repositories/area').Area} Area
 * @typedef {import('src/stores/addons').AddonsStore} AddonsStore
 * @typedef {import('src/stores/mikrotikLog').MikrotikLogStore} MikrotikLogStore
 * @typedef {import('src/stores/jobQueue').JobQueueStore} JobQueueStore
 */
import dayjs from 'dayjs';
import { toast } from 'sonner';
import { format } from 'date-fns';
import axios from '@commons/axios';
import { Icon } from '@iconify/react';
import { download } from '@utils/download';
import { useBoolean } from '@hooks/use-boolean';
import { useConfirm } from 'material-ui-confirm';
import { connect, useDispatch } from 'react-redux';
import { useDebouncedCallback } from 'use-debounce';
import { EXPORT_EXCEL_URL } from '@commons/constant';
import { usePrivilege } from '@auth/hooks/privileges';
import { usePermission } from '@auth/hooks/permission';
import { useRef, useMemo, useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ViewerImageDialog } from '@components/viewerImageDialog';
import ProcessDialogIsolir from '@components/processDialog/isolir';
import { PaymentFormDialog } from '@components/billing/paymentForm';
import AreaPickerFilter from '@components/billing/areaPickerFilter';
import SendMessageDialog from '@components/billing/sendMessageDialog';
import CustomerNoteFormDialog from '@components/customer/NoteFormDialog';
import CustomerActivateDialog from '@components/customer/ActivateDialog';
import PaymentDialog from '@components/billing/components/paymentDialog';
import InvoiceTempDetailDialog from '@components/invoiceTemp/detailDialog';
import CustomerChangePlanDialog from '@components/customer/ChangePlanDialog';
import CustomerDeactivateDialog from '@components/customer/DeactivateDialog';
import ProcessDialogRemoveIsolir from '@components/processDialog/RemoveIsolir';
import { PaymentHistoryDialog } from '@components/billing/paymentHistoryDialog';

import Grid from '@mui/material/Unstable_Grid2';
import { DatePicker } from '@mui/x-date-pickers';
import { TabList, TabPanel, TabContext, LoadingButton } from '@mui/lab';
import {
  Tab,
  Menu,
  Stack,
  Button,
  Dialog,
  Tooltip,
  useTheme,
  MenuItem,
  Checkbox,
  TextField,
  DialogTitle,
  useMediaQuery,
  DialogContent,
  DialogActions,
  TablePagination,
  FormControlLabel,
} from '@mui/material';

import 'src/extension/number';
import { setArea } from 'src/stores/areaStore';
import { useAddonsStore } from 'src/stores/addons';
import { useJobQueueStore } from 'src/stores/jobQueue';
import { useMikrotikLog } from 'src/stores/mikrotikLog';
import { setBillingState, setBillingStateMulti } from 'src/stores/billingStore';
import {
  areaRepository,
  addonsRepository,
  customerRepository,
  dashboardRepository,
  jobQueueRespository,
  packagePlanRepository,
  subscriptionRepository,
} from 'src/repositories';

import Overloading from 'src/components/overloading';
import BillingTable from 'src/components/billing/table';
import MobileCard from 'src/components/billing/mobileCard';
import { InvoiceAnalytic } from 'src/components/dashboard-card/invoice-analytics';

import BillingActionLogDialog from './components/actionLogDialog';
import ArchiveListDialog from './archiver/archiverList/archiverListDialog';

const INVOICE_URL = import.meta.env.VITE_INVOICE_URL;

/**
 *
 * @param {BillingStore & {allArea: Area[]}} props -- react props
 */
function Billing({
  month,
  year,
  statistics,
  packageFilter,
  oltList,
  selectedAreaId,
  selectedPackageId,
  selectedPaymentStatus,
  selectedUserStatus,
  subscription,
  status,
  limit,
  page,
  totalItem,
  order,
  orderBy,
  isolated,
  allArea,
  selectedAreaName,
  addons,
  customerNote,
  filterByTagihan,
  special,
}) {
  const theme = useTheme();

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const confirm = useConfirm();
  const [query, setQuery] = useSearchParams();
  const header = ['Pelanggan', 'Paket', 'Keterangan', 'Action'];
  const paymentStatusList = ['paid', 'unpaid', 'partially paid'];
  const userStatusList = ['active', 'inactive'];
  const [search, setSearch] = useState('');
  const debounceSearch = useDebouncedCallback((text) => {
    setSearch(text);
    setQuery({ q: text });
  }, 700);
  const tabsLabel = ['Daftar Pelanggan', 'Rekap'];
  const [selectedTab, setSelectedTab] = useState('0');
  const [loading, setLoading] = useState(true);
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const showPaymentDialog = useBoolean(false);
  const showPaymentHistoryDialog = useBoolean(false);
  const searchRef = useRef();
  const viewerImageDialogRef = useRef();
  const areaPickerFilterRef = useRef();
  /** @type {{current: {open: (customerId: string) => void}}} */
  const processIsolirRef = useRef();
  const processRemoveIsolirRef = useRef();
  const changePlanDialogRef = useRef();
  const customerNoteFormDialogRef = useRef();
  const deactivateDialogRef = useRef();
  const activateDialogRef = useRef();
  const invoiceTempDetailDialogRef = useRef();
  const paymentDialogRef = useRef();
  const billingActionDialogRef = useRef();
  const archiveInvoiceDialogRef = useRef();

  const { isAdmin, isLo } = usePrivilege();
  /** @type {AddonsStore} */
  const { data: addonsData, setAddonsStore } = useAddonsStore();
  const permission = usePermission();

  const [expanded, setExpanded] = useState(false);

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  /** @type {[Subscription, void]} */
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const showMessageDialog = useBoolean(false);

  const loadingDownload = useBoolean(false);
  const showCustomerSearch = useBoolean(false);

  /** @type {JobQueueStore} */
  const jobQueueStore = useJobQueueStore();

  /** @type {MikrotikLogStore} */
  const mikrotikLogStore = useMikrotikLog();

  /**
   * Option Menu
   */
  const [anchorEl, setAnchorEl] = useState(null);
  const showOption = Boolean(anchorEl);
  const openOption = (event, item) => {
    setAnchorEl(event.currentTarget);
  };
  const closeOption = () => {
    setAnchorEl(null);
  };

  /**
   * Billing Menu
   */
  const [anchorElBilling, setAnchorElBilling] = useState(null);
  const showOptionBilling = Boolean(anchorElBilling);
  /**
   *
   * @param {Event} event
   * @param {Subscription} s
   */
  const openOptionBilling = (event, s) => {
    setAnchorElBilling(event.currentTarget);
    setSelectedSubscription(s);
  };
  const closeOptionBilling = () => {
    setAnchorElBilling(null);
    setSelectedSubscription(null);
  };

  /**
   * Area Filter Menu
   */
  const [anchorElArea, setAnchorElArea] = useState(null);
  const openArea = Boolean(anchorElArea);
  const handleClickAnchorArea = (event) => {
    setAnchorElArea(event.currentTarget);
  };
  const handleCloseAnchorArea = () => {
    setAnchorElArea(null);
  };

  /**
   * @param {boolean} isPrefetch
   */
  const onClosePaymentDialog = async (isPrefetch) => {
    showPaymentDialog.onFalse();
    if (isPrefetch) prefetch();
  };

  /**
   * @param {Subscription} item
   */
  const onOpenInvoice = (item) => {
    if (!item.billingId) {
      toast.error('Tagihan belum dibayar');
      return;
    }
    const url = `${INVOICE_URL}/${item.billingId}`;
    window.open(url, '_blank');
  };

  const chartAnalytics = useMemo(() => [
    {
      title: `Tagihan ${month.toIndonesianMonthLong()}`,
      subtitle: 'Jumlah Tagihan',
      percent: 100,
      icon: 'solar:bill-list-bold-duotone',
      price: permission.showFinanceData ? (
        `Rp. ${(statistics?.amount ?? 0).formatCurrency()}`
      ) : (
        <span className="tw-text-xl">***.***</span>
      ),
      color: theme.vars.palette.warning.main,
    },
    {
      title: `Bayar ${month.toIndonesianMonthLong()}`,
      subtitle: 'Jumlah Bayar',
      percent: 100,
      icon: 'solar:file-check-bold-duotone',
      price: permission.showFinanceData ? (
        `Rp. ${(statistics?.paid ?? 0).formatCurrency()}`
      ) : (
        <span className="tw-text-xl">***.***</span>
      ),
      color: theme.vars.palette.success.main,
    },
    {
      title: `Piutang ${month.toIndonesianMonthLong()}`,
      subtitle: 'Jumlah Piutang',
      percent: 100,
      icon: 'solar:sort-by-time-bold-duotone',
      price: permission.showFinanceData ? (
        `Rp. ${(statistics?.unpaid ?? 0).formatCurrency()}`
      ) : (
        <span className="tw-text-xl">***.***</span>
      ),
      color: theme.vars.palette.info.main,
    },
    {
      title: `Tunggakan ${month.toIndonesianMonthLong()}`,
      subtitle: 'Jumlah Tunggakan',
      percent: 100,
      icon: 'solar:bell-bing-bold-duotone',
      price: permission.showFinanceData ? (
        `Rp. ${(statistics?.unpaid ?? 0).formatCurrency()}`
      ) : (
        <span className="tw-text-xl">***.***</span>
      ),
      color: theme.vars.palette.error.main,
    },
  ]);

  const prefetchStatistics = async () => {
    try {
      const snapshotStatistic = await dashboardRepository.getStatistic({
        year,
        month,
        areaId: selectedAreaId.replace('all', ''),
        packageId: selectedPackageId.replace('all', ''),
      });
      dispatch(setBillingState({ key: 'statistics', value: snapshotStatistic }));
    } catch (error) {
      toast.error(error.message);
    }
  };

  const prefetch = async () => {
    setLoading(true);

    try {
      const payloads = [];
      // dispatch(setBillingState({ key: 'statistics', value: snapshotStatistic }));

      if (packageFilter.length <= 0) {
        const snapshot = await packagePlanRepository.getPackageListSummary();
        payloads.push({ key: 'packageFilter', value: snapshot });

        // dispatch(setBillingState());
      }

      if (oltList.length <= 0) {
        const snapshot = await areaRepository.getOlt();
        payloads.push({ key: 'oltList', value: snapshot });

        // dispatch(setBillingState());
      }

      if (addonsData.length <= 0) {
        const snapshotAddons = await addonsRepository.getAddons({ page: 0, limit: 100 });
        setAddonsStore({ data: snapshotAddons });
      }

      if (allArea.length <= 0) {
        const snapshot = await areaRepository.getAllArea();
        dispatch(setArea(snapshot));
      }

      const snapshot = await subscriptionRepository.getListSubscription({
        status: selectedUserStatus.replace('all', ''),
        areaId: selectedAreaId.replace('all', ''),
        limit,
        month,
        packageId: selectedPackageId.replace('all', ''),
        page,
        paymentStatus: selectedPaymentStatus.toLowerCase().replaceAll(' ', '_'),
        year,
        find: search,
        order,
        orderBy,
        isolated: isolated === 'all' ? undefined : isolated,
        addons: addons.replaceAll('all', ''),
        customerNote,
        availableDebt: filterByTagihan.toString(),
        special: special === true ? 'true' : 'false'
      });
      payloads.push({ key: 'subscription', value: snapshot.customerList });
      payloads.push({ key: 'totalItem', value: snapshot.total });
      dispatch(setBillingStateMulti(payloads));
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const q = query.get('q');
    if (q) {
      setTimeout(() => {
        setSearch(q);
        searchRef.current.value = q;
        searchRef.current.focus();
      }, 300);
    }
  }, []);

  const debouncePrefetch = useDebouncedCallback(() => {
    prefetch();
  }, 500);

  useEffect(() => {
    debouncePrefetch();
  }, [page, order, orderBy]);

  useEffect(() => {
    prefetchStatistics();
  }, [selectedAreaId, selectedPackageId, month, year]);

  useEffect(() => {
    dispatch(setBillingState({ key: 'page', value: 0 }));
    if (page === 0) debouncePrefetch();
  }, [
    limit,
    search,
    selectedAreaId,
    selectedPackageId,
    month,
    year,
    selectedPaymentStatus,
    selectedUserStatus,
    isolated,
    addons,
    customerNote,
    filterByTagihan,
    special
  ]);

  const generateBilling = async () => {
    try {
      await confirm({
        content: `Apakah anda yakin ingin, membuat tagihan untuk user ${selectedSubscription?.fullname}`,
        cancellationText: 'Batal',
        confirmationText: 'Ya',
        confirmationButtonProps: { color: 'primary', variant: 'contained' },
      });

      await subscriptionRepository.generateCustomerBilling({
        customer: selectedSubscription._id,
        month,
        year,
      });

      toast.success('Berhasil membuat tagihan');
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
    }
  };

  const isolate = async () => {
    await processIsolirRef.current.open(selectedSubscription._id);
    prefetch();
    closeOptionBilling();
  };

  const unisolate = async () => {
    await processRemoveIsolirRef.current.open(selectedSubscription._id);
    prefetch();
    closeOptionBilling();
  };

  async function changePlan() {
    await changePlanDialogRef.current.open(selectedSubscription._id);
    prefetch();
    closeOptionBilling();
  }

  const turnOffCustomer = async () => {
    await deactivateDialogRef.current.open(selectedSubscription._id);
    closeOptionBilling();
    prefetch();
  };

  const activateCustomer = async () => {
    await activateDialogRef.current.open(selectedSubscription._id);
    closeOptionBilling();
    prefetch();
  };

  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));

  const excelUrl = useMemo(() => {
    if (selectedAreaId === 'all') {
      return `${EXPORT_EXCEL_URL}?year=${year}&month=${month}`;
    }
    return `${EXPORT_EXCEL_URL}/${selectedAreaId}?year=${year}&month=${month}`;
  });

  async function downloadExcel() {
    loadingDownload.onTrue();
    try {
      const currentArea = oltList.find((o) => o._id === selectedAreaId);
      const response = await axios.get(excelUrl, {
        responseType: 'blob',
        params: {
          year,
          month,
          isolated: isolated.replaceAll('all', ''),
          paymentStatus: selectedPaymentStatus.replaceAll('all', ''),
          customerStatus: selectedUserStatus.replaceAll('all', ''),
          packageId: selectedPackageId.replaceAll('all', ''),
          addons: addons.replaceAll('all', ''),
        },
      });
      const timeFormat = format(new Date(), 'dd-MM-yyyy');
      const periode = month.toIndonesianMonthLong().toUpperCase();
      const periodeText = `${periode} ${year}`;
      let filename = `EXPORT ALL AREA_${timeFormat} - PERIODE ${periodeText}.xlsx`;

      if (!!selectedAreaName) {
        const areaTitle = selectedAreaName.toUpperCase();
        filename = `EXPORT AREA ${areaTitle}_${timeFormat} - PERIODE ${periodeText}.xlsx`;
      }
      download(response.data, filename);
    } catch (error) {
      toast.error(error.message);
    } finally {
      loadingDownload.onFalse();
    }
  }

  /**
   * @param {InvoiceHistory} d
   */
  function showKtp(ktpPath) {
    const imageUrl = ktpPath.replaceAll('/public/uploads/', '');
    viewerImageDialogRef.current.showImage([imageUrl], 'KTP');
  }

  async function filterArea() {
    /**
     * @type {import('@components/billing/areaPickerFilter').AreaPickerFilterResult}
     */
    const result = await areaPickerFilterRef.current.open(selectedAreaId);
    if (!result) return;
    dispatch(setBillingState({ key: 'selectedAreaId', value: result._id }));
    dispatch(setBillingState({ key: 'selectedAreaName', value: result.name }));
  }

  async function editNote(s) {
    await customerNoteFormDialogRef.current.open(s._id);
    prefetch();
  }

  async function removeNote(s) {
    try {
      await confirm({
        title: 'Hapus Catatan',
        description: `Apakah anda ingin menghapus catatan pelanggan ${s.fullname} ?`,
        confirmationText: 'Hapus',
        confirmationButtonProps: { color: 'primary', variant: 'contained' },
        cancellationText: 'Batal',
        cancellationButtonProps: { color: 'error', variant: 'text' },
      });
      await customerRepository.clearNote(s._id);
      prefetch();
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
    }
  }

  function navigateToJobQueue() {
    jobQueueStore.setQueueStore({
      page: 0,
      data: [],
      area: '',
      areaName: 'Semua',
      find: selectedSubscription.customerId ?? selectedSubscription.fullname,
    });
    handleCloseAnchorArea();
    navigate(`/v2/tools?tab=job_queue`);
  }

  function navigateToMikrotikLog() {
    mikrotikLogStore.setArea(null);
    mikrotikLogStore.setPage(0);
    mikrotikLogStore.setData([]);
    mikrotikLogStore.setRemote('');
    mikrotikLogStore.setFind(selectedSubscription.customerId ?? selectedSubscription.fullname);
    handleCloseAnchorArea();
    navigate(`/v2/tools?tab=mikrotik`);
  }

  /**
   * @param {Subscription} c
   */
  async function cancelScheduleBilling(s) {
    try {
      await confirm({
        title: 'Hapus Catatan',
        description: `Apakah anda ingin menghapus schedule isolir ${s.fullname} ?`,
        confirmationText: 'Hapus',
        confirmationButtonProps: { color: 'primary', variant: 'contained' },
        cancellationText: 'Batal',
        cancellationButtonProps: { color: 'error', variant: 'text' },
      });

      const promises = jobQueueRespository.cancelAll(s._id, {
        queueType: 'schedule_isolir_billing',
      });

      toast.promise(promises, {
        loading: 'Menghapus schedule isolir...',
        success: () => {
          prefetch();
          return 'Berhasil menghapus schedule isolir';
        },
        error: (error) =>
          error instanceof Error ? error.message : 'Gagal menghapus schedule isolir',
      });
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
    }
  }

  async function showInvoiceTemp(invoiceTempId) {
    await invoiceTempDetailDialogRef.current.open(invoiceTempId);
    prefetch();
  }

  return (
    <>
      <div className="tw-flex tw-flex-col tw-px-5 tw-w-full tw-mx-auto tw-items-center tw-justify-center">
        {/* Header Page */}
        <div className="tw-flex tw-flex-col lg:tw-flex-row tw-w-full tw-items-center tw-justify-end tw-gap-2 tw-mb-10">
          {/* <Typography variant="h4">Billing</Typography> */}
        </div>
        {/* Dashboard Card */}
        <Grid container className="tw-w-full" spacing={2}>
          {!isMobile &&
            chartAnalytics.map((item, index) => (
              <Grid xs={12} md={6} lg={3} key={index}>
                <InvoiceAnalytic
                  title={item.title}
                  subtitle={item.subtitle}
                  percent={item.percent}
                  price={item.price}
                  icon={item.icon}
                  color={item.color}
                />
              </Grid>
            ))}
        </Grid>

        {/* End Dashboard Card */}
        <TabContext value={selectedTab}>
          {isMobile && (
            <>
              <div className="tw-flex tw-flex-row tw-items-center tw-justify-between tw-w-full">
                <div className="tw-w-full tw-flex tw-justify-end">
                  <TabList onChange={(e, v) => setSelectedTab(v)} className="tw-w-full">
                    {tabsLabel.map((t, i) => (
                      <Tab key={i} value={i.toString()} label={t} />
                    ))}
                  </TabList>
                </div>
                <div className="tw-w-min tw-flex tw-justify-end">
                  <Button onClick={openOption}>
                    <Icon icon="ep:setting" fontSize={20} />
                  </Button>
                </div>
              </div>
              <Menu
                anchorEl={anchorEl}
                open={showOption}
                onClose={closeOption}
                MenuListProps={{
                  'aria-labelledby': 'basic-button',
                }}
              >
                <MenuItem onClick={() => downloadExcel()}>
                  <div className="tw-flex tw-flex-row tw-gap-2 tw-relative">
                    <Overloading loading={loadingDownload.value} />
                    <Icon icon="ri:file-excel-2-line" fontSize={20} className="lg:tw-mr-2" />
                    Export Excel
                  </div>
                </MenuItem>
                <MenuItem>
                  <DatePicker
                    views={['year', 'month']}
                    label="Periode Billing"
                    value={dayjs(`${year}-${month}-01`)}
                    onAccept={(newValue) => {
                      dispatch(
                        setBillingStateMulti([
                          { key: 'year', value: newValue.year() },
                          { key: 'month', value: newValue.month() + 1 },
                        ])
                      );
                      // setValue(newValue);
                    }}
                    slotProps={{ textField: { size: 'small' } }}
                    className="tw-w-full md:tw-w-auto"
                  />
                  {/* <div className="tw-flex tw-flex-row tw-gap-2">
                    <Icon icon="solar:calendar-line-duotone" fontSize={20} className="lg:tw-mr-2" />
                    {month.toIndonesianMonthLong()} {year}
                  </div> */}
                </MenuItem>
              </Menu>
            </>
          )}

          <TabPanel value="0" sx={{ padding: 0 }} className="tw-w-full">
            {/* Filterable Data */}
            <Grid className="tw-w-full tw-pt-10" container spacing={2}>
              {!isMobile && (
                <>
                  <Grid xs={12} md={3} lg={1.5}>
                    <TextField
                      select
                      fullWidth
                      size="small"
                      variant="filled"
                      value={selectedPaymentStatus}
                      label="Pembayaran"
                      SelectProps={{ native: true }}
                      onChange={(e) =>
                        dispatch(
                          setBillingState({ key: 'selectedPaymentStatus', value: e.target.value })
                        )
                      }
                      id="select-payment-status"
                      InputLabelProps={{ htmlFor: `select-payment-status` }}
                      inputProps={{ id: `select-payment-status` }}
                    >
                      <option value="all">Semua</option>
                      {paymentStatusList.map((p, i) => (
                        <option key={i} value={p}>
                          {p}
                        </option>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid xs={12} md={3} lg={1.5}>
                    <TextField
                      select
                      fullWidth
                      size="small"
                      value={selectedUserStatus}
                      label="Status User"
                      variant="filled"
                      SelectProps={{ native: true }}
                      onChange={(e) =>
                        dispatch(
                          setBillingState({ key: 'selectedUserStatus', value: e.target.value })
                        )
                      }
                      id="select-user-status"
                      InputLabelProps={{ htmlFor: `select-user-status` }}
                      inputProps={{ id: `select-user-status` }}
                    >
                      {userStatusList.map((p, i) => (
                        <option key={i} value={p}>
                          {p}
                        </option>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid xs={12} md={3} lg={1.5}>
                    <TextField
                      select
                      fullWidth
                      size="small"
                      value={isolated}
                      label="Status Isolir"
                      variant="filled"
                      SelectProps={{ native: true }}
                      onChange={(e) =>
                        dispatch(setBillingState({ key: 'isolated', value: e.target.value }))
                      }
                    >
                      <option value="all">Semua</option>
                      <option value="true">Isolir</option>
                      <option value="false">Open</option>
                      <option value="schedule">Reschedule</option>
                    </TextField>
                  </Grid>
                  <Grid xs={12} md={3} lg={1.5}>
                    <TextField
                      select
                      fullWidth
                      size="small"
                      variant="filled"
                      value={selectedPackageId}
                      label="Paket"
                      SelectProps={{ native: true }}
                      onChange={(e) =>
                        dispatch(
                          setBillingState({ key: 'selectedPackageId', value: e.target.value })
                        )
                      }
                      id="select-packet"
                      InputLabelProps={{ htmlFor: `select-packet` }}
                      inputProps={{ id: `select-packet` }}
                    >
                      <option value="all">Semua</option>
                      {packageFilter.map((p, i) => (
                        <option key={i} value={p._id}>
                          {p.title}
                        </option>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid xs={12} md={3} lg={2}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Addons"
                      variant="filled"
                      placeholder="Pilih Addons"
                      value={addons}
                      SelectProps={{ native: true }}
                      onChange={(e) =>
                        dispatch(setBillingState({ key: 'addons', value: e.target.value }))
                      }
                      select
                    >
                      <option value="all">Semua</option>
                      {addonsData.map((addon, i) => (
                        <option key={i} value={addon._id}>
                          {addon.variantName}
                        </option>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid xs={12} md={3} lg={2}>
                    <div className="tw-flex tw-flex-row tw-gap-1">
                      <TextField
                        fullWidth
                        size="small"
                        label="Area"
                        variant="filled"
                        placeholder="Cari"
                        value={!!selectedAreaName ? selectedAreaName : 'Cari'}
                        readOnly
                        onClick={() => filterArea()}
                      />
                      {/* {isDesktop && (
                        <Button
                          color="primary"
                          variant="soft"
                          onClick={() => showCustomerSearch.onToggle()}
                        >
                          <Iconify icon="mdi:search" />
                        </Button>
                      )} */}
                    </div>
                  </Grid>
                </>
              )}

              <Grid xs={12} md={3} lg={2} container>
                <Grid xs={isMobile ? 10 : 12}>
                  <TextField
                    fullWidth
                    size="small"
                    variant="filled"
                    label="Cari Pelanggan"
                    defaultValue={search}
                    inputRef={searchRef}
                    InputLabelProps={{ shrink: true }}
                    onChange={(e) => debounceSearch(e.target.value)}
                  />
                  {/* </div> */}
                </Grid>

                {isMobile && (
                  <Grid xs={2}>
                    <Button
                      fullWidth
                      color="primary"
                      variant="outlined"
                      onClick={() => setShowFilterDialog(true)}
                    >
                      <Icon icon="ic:baseline-menu" fontSize={24} />
                    </Button>
                  </Grid>
                )}
              </Grid>
              {isMobile ? null : (
                <Grid xs={12} item>
                  <Stack
                    direction="row"
                    spacing={1}
                    className="tw-justify-between tw-pt-2"
                    alignItems="center"
                  >
                    <div className="md:tw-flex tw-hidden tw-flex-row tw-w-auto tw-items-center tw-justify-between tw-gap-2">
                      <FormControlLabel
                        sx={{ paddingLeft: 2 }}
                        control={
                          <Checkbox
                            checked={customerNote === 'true'}
                            color="primary"
                            onChange={(e) => {
                              const value = e.target.checked ? 'true' : 'all';
                              dispatch(setBillingState({ key: 'customerNote', value }));
                            }}
                          />
                        }
                        label={<span className="tw-text-xs">Filter by Notes</span>}
                      />
                      <FormControlLabel
                        sx={{ paddingLeft: 2 }}
                        control={
                          <Checkbox
                            checked={filterByTagihan}
                            color="primary"
                            onChange={(e) => {
                              dispatch(
                                setBillingState({ key: 'filterByTagihan', value: e.target.checked })
                              );
                            }}
                          />
                        }
                        label={<span className="tw-text-xs">Filter by Unpaid</span>}
                      />
                      <FormControlLabel
                        sx={{ paddingLeft: 2 }}
                        control={
                          <Checkbox
                            checked={special}
                            color="primary"
                            onChange={(e) => {
                              dispatch(
                                setBillingState({ key: 'special', value: e.target.checked })
                              );
                            }}
                          />
                        }
                        label={<span className="tw-text-xs">Spesial</span>}
                      />
                    </div>
                    <div className="lg:tw-flex tw-hidden tw-flex-row tw-w-auto tw-items-center tw-justify-between tw-gap-2">
                      <Tooltip title="Export Resi">
                        <LoadingButton
                          variant="contained"
                          color="success"
                          className="tw-w-full md:tw-w-auto"
                          onClick={() => archiveInvoiceDialogRef.current?.open()}
                        >
                          <Icon icon="stash:invoice-duotone" fontSize={20} className="lg:tw-mr-2" />
                          {/* {!isMobile && 'Export Resi'} */}
                        </LoadingButton>
                      </Tooltip>
                      <Tooltip title="Export Excel">
                        <LoadingButton
                          variant="contained"
                          color="success"
                          loading={loadingDownload.value}
                          className="tw-w-full md:tw-w-auto"
                          onClick={() => downloadExcel()}
                        >
                          <Icon icon="ri:file-excel-2-line" fontSize={20} className="lg:tw-mr-2" />
                          {/* {!isMobile && 'Export Excel'} */}
                        </LoadingButton>
                      </Tooltip>

                      <DatePicker
                        views={['year', 'month']}
                        label="Periode Billing"
                        value={dayjs(`${year}-${month}-01`)}
                        onAccept={(newValue) => {
                          dispatch(
                            setBillingStateMulti([
                              { key: 'year', value: newValue.year() },
                              { key: 'month', value: newValue.month() + 1 },
                            ])
                          );
                          // setValue(newValue);
                        }}
                        slotProps={{ textField: { size: 'small' } }}
                        className="tw-w-full md:tw-w-auto"
                      />
                    </div>
                  </Stack>
                </Grid>
              )}
            </Grid>
            {/* End Filterable Data */}
            <div className="tw-flex tw-flex-col tw-w-full tw-mt-4 tw-gap-2 tw-relative">
              <Overloading loading={loading} />
              {isMobile ? (
                subscription.map((s, i) => (
                  <MobileCard
                    key={i}
                    subscription={s}
                    onShowMenu={(e) => openOptionBilling(e, s)}
                    onPrint={onOpenInvoice}
                    showPrint={false}
                    showKtp={(ktp) => showKtp(ktp)}
                    editNote={() => editNote(s)}
                    onRemoveNote={() => removeNote(s)}
                    onInvoiceTempClick={(value) => showInvoiceTemp(value)}
                    onCancelSystemNote={() => cancelScheduleBilling(s)}
                  />
                ))
              ) : (
                <BillingTable
                  subscription={subscription}
                  onShowMenu={openOptionBilling}
                  onPrint={onOpenInvoice}
                  showPrint={false}
                  showKtp={(ktp) => showKtp(ktp)}
                  onEditNote={(s) => editNote(s)}
                  onRemoveNote={(s) => removeNote(s)}
                  onInvoiceTempClick={(value) => showInvoiceTemp(value)}
                  onCancelSystemNote={(s) => cancelScheduleBilling(s)}
                />
              )}
              <TablePagination
                size="small"
                component="div"
                count={totalItem ?? 0}
                page={page}
                onPageChange={(e, p) => dispatch(setBillingState({ key: 'page', value: p }))}
                rowsPerPage={limit}
                onRowsPerPageChange={(e) =>
                  dispatch(setBillingState({ key: 'limit', value: e.target.value }))
                }
              />
            </div>
          </TabPanel>
          <TabPanel value="1">
            {/* Dashboard Card */}
            <Grid container className="tw-w-full" spacing={2}>
              {chartAnalytics.map((item, index) => (
                <Grid xs={12} md={6} lg={3} key={index}>
                  <InvoiceAnalytic
                    title={item.title}
                    subtitle={item.subtitle}
                    percent={item.percent}
                    price={item.price}
                    icon={item.icon}
                    color={item.color}
                  />
                </Grid>
              ))}
            </Grid>
            {/* End Dashboard Card */}
          </TabPanel>
        </TabContext>
      </div>
      {/* Filter dialog for mobile */}
      <Dialog open={showFilterDialog} onClose={() => setShowFilterDialog(false)}>
        <DialogTitle>Filter Data</DialogTitle>
        <DialogContent>
          <Grid container className="tw-py-2" spacing={2}>
            <>
              <Grid xs={12} md={4} lg={3}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  value={selectedPaymentStatus}
                  label="Status Pembayaran"
                  SelectProps={{ native: true }}
                  onChange={(e) =>
                    dispatch(
                      setBillingState({ key: 'selectedPaymentStatus', value: e.target.value })
                    )
                  }
                  id="select-payment-status"
                  InputLabelProps={{ htmlFor: `select-payment-status` }}
                  inputProps={{ id: `select-payment-status` }}
                >
                  <option value="all">Semua</option>
                  {paymentStatusList.map((p, i) => (
                    <option key={i} value={p}>
                      {p}
                    </option>
                  ))}
                </TextField>
              </Grid>
              <Grid xs={12} md={4} lg={3}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  value={selectedUserStatus}
                  label="Status Pengguna"
                  SelectProps={{ native: true }}
                  onChange={(e) =>
                    dispatch(setBillingState({ key: 'selectedUserStatus', value: e.target.value }))
                  }
                  id="select-user-status"
                  InputLabelProps={{ htmlFor: `select-user-status` }}
                  inputProps={{ id: `select-user-status` }}
                >
                  {userStatusList.map((p, i) => (
                    <option key={i} value={p}>
                      {p}
                    </option>
                  ))}
                </TextField>
              </Grid>
              <Grid xs={12} md={4} lg={3}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  value={isolated}
                  label="Status Isolir"
                  SelectProps={{ native: true }}
                  onChange={(e) =>
                    dispatch(setBillingState({ key: 'isolated', value: e.target.value }))
                  }
                >
                  <option value="all">Semua</option>
                  <option value="true">Isolir</option>
                  <option value="false">Open</option>
                  <option value="schedule">Reschedule</option>
                </TextField>
              </Grid>
              <Grid xs={12} md={4} lg={3}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  value={selectedPackageId}
                  label="Paket"
                  SelectProps={{ native: true }}
                  onChange={(e) =>
                    dispatch(setBillingState({ key: 'selectedPackageId', value: e.target.value }))
                  }
                  id="select-packet"
                  InputLabelProps={{ htmlFor: `select-packet` }}
                  inputProps={{ id: `select-packet` }}
                >
                  <option value="all">Semua</option>
                  {packageFilter.map((p, i) => (
                    <option key={i} value={p._id}>
                      {p.title}
                    </option>
                  ))}
                </TextField>
              </Grid>
              <Grid xs={12} md={4} lg={3}>
                <TextField
                  fullWidth
                  size="small"
                  label="Addons"
                  variant="outlined"
                  placeholder="Pilih Addons"
                  value={addons}
                  onChange={(e) =>
                    dispatch(setBillingState({ key: 'addons', value: e.target.value }))
                  }
                  select
                >
                  <MenuItem value="all">Semua</MenuItem>
                  {addonsData.map((addon, i) => (
                    <MenuItem key={i} value={addon._id}>
                      {addon.variantName}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid xs={12} md={4} lg={3}>
                <TextField
                  fullWidth
                  size="small"
                  label="Area"
                  placeholder=""
                  value={selectedAreaName}
                  SelectProps={{ readOnly: true }}
                  onClick={() => filterArea()}
                />
              </Grid>
              <Grid xs={12}>
                <FormControlLabel
                  sx={{ paddingLeft: 2 }}
                  control={
                    <Checkbox
                      checked={customerNote === 'true'}
                      color="primary"
                      onChange={(e) => {
                        const value = e.target.checked ? 'true' : 'all';
                        dispatch(setBillingState({ key: 'customerNote', value }));
                      }}
                    />
                  }
                  label={<span className="tw-text-xs">Filter by Notes</span>}
                />
              </Grid>
              <Grid xs={12}>
                <FormControlLabel
                  sx={{ paddingLeft: 2 }}
                  control={
                    <Checkbox
                      checked={filterByTagihan}
                      color="primary"
                      onChange={(e) => {
                        dispatch(
                          setBillingState({ key: 'filterByTagihan', value: e.target.checked })
                        );
                      }}
                    />
                  }
                  label={<span className="tw-text-xs">Filter by Unpaid</span>}
                />
              </Grid>
              <Grid xs={12}>
                <FormControlLabel
                  sx={{ paddingLeft: 2 }}
                  control={
                    <Checkbox
                      checked={special}
                      color="primary"
                      onChange={(e) => {
                        dispatch(setBillingState({ key: 'special', value: e.target.checked }));
                      }}
                    />
                  }
                  label={<span className="tw-text-xs">Spesial</span>}
                />
              </Grid>
              <Grid xs={0} md={4} lg={2}>
                <span />
              </Grid>
            </>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button color="error" onClick={() => setShowFilterDialog(false)}>
            Tutup
          </Button>
        </DialogActions>
      </Dialog>
      {/* End Filter dialog for mobile */}
      {/* Menu Billing */}
      <Menu
        anchorEl={anchorElBilling}
        open={showOptionBilling}
        onClose={closeOptionBilling}
        MenuListProps={{
          'aria-labelledby': 'basic-button-billing',
        }}
      >
        <MenuItem
          onClick={() =>
            navigate(
              `/v2/area-configuration?qCustomer=${selectedSubscription.customerId ?? selectedSubscription.fullname}&tab=Pelanggan`
            )
          }
        >
          <div className="tw-flex tw-flex-row tw-gap-2">
            <Icon icon="lets-icons:map-light" fontSize={20} className="lg:tw-mr-2" />
            Area Config
          </div>
        </MenuItem>

        {/* <MenuItem onClick={generateBilling}>
          <div className="tw-flex tw-flex-row tw-gap-2">
            <Icon icon="mingcute:bill-2-line" fontSize={20} className="lg:tw-mr-2" />
            Buat Billing
          </div>
        </MenuItem> */}
        {isAdmin && (
          <MenuItem
            onClick={() => {
              // closeOptionBilling();
              showMessageDialog.onTrue();
            }}
          >
            <div className="tw-flex tw-flex-row tw-gap-2">
              <Icon icon="f7:paperplane" fontSize={20} className="lg:tw-mr-2" />
              Kirim Pesan
            </div>
          </MenuItem>
        )}

        {(isAdmin || isLo) && (
          <MenuItem
            onClick={async () => {
              const result = await paymentDialogRef.current?.open(selectedSubscription?._id);
              closeOptionBilling();
              prefetch();
            }}
          >
            <div className="tw-flex tw-flex-row tw-gap-2">
              <Icon icon="clarity:form-line" fontSize={20} className="lg:tw-mr-2" />
              {isAdmin ? 'Form Pembayaran' : 'Upload Pembayaran'}
            </div>
          </MenuItem>
        )}

        <MenuItem onClick={() => showPaymentHistoryDialog.onTrue()}>
          <div className="tw-flex tw-flex-row tw-gap-2">
            <Icon icon="fluent:clock-bill-16-regular" fontSize={20} className="lg:tw-mr-2" />
            Riwayat Pembayaran
          </div>
        </MenuItem>

        <MenuItem
          onClick={() => {
            billingActionDialogRef.current?.open(selectedSubscription?._id);
            closeOptionBilling();
          }}
        >
          <div className="tw-flex tw-flex-row tw-gap-2">
            <Icon icon="tdesign:user-time" fontSize={20} className="lg:tw-mr-2" />
            Action Log
          </div>
        </MenuItem>

        {(isAdmin || isLo) && (
          <MenuItem onClick={() => changePlan()}>
            <div className="tw-flex tw-flex-row tw-gap-2">
              <Icon
                icon="clarity:network-globe-outline-alerted"
                fontSize={20}
                className="lg:tw-mr-2"
              />
              Perubahan Service
            </div>
          </MenuItem>
        )}

        {isAdmin && (
          <>
            <MenuItem
              onClick={() => {
                closeOptionBilling();
                isolate();
              }}
            >
              <div className="tw-flex tw-flex-row tw-gap-2">
                <Icon icon="material-symbols:block" fontSize={20} className="lg:tw-mr-2" />
                Isolir
              </div>
            </MenuItem>
            <MenuItem
              onClick={() => {
                closeOptionBilling();
                unisolate();
              }}
            >
              <div className="tw-flex tw-flex-row tw-gap-2">
                <Icon icon="gg:unblock" fontSize={20} className="lg:tw-mr-2" />
                Buka Isolir
              </div>
            </MenuItem>
            <MenuItem onClick={() => navigateToMikrotikLog()}>
              <div className="tw-flex tw-flex-row tw-gap-2">
                <Icon icon="cbi:mikrotik" fontSize={20} className="lg:tw-mr-2" />
                Mikrotik Log
              </div>
            </MenuItem>
            <MenuItem onClick={() => navigateToJobQueue()}>
              <div className="tw-flex tw-flex-row tw-gap-2">
                <Icon icon="ix:tasks-open" fontSize={20} className="lg:tw-mr-2" />
                Job Queue
              </div>
            </MenuItem>
            {selectedSubscription?.status === 'inactive' ? (
              <MenuItem onClick={activateCustomer}>
                <div className="tw-flex tw-flex-row tw-gap-2">
                  <Icon icon="mdi:check" fontSize={20} className="lg:tw-mr-2" />
                  Aktivasi
                </div>
              </MenuItem>
            ) : (
              <MenuItem onClick={turnOffCustomer}>
                <div className="tw-flex tw-flex-row tw-gap-2">
                  <Icon icon="mdi:shutdown" fontSize={20} className="lg:tw-mr-2" />
                  Nonaktifkan
                </div>
              </MenuItem>
            )}
          </>
        )}
      </Menu>
      {/* End Meu Billing */}
      {/* Dialog */}
      <SendMessageDialog
        customer={selectedSubscription}
        show={showMessageDialog.value}
        year={year}
        month={month}
        onClose={() => {
          closeOptionBilling();
          showMessageDialog.onFalse();
        }}
      />
      <PaymentFormDialog
        subscription={selectedSubscription}
        show={showPaymentDialog.value}
        onClose={(isPrefetch) => {
          closeOptionBilling();
          onClosePaymentDialog(isPrefetch);
        }}
        submitLabel={isAdmin ? 'Bayar Penuh' : 'Upload Pembayaran'}
      />
      <PaymentHistoryDialog
        show={showPaymentHistoryDialog.value}
        subscription={selectedSubscription}
        onClose={() => {
          closeOptionBilling();
          showPaymentHistoryDialog.onFalse();
          prefetch();
        }}
      />
      <ViewerImageDialog ref={viewerImageDialogRef} />
      <AreaPickerFilter ref={areaPickerFilterRef} />
      <ProcessDialogIsolir ref={processIsolirRef} />
      <ProcessDialogRemoveIsolir ref={processRemoveIsolirRef} />
      <CustomerChangePlanDialog ref={changePlanDialogRef} />
      <CustomerNoteFormDialog ref={customerNoteFormDialogRef} />
      <CustomerDeactivateDialog ref={deactivateDialogRef} />
      <CustomerActivateDialog ref={activateDialogRef} />
      <InvoiceTempDetailDialog ref={invoiceTempDetailDialogRef} />
      <PaymentDialog ref={paymentDialogRef} />
      <BillingActionLogDialog ref={billingActionDialogRef} />
      <ArchiveListDialog ref={archiveInvoiceDialogRef} />
    </>
  );
}

const mapStateToProps = (state) => ({ ...state.billingStore, allArea: state.areaStore.all });

export default connect(mapStateToProps)(Billing);
