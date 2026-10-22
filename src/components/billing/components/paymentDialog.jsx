import { Iconify } from '@components/iconify';
import { useBoolean } from '@hooks/use-boolean';
import { useRef, useState, forwardRef, useImperativeHandle } from 'react';

import {
  Tab,
  Tabs,
  Stack,
  Dialog,
  Button,
  useTheme,
  DialogTitle,
  useMediaQuery,
} from '@mui/material';

import PaymentDialogHistory from './paymentDialogHistory';
import PaymentDialogBilling from './paymentDialogBilling';

export const PaymentDialog = forwardRef((_, ref) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [currentCustomer_id, setCurrentCustomer_id] = useState(null);
  const show = useBoolean(false);
  const resolver = useRef();

  const tabList = [
    {
      title: 'Form Pembayaran',
      value: 'paymentForm',
    },
    {
      title: 'Riwayat Pembayaran',
      value: 'paymentHistory',
    },
  ];
  const [tab, setTab] = useState('paymentForm');

  const paymentFormRef = useRef();
  const paymentHistoryRef = useRef();

  function open(customer_id) {
    setCurrentCustomer_id(customer_id);
    show.onTrue();
    setTimeout(() => {
      paymentFormRef.current?.loadData(customer_id);
      paymentHistoryRef.current?.loadData(customer_id);
    }, 100);

    return new Promise((resolve) => {
      resolver.current = resolve;
    });
  }

  function close() {
    show.onFalse();
    resolver?.current(false);
  }

  useImperativeHandle(ref, () => ({ open }));

  return (
    <Dialog open={show.value} fullScreen={isMobile} fullWidth maxWidth="lg" scroll="paper">
      <DialogTitle>
        <Stack
          direction="row"
          className="tw-w-full"
          alignItems="center"
          justifyContent="space-between"
        >
          <Tabs value={tab} onChange={(e, newValue) => setTab(newValue)}>
            {tabList.map((item) => (
              <Tab key={item.value} label={item.title} value={item.value} />
            ))}
          </Tabs>
          <Button variant="soft" color="error" onClick={() => close()}>
            <Iconify icon="mdi:close" />
          </Button>
        </Stack>
      </DialogTitle>
      <PaymentDialogBilling
        hidden={tab !== 'paymentForm'}
        ref={paymentFormRef}
        onClose={() => close()}
      />
      <PaymentDialogHistory
        hidden={tab !== 'paymentHistory'}
        ref={paymentHistoryRef}
        onClose={() => close()}
      />
    </Dialog>
  );
});

export default PaymentDialog;
