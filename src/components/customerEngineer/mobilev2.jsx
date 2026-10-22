/**
 * @typedef {import("src/repositories/subscription").Subscription} Subscription
 * @typedef {import("src/repositories/subscription").PPPActive} PPPActive
 */

import { Icon } from '@iconify/react';

import Grid2 from '@mui/material/Unstable_Grid2';
import {
  Chip,
  Stack,
  Button,
  Divider,
  Tooltip,
  Accordion,
  IconButton,
  AccordionDetails,
  AccordionSummary,
  AccordionActions,
} from '@mui/material';

import { Iconify } from 'src/components/iconify';

/**
 * @callback baseCallback
 * @param {Event} event
 * @param {Subscription} subscription
 */

/**
 * @param {{
 * subscription: Subscription,
 * onShowMenu: baseCallback
 * clickTopology: (e: Event, data: Subscription) => void;
 * clickHistory: (e: Event, data: Subscription) => void;
 * clickAcs: (e: Event, data: Subscription) => void;
 * onRefreshConnection: (data: Subscription, variant: "onu" | "pppoe") => void;
 * onOdpClick: (data: Subscription) => void;
 * onHybridRefreshConnection: (data: Subscription) => void;
 * onShowHistoryDataOLT: (data: Subscription) => void;
 * onShowHistoryLastdown: (data: Subscription) => void;
 * onRebootOnu: (data: Subscription) => void;
 * }} props
 */
export default function MobileV2({
  subscription,
  onShowMenu,
  clickTopology,
  clickHistory,
  clickAcs,
  onRefreshConnection,
  onOdpClick,
  onShowHistoryDataOLT,
  onShowHistoryLastdown,
  onRebootOnu,
}) {
  const isLunas = subscription.billingStatus.toLowerCase() === 'paid';

  return (
    <div className="tw-ring-1 tw-ring-gray-300 tw-rounded-lg">
      <Accordion>
        <AccordionSummary>
          <div className="tw-flex tw-flex-col tw-gap-2 tw-w-full">
            {/* Top Accordion Summary */}
            <div className="tw-flex tw-flex-row tw-items-center tw-justify-between tw-w-full tw-gap-2">
              <div className="tw-flex tw-flex-col">
                <span className="tw-text-xs tw-uppercase tw-font-medium tw-whitespace-nowrap">
                  {subscription.area ?? '-'}
                </span>
              </div>
              <Stack direction="row" spacing={1}>
                <Button onClick={onShowMenu} color="primary" variant="outlined" size="small">
                  <Icon icon="ic:baseline-menu" className="tw-mr-2" />
                  Lain
                </Button>
              </Stack>
            </div>
            {/* End Top Accordion Summary */}
            <Divider />

            <div className="tw-flex tw-flex-row tw-justify-between tw-items-start tw-w-full tw-gap-3">
              {subscription.isSpecial && (
                <Chip
                  size="small"
                  color="primary"
                  label="Pelanggan Spesial"
                  variant="outlined"
                  className="tw-w-min"
                />
              )}
              <img
                src="/assets/avatar-25.webp"
                className="tw-w-16 tw-aspect-square tw-rounded-full tw-object-cover tw-object-center"
                alt="KTP"
              />
              <div className="tw-flex tw-w-full">
                <Stack spacing={0.3}>
                  <span className="tw-text-xs tw-uppercase tw-font-semibold">
                    {subscription.fullname}
                  </span>
                  <span className="tw-text-xs tw-uppercase tw-text-gray-500">
                    {subscription.customerId}
                  </span>
                  <span className="tw-text-xs tw-uppercase tw-text-gray-500">
                    {subscription.phone}
                  </span>
                  <span className="tw-text-xs tw-uppercase tw-text-gray-500">
                    {subscription.address}
                  </span>
                </Stack>
              </div>
            </div>
            <Divider />
            <div className="tw-flex tw-flex-wrap tw-items-center tw-justify-between tw-w-full tw-gap-2">
              <div className="tw-flex tw-flex-row tw-gap-2">
                <Chip
                  size="small"
                  color={subscription.billingDebt <= 0 ? 'success' : 'error'}
                  label={subscription.billingDebt <= 0 ? 'Paid' : 'Unpaid'}
                  variant="outlined"
                />
              </div>
              <div className="tw-flex tw-flex-row tw-gap-2">
                <Chip
                  label={subscription.status.toCapitalCase()}
                  color={subscription.status.toLowerCase() === 'active' ? 'success' : 'error'}
                  className="tw-w-min"
                  size="small"
                  variant="outlined"
                />
                <Tooltip
                  title={
                    subscription.isolatedCode === 'M'
                      ? 'Manual'
                      : subscription.isolatedCode === 'S'
                        ? 'System'
                        : 'Unknown Reason'
                  }
                >
                  <Chip
                    variant="outlined"
                    color={subscription.isolated ? 'error' : 'success'}
                    label={subscription.isolated ? `Isolir` : 'Open'}
                    size="small"
                    className="tw-w-min"
                  />
                </Tooltip>
                {/* Isolir Status From Mikrotik */}
                <Tooltip title="Isolir Mikrotik Status">
                  <Chip
                    variant="outlined"
                    color={
                      typeof subscription.isIsolirMikrotik === 'undefined'
                        ? 'warning'
                        : subscription.isIsolirMikrotik === true
                          ? 'error'
                          : 'success'
                    }
                    label={
                      typeof subscription.isIsolirMikrotik === 'undefined'
                        ? 'Connecting'
                        : subscription.isIsolirMikrotik === true
                          ? `Isolir Mikrotik`
                          : 'Open Mikrotik'
                    }
                    size="small"
                    className="tw-w-min"
                  />
                </Tooltip>
              </div>
            </div>
          </div>
        </AccordionSummary>
        <AccordionDetails>
          <Stack spacing={2}>
            <Divider />
            <Stack spacing={1.5}>
              <Stack direction="row" alignItems="center" spacing={2} flexWrap="wrap">
                <OnuLastRx value={subscription.onuInfo?.ReceivedOpticalPower} />
                <Tooltip title="Chart RX">
                  <IconButton className="tw-w-min" onClick={() => onShowHistoryDataOLT()}>
                    <Iconify icon="fe:line-chart" />
                  </IconButton>
                </Tooltip>
              </Stack>

              <div className="tw-flex tw-flex-col">
                <span className="tw-text-xs tw-uppercase tw-text-gray-500">Alamat</span>
                <span className="tw-text-xs tw-uppercase tw-text-gray-500">
                  {subscription.address === '-' || !subscription.address
                    ? 'Data tidak ditemukan'
                    : subscription.address}
                </span>
              </div>
              <div className="tw-flex tw-flex-col">
                <span className="tw-text-xs tw-uppercase tw-text-gray-500">Serial Number</span>
                <span className="tw-text-xs tw-uppercase tw-text-gray-500">
                  {!!subscription.routerSerialNumber ? (
                    subscription.routerSerialNumber
                  ) : (
                    <span className="tw-text-red-500 tw-font-semibold">Tidak Ada Input</span>
                  )}
                </span>
              </div>
              <div className="tw-flex tw-flex-col">
                <span className="tw-text-xs tw-uppercase tw-text-gray-500">PPPoE</span>
                <span className="tw-text-xs tw-uppercase tw-font-medium">
                  <Stack direction="row" spacing={1} alignItems="start">
                    <ConnectionStatus pppActive={subscription.pppActive} />
                    <IconButton onClick={() => onRefreshConnection(subscription, 'pppoe')}>
                      <Iconify icon="mdi:refresh" />
                    </IconButton>
                  </Stack>
                </span>
              </div>
              <div className="tw-flex tw-flex-col">
                <span className="tw-text-xs tw-uppercase tw-text-gray-500">Remote OLTs</span>
                <span className="tw-text-xs tw-uppercase tw-font-medium">
                  <Stack direction="row" spacing={1} alignItems="start">
                    <OnuInfo
                      info={subscription.onuInfo}
                      onRefreshConnection={() => onRefreshConnection(subscription, 'onu')}
                      onShowHistoryLastdown={() => onShowHistoryLastdown(subscription)}
                      onRebootOnu={() => onRebootOnu(subscription)}
                    />
                  </Stack>
                </span>
              </div>
              <div className="tw-flex tw-flex-col">
                <span className="tw-text-xs tw-uppercase tw-text-gray-500">Jatuh Tempo</span>
                <span className="tw-text-xs tw-uppercase tw-font-medium">
                  {subscription.duoDate?.toDate().format('EEEE, dd MMM yyyy') ?? '-'}
                </span>
              </div>
              <div className="tw-flex tw-flex-col">
                <span className="tw-text-xs tw-uppercase tw-text-gray-500">Mulai Aktif</span>
                <span className="tw-text-xs tw-uppercase tw-font-medium">
                  {subscription.customerStart?.toDate().formatSummaryDate() ?? '-'}
                </span>
              </div>
              <div className="tw-flex tw-flex-col">
                <span className="tw-text-xs tw-uppercase tw-text-gray-500">SSID</span>
                <span className="tw-text-xs tw-uppercase tw-font-medium">
                  {subscription.routerSsid ?? '-'}
                </span>
              </div>
              <div className="tw-flex tw-flex-col">
                <span className="tw-text-xs tw-uppercase tw-text-gray-500">Password</span>
                <span className="tw-text-xs tw-uppercase tw-font-medium">
                  {subscription.routerPassword ?? '-'}
                </span>
              </div>
              <div className="tw-flex tw-flex-col">
                <span className="tw-text-xs tw-uppercase tw-text-gray-500">GPON SN</span>
                <span className="tw-text-xs tw-uppercase tw-font-medium">
                  {subscription.routerSerialNumber ?? '-'}
                </span>
              </div>
              <div className="tw-flex tw-flex-col">
                <span className="tw-text-xs tw-uppercase tw-text-gray-500">ONU MAC</span>
                <span className="tw-text-xs tw-uppercase tw-font-medium">
                  {subscription.routerMac ?? '-'}
                </span>
              </div>
              <div className="tw-flex tw-flex-col">
                <span className="tw-text-xs tw-uppercase tw-text-gray-500">POP</span>
                <span className="tw-text-xs tw-uppercase tw-font-medium">
                  {subscription.area ?? '-'}
                </span>
              </div>
              <div className="tw-flex tw-flex-col">
                <span className="tw-text-xs tw-uppercase tw-text-gray-500">ODP</span>
                <span className="tw-text-xs tw-uppercase tw-font-medium">
                  {subscription.odp ?? '-'}
                </span>
              </div>
              <div className="tw-flex tw-flex-col">
                <span className="tw-text-xs tw-uppercase tw-text-gray-500">VLAN</span>
                <span className="tw-text-xs tw-uppercase tw-font-medium">
                  {subscription.vlan ?? '-'}
                </span>
              </div>
            </Stack>
            <Divider />
            <div className="tw-flex tw-flex-col">
              <span className="tw-text-xs tw-uppercase tw-text-gray-500">Tanggal Isolir</span>
              <span className="tw-text-xs tw-uppercase tw-font-medium">
                {subscription.isolatedAt?.toDate().formatSummaryDate() ?? '-'}
              </span>
            </div>

            <Stack>
              <span className="tw-text-xs tw-uppercase tw-font-medium">{subscription.package}</span>
              <span className="tw-text-xs tw-uppercase tw-text-gray-500">
                Rp. {subscription.price?.formatCurrency()}
              </span>
            </Stack>

            <Stack spacing={1}>
              <Grid2 container spacing={2}>
                <Grid2>
                  <Chip label="Tunggakan" className="tw-w-min" size="small" />
                </Grid2>
                <Grid2>
                  <span className="tw-text-xs tw-uppercase tw-text-gray-500">
                    Rp. {subscription.billingDebt.formatCurrency()}
                  </span>
                </Grid2>
              </Grid2>
            </Stack>
            <Divider />
          </Stack>
        </AccordionDetails>
        <AccordionActions>
          <Tooltip title="Topologi">
            <IconButton
              onClick={(e) => clickTopology(e, subscription)}
              color="default"
              size="small"
              variant="contained"
            >
              <Icon icon="iconoir:network" />
            </IconButton>
          </Tooltip>
          <Tooltip title="History Log Mikrotik">
            <IconButton
              onClick={(e) => clickHistory(e, subscription)}
              color="default"
              size="small"
              variant="contained"
            >
              <Icon icon="material-symbols:history-rounded" />
            </IconButton>
          </Tooltip>
          <Tooltip title="ACS & Cek Koneksi">
            <IconButton
              onClick={(e) => clickAcs(e, subscription)}
              color="default"
              size="small"
              variant="contained"
            >
              <Icon icon="mdi:network-outline" />
            </IconButton>
          </Tooltip>
          <Tooltip title="ODP Pelanggan">
            <IconButton
              onClick={(e) => onOdpClick(subscription)}
              color="default"
              size="small"
              variant="contained"
            >
              <Icon icon="tabler:circle-dot" />
            </IconButton>
          </Tooltip>
          <Button
            color="grey"
            variant="contained"
            size="small"
            onClick={(e) => onShowMenu(e, subscription)}
          >
            <Iconify icon="mdi-menu" className="tw-mr-2" />
            Action
          </Button>
        </AccordionActions>
      </Accordion>
    </div>
  );
}

function OnuLastRx({ value, onClick }) {
  let val = value;
  val ??= '-00.00';
  // if (!value) return value?.toString();

  let circleColor = 'bg-gray-500';

  if (value <= -27) {
    circleColor = 'tw-bg-orange-400';
  } else if (value <= -21) {
    circleColor = 'tw-bg-green-600';
  } else if (value <= -1) {
    circleColor = 'tw-bg-green-300';
  }

  return (
    <Stack>
      <Stack direction="row" spacing={1} alignItems="center">
        <div className={`tw-size-3 ${circleColor} tw-rounded-full tw-ring-1 tw-ring-black`} />
        <span className=" tw-uppercase">{val}</span>
      </Stack>
    </Stack>
  );
}

/**
 * @param {{info: import('src/repositories/customer').CustomerONUInfo}} param0
 */
function OnuInfo({ info, onRefreshConnection, onShowHistoryLastdown, onRebootOnu }) {
  const runState = {
    0: 'Initial',
    1: 'Online',
    2: 'Offline',
    '-1': 'Connecting',
    '-2': 'NOT FOUND',
  }[info?.RunningState?.toString() ?? '-1'];

  const runStateColor = {
    0: 'tw-bg-orange-500',
    1: 'tw-bg-green-500',
    2: 'tw-bg-red-500',
    '-1': 'tw-bg-orange-500',
    '-2': 'tw-bg-red-500',
  }[info?.RunningState?.toString() ?? '-1'];

  const textStateColor = {
    0: 'tw-text-orange-500',
    1: 'tw-text-green-500',
    2: 'tw-text-red-500',
    '-1': 'tw-text-orange-500',
    '-2': 'tw-text-red-500',
  }[info?.RunningState?.toString() ?? '-1'];

  const onuStateText =
    {
      1: 'Active',
      2: 'Disable',
      3: 'Enable',
      4: 'ActiveS',
      5: 'Awake',
    }[info?.State?.toString()] || 'Unknown';

  return (
    <Stack className="tw-w-full">
      <div className="tw-flex tw-flex-row tw-gap-1 tw-items-center tw-justify-between">
        <div className="tw-flex tw-flex-row tw-gap-1 tw-items-center">
          <div className={`tw-size-2 ${runStateColor} tw-rounded-full tw-ring-1 tw-ring-black`} />
          <span className={`tw-text-xs tw-text-[10px] ${textStateColor} tw-font-bold tw-uppercase`}>
            {runState}
          </span>
        </div>
        <Tooltip title="Refresh Connection">
          <IconButton onClick={onRefreshConnection}>
            <Iconify icon="mdi:refresh" />
          </IconButton>
        </Tooltip>
      </div>
      <span className="tw-text-xs tw-text-[12px] tw-text-gray-500 tw-uppercase tw-whitespace-nowrap">
        TX: <span className="tw-text-black">{info?.TransmittedOpticalPower}</span>
      </span>
      {/* <span className="tw-text-xs tw-text-[12px] tw-text-gray-500 tw-uppercase tw-whitespace-nowrap">
        RX: <span className="tw-text-black">{info?.ReceivedOpticalPower}</span>
      </span> */}
      <span className="tw-text-xs tw-text-[12px] tw-text-gray-500 tw-uppercase">
        UPTIME: <span className="tw-text-black">{info?.Uptime}</span>
      </span>
      <span className="tw-text-xs tw-text-[12px] tw-text-gray-500 tw-uppercase">
        DISTANCE: <span className="tw-text-black">{info?.Distance} m</span>
      </span>
      <span className="tw-text-xs tw-text-[12px] tw-text-gray-500 tw-uppercase tw-whitespace-nowrap">
        DEVICE:{' '}
        <span className="tw-text-black white-space-nowrap">
          {info?.DeviceVendor} - {info?.DeviceModel}
        </span>
      </span>
      <div className="tw-my-1">
        <Divider />
      </div>
      <div className="tw-flex tw-flex-row tw-gap-2 tw-items-center tw-w-full tw-justify-between">
        <span className="tw-text-xs tw-text-[12px] tw-text-gray-500 tw-uppercase">
          <Tooltip title="Last Down Reason">
            <span>LDR: </span>
          </Tooltip>
          <span className="tw-text-black tw-whitespace-nowrap">
            {!!info?.LastDownReason ? info.LastDownReason : '-'}
          </span>
        </span>
        <Tooltip title="History LDR">
          <IconButton size="small" onClick={onShowHistoryLastdown}>
            <Iconify icon="flowbite:exclamation-circle-outline" />
          </IconButton>
        </Tooltip>
      </div>
      <Button size="small" color="warning" variant="soft" onClick={onRebootOnu}>
        Reboot
      </Button>
      {/* <span className="tw-text-xs tw-text-[12px] tw-text-gray-500 tw-uppercase">
        Temp: <span className="tw-text-black">{info?.WorkTemperature}</span>
      </span>
      <span className="tw-text-xs tw-text-[12px] tw-text-gray-500 tw-uppercase">
        Volt: <span className="tw-text-black">{info?.WorkVoltage}</span>
      </span> */}
    </Stack>
  );
}

function ConnectionStatus({ pppActive, ipRemote }) {
  let status = pppActive?.status ?? 0;
  const uptime = pppActive?.uptime ?? '-';
  const address = pppActive?.address ?? '-';
  const lastLoggedOut = pppActive?.lastLoggedOut;

  const isIpAddressDifferent = ipRemote !== address;

  if (lastLoggedOut) {
    status = 2;
  }

  const label = {
    0: 'Connecting',
    1: 'Connected',
    2: 'Disconnected',
  }[status ?? 0];

  const color = {
    0: 'tw-bg-orange-500',
    1: 'tw-bg-green-500',
    2: 'tw-bg-red-500',
  }[status ?? 0];

  const textColor = {
    0: 'tw-text-orange-500',
    1: 'tw-text-green-500',
    2: 'tw-text-red-500',
  }[status ?? 0];

  return (
    <Stack spacing={0.5}>
      <div className="tw-flex tw-flex-row tw-gap-1 tw-items-center">
        <div className={`tw-size-2 ${color} tw-rounded-full`} />
        <span className={`tw-text-xs tw-text-[10px] ${textColor} tw-font-bold tw-uppercase`}>
          {label}
        </span>
      </div>
      <span className="tw-text-xs tw-text-[12px] tw-text-gray-500 tw-uppercase">
        UPTIME: <span className="tw-text-black">{uptime}</span>
      </span>
      <span className="tw-text-xs tw-text-[12px] tw-text-gray-500 tw-uppercase">
        IP:{' '}
        <span className={isIpAddressDifferent ? 'tw-text-red-500' : 'tw-text-black'}>
          {address}
        </span>
      </span>
      <span className="tw-text-xs tw-text-[12px] tw-text-gray-500 tw-uppercase">
        LAST CONNECT: <span className="tw-text-black">{lastLoggedOut}</span>
      </span>
    </Stack>
  );
}
