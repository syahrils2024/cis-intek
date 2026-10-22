import Overloading from '@components/overloading';
import { useRef, forwardRef, useImperativeHandle } from 'react';
import { ViewerImageDialog } from '@components/viewerImageDialog';

import {
  Stack,
  Button,
  useTheme,
  DialogContent,
  useMediaQuery,
  DialogActions,
} from '@mui/material';

import { PaymentHistoryData } from './paymentHistoryData';
import { useHistoryPaymentState } from '../states/historyPayment';

const PaymentDialogHistory = forwardRef(({ onClose, hidden }, ref) => {
  const viewerImageDialogRef = useRef();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { allowCancel, histories, load, loading, onPrint, removeInvoice, reset } =
    useHistoryPaymentState();

  function loadData(customer_id) {
    reset();
    load(customer_id);
  }

  useImperativeHandle(ref, () => ({ loadData }));

  function showEvidence(d) {
    const imageUrl = d.paymentEvidences.map((e) => e.replaceAll('/public/uploads/', ''));
    viewerImageDialogRef.current.showImage(imageUrl, 'Resi');
  }

  return (
    <>
      <DialogContent hidden={hidden}>
        <Stack spacing={0.5} className="tw-relative">
          <Overloading loading={loading.value} />
          {isMobile ? (
            <PaymentHistoryData.Mobile
              items={histories}
              onCancel={removeInvoice}
              onPrint={onPrint}
              allowAction={allowCancel}
              onShowEvidence={(item) => showEvidence(item)}
            />
          ) : (
            <PaymentHistoryData.Table
              items={histories}
              onCancel={removeInvoice}
              onPrint={onPrint}
              allowAction={allowCancel}
              onShowEvidence={(item) => showEvidence(item)}
            />
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ display: hidden ? 'none' : 'flex' }} hidden={hidden}>
        <Button variant="text" color="error" onClick={() => onClose()}>
          Tutup
        </Button>
      </DialogActions>
      <ViewerImageDialog ref={viewerImageDialogRef} />
    </>
  );
});

export default PaymentDialogHistory;
