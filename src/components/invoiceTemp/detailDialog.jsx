import Overloading from '@components/overloading';
import { forwardRef, useImperativeHandle } from 'react';
import { ViewerImageDialog } from '@components/viewerImageDialog';

import { LoadingButton } from '@mui/lab';
import Grid from '@mui/material/Unstable_Grid2';
import {
  Stack,
  Button,
  Dialog,
  Divider,
  MenuItem,
  TextField,
  DialogTitle,
  DialogActions,
  DialogContent,
} from '@mui/material';

import 'src/extension/date';
import 'src/extension/number';
import 'src/extension/string';

import RejectDialog from './rejectDialog';
import { UserWalletSelect } from './UserWalletSelect';
import { useInvoiceTempDialogState } from './detailDialog.state';

const InvoiceTempDetailDialog = forwardRef((props, ref) => {
  const { state, handlers } = useInvoiceTempDialogState();
  const {
    paymentMethodStore,
    isMobile,
    show,
    loading,
    loadingData,
    depositMethod,
    note,
    data,
    isAdmin,
    rejectDialogRef,
    viewerImageRef,
  } = state;
  const { open, close, onApprove, onReject, setDepositMethod, setNote } = handlers;

  useImperativeHandle(ref, () => ({ open }), [open]);

  return (
    <Dialog open={show} maxWidth="sm" fullScreen={isMobile}>
      <DialogTitle>Detail Pembayaran</DialogTitle>
      <DialogContent className="tw-bg-slate-100">
        <div className="tw-flex tw-flex-col tw-gap-3 tw-w-full tw-py-2 tw-relative">
          <Overloading loading={loadingData} />
          <Grid container spacing={2}>
            {/* Customer Identity */}
            <Grid xs={6} sm={6}>
              <Stack>
                <span className="tw-text-gray-400 tw-text-xs">Nama Pelanggaan</span>
                <span className="tw-text-xs tw-font-medium">{data?.customerData.fullname}</span>
              </Stack>
            </Grid>
            <Grid xs={6} sm={6}>
              <Stack>
                <span className="tw-text-gray-400 tw-text-xs">Nomor Telepon</span>
                <span className="tw-text-xs tw-font-medium">{data?.customerData.phone}</span>
              </Stack>
            </Grid>
            <Grid xs={6} sm={6}>
              <Stack>
                <span className="tw-text-gray-400 tw-text-xs">Alamat</span>
                <span className="tw-text-xs tw-font-medium">{data?.customerData.address}</span>
              </Stack>
            </Grid>
            <Grid xs={6} sm={6}>
              <Stack>
                <span className="tw-text-gray-400 tw-text-xs">Tanggal</span>
                <span className="tw-text-xs tw-font-medium">
                  {data?.date?.toDate().formatDateTime() ?? ''}
                </span>
              </Stack>
            </Grid>
            <Grid xs={6} sm={6}>
              <Stack>
                <span className="tw-text-gray-400 tw-text-xs">Pengajuan Oleh</span>
                <span className="tw-text-xs tw-font-medium">{data?.createdUserFullname}</span>
              </Stack>
            </Grid>
            <Grid xs={6} sm={6}>
              <Stack>
                <span className="tw-text-gray-400 tw-text-xs">POP /Area</span>
                <span className="tw-text-xs tw-font-medium">{data?.areaTitle}</span>
              </Stack>
            </Grid>
          </Grid>
          <Divider />
          {/* Reject Reason */}
          {data?.rejectReason && (
            <Stack>
              <span className="tw-text-gray-400 tw-text-xs">Alasan Ditolak</span>
              <span className="tw-text-xs tw-font-medium tw-text-red-500">
                {data?.rejectReason}
              </span>
            </Stack>
          )}

          <Divider />
          {/* Items Pembayaran */}
          {data?.items.map((item, i) => (
            <div
              key={i}
              className="tw-flex tw-flex-row tw-items-center tw-w-full tw-gap-3 tw-px-5 tw-py-3 tw-ring-1 tw-ring-gray-300 tw-rounded-lg  hover:tw-ring-primary tw-duration-300 tw-bg-white tw-justify-between"
            >
              <div className="tw-flex tw-flex-col tw-w-auto">
                <span className="tw-text-xs tw-font-medium">
                  {item.year && item.month
                    ? new Date(item.year, item.month - 1).format('MMM yyyy')
                    : '-'}
                </span>
                <span className="tw-text-xs tw-font-medium">{item.services.join(', ')}</span>
                <span className="tw-text-xs tw-font-medium">{item.summaryPeriode}</span>
              </div>

              <span className="tw-text-xs tw-font-medium tw-whitespace-nowrap">
                Rp. {item.amount.formatCurrency()}
              </span>
            </div>
          ))}
          <Divider />
          {/* Deposit Method */}
          <TextField
            label="Metode Pembayaran"
            value={depositMethod}
            className="tw-bg-white"
            select
            size="small"
            InputProps={{ readOnly: data?.status !== 'pending' }}
            onChange={(e) => setDepositMethod(e.target.value)}
          >
            {paymentMethodStore.cash.map((item) => (
              <MenuItem value={item._id} key={item._id}>
                Cash - {item.title}
              </MenuItem>
            ))}
            {paymentMethodStore.transfer.map((item) => (
              <MenuItem value={item._id} key={item._id}>
                Transfer - {item.title}
              </MenuItem>
            ))}
            {paymentMethodStore.ewallet.map((item) => (
              <MenuItem value={item._id} key={item._id}>
                Ewallet - {item.title}
              </MenuItem>
            ))}
          </TextField>
          {/* End Deposit Method */}
          {/* User Wallet Select */}
          {state.showUserWallet ? (
            <UserWalletSelect
              value={state.addBalanceToWallet}
              onChange={handlers.setAddBalanceToWallet}
              label="Kas Tujuan"
            />
          ) : null}
          <Divider />
          {/* Catatan Pembayaran */}
          <TextField
            label="Catatan Pembayaran"
            value={note}
            className="tw-bg-white"
            onChange={(e) => setNote(e.target.value)}
            InputLabelProps={{ shrink: true }}
            InputProps={{ readOnly: data?.status !== 'pending' }}
            multiline
            rows={3}
          />
          {/* <div className="tw-flex tw-flex-col tw-bg-white tw-p-3 tw-ring-1 tw-ring-gray-300 tw-rounded-md">
            <span className="tw-text-gray-500 tw-text-xs">Catatan Pembayaran</span>
            {!!data?.note ? (
              <span className="tw-font-bold tw-text-xs  tw-text-left">{data.note}</span>
            ) : (
              <span className="tw-font-bold tw-text-xs tw-text-gray-400 tw-text-center">
                Tidak Ada catatan pembayaran
              </span>
            )}
          </div> */}

          <Divider />
          {/* Bukti Pembayaran */}
          <div className="tw-flex tw-flex-col">
            <span className="tw-text-gray-500 tw-text-xs">Bukti Pembayaran</span>
            {data?.paymentEvidences.length >= 1 ? (
              <Grid container className="w-full">
                {data?.paymentEvidences.map((image, i) => (
                  <Grid xs={4} md={2} key={i}>
                    <button
                      type="button"
                      onClick={() => {
                        viewerImageRef.current.showImage([image], 'Detail Foto');
                      }}
                    >
                      <img
                        src={`/public/uploads/${image}`}
                        alt={image}
                        className="tw-w-full tw-aspect-square tw-rounded-md tw-object-cover tw-object-center"
                      />
                    </button>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <span className="tw-font-bold tw-text-xs tw-text-gray-400 tw-text-center">
                Tidak Ada bukti pembayaran
              </span>
            )}
          </div>

          <Divider />
          {/* Total Pembayarn */}
          <div className="tw-flex tw-flex-row tw-items-center tw-justify-between">
            <span className="tw-text-gray-500 tw-text-xs">Total Pembayaran</span>
            <span className="tw-text-xs tw-font-medium">Rp. {data?.amount.formatCurrency()}</span>
          </div>
        </div>
      </DialogContent>
      <DialogActions>
        <div className="tw-flex-col md:tw-flex-row tw-flex tw-w-full tw-items-center tw-justify-between">
          <Stack justifyContent="end" className="tw-w-full" direction="row" spacing={2}>
            <Button color="error" variant="text" onClick={() => close(false)}>
              Tutup
            </Button>
            {data?.status === 'pending' && isAdmin ? (
              <>
                <LoadingButton
                  loading={loading}
                  color="error"
                  variant="contained"
                  onClick={() => onReject()}
                >
                  Reject
                </LoadingButton>
                <LoadingButton
                  loading={loading}
                  color="success"
                  variant="contained"
                  onClick={() => onApprove()}
                >
                  Approve
                </LoadingButton>
              </>
            ) : null}
          </Stack>
        </div>
      </DialogActions>
      <RejectDialog ref={rejectDialogRef} />
      <ViewerImageDialog ref={viewerImageRef} />
    </Dialog>
  );
});

export default InvoiceTempDetailDialog;
