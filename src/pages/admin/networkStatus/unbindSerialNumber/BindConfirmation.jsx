import { Iconify } from '@components/iconify';
import { useBoolean } from '@hooks/use-boolean';
import { useRef, useMemo, useState, forwardRef, useImperativeHandle } from 'react';

import {
  Grid,
  Stack,
  Dialog,
  Button,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';

/**
 * @typedef {import('src/repositories/customer').CustomerListFromEngineer} CustomerListFromEngineer
 */

const BindConfirmation = forwardRef((props, ref) => {
  const show = useBoolean(false);
  const [newSerialNumber, setNewSerialNumber] = useState('');
  const resolver = useRef();

  /** @type {[CustomerListFromEngineer, Function]} */
  const [customer, setCustomer] = useState(null);

  const customerData = useMemo(() => {
    const items = {
      ID: customer?.customerId ?? '-',
      Pelanggan: customer?.fullname ?? '-',
      Whatsapp: customer?.phone ?? '-',
      Alamat: customer?.address ?? '-',
      'Area / POP': customer?.areaData?.title ?? '-',
    };

    return Object.entries(items).map(([key, value]) => ({ key, value }));
  }, [customer]);

  /**
   * @param {Object} item
   * @param {string} item.serialNumber
   * @param {CustomerListFromEngineer} item.customer
   */
  function open(item) {
    setNewSerialNumber(item.serialNumber);
    setCustomer(item.customer);
    show.onTrue();
    return new Promise((resolve) => {
      resolver.current = resolve;
    });
  }

  function reset() {
    setNewSerialNumber('');
    setCustomer(null);
  }

  function close(value) {
    reset();
    show.onFalse();
    resolver.current?.(value);
  }

  useImperativeHandle(ref, () => ({ open, close }));

  // return dialog confirmation
  return (
    <Dialog open={show.value} fullWidth maxWidth="sm">
      <DialogTitle>Bind Serial Number Confirmation</DialogTitle>
      <DialogContent>
        <Stack className="tw-py-2">
          <Grid container spacing={2} className="tw-my-4">
            {customerData.map((item) => (
              <Grid item md={6} columns={12} key={item.key}>
                <Stack className="tw-text-xs">
                  <span>{item.key}</span>
                  <span className="tw-font-semibold">{item.value}</span>
                </Stack>
              </Grid>
            ))}
          </Grid>
          {/* Compare Serial Number */}
          <Stack className="tw-mt-4" direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
            <Stack>
              <span className="tw-text-xs">Serial Number</span>
              <span className="tw-text-xs tw-font-bold">{customer?.routerSerialNumber}</span>
            </Stack>
            <Iconify icon="line-md:arrow-right" />
            <Stack>
              <span className="tw-text-xs">Serial Number</span>
              <span className="tw-text-xs tw-font-bold">{newSerialNumber}</span>
            </Stack>
          </Stack>
          {/* End Compare Serial Number */}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button variant="text" color="error" onClick={() => close(false)}>
          Batal
        </Button>
        <Button variant="contained" color="primary" onClick={() => close(true)}>
          Bind
        </Button>
      </DialogActions>
    </Dialog>
  );
});

export default BindConfirmation;
