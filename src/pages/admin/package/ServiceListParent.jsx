import { useState } from 'react';

import { Tab, Tabs } from '@mui/material';
import { TabPanel, TabContext } from '@mui/lab';

import Package from './package';
import AddonsPackage from './addonsPackage';
import AddonsCategory from './addonsCategory';
import PackageStatistics from './packageStatistics';

export default function ServiceListParent() {
  const [tab, setTab] = useState('internet');
  const tabs = [
    {
      title: 'Internet',
      value: 'internet',
    },
    {
      title: 'Paket Addons',
      value: 'addons.package',
    },
    {
      title: 'Kategori',
      value: 'addons.category',
    },
    {
      title: 'Statistics',
      value: 'statistics',
    },
  ];

  return (
    <TabContext value={tab}>
      <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ paddingX: 2 }}>
        {tabs.map((t, i) => (
          <Tab key={i} value={t.value} label={t.title} />
        ))}
      </Tabs>
      <TabPanel value="internet" sx={{ paddingX: 0 }}>
        <Package />
      </TabPanel>
      <TabPanel value="addons.category" sx={{ paddingX: 0 }}>
        <AddonsCategory />
      </TabPanel>
      <TabPanel value="addons.package" sx={{ paddingX: 0 }}>
        <AddonsPackage />
      </TabPanel>
      <TabPanel value="statistics" sx={{ paddingX: 0 }}>
        {/* <AddonsPackage /> */}
        <PackageStatistics />
      </TabPanel>
    </TabContext>
  );
}
