import { useState } from 'react';

import { Tab, Tabs } from '@mui/material';
import { TabPanel, TabContext } from '@mui/lab';

import AddonsPackage from './package/addonsPackage';
import AddonsCategory from './package/addonsCategory';

export default function AddonsParentPage() {
  const [tab, setTab] = useState('addons.package');
  const tabs = [
    {
      title: 'Paket Addons',
      value: 'addons.package',
    },
    {
      title: 'Kategori',
      value: 'addons.category',
    },
  ];

  return (
    <TabContext value={tab}>
      <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ paddingX: 2 }}>
        {tabs.map((t, i) => (
          <Tab key={i} value={t.value} label={t.title} />
        ))}
      </Tabs>
      <TabPanel value="addons.category" sx={{ paddingX: 0 }}>
        <AddonsCategory />
      </TabPanel>
      <TabPanel value="addons.package" sx={{ paddingX: 0 }}>
        <AddonsPackage />
      </TabPanel>
    </TabContext>
  );
}
