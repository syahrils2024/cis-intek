import { Iconify } from '@components/iconify';
import Overloading from '@components/overloading';
import { useDebouncedCallback } from 'use-debounce';
import { useEffect, forwardRef, useImperativeHandle } from 'react';

import {
  Stack,
  Dialog,
  Button,
  useTheme,
  DialogTitle,
  useMediaQuery,
  DialogContent,
  DialogActions,
  TablePagination,
} from '@mui/material';

import { BillingActionLogData } from './actionLogData';
import { useBillingActionLogDialogState } from '../states/actionLogDialog.state';

const BillingActionLogDialog = forwardRef((props, ref) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const {
    customer,
    customerId,
    data,
    loadCustomer,
    loadData,
    reset,
    limit,
    page,
    setLimit,
    setPage,
    show,
    loading,
    total,
  } = useBillingActionLogDialogState();

  const debounceLoadData = useDebouncedCallback(loadData, 300);

  async function open(customer_id) {
    show.onTrue();
    await loadCustomer(customer_id);
    await loadData(customer_id);
  }

  function close() {
    show.onFalse();
    reset();
  }

  useImperativeHandle(ref, () => ({ open }));

  useEffect(() => {
    setPage(0);
    debounceLoadData();
  }, [limit]);

  useEffect(() => {
    debounceLoadData();
  }, [page]);

  return (
    <Dialog open={show.value} fullWidth maxWidth="md" fullScreen={isMobile}>
      <DialogTitle>
        <Stack direction="row" justifyContent="space-between">
          <span>Billing Action Log</span>
          <Button color="error" variant="soft">
            <Iconify icon="mdi:close" onClick={() => close()} />
          </Button>
        </Stack>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={1} className="tw-py-1 tw-relative">
          <Overloading loading={loading.value} />
          {isMobile ? (
            <BillingActionLogData.Mobile data={data} />
          ) : (
            <BillingActionLogData.Table data={data} />
          )}
          <TablePagination
            size="small"
            component="div"
            count={total ?? 0}
            page={page}
            onPageChange={(e, p) => setPage(p)}
            rowsPerPage={limit}
            onRowsPerPageChange={(e) => setLimit(e.target.value)}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button color="error" variant="text" onClick={() => close()}>
          Tutup
        </Button>
      </DialogActions>
    </Dialog>
  );
});

export default BillingActionLogDialog;
