/**
 * @typedef {Object} PaymentOrderProps
 * @property {Date} start - The start date for filtering payment orders.
 * @property {Date} until - The end date for filtering payment orders.
 * @property {string} status - The status filter for payment orders.
 * @property {string} search - The search query for payment orders.
 * @property {string} area
 * @property {(value: Date) => void} onChangeStart - Callback to handle changes to the start date.
 * @property {(value: Date) => void} onChangeUntil - Callback to handle changes to the end date.
 * @property {(value: string) => void} onChangeStatus - Callback to handle changes to the status filter.
 * @property {(value: string) => void} onChangeSearch - Callback to handle changes to the search query.
 * @property {() => void} onPickArea - Callback to handle changes to the search query.
 */

import dayjs from 'dayjs';

import { DatePicker } from '@mui/x-date-pickers';
import { MenuItem, TextField } from '@mui/material';

/**
 * @param {PaymentOrderProps} param0
 * @returns
 */
export default function PaymentOrderFilter({
  start = new Date(),
  until = new Date(),
  status = 'pending',
  search = '',
  area = 'semua',
  onChangeStart,
  onChangeUntil,
  onChangeStatus,
  onChangeSearch,
  onPickArea,
}) {
  const statusList = [
    {
      label: 'Pending',
      value: 'pending',
    },
    {
      label: 'Expired',
      value: 'expired',
    },
    {
      label: 'Selesai',
      value: 'success',
    },
  ];

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
          value={status}
          onChange={(e) => onChangeStatus(e.target.value)}
          label="Status"
          variant="outlined"
          size="small"
          select
          fullWidth
        >
          {statusList.map((item) => (
            <MenuItem key={item.value} value={item.value}>
              {item.label}
            </MenuItem>
          ))}
        </TextField>
      </div>
      <div className="tw-w-full lg:tw-w-48">
        <TextField
          value={area}
          label="Area"
          variant="outlined"
          size="small"
          InputProps={{ readOnly: true }}
          onClick={() => onPickArea()}
          fullWidth
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
