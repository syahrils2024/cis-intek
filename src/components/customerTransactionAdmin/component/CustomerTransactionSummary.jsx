import { Stack } from '@mui/material';

const CustomerTransactionSummary = ({ customerData }) => (
  <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-3">
    {customerData.map((item, i) => (
      <Stack key={i}>
        <span className="tw-text-xs">{item.label}</span>
        <span className={`tw-text-xs tw-font-semibold ${item.textColor}`}>
          {item.value}
        </span>
      </Stack>
    ))}
  </div>
);

export default CustomerTransactionSummary;
