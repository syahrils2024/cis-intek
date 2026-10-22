import Overloading from '@components/overloading';
import { forwardRef, useImperativeHandle } from 'react';

import { TabList, TabPanel, TabContext, LoadingButton } from '@mui/lab';
import {
  Tab,
  Grid,
  Stack,
  Button,
  Dialog,
  TextField,
  DialogTitle,
  DialogActions,
  DialogContent,
} from '@mui/material';

import { useChangeSerialNumberState } from './changeSerialNumber.state';
import ChangeCustomerSerialNumberLog from './ChangeCustomerSerialNumberLog';

const ChangeCustomerSerialNumberDialog = forwardRef((props, ref) => {
  const { methods, state } = useChangeSerialNumberState();

  useImperativeHandle(ref, () => ({
    open: methods.open,
    close: methods.close,
  }));

  return (
    <Dialog open={state.show.value} fullWidth maxWidth="md" fullScreen={state.isMobile}>
      <DialogTitle>Edit Serial Number</DialogTitle>
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
          <TabContext value={state.tab}>
            <TabList onChange={(e, value) => methods.setTab(value)}>
              {state.tabs.map((label, index) => (
                <Tab key={index} label={label} value={index} />
              ))}
            </TabList>
            <TabPanel value={0} sx={{ px: 0 }}>
              {/* Tab Edit Serial Number */}
              <TextField
                label="Serial Number"
                fullWidth
                value={state.serialNumber}
                size="small"
                onChange={(e) => methods.setSerialNumber(e.target.value)}
                className="tw-mt-4"
              />
            </TabPanel>
            <TabPanel value={1} sx={{ px: 0 }}>
              {/* Tab History */}
              <ChangeCustomerSerialNumberLog items={state.logChanges} />
            </TabPanel>
          </TabContext>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={methods.close} color="error" variant="text">
          Tutup
        </Button>
        <LoadingButton
          loading={state.loadingSubmit.value}
          onClick={methods.submit}
          variant="contained"
          color="primary"
          disabled={state.tab !== 0}
        >
          Simpan
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
});

export default ChangeCustomerSerialNumberDialog;
