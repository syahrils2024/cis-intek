// @ts-nocheck

import dayjs from 'dayjs';

import { DatePicker } from '@mui/x-date-pickers';

const MIN_DATE = dayjs('2019-01-01');

export default function DashboardFilter({ value, onChange }) {
  return (
    <div className="tw-flex tw-flex-row tw-items-center tw-justify-end tw-w-full">
      <DatePicker
        views={['month', 'year']}
        openTo="month"
        label="Tanggal"
        minDate={MIN_DATE}
        maxDate={dayjs()}
        value={dayjs(value)}
        onChange={(newValue) => {
          if (!newValue) return;
          onChange(newValue.toDate());
        }}
        slotProps={{ textField: { size: 'small' } }}
        className="tw-w-full md:tw-w-auto"
      />
    </div>
  );
}
