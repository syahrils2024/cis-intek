import { useState } from 'react';

import { Tab } from '@mui/material';
import { TabList, TabPanel, TabContext } from '@mui/lab';

import InvoiceTemp from './invoiceTemp';
import UserWalletList from './userWallet/list/UserWalletList';

export default function ReqPaymentParent() {
  const [tab, setTab] = useState('reqPayment');
  const tabList = [
    { label: 'Req Payment', value: 'reqPayment', show: true },
    { label: 'Kas Kolektor', value: 'user-wallet', show: true },
  ];

  return <TabContext value={tab}>
    <TabList sx={{ paddingX: 2 }} onChange={(e, value) => setTab(value)}>
      {tabList.map((t) => (
        <Tab key={t.value} value={t.value} label={t.label} />
      ))}
    </TabList>
    <TabPanel value="reqPayment" sx={{ paddingX: 0 }}>
      <InvoiceTemp />
    </TabPanel>
    <TabPanel value="user-wallet" sx={{ paddingX: 0 }}>
      <UserWalletList />
    </TabPanel>
  </TabContext>;
}
