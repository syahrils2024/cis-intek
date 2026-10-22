/**
 * @typedef {import("@/stores/billingStore").BillingStore} BillingStore
 * @typedef {import('src/stores/billingStore').Subscription} Subscription
 */
import dayjs from 'dayjs';
import { toast } from 'sonner';
import { Icon } from '@iconify/react';
import { useState, useEffect } from 'react';
import { useBoolean } from '@hooks/use-boolean';
import { useConfirm } from 'material-ui-confirm';
import { connect, useDispatch } from 'react-redux';
import { useDebouncedCallback } from 'use-debounce';
import { PaymentFormDialog } from '@components/billing/paymentForm';
import SendMessageDialog from '@components/billing/sendMessageDialog';
import { PaymentHistoryDialog } from '@components/billing/paymentHistoryDialog';

import Grid from '@mui/material/Unstable_Grid2';
import { TabPanel, TabContext } from '@mui/lab';
import { DatePicker } from '@mui/x-date-pickers';
import {
  Menu,
  Button,
  Dialog,
  useTheme,
  MenuItem,
  TextField,
  Typography,
  DialogTitle,
  useMediaQuery,
  DialogContent,
  DialogActions,
  TablePagination,
} from '@mui/material';

import 'src/extension/number';
import { setBillingState, setBillingStateMulti } from 'src/stores/billingStore';
import { areaRepository, packagePlanRepository, subscriptionRepository } from 'src/repositories';

import Overloading from 'src/components/overloading';
import BillingTable from 'src/components/billing/table';
import MobileCard from 'src/components/billing/mobileCard';

const INVOICE_URL = import.meta.env.VITE_INVOICE_URL;

/**
 *
 * @param {BillingStore} props -- react props
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
}) {
  const dispatch = useDispatch();
  const confirm = useConfirm();
  const header = ['Pelanggan', 'Paket', 'Keterangan', 'Action'];
  const paymentStatusList = ['paid', 'unpaid', 'partially paid'];
  const userStatusList = ['active', 'inactive', 'banned'];
  const [search, setSearch] = useState('');
  const tabsLabel = ['Daftar Pelanggan'];
  const [selectedTab, setSelectedTab] = useState('0');
  const [loading, setLoading] = useState(true);
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const showPaymentDialog = useBoolean(false);
  const showPaymentHistoryDialog = useBoolean(false);

  const debounceSearch = useDebouncedCallback((value) => {
    setSearch(value);
  }, 700);

  /** @type {[Subscription, void]} */
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const showMessageDialog = useBoolean(false);

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

  const theme = useTheme();

  const prefetch = async () => {
    setLoading(true);

    try {
      const payloads = [];

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
      });
      payloads.push({ key: 'subscription', value: snapshot.customerList });
      payloads.push({ key: 'totalItem', value: snapshot.total });
      dispatch(setBillingStateMulti(payloads));
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }

    // dispatch(setBillingState({ key: 'subscription', value: snapshot.customerList }));
    // dispatch(setBillingState({ key: 'totalItem', value: snapshot.total }));
    // setLoading(false);
  };

  useEffect(() => {
    prefetch();
  }, [
    page,
    limit,
    selectedAreaId,
    selectedPackageId,
    month,
    year,
    selectedPaymentStatus,
    selectedUserStatus,
    search,
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

  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  return (
    <>
      <div className="tw-flex tw-flex-col tw-px-5 tw-w-full tw-mx-auto tw-items-center tw-justify-center">
        {/* Header Page */}
        <div className="tw-flex tw-flex-col lg:tw-flex-row tw-w-full tw-items-center tw-justify-between tw-gap-2 tw-mb-10">
          <div className="tw-flex tw-flex-row tw-w-full tw-items-center tw-justify-between tw-gap-2">
            <Typography variant="h4">Daftar Pelanggan</Typography>
          </div>
          <div className="lg:tw-flex tw-hidden tw-flex-row tw-w-auto tw-items-center tw-justify-between tw-gap-2">
            <DatePicker
              views={['year', 'month']}
              label="Tanggal"
              maxDate={dayjs().year(new Date().getFullYear())}
              value={dayjs(`${year}-${month}-01`)}
              onAccept={(newValue) => {
                dispatch(
                  setBillingStateMulti([
                    { key: 'year', value: newValue.year() },
                    { key: 'month', value: newValue.month() },
                  ])
                );
                // setValue(newValue);
              }}
              slotProps={{ textField: { size: 'small' } }}
              className="tw-w-full md:tw-w-auto"
            />
          </div>
        </div>
        <TabContext value={selectedTab}>
          {isMobile && (
            <Menu
              anchorEl={anchorEl}
              open={showOption}
              onClose={closeOption}
              MenuListProps={{
                'aria-labelledby': 'basic-button',
              }}
            >
              <MenuItem>
                <DatePicker
                  views={['year', 'month']}
                  label="Tanggal"
                  maxDate={dayjs(new Date())}
                  value={dayjs(`${year}-${month}-01`)}
                  onAccept={(newValue) => {
                    dispatch(
                      setBillingStateMulti([
                        { key: 'year', value: newValue.year() },
                        { key: 'month', value: newValue.month() },
                      ])
                    );
                    // setValue(newValue);
                  }}
                  slotProps={{
                    textField: { size: 'small' },
                  }}
                  className="tw-w-full md:tw-w-auto"
                />
                {/* <div className="tw-flex tw-flex-row tw-gap-2">
                    <Icon icon="solar:calendar-line-duotone" fontSize={20} className="lg:tw-mr-2" />
                    {month.toIndonesianMonthLong()} {year}
                  </div> */}
              </MenuItem>
            </Menu>
          )}

          <TabPanel value="0" sx={{ padding: 0 }} className="tw-w-full">
            {/* Filterable Data */}
            <Grid className="tw-w-full" container spacing={2}>
              {!isMobile && (
                <>
                  <Grid xs={12} md={4} lg={2}>
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
                  <Grid xs={12} md={4} lg={2}>
                    <TextField
                      select
                      fullWidth
                      size="small"
                      value={selectedUserStatus}
                      label="Status Pengguna"
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
                  <Grid xs={12} md={4} lg={2}>
                    <TextField
                      select
                      fullWidth
                      size="small"
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
                  <Grid xs={12} md={4} lg={2}>
                    <TextField
                      select
                      fullWidth
                      size="small"
                      label="Area"
                      placeholder=""
                      value={selectedAreaId}
                      SelectProps={{ native: true }}
                      onChange={(e) =>
                        dispatch(setBillingState({ key: 'selectedAreaId', value: e.target.value }))
                      }
                    >
                      <option value="all">Semua</option>
                      {oltList.map((o, i) => (
                        <option key={i} value={o._id}>
                          {o.title}
                        </option>
                      ))}
                    </TextField>
                  </Grid>
                </>
              )}

              <Grid xs={12} md={4} lg={2} container>
                <Grid xs={isMobile ? 10 : 12}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Cari Pelanggan"
                    defaultValue={search}
                    onChange={(e) => debounceSearch(e.target.value)}
                  />
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
                  />
                ))
              ) : (
                <BillingTable
                  headers={header}
                  subscription={subscription}
                  onShowMenu={openOptionBilling}
                  onPrint={onOpenInvoice}
                  showPrint={false}
                />
              )}
              <TablePagination
                size="small"
                component="div"
                count={totalItem}
                page={page}
                onPageChange={(e, p) => dispatch(setBillingState({ key: 'page', value: p }))}
                rowsPerPage={limit}
                onRowsPerPageChange={(e) =>
                  dispatch(setBillingState({ key: 'limit', value: e.target.value }))
                }
              />
            </div>
          </TabPanel>
        </TabContext>
      </div>
      {/* Filter dialog for mobile */}
      <Dialog open={showFilterDialog} onClose={() => setShowFilterDialog(false)}>
        <DialogTitle>Filter Data</DialogTitle>
        <DialogContent>
          <Grid container className="tw-py-2" spacing={2}>
            <>
              <Grid xs={12} md={4} lg={2}>
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
              <Grid xs={12} md={4} lg={2}>
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
              <Grid xs={12} md={4} lg={2}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Area"
                  placeholder=""
                  value={selectedAreaId}
                  SelectProps={{ native: true }}
                  onChange={(e) =>
                    dispatch(setBillingState({ key: 'selectedAreaId', value: e.target.value }))
                  }
                >
                  <option value="all">Semua</option>
                  {oltList.map((o, i) => (
                    <option key={i} value={o._id}>
                      {o.title}
                    </option>
                  ))}
                </TextField>
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
        <MenuItem onClick={() => showPaymentDialog.onTrue()}>
          <div className="tw-flex tw-flex-row tw-gap-2">
            <Icon icon="clarity:form-line" fontSize={20} className="lg:tw-mr-2" />
            Form Pembayaran
          </div>
        </MenuItem>
      </Menu>
      {/* End Meu Billing */}
      {/* Dialog */}
      <SendMessageDialog
        customer={selectedSubscription}
        show={showMessageDialog.value}
        onClose={() => showMessageDialog.onFalse()}
      />
      <PaymentFormDialog
        subscription={selectedSubscription}
        show={showPaymentDialog.value}
        onClose={onClosePaymentDialog}
        submitLabel="Upload Pembayaran"
      />
      <PaymentHistoryDialog
        show={showPaymentHistoryDialog.value}
        subscription={selectedSubscription}
        onClose={() => showPaymentHistoryDialog.onFalse()}
      />
    </>
  );
}

const mapStateToProps = (state) => state.billingStore;

export default connect(mapStateToProps)(Billing);
