import dayjs from 'dayjs';
import { Upload } from '@components/upload';
import { Iconify } from '@components/iconify';
import Overloading from '@components/overloading';
import ReasonConfirm from '@components/ReasonConfirm';
import { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';

import { LoadingButton } from '@mui/lab';
import { MobileDateTimePicker } from '@mui/x-date-pickers';
import {
  Grid,
  Stack,
  Button,
  MenuItem,
  useTheme,
  TextField,
  DialogActions,
  DialogContent,
  useMediaQuery,
} from '@mui/material';

import 'src/extension/string';
import 'src/extension/number';

import BillingUpdateForm from '../billingUpdateForm';
import PartiallyPaidForm from '../partiallyPaidForm';
import { usePaymentForm } from '../states/paymentForm';
import { BillingData } from './paymentDialogBillingData';
import BillingGenerateMonthlyDialog from '../GenerateMonthlyDialog';

/**
 * @typedef {import('src/repositories/subscription').Billing} Billing
 */

const PaymentDialogBilling = forwardRef(
  (
    {
      onClose,
      hidden,
      hideAction = false,
      hideCustomerHeader = false,
      hideForm = false,
      onRefresh,
      paddingLessContent = false,
    },
    ref
  ) => {
    const {
      allowAction,
      availableDepositMethod,
      billingAction,
      billingList,
      evidences,
      itemHeader,
      load,
      loading,
      loadingSubmit,
      note,
      paymentDate,
      paymentMethod,
      paymentMethodList,
      reset,
      selectedDepositMethod,
      setNote,
      setPaymentDate,
      setPaymentMethod,
      setSelectedDepositMethod,
      totalAmount,
      totalItem,
      partiallyPaidFormRef,
      onCheckAll,
      checkedAll,
    } = usePaymentForm();

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const billingUpdateFormRef = useRef();
    const billingMonthlyDialogRef = useRef();
    const reasonConfirmRef = useRef();

    function loadData(customer_id) {
      reset();
      load(customer_id);
    }

    async function beforeGenerate() {
      const result = await billingMonthlyDialogRef.current?.open();
      if (!result) return;
      billingAction.generate(result);
    }

    async function handlerCancel(item) {
      const reason = await reasonConfirmRef.current?.open({
        title: 'Alasan Cancel',
        confirmMessage: 'Saya menyetujui cancel tagihan ini',
      });
      if (typeof reason !== 'string') return;
      billingAction.cancel(item, !!reason ? reason : null);
    }

    async function handlerRestore(item) {
      const reason = await reasonConfirmRef.current?.open({
        title: 'Alasan Restore',
        confirmMessage: 'Saya menyetujui Restore tagihan ini',
      });
      if (typeof reason !== 'string') return;
      billingAction.restore(item, !!reason ? reason : null);
    }

    async function handlerRemove(item) {
      const reason = await reasonConfirmRef.current?.open({
        title: 'Alasan Hapus',
        confirmMessage: 'Saya menyetujui Hapus tagihan ini',
      });
      if (typeof reason !== 'string') return;
      billingAction.remove(item, !!reason ? reason : null);
    }

    /** @param {Billing} item */
    async function edit(item) {
      const result = await billingUpdateFormRef.current.open(item._id, {
        amount: item.amount,
        summaryPeriode: item.summaryPeriode,
        services: item.services,
      });
      if (!result) return;
      billingAction.refresh();
    }

    useImperativeHandle(ref, () => ({ loadData }));

    useEffect(() => {
      if (onRefresh) onRefresh();
    }, [billingList]);

    return (
      <>
        <DialogContent hidden={hidden} sx={{ p: paddingLessContent ? 0 : null }}>
          <Stack spacing={2} className="tw-relative tw-py-0.5">
            <Overloading loading={loading.value} />
            {/* Header */}
            {!hideCustomerHeader ? (
              <Grid container spacing={2}>
                {itemHeader.map((item, index) => (
                  <Grid item xs={6} sm={6} md={4} key={index}>
                    <Stack>
                      <span className="tw-text-xs tw-text-gray-500">{item.label}</span>
                      <span className="tw-text-xs tw-font-semibold">{item.value}</span>
                    </Stack>
                  </Grid>
                ))}
              </Grid>
            ) : null}

            {/* End Header */}
            {/* Content */}
            <Stack
              direction="row"
              alignItems="end"
              justifyContent="space-between"
              className="tw-mt-2"
            >
              <span className="tw-text-xs tw-text-gray-500">Item Pembayaran</span>
              <Button
                sx={{ display: hideAction ? 'none' : 'inline-flex' }}
                size="small"
                color="primary"
                variant="soft"
                onClick={() => beforeGenerate()}
              >
                Generate Billing
              </Button>
            </Stack>
            <Stack spacing={1}>
              {isMobile ? (
                <BillingData.Mobile
                  items={billingList}
                  onRestore={(item) => handlerRestore(item)}
                  onCancel={(item) => handlerCancel(item)}
                  onOpen={(item) => billingAction.open(item)}
                  onToggleChecked={(item) => billingAction.toggle(item)}
                  onEdit={(item) => edit(item)}
                  onRemove={(item) => handlerRemove(item)}
                />
              ) : (
                <BillingData.Table
                  items={billingList}
                  onRestore={(item) => handlerRestore(item)}
                  onCancel={(item) => handlerCancel(item)}
                  onOpen={(item) => billingAction.open(item)}
                  onToggleChecked={(item) => billingAction.toggle(item)}
                  onEdit={(item) => edit(item)}
                  onCheckAll={onCheckAll}
                  checkedAll={checkedAll}
                  onRemove={(item) => handlerRemove(item)}
                />
              )}
            </Stack>

            {/* End Content */}
            {/* Form */}
            <Stack
              direction="row"
              alignItems="end"
              justifyContent="space-between"
              className="tw-mt-2"
              sx={{ display: hideForm ? 'none' : 'flex' }}
            >
              <span className="tw-text-xs tw-text-gray-500">Keterangan</span>
            </Stack>
            <Grid sx={{ display: hideForm ? 'none' : 'flex' }} container spacing={2}>
              <Grid item xs={12} md={4}>
                <TextField
                  label="Metode Pembayaran"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  select
                  fullWidth
                  size="small"
                >
                  {paymentMethodList.map((item, i) => (
                    <MenuItem key={i} value={item.value}>
                      {item.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label="Metode Deposit"
                  value={selectedDepositMethod}
                  select
                  fullWidth
                  size="small"
                  onChange={(e) => setSelectedDepositMethod(e.target.value)}
                >
                  {availableDepositMethod.map((item, i) => (
                    <MenuItem key={i} value={item._id}>
                      {item.title}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={4}>
                <MobileDateTimePicker
                  label="Tanggal Pembayaran"
                  value={dayjs(paymentDate)}
                  onChange={(newValue) => setPaymentDate(newValue.toDate())}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: 'small',
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Catatan"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  fullWidth
                  size="small"
                  minRows={3}
                  maxRows={3}
                  multiline
                />
              </Grid>
              <Grid item xs={12}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <Upload accept="image/*" onDrop={(files) => evidences.add(files[0])} />
                  </Grid>
                  {evidences.previews.map((t, i) => (
                    <Grid key={i} item xs={12} md={4}>
                      <div className="tw-relative">
                        <button
                          type="button"
                          className="tw-absolute tw-top-3 tw-right-1 tw-bg-white/80 tw-rounded-full tw-w-7 tw-h-7 tw-flex tw-items-center tw-justify-center"
                          onClick={() => evidences.remove(i)}
                        >
                          <Iconify icon="mdi:close" />
                        </button>
                        <img
                          src={t}
                          className="tw-w-full tw-aspect-video tw-rounded-lg  tw-object-contain tw-object-center"
                          alt="Thumbnail"
                        />
                      </div>
                    </Grid>
                  ))}
                </Grid>
              </Grid>
            </Grid>
            {/* End Form */}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ display: hidden || hideAction ? 'none' : 'flex' }} hidden={hidden}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            className="tw-w-full"
            spacing={1}
          >
            <div className="tw-flex tw-flex-col">
              <span className="tw-text-xs">{totalItem} Item</span>
              <span className="tw-text-sm tw-font-semibold">
                Rp. {totalAmount.toString().toNumber().formatCurrency()}
              </span>
            </div>
            <Stack direction="row" alignItems="center" spacing={1}>
              {onClose ? (
                <Button color="error" variant="text" onClick={() => onClose()}>
                  Tutup
                </Button>
              ) : null}
              <LoadingButton
                variant="outlined"
                color="success"
                loading={loadingSubmit.value || loading.value}
                onClick={() => billingAction.submitPartiallyPayment()}
                size={isMobile ? 'small' : 'medium'}
                disabled={totalItem <= 0}
              >
                Bayar Partially
              </LoadingButton>
              <LoadingButton
                variant="contained"
                color="success"
                loading={loadingSubmit.value || loading.value}
                onClick={() => billingAction.submitPayment()}
                size={isMobile ? 'small' : 'medium'}
                disabled={totalItem <= 0}
              >
                Bayar Penuh
              </LoadingButton>
            </Stack>
          </Stack>
        </DialogActions>
        {/* Action Component */}
        <BillingUpdateForm ref={billingUpdateFormRef} />
        <PartiallyPaidForm ref={partiallyPaidFormRef} />
        <BillingGenerateMonthlyDialog ref={billingMonthlyDialogRef} />
        <ReasonConfirm ref={reasonConfirmRef} />
        {/* End Action Component */}
      </>
    );
  }
);

export default PaymentDialogBilling;
