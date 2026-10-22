import { useState } from 'react';
import { Iconify } from '@components/iconify';

import { Tab } from '@mui/material';
import { TabList, TabPanel, TabContext } from '@mui/lab';

import HistoryPaymentSummary from './HistoryPaymentSummary';
import HistoryPaymentSummaryByArea from './HistoryPaymentSummaryByArea';
import PaymentOrderSummary from './paymentOrderSummary/paymentOrderSummary';

export default function SummaryBillingParent() {
  const [tab, setTab] = useState('history.summary');

  const tabs = [
    {
      label: 'User',
      value: 'history.summary',
      show: true,
      icon: 'bitcoin-icons:transactions-outline',
    },
    {
      label: 'By Area',
      value: 'history.summary-area',
      show: true,
      icon: 'bitcoin-icons:transactions-outline',
    },
    {
      label: 'Payment Gateway',
      value: 'pay-gateway.summary',
      show: true,
      icon: 'bitcoin-icons:transactions-outline',
    },
  ];

  return (
    <TabContext value={tab}>
      <TabList sx={{ paddingX: 2 }} onChange={(e, value) => setTab(value)}>
        {tabs.map((t) => (
          <Tab
            key={t.value}
            value={t.value}
            label={t.label}
            icon={typeof t.icon === 'string' ? <Iconify icon={t.icon} /> : t.icon}
          />
        ))}
      </TabList>
      <TabPanel value="history.summary" sx={{ paddingX: 0 }}>
        <HistoryPaymentSummary />
      </TabPanel>
      <TabPanel value="history.summary-area" sx={{ paddingX: 0 }}>
        <HistoryPaymentSummaryByArea />
      </TabPanel>
      <TabPanel value="pay-gateway.summary" sx={{ paddingX: 0 }}>
        <PaymentOrderSummary />
      </TabPanel>
    </TabContext>
  );
}
