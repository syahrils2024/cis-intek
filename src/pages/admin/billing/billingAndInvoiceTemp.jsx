import { useState } from 'react';
import { usePrivilege } from '@auth/hooks/privileges';

import { Tab } from '@mui/material';
import { TabList, TabPanel, TabContext } from '@mui/lab';

import Billing from './billingEngineer';
import InvoiceTemp from './invoiceTemp';

export default function BillingAndInvoiceTemp() {
  const [selectedTab, setSelectedTab] = useState('0');
  const tabItems = ['Billing', 'Pengajuan Pembayaran'];
  const { isAdmin } = usePrivilege();

  if (isAdmin) return <InvoiceTemp />;

  return (
    <div className="tw-flex tw-flex-col">
      <TabContext value={selectedTab}>
        <TabList sx={{ paddingLeft: 3 }} onChange={(e, p) => setSelectedTab(p)}>
          {tabItems.map((t, i) => (
            <Tab key={i} value={i.toString()} label={t} />
          ))}
        </TabList>
        <TabPanel value="0" sx={{ paddingX: 0 }}>
          <Billing />
        </TabPanel>
        <TabPanel value="1" sx={{ paddingX: 0 }}>
          <InvoiceTemp />
        </TabPanel>
      </TabContext>
    </div>
  );
}
