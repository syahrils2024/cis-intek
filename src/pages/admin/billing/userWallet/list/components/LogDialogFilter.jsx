import dayjs from 'dayjs';

import { Stack } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';

/**
 *
 */
export default function UserLogDialogFilter({
  start = new Date(),
  until = new Date(),
  setStart,
  setUntil,
  isMobile = false,
}) {
  return (
    <Stack spacing={2} direction={isMobile ? 'column' : 'row'} alignContent="center" justifyContent="end">
      <div className="tw-w-full md:tw-max-w-48">
        <DatePicker
          label="Mulai"
          value={dayjs(start)}
          onChange={(e) => setStart(e.toDate())}
          slotProps={{
            textField: {
              size: 'small',
              fullWidth: true
            },
          }}
        />
      </div>
      <div className="tw-w-full md:tw-max-w-48">
        <DatePicker
          label="Sampai"
          value={dayjs(until)}
          onChange={(e) => setUntil(e.toDate())}
          slotProps={{
            textField: {
              size: 'small',
              fullWidth: true
            },
          }}
        />
      </div>
    </Stack>
  );
}
