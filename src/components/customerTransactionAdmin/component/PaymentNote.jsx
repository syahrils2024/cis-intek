import { Stack } from '@mui/material';

const PaymentNote = ({ note }) => (
  <Stack spacing={1}>
    <span className="tw-text-xs">Catatan Pembayaran</span>
    <div className="tw-bg-warning/10 tw-ring-warning tw-ring-1 tw-p-3 tw-rounded-md tw-text-center">
      <span className="tw-text-xs">{note || 'Tidak Ada Catatan Pembayaran'}</span>
    </div>
  </Stack>
);

export default PaymentNote;
