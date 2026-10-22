import { useMemo, useState } from 'react';
import { Iconify } from '@components/iconify';
import { usePrivilege } from '@auth/hooks/privileges';

import { Tab } from '@mui/material';
import { TabList, TabPanel, TabContext } from '@mui/lab';

import Ticket from './ticket/ticket';
import CustomerEngineer from './customerEngineer';

export default function CustomerParent() {
  const { isAdmin } = usePrivilege();
  const tabs = useMemo(() => {
    if (isAdmin) {
      return [{ label: 'List', value: 'list', icon: 'mdi:text-user' }];
    }

    return [
      { label: 'List', value: 'list', icon: 'mdi:text-user' },
      { label: 'E-Ticket', value: 'ticket', icon: 'icon-park-outline:ticket' },
    ];
  });
  // const tabs = [
  //   { label: 'List', value: 'list', icon: 'mdi:text-user' },
  //   { label: 'E-Ticket', value: 'ticket', icon: 'icon-park-outline:ticket' },
  // ];
  const [selectedTab, setSelectedTab] = useState('list');

  return (
    <TabContext value={selectedTab}>
      <TabList sx={{ paddingX: 2 }} onChange={(e, value) => setSelectedTab(value)}>
        {tabs.map((t) => (
          <Tab key={t.value} value={t.value} label={t.label} icon={<Iconify icon={t.icon} />} />
        ))}
      </TabList>
      <TabPanel value="list" sx={{ paddingX: 0 }}>
        <CustomerEngineer />
      </TabPanel>
      <TabPanel value="ticket" sx={{ paddingX: 0 }}>
        <Ticket />
      </TabPanel>
    </TabContext>
  );
}
