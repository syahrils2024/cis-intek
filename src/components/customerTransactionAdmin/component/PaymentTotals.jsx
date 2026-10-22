import { Stack } from '@mui/material';

const PaymentTotals = ({ data }) => (
  <Stack spacing={1}>
    <div className="tw-flex tw-flex-row tw-items-center tw-justify-between">
      <span className="tw-text-xs">Digit Kode Pembayaran</span>
      <span className="tw-text-xs tw-font-semibold">Rp. {data?.suffixDigit?.toString().toNumber().formatCurrency()}</span>
    </div>
    <div className="tw-flex tw-flex-row tw-items-center tw-justify-between">
      <span className="tw-text-xs">Total Pembayaran</span>
      <span className="tw-text-xs tw-font-semibold">Rp. {data?.totalAmount?.toString().toNumber().formatCurrency()}</span>
    </div>
  </Stack>
);

export default PaymentTotals;
