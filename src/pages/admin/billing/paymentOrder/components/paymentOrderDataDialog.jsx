import { forwardRef, useImperativeHandle } from 'react';

import { LoadingButton } from '@mui/lab';
import {
  Box,
  Grid,
  Stack,
  Button,
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent
} from '@mui/material';

import 'src/extension/date';
import 'src/extension/number';
import 'src/extension/string';

import PaymentOrderStatusChip from './paymentOrderStatusChip';
import { usePaymentOrderDataDialogState } from './paymentOrderDataDialog.state';

const PaymentOrderDataDialog = forwardRef((props, ref) => {
  const { open, customerHeaders, orderData, recheckOrderStatus, show, mobile, close, loading } =
    usePaymentOrderDataDialogState();

  useImperativeHandle(ref, () => ({
    open,
    close,
  }));

  return (
    <Dialog open={show.value} fullWidth maxWidth="sm" fullScreen={mobile}>
      <DialogTitle>Detail</DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          <Grid container spacing={2}>
            {customerHeaders.map((item) => (
              <Grid item xs={12} sm={6} key={item.label}>
                <Stack>
                  <span className="tw-text-xs tw-text-gray-500">{item.label}</span>
                  <span className="tw-text-xs tw-font-semibold">{item.value}</span>
                </Stack>
              </Grid>
            ))}
            {orderData ? (
              <>
                <Grid item xs={12} sm={6}>
                  <Stack direction="row" spacing={2}>
                    <img
                      src={orderData?.paymentImageUrl}
                      alt={orderData?.paymentName}
                      className="tw-w-16 tw-object-contain"
                    />
                    <Stack>
                      <span className="tw-text-xs">{orderData?.paymentName}</span>
                      <span className="tw-text-xs">
                        {orderData?.paymentCode} - {orderData?.gateway}
                      </span>
                    </Stack>
                  </Stack>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Stack direction="row" spacing={2}>
                    <Stack>
                      <span className="tw-text-xs">Status</span>
                      <PaymentOrderStatusChip status={orderData?.status} />
                    </Stack>
                  </Stack>
                </Grid>
              </>
            ) : null}
          </Grid>
          <Box className="tw-space-y-2">
            <Box className="tw-flex tw-justify-between">
              <span className="tw-text-gray-600 tw-text-xs">Jumlah:</span>
              <span className="tw-font-medium tw-text-xs">
                Rp. {orderData?.amount.formatCurrency()}
              </span>
            </Box>
            <Box className="tw-flex tw-justify-between">
              <span className="tw-text-gray-600 tw-text-xs">Fee:</span>
              <span className="tw-font-medium tw-text-xs">
                Rp. {Math.ceil(orderData?.fee ?? 0).formatCurrency()}
              </span>
            </Box>
            <Box className="tw-flex tw-justify-between tw-border-t tw-pt-2">
              <span className="tw-font-semibold tw-text-xs">Total:</span>
              <span className="tw-font-semibold tw-text-xs">
                Rp. {Math.ceil((orderData?.amount ?? 0) + (orderData?.fee ?? 0)).formatCurrency()}
              </span>
            </Box>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button color="error" variant="text" onClick={close}>
          Tutup
        </Button>
        <LoadingButton
          loading={loading.value}
          onClick={() => recheckOrderStatus()}
          color="primary"
          variant="soft"
        >
          Check Pembayaran
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
});

export default PaymentOrderDataDialog;
