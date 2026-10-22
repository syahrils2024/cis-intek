import { toast } from 'sonner';
import { useBoolean } from '@hooks/use-boolean';
import Overloading from '@components/overloading';
import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';

import {
  Dialog,
  Button,
  useTheme,
  DialogTitle,
  DialogContent,
  DialogActions,
  useMediaQuery,
  TablePagination,
} from '@mui/material';

import { mikrotikRepository } from 'src/repositories';

import HistoryLogMikrotikTable from './historyLogMikrotik/table';
import HistoryLogMikrotikMobileCard from './historyLogMikrotik/mobileCard';

/**
 * @typedef {import('@/repositories/mikrotik').MikrotikActionLog} MikrotikActionLog
 */

const HistoryLogMikrotik = forwardRef((props, ref) => {
  const show = useBoolean(false);
  const [limit, setLimit] = useState(2);
  const [page, setPage] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const isLoading = useBoolean(false);
  const [customerId, setCustomerId] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  /**
   * @type {[MikrotikActionLog[], void]}
   */
  const [data, setData] = useState([]);

  async function prefetch(customer_id) {
    if (customer_id) {
      setCustomerId(customer_id);
    }
    if (!customerId && !customer_id) return;
    isLoading.onTrue();
    try {
      const result = await mikrotikRepository.getHistoryActionLog({
        customerId: customer_id ?? customerId,
        limit,
        page,
      });
      setData(result.data);
      setTotalItems(result.total);
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
    } finally {
      isLoading.onFalse();
    }
  }

  function close() {
    show.onFalse();
    setCustomerId(null);
  }

  async function open(customer_id) {
    setPage(0);
    setData([]);
    show.onTrue();
    await prefetch(customer_id);
  }

  /**
   * @param {Event} e
   * @param {number} n
   */
  const handlerSetPage = (e, n) => {
    setPage(n);
  };

  /**
   * @param {Event} e
   */
  const handlerSetLimit = (e) => {
    setPage(0);
    setLimit(e.target.value);
  };

  useImperativeHandle(ref, () => ({ open }));

  useEffect(() => {
    prefetch();
  }, [page, limit]);

  return (
    <Dialog open={show.value} maxWidth="lg" fullWidth fullScreen={isMobile}>
      <DialogTitle>History Log Mikrotik</DialogTitle>
      <DialogContent className="tw-relative">
        <Overloading loading={isLoading.value} />
        <div className="tw-flex tw-flex-col tw-gap-4 tw-py-1">
          {isMobile ? (
            data.map((d, i) => <HistoryLogMikrotikMobileCard data={d} key={i} />)
          ) : (
            <HistoryLogMikrotikTable data={data} />
          )}
        </div>
        <TablePagination
          component="div"
          count={totalItems}
          page={page}
          onPageChange={handlerSetPage}
          rowsPerPage={limit}
          onRowsPerPageChange={handlerSetLimit}
        />
      </DialogContent>
      <DialogActions>
        <Button variant="text" color="error" onClick={() => close()}>
          Tutup
        </Button>
      </DialogActions>
    </Dialog>
  );
});

export default HistoryLogMikrotik;
