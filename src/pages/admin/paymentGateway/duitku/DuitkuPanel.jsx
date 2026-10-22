import { useState } from 'react';

import { Tab, Stack } from '@mui/material';
import { TabList, TabPanel, TabContext } from '@mui/lab';

import { DuitkuFeePage } from './fee/Fee.page';
import DuitkuSecretPage from './secret/DuitkuSecret.page';
import DuitkuFeeProfilePage from './feeProfile/FeeProfile.page';

export default function DuitkuPanel() {
  const [tab, setTab] = useState('fee.profile');
  const [tabList] = useState([
    {
      label: 'Profile Biaya',
      value: 'fee.profile',
    },
    {
      label: 'Secret Profile',
      value: 'secret',
    },
    {
      label: 'Default Duitku',
      value: 'fee',
    },
  ]);

  return (
    <Stack sx={{ paddingX: 2 }}>
      <TabContext value={tab}>
        {/* Tab List */}
        <TabList onChange={(e, value) => setTab(value)} sx={{ paddingX: 0 }}>
          {tabList.map((t, i) => (
            <Tab label={t.label} value={t.value} key={t} />
          ))}
        </TabList>
        {/* Tab Panel */}
        <TabPanel value="fee.profile" sx={{ paddingX: 0 }}>
          <DuitkuFeeProfilePage />
        </TabPanel>
        <TabPanel value="secret" sx={{ paddingX: 0 }}>
          <DuitkuSecretPage />
        </TabPanel>
        <TabPanel value="fee" sx={{ paddingX: 0 }}>
          <DuitkuFeePage />
        </TabPanel>
      </TabContext>
    </Stack>
  );
}
