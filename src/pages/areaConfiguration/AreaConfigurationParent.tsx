// @ts-nocheck
import { useState } from 'react';

import { Tab } from '@mui/material';
import { TabList, TabPanel, TabContext } from '@mui/lab';

import PopList from './popList/popList';
import OltList from './oltList/OltList';
import MapsArea from '../admin/mapsArea';
import AreaConfiguration2 from '../admin/areaConfiguration2';

export default function AreaConfigurationParent() {
  const tabs = [
    {
      label: 'POP List',
      value: 'pop',
    },
    {
      label: 'Area Configuration',
      value: 'areaConfiguration',
    },
    {
      label: 'OLT List',
      value: 'oltList',
    },
    // {
    //   label: 'Maps',
    //   value: 'maps',
    // },
  ];

  const [selectedTab, setSelectedTab] = useState('areaConfiguration');

  return (
    <div className="tw-flex tw-flex-col">
      <TabContext value={selectedTab}>
        <TabList onChange={(e, p) => setSelectedTab(p)} sx={{ paddingLeft: 2.5 }}>
          {tabs.map((t) => (
            <Tab key={t.value} value={t.value} label={t.label} />
          ))}
        </TabList>
        <TabPanel value="pop">
          <PopList />
        </TabPanel>
        <TabPanel value="areaConfiguration">
          <AreaConfiguration2 />
        </TabPanel>
        <TabPanel value="maps">
          <MapsArea />
        </TabPanel>
        <TabPanel value="oltList">
          <OltList />
        </TabPanel>
      </TabContext>
    </div>
  );
}
