import { toast } from 'sonner';
import { useBoolean } from '@hooks/use-boolean';
import { getBankImagePath } from '@utils/getBankImage';
import { useRef, useMemo, useState, forwardRef, useImperativeHandle } from 'react';

import {
  Tab,
  Tabs,
  Stack,
  Button,
  Dialog,
  useTheme,
  DialogTitle,
  DialogActions,
  DialogContent,
  useMediaQuery,
} from '@mui/material';

import { customerTransactionRepository } from 'src/repositories';
import { useCustomerTransaction } from 'src/stores/customerTransaction';

/**
 * @typedef {import('src/stores/customerTransaction').CustomerTransactionStore} CustomerTransactionStore
 */

const AvailableDepositMethodPicker = forwardRef((props, ref) => {
  /** @type {CustomerTransactionStore} */
  const customerTransaction = useCustomerTransaction();
  const [selectedDepositMethod, setSelectedDepositMethod] = useState(null);
  const resolver = useRef();
  const showDialog = useBoolean(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [category, setCategory] = useState('');
  const [tab, setTab] = useState('automatic');
  const [tabs, setTabs] = useState([
    { title: 'Otomatis', value: 'automatic' },
    { title: 'Manual', value: 'manual' },
    { title: 'E-Wallet', value: 'ewallet' },
  ]);

  async function prefetch() {
    if (customerTransaction.availableDepositMethod.length >= 1) return;
    try {
      const snapshotAvailableDepositMethod =
        await customerTransactionRepository.availableDepositMethod();
      customerTransaction.setAvailableDepositMethod(snapshotAvailableDepositMethod);
    } catch (error) {
      toast.error(error.message);
    }
  }

  const depositMethodsFilteredList = useMemo(() => {
    if (tab === 'automatic') {
      return customerTransaction.availableDepositMethod.filter(
        (item) => item.isAuto && item.mutasiBankData != null
      );
    }

    if (tab === 'manual') {
      return customerTransaction.availableDepositMethod.filter(
        (item) =>
          item.isManual &&
          !!item.bankName &&
          !!item.bankNumber &&
          !!item.bankUsername &&
          item.paymentMethod !== 'ewallet'
      );
    }

    return customerTransaction.availableDepositMethod.filter(
      (item) => item.isManual && item.paymentMethod === 'ewallet'
    );
  });

  function close(depositMethod) {
    showDialog.onFalse();
    resolver.current(depositMethod);
  }

  function closeNull() {
    showDialog.onFalse();
    resolver.current(null);
    setSelectedDepositMethod(null);
  }

  function open() {
    prefetch();
    showDialog.onTrue();
    return new Promise((resolve) => {
      resolver.current = resolve;
    });
  }

  useImperativeHandle(ref, () => ({ open }));

  return (
    <Dialog open={showDialog.value} maxWidth="sm" fullWidth fullScreen={isMobile}>
      <DialogTitle>Pilih Metode Pembayaran</DialogTitle>
      <DialogContent>
        <Stack spacing={2} className="tw-py-2">
          <Tabs value={tab} onChange={(e, value) => setTab(value)}>
            {tabs.map((t, i) => (
              <Tab label={t.title} value={t.value} key={i} />
            ))}
          </Tabs>
          <Stack spacing={2}>
            {depositMethodsFilteredList.map((d, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  close({ category: tab, data: d });
                }}
              >
                <div className="tw-p-3 tw-ring-1 tw-ring-gray-300 tw-rounded-lg hover:tw-ring-primary">
                  <Stack direction="row" spacing={1} alignContent="center" alignItems="center">
                    <img
                      src={`/assets/bank/${getBankImagePath(d.bankName ?? '')}`}
                      className="tw-w-20 tw-object-contain"
                      alt={i}
                    />
                    <Stack alignItems="start">
                      <span className="tw-font-semibold tw-text-xs">{d.bankUsername ?? '-'}</span>
                      <span className="tw-font-semibold tw-text-xs">{d.bankNumber ?? '-'}</span>
                    </Stack>
                  </Stack>
                </div>
              </button>
            ))}
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button color="error" onClick={() => closeNull()}>
          Batal
        </Button>
      </DialogActions>
    </Dialog>
  );
});

export default AvailableDepositMethodPicker;
