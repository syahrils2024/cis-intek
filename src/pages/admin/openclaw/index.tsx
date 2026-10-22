import React, { useEffect } from 'react';
import { Iconify } from '@components/iconify';
import { usePrivilege } from '@auth/hooks/privileges';

import { Tab } from '@mui/material';
import { TabList, TabPanel, TabContext } from '@mui/lab';

import SoulEditor from './components/SoulEditor';
import ChannelList from './components/ChannelList';
import { useOpenclawGateway } from './hooks/useGateway';
import ConfigurationEditor from './components/ConfigurationEditor';
import GatewayStatusButton from './components/GatewayStatusButton';

export default function OpenclawPage() {
  const [tab, setTab] = React.useState('soul');
  const { isDeveloper } = usePrivilege();
  const gatewayStatus = useOpenclawGateway();

  useEffect(() => {
    gatewayStatus.checkGateway();
  }, []);

  return (
    <div className="tw-flex tw-flex-col tw-mt-8 tw-px-5 tw-container tw-w-full tw-mx-auto tw-items-stretch tw-justify-start">
      <TabContext value={tab}>
        <div className="tw-flex tw-flex-col tw-gap-4 md:tw-flex-row tw-items-center tw-justify-between">
          <TabList onChange={(e, v) => setTab(v)} sx={{ paddingX: 0 }}>
            <Tab label="Soul" value="soul" icon={<Iconify icon="mdi:brain" />} />
            <Tab
              label="WhatsApp Channels"
              value="channels"
              icon={<Iconify icon="ic:outline-whatsapp" />}
            />
            {isDeveloper ? (
              <Tab
                label="Configuration"
                value="configuration"
                icon={<Iconify icon="mdi:code-json" />}
              />
            ) : null}
          </TabList>
          <GatewayStatusButton
            running={gatewayStatus.running}
            loading={gatewayStatus.loading}
            error={gatewayStatus.error}
            onRestart={gatewayStatus.startGateway}
            onStop={gatewayStatus.stopGateway}
          />
        </div>
        <TabPanel value="soul" sx={{ paddingX: 0 }}>
          <SoulEditor />
        </TabPanel>
        <TabPanel value="channels" sx={{ paddingX: 0 }}>
          <ChannelList />
        </TabPanel>
        <TabPanel value="configuration" sx={{ paddingX: 0 }}>
          <ConfigurationEditor />
        </TabPanel>
      </TabContext>
    </div>
  );
}
