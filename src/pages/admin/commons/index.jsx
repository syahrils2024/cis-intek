import { useState } from 'react';
import { Iconify } from '@components/iconify';

import { Tab, Stack } from '@mui/material';
import { TabList, TabPanel, TabContext } from '@mui/lab';

import FaqPage from './faq.page';
import CommonPage from './common.page';
import InformationBannerPage from './informationBanner.page';

export default function CommonPageMain() {
  const tabs = [
    { label: 'Menu Android', value: 'menu.android' },
    { label: 'Faq', value: 'faq' },
    { label: 'Informasi Mobile', value: 'information.banner' },
  ];

  const [selectedTab, setSelectedTab] = useState('menu.android');

  return (
    <Stack>
      <TabContext value={selectedTab}>
        <TabList sx={{ paddingX: 2 }} onChange={(e, value) => setSelectedTab(value)}>
          {tabs.map((t) => (
            <Tab key={t.value} value={t.value} label={t.label} icon={<Iconify icon={t.icon} />} />
          ))}
        </TabList>
        <TabPanel value="menu.android" sx={{ paddingX: 0 }}>
          <CommonPage />
        </TabPanel>
        <TabPanel value="faq" sx={{ paddingX: 0 }}>
          <FaqPage />
        </TabPanel>
        <TabPanel value="information.banner" sx={{ paddingX: 0 }}>
          <InformationBannerPage />
        </TabPanel>
      </TabContext>
    </Stack>
  );
}
