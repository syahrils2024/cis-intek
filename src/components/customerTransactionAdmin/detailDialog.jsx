import Overloading from '@components/overloading';
import { forwardRef, useImperativeHandle } from 'react';
import AvailableDepositMethodPicker from '@components/customerTransaction/AvailableDepositMethodPicker';

import { LoadingButton } from '@mui/lab';
import {
  Grid,
  Dialog,
  Button,
  Divider,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';

import PaymentNote from './component/PaymentNote';
import PaymentTotals from './component/PaymentTotals';
import BillingDetails from './component/BillingDetails';
import PaymentEvidence from './component/PaymentEvidence';
import { useDetailDialogState } from './detailDialog.state';
import TransferDestination from './component/TransferDestination';
import CustomerTransactionAdminRejectDialog from './component/rejectDialog';
import CustomerTransactionSummary from './component/CustomerTransactionSummary';
import CustomerTransactionConfirmApproveDialog from './component/ConfirmApprove';

/**
 * @typedef {import('src/repositories/customerTransactionAdmin').CustomerTransactionAdmin} CustomerTransactionAdmin
 * @typedef {import('src/repositories/depositMethod').PaymentMethod} PaymentMethod
 */

const CustomerTransactionAdminDetail = forwardRef((props, ref) => {
  const {
    customerTransactionRejectDialogRef,
    availableDepositMethodPickerRef,
    confirmApproveRef,
    data,
    showDialog,
    isLoading,
    isMobile,
    customerData,
    open,
    overlayLoading,
    close,
    reject,
    approve,
    pickDepositMethod,
    showEvidence,
    evidences,
    displayEvidence,
    selectedImageIndex,
    setSelectedImageIndex,
    pickEvidence,
    evidencePickerRef,
    updateEvidence,
  } = useDetailDialogState();

  useImperativeHandle(ref, () => ({ open }));

  return (
    <Dialog open={showDialog.value} fullWidth maxWidth="md" fullScreen={isMobile}>
      <DialogTitle>Detail Pay Gateway</DialogTitle>
      <DialogContent className="tw-relative">
        <Overloading loading={overlayLoading.value} />
        <Grid className="tw-py-1" container spacing={2}>
          <Grid item xs={12} md={7}>
            <div className="tw-flex tw-flex-col tw-py-2 tw-gap-4 tw-uppercase">
              <CustomerTransactionSummary customerData={customerData} />
              <TransferDestination data={data} pickDepositMethod={pickDepositMethod} />
              <Divider />
              <BillingDetails billings={data?.billings} />
              <Divider />
              <PaymentNote note={data?.note} />
              <PaymentEvidence
                data={data}
                evidences={evidences}
                selectedImageIndex={selectedImageIndex}
                setSelectedImageIndex={setSelectedImageIndex}
                evidencePickerRef={evidencePickerRef}
                pickEvidence={pickEvidence}
                updateEvidence={updateEvidence}
                allowUpdate={data?.status === "verify"}
              />
              <Divider />
              <PaymentTotals data={data} />
            </div>
          </Grid>
          <Grid item xs={12} md={5}>
            {/* Display Evidence */}
            <div id="viewerImage">
              <button
                type="button"
                className="tw-ring-1 tw-ring-gray-500 tw-rounded-lg tw-block tw-w-full"
                onClick={() => showEvidence(displayEvidence)}
              >
                <img
                  src={displayEvidence}
                  alt="Bukti pembayaran"
                  className="tw-w-full tw-h-auto tw-rounded-lg tw-p-1"
                />
              </button>
            </div>

            {/* End Display Evidence */}
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        {!isLoading.value && (
          <Button size="small" color="error" onClick={() => close()}>
            Tutup
          </Button>
        )}

        {['unpaid', 'verify', 'expired'].includes(data?.status) || overlayLoading.value ? (
          <>
            <LoadingButton
              loading={isLoading.value}
              size="small"
              variant="contained"
              color="error"
              onClick={() => reject()}
            >
              Reject
            </LoadingButton>
            <LoadingButton
              loading={isLoading.value}
              size="small"
              variant="contained"
              color="success"
              onClick={() => approve()}
            >
              Approve
            </LoadingButton>
          </>
        ) : null}
      </DialogActions>
      <CustomerTransactionAdminRejectDialog ref={customerTransactionRejectDialogRef} />
      <AvailableDepositMethodPicker ref={availableDepositMethodPickerRef} />
      <CustomerTransactionConfirmApproveDialog ref={confirmApproveRef} />
    </Dialog>
  );
});

export default CustomerTransactionAdminDetail;
