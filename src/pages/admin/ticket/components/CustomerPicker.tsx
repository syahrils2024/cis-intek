// @ts-nocheck

import { toast } from 'sonner';
import { useBoolean } from '@hooks/use-boolean';
import Overloading from '@components/overloading';
import { useDebouncedCallback } from 'use-debounce';
import { useRef, useState, useEffect, forwardRef, useImperativeHandle } from 'react';

import {
  Stack,
  Button,
  Dialog,
  useTheme,
  TextField,
  DialogTitle,
  DialogActions,
  DialogContent,
  useMediaQuery,
} from '@mui/material';

import { customerRepository } from 'src/repositories';

import CustomerTicketList from './CustomerList';

const CustomerPickerDialog = forwardRef((props, ref) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const show = useBoolean(false);
  const isLoading = useBoolean(false);
  const [search, setSearch] = useState('');

  const [customers, setCustomer] = useState([]);
  const resolver = useRef();

  const debounceSearch = useDebouncedCallback((text) => {
    setSearch(text);
  }, 500);

  async function prefetch() {
    isLoading.onTrue();
    try {
      const snapshot = await customerRepository.findCustomerFromEnginner({
        page: 0,
        limit: 10,
        search,
        order: 'asc',
        orderBy: 'customer',
      });
      setCustomer(snapshot.customers);
    } catch (error) {
      toast.error(error.message);
    } finally {
      isLoading.onFalse();
    }
  }

  useEffect(() => {
    if (search !== '') prefetch();
  }, [search]);

  function handlePick(customer) {
    show.onFalse();
    resolver.current(customer);
  }

  function open() {
    setCustomer([]);
    setSearch('');
    show.onTrue();
    return new Promise((resolve) => {
      resolver.current = resolve;
    });
  }

  function close() {
    show.onFalse();
    resolver.current();
  }

  useImperativeHandle(ref, () => ({ open }));

  return (
    <Dialog open={show.value} fullWidth maxWidth="sm" fullScreen={isMobile}>
      <DialogTitle>Pilih Pelanggan</DialogTitle>
      <DialogContent>
        <Stack className="tw-py-2">
          <TextField
            defaultValue={search}
            label="Cari..."
            onChange={(e) => debounceSearch(e.target.value)}
            variant="filled"
          />
          <div className="tw-flex tw-flex-col tw-w-full tw-gap-2 tw-mt-2 tw-relative">
            <Overloading loading={isLoading.value} />
            <CustomerTicketList
              onClick={(customer) => handlePick(customer)}
              customers={customers}
            />
          </div>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button color="error" variant="text" onClick={() => close()}>
          Batal
        </Button>
      </DialogActions>
    </Dialog>
  );
});

export default CustomerPickerDialog;
