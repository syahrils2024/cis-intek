import dayjs from 'dayjs';
import { Iconify } from '@components/iconify';
import { useBoolean } from '@hooks/use-boolean';
import { useRef, useState, useEffect, forwardRef, useImperativeHandle } from 'react';

import { DatePicker } from '@mui/x-date-pickers';
import {
  Stack,
  Button,
  Dialog,
  useTheme,
  DialogTitle,
  DialogActions,
  DialogContent,
  useMediaQuery,
} from '@mui/material';

const BillingGenerateMonthlyDialog = forwardRef((props, ref) => {
  const [start, setStart] = useState(new Date());
  const [until, setUntil] = useState(new Date());
  const show = useBoolean(false);
  const resolver = useRef();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  function reset() {
    setStart(new Date());
    setUntil(new Date());
  }

  function open() {
    reset();
    show.onTrue();
    return new Promise((resolve) => {
      resolver.current = resolve;
    });
  }

  // generate array of dates between start and until example array [{year: 2025, month: 1}, {year: 2025, month: 2}]
  function generateDateArray(startDate, untilDate) {
    const startD = dayjs(startDate);
    const endDate = dayjs(untilDate);
    const dates = [];
    let currentDate = startD;
    while (currentDate.isBefore(endDate) || currentDate.isSame(endDate, 'month')) {
      dates.push({
        year: currentDate.year(),
        month: currentDate.month() + 1,
      });
      currentDate = currentDate.add(1, 'month');
    }
    return dates;
  }

  function submit() {
    const result = generateDateArray(start, until);
    show.onFalse();
    resolver.current(result);
  }

  function close() {
    show.onFalse();
    resolver.current();
  }

  function validateDate() {
    if (until < start) {
      setUntil(start);
    }
  }

  useEffect(validateDate, [start]);

  useImperativeHandle(ref, () => ({ open, close }));

  return (
    <Dialog open={show.value} fullWidth maxWidth="sm" fullScreen={isMobile}>
      <DialogTitle>Pilih Range</DialogTitle>
      <DialogContent>
        <Stack spacing={2} direction="row" alignItems="center">
          <DatePicker
            views={['year', 'month']}
            value={dayjs(start)}
            slotProps={{ textField: { fullWidth: true } }}
            onChange={(v) => setStart(v.toDate())}
          />
          <Iconify icon="mdi:minus" />
          <DatePicker
            views={['year', 'month']}
            value={dayjs(until)}
            slotProps={{ textField: { fullWidth: true } }}
            onChange={(v) => setUntil(v.toDate())}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => close()} variant="text" color="error">
          Tutup
        </Button>
        <Button onClick={() => submit()} variant="contained" color="primary">
          Generate Billing
        </Button>
      </DialogActions>
    </Dialog>
  );
});

export default BillingGenerateMonthlyDialog;
