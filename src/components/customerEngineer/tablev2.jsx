/**
 * @typedef {import('src/repositories/customer').PPPActive} PPPActive
 * @typedef {import("src/stores/billingStore").Subscription} Subscription
 */

import { toast } from 'sonner';
import { Icon } from '@iconify/react';
import { Fragment, useState } from 'react';
import { changeSorter } from '@utils/sort';
import { Iconify } from '@components/iconify';
import { goToGoogleMaps } from '@utils/goToMaps';
import { connect, useDispatch } from 'react-redux';
import PrtgTraffic from '@components/prtg/PrtgTraffic';

import {
  Chip,
  Grid,
  Table,
  Stack,
  Button,
  Tooltip,
  Divider,
  TableRow,
  Collapse,
  TableCell,
  TableHead,
  TableBody,
  IconButton,
  TableSortLabel,
} from '@mui/material';

import 'src/extension/date';
import 'src/extension/number';
import 'src/extension/string';
import { setBillingState } from 'src/stores/billingStore';

// Constants
const STATUS_ICONS = {
  paid: 'material-symbols:check',
  unpaid: 'material-symbols:close',
};

const STATUS_COLORS = {
  paid: 'success',
  unpaid: 'error',
};

const RUN_STATE_LABELS = {
  0: 'Initial',
  1: 'Online',
  2: 'Offline',
  '-1': 'Connecting',
  '-2': 'NOT FOUND',
};

const RUN_STATE_COLORS = {
  0: 'tw-bg-orange-500',
  1: 'tw-bg-green-500',
  2: 'tw-bg-red-500',
  '-1': 'tw-bg-orange-500',
  '-2': 'tw-bg-red-500',
};

const RUN_STATE_TEXT_COLORS = {
  0: 'tw-text-orange-500',
  1: 'tw-text-green-500',
  2: 'tw-text-red-500',
  '-1': 'tw-text-orange-500',
  '-2': 'tw-text-red-500',
};

const ONU_STATE_LABELS = {
  1: 'Active',
  2: 'Disable',
  3: 'Enable',
  4: 'ActiveS',
  5: 'Awake',
};

const CONNECTION_STATUS_LABELS = {
  0: 'Connecting',
  1: 'Connected',
  2: 'Disconnected',
};

const CONNECTION_STATUS_COLORS = {
  0: 'tw-bg-orange-500',
  1: 'tw-bg-green-500',
  2: 'tw-bg-red-500',
};

const CONNECTION_TEXT_COLORS = {
  0: 'tw-text-orange-500',
  1: 'tw-text-green-500',
  2: 'tw-text-red-500',
};

/**
 * @callback baseCallback
 * @param {Event} event
 * @param {Subscription} subscription
 */

/**
 * @param {{ headers: string[],
 * subscription: Subscription[],
 * order: string
 * orderBy: string
 * overlayOrder: string
 * overlayOrderBy: string
 * onAction: (e: Event, data: Subscription) => void;
 * clickTopology: (e: Event, data: Subscription) => void;
 * clickHistory: (e: Event, data: Subscription) => void;
 * clickAcs: (e: Event, data: Subscription) => void;
 * onRefreshConnection(data: Subscription, variant: "onu" | "pppoe") => void
 * onOdpClick: (data: Subscription) => void;
 * onChangeSort: (order: string, orderBy: string) => void;
 * onHybridRefreshConnection: (data: Subscription) => void;
 * onShowHistoryDataOLT: (data: Subscription) => void;
 * onShowHistoryLastdown: (data: Subscription) => void;
 * onChangeSerialNumber: (data: Subscription) => void;
 * onRebootOnu: (data: Subscription) => void;
 * }} props
 */

function TableV2({
  subscription,
  order,
  orderBy,
  overlayOrder,
  overlayOrderBy,
  onAction,
  clickTopology,
  clickHistory,
  clickAcs,
  onRefreshConnection,
  onOdpClick,
  onChangeSort,
  onHybridRefreshConnection,
  onShowHistoryDataOLT,
  onShowHistoryLastdown,
  onChangeSerialNumber,
  onRebootOnu,
}) {
  const dispatch = useDispatch();
  const [expandIndex, setExpandIndex] = useState([]);

  const headers = [
    { label: 'Data Pelanggan', id: 'customer', sortable: true },
    { label: 'PPPoE Mikrotik', id: 'connection', sortable: false },
    { label: 'Data OLT', id: 'onu', sortable: false, colspan: 2 },
    { label: 'Paket', id: 'packet', sortable: false },
    { label: 'CIS', id: 'isolated', sortable: true },
    { label: 'Router', id: 'isolated', sortable: true },
    { label: 'Actions', id: '_', sortable: false },
  ];

  const toggleExpand = (index) => {
    const items = [...expandIndex];
    const indexItem = items.findIndex((i) => i === index);

    if (indexItem !== -1) {
      items.splice(indexItem, 1);
    } else {
      items.push(index);
    }

    setExpandIndex(items);
  };

  const handleSort = (key) => {
    const currentOrderBy = overlayOrderBy ?? orderBy;
    const currentOrder = overlayOrder ?? order;
    const sortBy = changeSorter(currentOrder);

    if (key !== currentOrderBy) {
      if (onChangeSort) {
        onChangeSort('asc', key);
      } else {
        dispatch(setBillingState({ key: 'orderBy', value: key }));
      }
    }

    if (onChangeSort) {
      onChangeSort(sortBy, key);
    } else {
      dispatch(setBillingState({ key: 'order', value: sortBy }));
    }
  };

  /** @param {Subscription} item */
  const isIpAddressDifference = (item) => {
    const { pppActive, ipRemote } = item;
    let pppIpAddress = pppActive?.address;
    if (pppIpAddress === '-') pppIpAddress = null;
    if (!pppActive || !pppIpAddress) return false;

    return pppIpAddress !== ipRemote;
  };

  const acsSerialNumberDifference = (item) => {
    const acsSerialNumberExist = !!item.acsSerialNumber?.trim();
    const routerSerialNumberExist = !!item.routerSerialNumber?.trim();
    const serialNumberDifference = item.routerSerialNumber !== item.acsSerialNumber;

    return acsSerialNumberExist && routerSerialNumberExist && serialNumberDifference;
  };

  const bgColorRow = (item) => {
    const ipAddressDifference = isIpAddressDifference(item);
    const acsSerialNumberDiff = acsSerialNumberDifference(item);

    const isError = acsSerialNumberDiff || ipAddressDifference;
    if (isError) return 'tw-bg-red-100';

    return '';
  };

  /** @param {Subscription} item */
  const rowErrors = (item) => {
    const errors = [];
    const ipAddressDifference = isIpAddressDifference(item);
    const serialNumberDifference = acsSerialNumberDifference(item);

    if (!item.routerSerialNumber?.trim()) errors.push('Serial Number Belum Diinput');

    if (serialNumberDifference) errors.push('Serial Number Berbeda dengan ACS');

    if (ipAddressDifference) errors.push('IP Remote Berbeda dengan PPPoE Mikrotik');
    return errors;
  };

  return (
    <Table>
      <TableHead>
        <TableRow>
          {headers.map((h) => (
            <TableCell align="center" colSpan={h.colspan ?? 1} key={h.id}>
              {h.sortable ? (
                <TableSortLabel
                  direction={orderBy === h.id ? order : 'asc'}
                  onClick={() => handleSort(h.id)}
                  className="tw-gap-2"
                  IconComponent={() => {
                    const currentOrderBy = overlayOrderBy ?? orderBy;
                    const currentOrder = overlayOrder ?? order;

                    if (currentOrderBy !== h.id) return null;

                    return (
                      <Iconify icon={currentOrder === 'asc' ? 'mdi:menu-up' : 'mdi:menu-down'} />
                    );
                  }}
                >
                  {h.label}
                </TableSortLabel>
              ) : (
                h.label
              )}
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {subscription.map((s, i) => (
          <Fragment key={i}>
            <TableRow
              sx={{
                backgroundColor: expandIndex.includes(i) ? 'rgba(0, 0, 0, 0.05)' : bgColorRow(s),
                borderCollapse: 'collapse',
                borderTop: expandIndex.includes(i) ? 'solid 1px' : 'transparent',
                borderRight: expandIndex.includes(i) ? 'solid 1px' : 'transparent',
                borderLeft: expandIndex.includes(i) ? 'solid 1px' : 'transparent',
              }}
              className={bgColorRow(s)}
            >
              <TableCell width={400} style={{ verticalAlign: 'top', padding: 7 }}>
                <Tooltip
                  title={
                    rowErrors(s).length === 0 ? null : (
                      <ul className="tw-list-disc tw-ml-4">
                        {rowErrors(s).map((error, index) => (
                          <li key={index} className="tw-text-xs tw-text-white">
                            {error}
                          </li>
                        ))}
                      </ul>
                    )
                  }
                >
                  {/* Data Pelanggan */}
                  <Stack>
                    <div className="tw-flex tw-flex-row tw-gap-4 tw-items-center">
                      <IconButton
                        aria-label="expand row"
                        size="small"
                        onClick={() => toggleExpand(i)}
                        className="tw-w-min tw-h-min tw-ring-1"
                      >
                        {expandIndex.includes(i) ? (
                          <Icon icon="ic:baseline-keyboard-arrow-up" />
                        ) : (
                          <Icon icon="ic:baseline-keyboard-arrow-down" />
                        )}
                      </IconButton>
                      <div className="tw-flex tw-flex-col tw-w-auto">
                        <Stack direction="row" className="tw-h-min" alignItems="center">
                          <span className="tw-text-xs tw-uppercase">
                            <span className=" tw-font-semibold">{s.fullname}</span> - {s.phone}
                          </span>
                          <IconButton
                            sx={{ p: 0 }}
                            aria-label="expand row"
                            size="small"
                            onClick={() => onHybridRefreshConnection(s)}
                            className="tw-w-min tw-h-min"
                          >
                            <Icon icon="mdi:refresh" />
                          </IconButton>
                        </Stack>
                        <ul className="tw-pl-5 tw-list-disc tw-mt-1 tw-space-y-0.5">
                          <li className="-tw-my-1">
                            <span className="tw-text-xs tw-uppercase tw-text-gray-500 tw-flex tw-flex-row tw-items-center">
                              SN:{' '}
                              {!!s.routerSerialNumber ? (
                                <span className="tw-text-gray-500 tw-font-semibold">
                                  {s.routerSerialNumber}
                                </span>
                              ) : (
                                <span className="tw-text-red-500 tw-font-semibold">
                                  Belum Di-input
                                </span>
                              )}{' '}
                              <span className="tw-mx-1">|</span>
                              <span className="tw-text-gray-500 tw-font-semibold">
                                {s.ipRemote ?? '-'}
                              </span>
                              <IconButton
                                size="small"
                                onClick={() => onChangeSerialNumber(s)}
                                sx={{ p: 0, ml: 1 }}
                              >
                                <Iconify icon="mdi:pencil" width={14} />
                              </IconButton>
                            </span>
                          </li>
                          <li className="-tw-my-1">
                            <span className="tw-text-xs tw-uppercase tw-text-gray-500">
                              ID:{' '}
                              <span className="tw-text-gray-500 tw-font-semibold">
                                {s.customerId}
                              </span>
                              <span className="tw-mx-1">|</span>
                              <span className="tw-text-gray-500 tw-font-semibold">{s.area}</span>
                            </span>
                          </li>
                          <button
                            type="button"
                            className="tw-text-left"
                            onClick={() => {
                              if (!s.location?.lat || !s.location?.lng)
                                toast.error('Data Pelanggan tidak memiliki koordinat lokasi');
                              else goToGoogleMaps(s.location.lat, s.location.lng);
                            }}
                          >
                            <li className="-tw-my-1 tw-text-left">
                              <p className="tw-text-xs tw-uppercase tw-text-gray-500 hover:tw-underline tw-text-left tw-font-semibold">
                                {s.address}
                              </p>
                            </li>
                          </button>
                        </ul>
                      </div>
                    </div>
                  </Stack>
                  {/* End Data Pelanggan */}
                </Tooltip>
              </TableCell>
              <TableCell width={180} style={{ verticalAlign: 'top', padding: 7 }}>
                <Stack direction="row" spacing={1} alignItems="start">
                  <ConnectionStatus pppActive={s.pppActive} ipRemote={s.ipRemote} />
                  <IconButton sx={{ p: 0 }} onClick={() => onRefreshConnection(s, 'pppoe')}>
                    <Iconify icon="mdi:refresh" />
                  </IconButton>
                </Stack>
              </TableCell>
              <TableCell width={180} style={{ verticalAlign: 'top', padding: 7 }}>
                <OnuInfo
                  info={s.onuInfo}
                  onRefreshConnection={() => onRefreshConnection(s, 'onu')}
                  onShowHistoryLastdown={() => onShowHistoryLastdown(s)}
                />
              </TableCell>
              <TableCell style={{ verticalAlign: 'top', padding: 7 }}>
                <OnuLastRx
                  value={s.onuInfo?.ReceivedOpticalPower}
                  info={s.onuInfo}
                  onChartRx={() => onShowHistoryDataOLT(s)}
                  onShowHistoryLastdown={() => onShowHistoryLastdown(s)}
                  onRebootOnu={() => onRebootOnu(s)}
                />
                {/* <Tooltip title="Chart RX">
                    <IconButton className="tw-w-min" onClick={() => onShowHistoryDataOLT(s)}>
                      <Iconify icon="fe:line-chart" />
                    </IconButton>
                  </Tooltip> */}
              </TableCell>
              <TableCell style={{ verticalAlign: 'top', padding: 7 }}>
                <Stack>
                  <span className="tw-text-xs tw-uppercase tw-font-medium tw-whitespace-nowrap">
                    {s.package}
                  </span>
                  <span className="tw-text-xs tw-uppercase tw-text-gray-500">
                    Rp. {s.price?.formatCurrency()}
                  </span>
                  <span className="tw-text-xs tw-uppercase tw-text-gray-500">
                    Status:{' '}
                    <span
                      className={
                        s.status.toLowerCase() === 'active'
                          ? 'tw-text-green-600'
                          : 'tw-text-red-500'
                      }
                    >
                      {s.status}
                    </span>
                  </span>
                </Stack>
              </TableCell>
              <TableCell style={{ verticalAlign: 'top', padding: 7 }}>
                <Stack spacing={0.5}>
                  <div className="tw-flex tw-flex-wrap tw-gap-2">
                    {/* Isolir Status From Database */}
                    <Tooltip
                      title={
                        s.isolatedCode === 'M'
                          ? 'CIS (Manual)'
                          : s.isolatedCode === 'S'
                            ? 'CIS (System)'
                            : 'CIS (Unknown)'
                      }
                    >
                      <Chip
                        variant="outlined"
                        color={s.isolated ? 'error' : 'success'}
                        label={s.isolated ? `Isolir` : 'Open'}
                        size="small"
                        className="tw-w-min"
                      />
                    </Tooltip>
                  </div>

                  <span className="tw-text-xs tw-uppercase tw-text-gray-500">
                    {s.isolatedAt?.toDate().formatSummaryDate()}
                  </span>
                </Stack>
              </TableCell>
              <TableCell style={{ verticalAlign: 'top', padding: 7 }}>
                {/* Isolir Status From Mikrotik */}
                <Tooltip title="Isolir Mikrotik Status">
                  <Chip
                    variant="outlined"
                    color={
                      typeof s.isIsolirMikrotik === 'undefined'
                        ? 'warning'
                        : s.isIsolirMikrotik === true
                          ? 'error'
                          : 'success'
                    }
                    label={
                      typeof s.isIsolirMikrotik === 'undefined'
                        ? 'Connecting'
                        : s.isIsolirMikrotik === true
                          ? `Isolir`
                          : 'Open'
                    }
                    size="small"
                    className="tw-w-min"
                  />
                </Tooltip>
              </TableCell>

              <TableCell width={100} style={{ verticalAlign: 'top', padding: 7 }}>
                <Grid container spacing={0.5}>
                  <Grid item xs={4}>
                    <Tooltip title="ACS & Cek Koneksi">
                      <IconButton
                        onClick={(e) => clickAcs(e, s)}
                        id={`${i}-basic-button`}
                        color="default"
                        size="small"
                        variant="contained"
                      >
                        <Icon icon="mdi:network-outline" />
                      </IconButton>
                    </Tooltip>
                  </Grid>
                  <Grid item xs={4}>
                    <Tooltip title="ODP Pelanggan">
                      <IconButton
                        onClick={(e) => onOdpClick(s)}
                        color="default"
                        size="small"
                        variant="contained"
                      >
                        <Icon icon="tabler:circle-dot" />
                      </IconButton>
                    </Tooltip>
                  </Grid>
                  <Grid item xs={4}>
                    <Tooltip title="Topologi">
                      <IconButton
                        onClick={(e) => clickTopology(e, s)}
                        id={`${i}-basic-button`}
                        color="default"
                        size="small"
                        variant="contained"
                      >
                        <Icon icon="iconoir:network" />
                      </IconButton>
                    </Tooltip>
                  </Grid>
                  <Grid item xs={4}>
                    <Tooltip title="History Log Mikrotik">
                      <IconButton
                        onClick={(e) => clickHistory(e, s)}
                        id={`${i}-basic-button`}
                        color="default"
                        size="small"
                        variant="contained"
                      >
                        <Icon icon="material-symbols:history-rounded" />
                      </IconButton>
                    </Tooltip>
                  </Grid>
                  <Grid item xs={4}>
                    <IconButton
                      color="grey"
                      variant="contained"
                      size="small"
                      onClick={(e) => onAction(e, s)}
                      className="tw-w-min"
                    >
                      <Iconify icon="mdi-menu" className="tw-mr-2" />
                    </IconButton>
                  </Grid>
                </Grid>
              </TableCell>
            </TableRow>
            <TableRow
              sx={{
                backgroundColor: expandIndex.includes(i) ? 'rgba(0, 0, 0, 0.05)' : 'white',
                borderCollapse: 'collapse',
                borderBottom: expandIndex.includes(i) ? 'solid 1px' : 'transparent',
                borderRight: expandIndex.includes(i) ? 'solid 1px' : 'transparent',
                borderLeft: expandIndex.includes(i) ? 'solid 1px' : 'transparent',
              }}
            >
              <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={headers.length + 1}>
                <Collapse in={expandIndex.includes(i)}>
                  <Stack className="tw-p-4" spacing={2}>
                    <div className="tw-grid tw-grid-cols-7">
                      <InfoField label="ODP" value={s.odp ?? '-'} />
                      <InfoField label="VLAN" value={s.vlan ?? '-'} />
                      <InfoField label="SSID" value={s.routerSsid ?? '-'} />
                      <InfoField label="Password" value={s.routerPassword ?? '-'} />
                      <InfoField label="GPON SN" value={s.routerSerialNumber ?? '-'} />
                      <InfoField label="ONU MAC" value={s.routerMac ?? '-'} />
                      <InfoField
                        label="Mulai Aktif"
                        value={s.customerStart?.toDate().formatSummaryDate() ?? '-'}
                      />
                    </div>
                    <PrtgTraffic customer_id={s._id} />
                  </Stack>
                </Collapse>
              </TableCell>
            </TableRow>
          </Fragment>
        ))}
      </TableBody>
    </Table>
  );
}

// Helper component for info fields
function InfoField({ label, value }) {
  return (
    <div className="tw-flex tw-flex-col">
      <span className="tw-text-xs tw-uppercase tw-text-gray-500">{label}</span>
      <span className="tw-text-xs tw-uppercase tw-text-black">{value}</span>
    </div>
  );
}

/**
 * @param {{
 * info: import('src/repositories/customer').CustomerONUInfo
 * value: number
 * onClick: Function
 * onShowHistoryLastdown: Function
 * onChartRx: Function
 * onRebootOnu: Function
 * }} param0
 */
function OnuLastRx({ value, info, onClick, onShowHistoryLastdown, onChartRx, onRebootOnu }) {
  let val = value;
  val ??= '-0.00';

  let circleColor = 'bg-gray-500';

  if (value <= -27) {
    circleColor = 'tw-bg-orange-400';
  } else if (value <= -21) {
    circleColor = 'tw-bg-green-600';
  } else if (value <= -1) {
    circleColor = 'tw-bg-green-300';
  }

  return (
    <Stack className="tw-text-xs tw-w-full">
      <Stack direction="row" spacing={1} alignItems="center">
        <Stack direction="row" spacing={1} alignItems="center">
          RX: <span className="tw-uppercase">{val}</span>
          <div className={`tw-size-2 ${circleColor} tw-rounded-full tw-ring-1 tw-ring-black`} />
        </Stack>
        |
        <Stack direction="row" spacing={1} alignItems="center">
          TX: <span className="tw-uppercase">{info?.TransmittedOpticalPower ?? '-0.00'}</span>
        </Stack>
        <Tooltip title="Chart RX">
          <IconButton sx={{ p: 0 }} className="tw-w-min" onClick={onChartRx}>
            <Iconify icon="fe:line-chart" />
          </IconButton>
        </Tooltip>
      </Stack>

      <Button size="small" color="warning" variant="soft" onClick={onRebootOnu}>
        Reboot
      </Button>

      <Divider className="tw-my-1" />
      <div className="tw-flex tw-flex-row tw-gap-2 tw-items-center tw-w-full tw-justify-between">
        <span className="tw-text-xs tw-text-gray-500 tw-uppercase">
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
    </Stack>
  );
}

/**
 * @param {{info: import('src/repositories/customer').CustomerONUInfo}} param0
 */
function OnuInfo({ info, onRefreshConnection, onShowHistoryLastdown }) {
  const runningState = info?.RunningState?.toString() ?? '-1';

  const runState = RUN_STATE_LABELS[runningState];
  const runStateColor = RUN_STATE_COLORS[runningState];
  const textStateColor = RUN_STATE_TEXT_COLORS[runningState];
  const onuStateText = ONU_STATE_LABELS[info?.State?.toString()] || 'Unknown';

  return (
    <Stack className="tw-w-full -tw-mt-1.5">
      <div className="tw-flex tw-flex-row tw-gap-1 tw-items-center tw-justify-between">
        <div className="tw-flex tw-flex-row tw-gap-1 tw-items-center">
          <div className={`tw-size-2 ${runStateColor} tw-rounded-full tw-ring-1 tw-ring-black`} />
          <span className={`tw-text-xs tw-text-[10px] ${textStateColor} tw-font-bold tw-uppercase`}>
            {runState}
          </span>
        </div>
        <Tooltip title="Refresh Connection">
          <IconButton size="small" onClick={onRefreshConnection}>
            <Iconify icon="mdi:refresh" />
          </IconButton>
        </Tooltip>
      </div>

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
    </Stack>
  );
}

/**
 * Component to display PPPoE connection status
 * @param {PPPActive} pppActive
 * @returns
 */
function ConnectionStatus({ pppActive, ipRemote }) {
  let status = pppActive?.status ?? 0;
  const uptime = pppActive?.uptime ?? '-';
  const address = pppActive?.address ?? '-';
  const lastLoggedOut = pppActive?.lastLoggedOut;
  const isIpAddressDifferent = ipRemote !== address;

  if (lastLoggedOut) {
    status = 2;
  }

  const label = CONNECTION_STATUS_LABELS[status ?? 0];
  const color = CONNECTION_STATUS_COLORS[status ?? 0];
  const textColor = CONNECTION_TEXT_COLORS[status ?? 0];

  return (
    <Stack>
      <div className="tw-flex tw-flex-row tw-gap-1 tw-items-center">
        <div className={`tw-size-2 ${color} tw-rounded-full tw-ring-1 tw-ring-black`} />
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

const mapStateToProps = (state) => {
  const { order, orderBy } = state.billingStore;
  return { order, orderBy };
};

export default connect(mapStateToProps)(TableV2);
