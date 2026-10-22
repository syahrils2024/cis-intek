import { toast } from 'sonner';
import { useBoolean } from '@hooks/use-boolean';
import Overloading from '@components/overloading';
import { useState, forwardRef, useImperativeHandle } from 'react';

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

import { whatsappNodeRepository } from 'src/repositories';

import WaCustomerCard from './waCustomerCard';
import WaCustomerTable from './waCustomerTable';

const WaLogCustomer = forwardRef((props, ref) => {
  const show = useBoolean(false);
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const isLoading = useBoolean(false);
  const [customerId, setCustomerId] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [data, setData] = useState([]);

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

  async function prefetch(customer_id) {
    if (!customer_id) return;
    isLoading.onTrue();
    try {
      const result = await whatsappNodeRepository.getCustomerLogs(customer_id, limit, page);
      console.log('result', result);
      setData(result.data);
      setTotalItems(result.total);
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
    } finally {
      isLoading.onFalse();
    }
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

  return (
    <Dialog open={show.value} maxWidth="md" fullWidth fullScreen={isMobile}>
      <DialogTitle>Whatsapp Log</DialogTitle>
      <DialogContent className="tw-relative">
        <Overloading loading={isLoading.value} />
        <div className="tw-flex tw-flex-col tw-gap-4 tw-py-1">
          {isMobile ? (
            data.map((d, i) => <WaCustomerCard data={d} key={i} />)
          ) : (
            <WaCustomerTable data={data} />
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

export default WaLogCustomer;
