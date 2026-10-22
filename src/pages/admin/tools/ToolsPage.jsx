import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

import { Tab, Tabs } from '@mui/material';
import { TabPanel, TabContext } from '@mui/lab';

import MikrotikLog from './mikrotikLog';
import ToolsImportODP from './ImportODP';
import JobQueuePage from './JobQueuePage';
import ToolsImportBilling from './ImportBilling';
import ToolsImportCustomer from './ImportCustomer';
import AppNotificationPage from './AppNotification';
import MigrationPackageLogPage from './MigrationPackageLog';

export default function ToolsPage() {
  const [tab, setTab] = useState('mikrotik');
  const [query] = useSearchParams();

  const tabs = [
    {
      title: 'Mikrotik',
      value: 'mikrotik',
    },
    {
      title: 'Job Queue',
      value: 'job_queue',
    },
    {
      title: 'Riwayat Migrasi Internet',
      value: 'migration_package_log',
    },
    {
      title: 'Import Pelanggan',
      value: 'import_customer',
    },
    {
      title: 'Import Billing',
      value: 'import_billing',
    },
    {
      title: 'Import ODP',
      value: 'import_odp',
    },
    {
      title: 'App Notification',
      value: 'app_notification',
    },
  ];

  function watchTab() {
    const tabList = tabs.map((t) => t.value);
    const qTab = query.get('tab');
    if (!qTab) return;
    const isContains = tabList.includes(qTab);
    if (!isContains) return;
    setTab(qTab);
  }

  useEffect(() => {
    watchTab();
  }, []);

  return (
    <div className="tw-flex tw-flex-col tw-p-5">
      <TabContext value={tab}>
        <Tabs value={tab} onChange={(e, value) => setTab(value)}>
          {tabs.map((t, i) => (
            <Tab label={t.title} value={t.value} key={i} />
          ))}
        </Tabs>
        <TabPanel value="mikrotik" sx={{ paddingX: 0 }}>
          <MikrotikLog />
        </TabPanel>
        <TabPanel value="job_queue" sx={{ paddingX: 0 }}>
          <JobQueuePage />
        </TabPanel>
        <TabPanel value="migration_package_log" sx={{ paddingX: 0 }}>
          <MigrationPackageLogPage />
        </TabPanel>
        <TabPanel value="import_customer" sx={{ paddingX: 0 }}>
          <ToolsImportCustomer />
        </TabPanel>
        <TabPanel value="import_billing" sx={{ paddingX: 0 }}>
          <ToolsImportBilling />
        </TabPanel>
        <TabPanel value="import_odp" sx={{ paddingX: 0 }}>
          <ToolsImportODP />
        </TabPanel>
        <TabPanel value="app_notification" sx={{ paddingX: 0 }}>
          <AppNotificationPage />
        </TabPanel>
      </TabContext>
    </div>
  );
}
