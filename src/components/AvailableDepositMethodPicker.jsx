import { toast } from 'sonner';
import { useBoolean } from '@hooks/use-boolean';
import { getBankImagePath } from '@utils/getBankImage';
import { useRef, useMemo, useState, forwardRef, useImperativeHandle } from 'react';

import {
  Stack,
  Button,
  Dialog,
  useTheme,
  TextField,
  ButtonBase,
  DialogTitle,
  DialogActions,
  DialogContent,
  useMediaQuery,
} from '@mui/material';

import { usePaymentMethodStore } from 'src/stores/paymentMethodStore';

import Overloading from './overloading';

/**
 * @typedef {import('src/stores/paymentMethodStore').PaymentMethodStore} PaymentMethodStore
 */

const AvailableDepositMethodPicker = forwardRef((props, ref) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  /** @type {PaymentMethodStore} */
  const { loadPaymentMethods, cash, ewallet, transfer } = usePaymentMethodStore();
  const show = useBoolean(false);
  const loading = useBoolean(false);
  const resolver = useRef();
  const [search, setSearch] = useState('');

  const availablePayment = useMemo(() => {
    const available = [...cash, ...ewallet, ...transfer];
    return available
      .filter((item) => item.showAndroid)
      .filter((item) => !!item.bankName && !!item.bankNumber && !!item.bankUsername);
  }, [cash, ewallet, transfer]);

  const filteredPayment = useMemo(() => {
    if (!search) return availablePayment;
    const s = search.trim().toLowerCase();
    return availablePayment.filter(
      (item) =>
        item.bankName?.toLowerCase().includes(s) ||
        item.bankNumber?.toLowerCase().includes(s) ||
        item.bankUsername?.toLowerCase().includes(s) ||
        item.title?.toLowerCase().includes(s)
    );
  }, [availablePayment]);

  async function prefetch() {
    loading.onTrue();
    try {
      await loadPaymentMethods();
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
    } finally {
      loading.onFalse();
    }
  }

  function open() {
    show.onTrue();
    prefetch();
    return new Promise((resolve) => {
      resolver.current = resolve;
    });
  }

  function close(item) {
    show.onFalse();
    resolver.current?.(item);
  }

  useImperativeHandle(ref, () => ({ open }));

  return (
    <Dialog open={show.value} onClose={() => close()} maxWidth="sm" fullScreen={isMobile}>
      <DialogTitle>Pilih Metode Pembayaran</DialogTitle>
      <DialogContent>
        <Stack spacing={1} divider className="tw-relative">
          <Overloading loading={loading.value} />
          <TextField
            variant="outlined"
            color="primary"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Stack>
            {filteredPayment.map((item, i) => (
              <ButtonBase key={i} onClick={() => close(item)} className="tw-cursor-pointer tw-py-2">
                <Stack direction="row" alignContent="center">
                  <div className="tw-flex tw-flex-row tw-gap-4 tw-items-center">
                    <img
                      src={`/assets/bank/${getBankImagePath(item?.accountBank ?? '')}`}
                      alt={item?.accountBank}
                      className="tw-h-6"
                    />
                    <Stack>
                      <span className="tw-text-xs tw-uppercase">{item?.accountName}</span>
                      <span className="tw-text-xs tw-uppercase">{item?.accountNumber}</span>
                    </Stack>
                  </div>
                </Stack>
              </ButtonBase>
            ))}
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button color="error" varian="text" onClick={() => close()}>
          Tutup
        </Button>
      </DialogActions>
    </Dialog>
  );
});

export default AvailableDepositMethodPicker;
