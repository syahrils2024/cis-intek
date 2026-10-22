import { Iconify } from '@components/iconify';
import React, { useState, useEffect } from 'react';

import { Tab } from '@mui/material';
import { TabList, TabPanel, TabContext } from '@mui/lab';

import BroadcastJob from './components/broadcastJobPanel';
import BroadcastProfile from './components/broadcastProfile';
import useWhatsappSettingStore from './whatsappSetting.store';
import WhatsappNodePanel from './components/whatsappNodePanel';
import WhatsappBroadcastPage from './components/whatsappBroadcast';
import WhatsappLogAreaPanel from './components/whatsappLogAreaPanel';
import WhatsappLogCustomerPanel from './components/whatsappLogCustomerPanel';

export default function WhatsAppSettingPage() {
  const store = useWhatsappSettingStore();
  const [page, setPage] = useState('node');
  const pages = [
    {
      value: 'node',
      label: 'Node WA',
      icon: 'ic:outline-whatsapp',
    },
    {
      value: 'log',
      label: 'Log Grub',
      icon: 'mage:message-info-round',
    },
    {
      value: 'log.customer',
      label: 'Log Pelanggan',
      icon: 'tabler:message-circle-user',
    },
    {
      value: 'broadcast',
      label: 'Pengaturan Broadcast',
      icon: 'humbleicons:chats',
    },
    {
      value: 'broadcast.profile',
      label: 'Broadcast Profile',
      icon: 'bi:send-check',
    },
    {
      value: 'broadcast.job',
      label: 'Broadcast Job',
      icon: 'healthicons:job-status-level-outline-24px',
    },
  ];

  // Dispose when unmounting
  useEffect(
    () => () => {
      useWhatsappSettingStore.getState().dispose();
    },
    []
  );

  return (
    <div className=" tw-flex tw-flex-col tw-mt-8 tw-px-5 tw-container tw-w-full tw-mx-auto tw-items-stretch tw-justify-start">
      {/* Header Page */}
      <TabContext value={page}>
        <TabList onChange={(e, p) => setPage(p)} sx={{ paddingX: 0 }}>
          {pages.map((p, i) => (
            <Tab value={p.value} label={p.label} key={i} icon={<Iconify icon={p.icon} />} />
          ))}
        </TabList>
        <TabPanel value="node" sx={{ paddingX: 0 }}>
          <WhatsappNodePanel />
        </TabPanel>
        <TabPanel value="log" sx={{ paddingX: 0 }}>
          <WhatsappLogAreaPanel />
        </TabPanel>
        <TabPanel value="log.customer" sx={{ paddingX: 0 }}>
          <WhatsappLogCustomerPanel />
        </TabPanel>
        <TabPanel value="broadcast" sx={{ paddingX: 0 }}>
          <WhatsappBroadcastPage />
        </TabPanel>
        <TabPanel value="broadcast.profile" sx={{ paddingX: 0 }}>
          <BroadcastProfile />
        </TabPanel>
        <TabPanel value="broadcast.job" sx={{ paddingX: 0 }}>
          <BroadcastJob />
        </TabPanel>
      </TabContext>
    </div>
  );
}
