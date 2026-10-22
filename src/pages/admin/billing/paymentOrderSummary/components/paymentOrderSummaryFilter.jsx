import dayjs from 'dayjs';

import { TextField } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';

export default function PaymentOrderSummaryFilter({
  start = new Date(),
  until = new Date(),
  search = '',
  onChangeSearch,
  onChangeStart,
  onChangeUntil,
}) {
  return (
    <div className="tw-flex tw-flex-col lg:tw-flex-row tw-items-center tw-justify-end tw-gap-4 tw-w-full">
      <div className="tw-w-full lg:tw-w-48">
        <DatePicker
          value={dayjs(start)}
          onChange={(e) => onChangeStart(e.toDate())}
          label="Mulai"
          slotProps={{ textField: { size: 'small', fullWidth: true } }}
        />
      </div>
      <div className="tw-w-full lg:tw-w-48">
        <DatePicker
          value={dayjs(until)}
          onChange={(e) => onChangeUntil(e.toDate())}
          label="Sampai"
          slotProps={{ textField: { size: 'small', fullWidth: true } }}
        />
      </div>
      <div className="tw-w-full lg:tw-w-48">
        <TextField
          value={search}
          onChange={(e) => onChangeSearch(e.target.value)}
          label="Cari"
          variant="outlined"
          size="small"
          fullWidth
        />
      </div>
    </div>
  );
}
