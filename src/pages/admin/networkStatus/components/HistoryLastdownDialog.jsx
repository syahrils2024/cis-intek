import dayjs from 'dayjs';
import Overloading from '@components/overloading';
import { forwardRef, useImperativeHandle } from 'react';

import { DataGrid } from '@mui/x-data-grid';
import { DatePicker } from '@mui/x-date-pickers';
import {
  Grid,
  Stack,
  Dialog,
  Button,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';

import { useHistoryLastdownDialogState } from './historyLasdownDialog.state';

const HistoryLastdownDialog = forwardRef((props, ref) => {
  const { method, state } = useHistoryLastdownDialogState();

  useImperativeHandle(ref, () => ({ open: method.open, close: method.close }));

  return (
    <Dialog
      fullWidth
      maxWidth="md"
      open={state.show.value}
      onClose={method.close}
      fullScreen={state.mobile}
    >
      <DialogTitle>History Lastdown</DialogTitle>
      <DialogContent>
        <Stack className="tw-relative" spacing={2}>
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
          <div style={{ height: 400, width: '100%' }}>
            <DataGrid
              rows={state.data}
              columns={state.dataGridColumns}
              getRowId={(row) => row.Timestamp}
              getRowHeight={() => 30}
              disableColumnResize
              columnBufferPx={100}
              initialState={{
                pagination: {
                  paginationModel: {
                    pageSize: 10,
                  },
                },
              }}
              pageSizeOptions={[10, 25, 50]}
            />
          </div>
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

export default HistoryLastdownDialog;
