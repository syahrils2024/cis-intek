import { useState } from 'react';
import { Iconify } from '@components/iconify';

import { Tab, Badge } from '@mui/material';
import { TabList, TabPanel, TabContext } from '@mui/lab';

import { useInfoStore } from 'src/stores/info';

import PSBChart from './psbChart';
import CustomerQueue from './customerQueue';
import CustomerFinish from './customerFinish';
import SimulationBilling from './simulationBilling';
import InstallationRequest from './installationRequest';

/** @typedef {import('src/stores/info').InfoStore} InfoStore */

export default function Psb() {
  /** @type {InfoStore} */
  const infoStore = useInfoStore();
  const [page, setPage] = useState('queue');
  const pages = [
    {
      value: 'registration',
      label: 'Registrasi',
      icon: (
        <Badge badgeContent={infoStore.installationRequest} color="warning" variant="standard">
          <Iconify icon="medical-icon:i-registration" />
        </Badge>
      ),
    },
    {
      value: 'queue',
      label: 'Processed',
      icon: (
        <Badge badgeContent={infoStore.customerPending} color="warning" variant="standard">
          <Iconify icon="fluent:people-queue-20-regular" />
        </Badge>
      ),
    },
    {
      value: 'history',
      label: 'Riwayat',
      icon: 'tdesign:user-list',
    },
    {
      value: 'simulation',
      label: 'Simulasi',
      icon: 'stash:billing-info-light',
    },
    {
      value: 'chart',
      label: 'Chart',
      icon: 'gg:chart',
    },
  ];

  return (
    <div className="tw-flex tw-flex-col">
      <TabContext value={page}>
        <TabList onChange={(e, p) => setPage(p)} sx={{ paddingX: 3 }}>
          {pages.map((p, i) => (
            <Tab
              value={p.value}
              label={p.label}
              key={i}
              icon={typeof p.icon === 'string' ? <Iconify icon={p.icon} /> : p.icon}
            />
          ))}
        </TabList>
        <TabPanel value="queue" sx={{ paddingX: 0 }}>
          <CustomerQueue />
        </TabPanel>
        <TabPanel value="registration" sx={{ paddingX: 0 }}>
          <InstallationRequest />
        </TabPanel>
        <TabPanel value="simulation" sx={{ paddingX: 0 }}>
          <SimulationBilling />
        </TabPanel>
        <TabPanel value="chart" sx={{ paddingX: 0 }}>
          <PSBChart />
        </TabPanel>
        <TabPanel value="history" sx={{ paddingX: 0 }}>
          <CustomerFinish />
        </TabPanel>
      </TabContext>
    </div>
  );
}
