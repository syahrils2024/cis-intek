import { useState } from 'react';

import { Tab } from '@mui/material';
import { TabList, TabPanel, TabContext } from '@mui/lab';

import AcsChart from './acsChart/AcsChart';
import CustomerEngineerV2 from './customerEngineerV2';

export default function NetworkStatus() {
  const [tab, setTab] = useState('networkStatus');
  const tabs = [
    {
      label: 'Network Status',
      value: 'networkStatus',
    },
    {
      label: 'Dashboard ACS',
      value: 'acsChart',
    },
  ];

  return (
    <TabContext value={tab}>
      <TabList sx={{paddingLeft: 3}} onChange={(e, v) => setTab(v)}>
        {tabs.map((t) => (
          <Tab label={t.label} value={t.value} key={t.value} />
        ))}
      </TabList>
      <TabPanel value="networkStatus" sx={{ paddingX: 0 }}>
        <CustomerEngineerV2 />
      </TabPanel>
      <TabPanel value="acsChart">
        <AcsChart />
      </TabPanel>
    </TabContext>
  );

  return <CustomerEngineerV2 />;
}
