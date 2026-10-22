import { Stack } from '@mui/material';

const BillingDetails = ({ billings = [] }) => (
  <Stack spacing={1}>
    <span className="tw-text-xs">Detail Pembayaran</span>
    {billings.map((billing, i) => (
      <div key={i} className="tw-flex tw-flex-row tw-p-3 tw-ring-1 tw-ring-gray-300 tw-rounded-lg tw-w-full tw-items-center tw-justify-between">
        <Stack>
          <span className="tw-text-xs tw-font-semibold">{billing.services.join(',')}</span>
          <span className="tw-text-xs">{billing.summaryPeriode}</span>
          <span className="tw-text-xs">{billing.month} / {billing.year}</span>
        </Stack>
        <span className="tw-text-xs tw-font-semibold">
          Rp. {billing.amount?.toString().toNumber().formatCurrency()}
        </span>
      </div>
    ))}
  </Stack>
);

export default BillingDetails;
