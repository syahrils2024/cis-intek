import { Iconify } from '@components/iconify';
import { useSearchParams } from 'react-router-dom';
import { useMemo, useState, useEffect } from 'react';
import { usePrivilege } from '@auth/hooks/privileges';
import { usePermission } from '@auth/hooks/permission';

import { Tab, Badge } from '@mui/material';
import { TabList, TabPanel, TabContext } from '@mui/lab';

import { useInfoStore } from 'src/stores/info';

import Billing from './billing';
import InvoiceHistory from './invoiceHistory';
import ReqPaymentParent from './ReqPaymentParent';
import SummaryBillingParent from './SummaryParent';
import PaymentOrder from './paymentOrder/paymentOrder';
import HistoryPaymentSummary from './HistoryPaymentSummary';
import CustomerTransactionAdmin from './customerTransaction';
import HistoryPaymentSummaryByArea from './HistoryPaymentSummaryByArea';
import PaymentOrderSummary from './paymentOrderSummary/paymentOrderSummary';

/** @typedef {import('src/stores/info').InfoStore} InfoStore */

export default function BillingParent() {
  const [query, setQuery] = useSearchParams();
  /** @type {InfoStore} */
  const infoStore = useInfoStore();

  const permission = usePermission();

  const tabs = useMemo(() => [
    { label: 'Billing', value: 'billing', icon: 'stash:billing-info', show: true },
    { label: 'History', value: 'history', icon: 'ix:history-list', show: true },
    {
      label: 'Req Payment',
      value: 'reqPayment',
      show: true,
      icon: (
        <Badge badgeContent={infoStore.invoiceTempPending} color="warning" variant="standard">
          <Iconify icon="fluent:money-hand-16-regular" />
        </Badge>
      ),
    },
    {
      label: 'Summary',
      value: 'summary.parent',
      icon: 'bitcoin-icons:transactions-outline',
      show: permission.showFinanceData,
    },
    // {
    //   label: 'Summary by Area',
    //   value: 'history.summary-area',
    //   icon: 'bitcoin-icons:transactions-outline',
    //   show: permission.showFinanceData,
    // },
    {
      label: 'AI & my.INTEK (manual)',
      value: 'pay-gateway.manual',
      show: true,
      icon: (
        <Badge
          badgeContent={infoStore.customerTransactionPending}
          color="warning"
          variant="standard"
        >
          <Iconify icon="solar:card-transfer-linear" />
        </Badge>
      ),
    },
    {
      label: 'my.INTEK (auto)',
      value: 'pay-gateway.auto',
      icon: 'bitcoin-icons:transactions-outline',
      show: true,
    },
    // {
    //   label: 'Summary Payment Gateway',
    //   value: 'pay-gateway.summary',
    //   icon: 'bitcoin-icons:transactions-outline',
    //   show: true,
    // },
    // {
    //   label: 'Kas Kolektor',
    //   value: 'user-wallet',
    //   icon: 'stash:wallet-duotone',
    //   show: true,
    // },
  ]);

  const allowedTabs = tabs.filter((t) => t.show);
  const [selectedTab, setSelectedTab] = useState('billing');

  const { isAdmin, isLo } = usePrivilege();

  const availableTabs = useMemo(() => {
    if (!isAdmin) return tabs.slice(0, 3);
    return tabs;
  });

  function onMounted() {
    const tab = query.get('tab');
    if (tab && availableTabs.some((t) => t.value === tab)) {
      setSelectedTab(tab);
    } else {
      setSelectedTab('billing');
    }
  }

  useEffect(() => {
    onMounted();
  }, []);

  return (
    <TabContext value={selectedTab}>
      <TabList sx={{ paddingX: 2 }} onChange={(e, value) => setSelectedTab(value)}>
        {allowedTabs.map((t) => (
          <Tab
            key={t.value}
            value={t.value}
            label={t.label}
            icon={typeof t.icon === 'string' ? <Iconify icon={t.icon} /> : t.icon}
          />
        ))}
      </TabList>
      <TabPanel value="billing" sx={{ paddingX: 0 }}>
        <Billing />
      </TabPanel>
      <TabPanel value="history" sx={{ paddingX: 0 }}>
        <InvoiceHistory />
      </TabPanel>
      <TabPanel value="reqPayment" sx={{ paddingX: 0 }}>
        {/* <InvoiceTemp /> */}
        <ReqPaymentParent />
      </TabPanel>
      <TabPanel value="history.summary" sx={{ paddingX: 0 }}>
        <HistoryPaymentSummary />
      </TabPanel>
      <TabPanel value="history.summary-area" sx={{ paddingX: 0 }}>
        <HistoryPaymentSummaryByArea />
      </TabPanel>
      <TabPanel value="pay-gateway.manual" sx={{ paddingX: 0 }}>
        <CustomerTransactionAdmin />
      </TabPanel>
      <TabPanel value="pay-gateway.auto" sx={{ paddingX: 0 }}>
        <PaymentOrder />
      </TabPanel>
      <TabPanel value="pay-gateway.summary" sx={{ paddingX: 0 }}>
        <PaymentOrderSummary />
      </TabPanel>
      {/* <TabPanel value="user-wallet" sx={{ paddingX: 0 }}>
        <UserWalletList />
      </TabPanel> */}
      <TabPanel value="summary.parent" sx={{ paddingX: 0 }}>
        <SummaryBillingParent />
      </TabPanel>
    </TabContext>
  );
}
