import dayjs from 'dayjs';
import { Chart } from '@components/chart';
import Overloading from '@components/overloading';
import { forwardRef, useImperativeHandle } from 'react';

import { DatePicker } from '@mui/x-date-pickers';
import {
  Grid,
  Stack,
  Button,
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
} from '@mui/material';

import { useOnuChartState } from './onuChart.state';

const OnuChart = forwardRef((props, ref) => {
  const { method, state } = useOnuChartState();

  useImperativeHandle(ref, () => ({ open: method.open }));

  return (
    <Dialog open={state.openDialog.value} fullWidth maxWidth="md" fullScreen={state.mobile}>
      <DialogTitle>RX History</DialogTitle>
      <DialogContent>
        <Stack className="tw-relative">
          <Overloading loading={state.loading.value} />
          <Grid container spacing={2}>
            {state.customerData.map((item, i) => (
              <Grid item xs={12} md={4} key={i}>
                <Stack>
                  <span className="tw-text-xs tw-text-gray-500">{item.label}</span>
                  <span className="tw-text-xs tw-font-medium">{item.value}</span>
                </Stack>
              </Grid>
            ))}
          </Grid>
          {/* Filter Date */}
          <Stack
            direction={state.mobile ? 'column' : 'row'}
            className="tw-mt-6 tw-w-full"
            spacing={2}
            alignItems="end"
            justifyContent="end"
          >
            <DatePicker
              label="Mulai"
              value={dayjs(state.start)}
              onChange={(e) => method.setStart(e.toDate())}
              slotProps={{ textField: { size: 'small', fullWidth: state.mobile } }}
            />
            <DatePicker
              label="Sampai"
              value={dayjs(state.end)}
              onChange={(e) => method.setEnd(e.toDate())}
              slotProps={{ textField: { size: 'small', fullWidth: state.mobile } }}
            />
          </Stack>
          {/* End Filter Date */}
          <Chart
            type="bar"
            series={state.chartData.series}
            options={{
              ...state.chartOptions,
              xaxis: {
                categories: state.chartData.categories,
              },
            }}
            height={364}
            sx={{ py: 2.5, pl: 1, pr: 2.5 }}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button color="error" variant="text" onClick={method.close}>
          Tutup
        </Button>
      </DialogActions>
    </Dialog>
  );
});

export default OnuChart;
