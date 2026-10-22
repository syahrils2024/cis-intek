import {
  Chip,
  Grid,
  Stack,
  Table,
  Button,
  Divider,
  Tooltip,
  TableRow,
  Collapse,
  Accordion,
  TableHead,
  TableCell,
  TableBody,
  IconButton,
  TableSortLabel,
  AccordionSummary,
  AccordionActions,
  AccordionDetails,
} from '@mui/material';

/**
 * @typedef {import("src/repositories/customer").Customer} Customer
 */

import { Icon } from '@iconify/react';
import { Fragment, useState } from 'react';
import { changeSorter } from '@utils/sort';
import { Iconify } from '@components/iconify';
import { goToGoogleMaps } from '@utils/goToMaps';
import { connect, useDispatch } from 'react-redux';
import { usePrivilege } from '@auth/hooks/privileges';

import { setAreaConfigurationState } from 'src/stores/areaConfiguration';

/**
 * @callback CallbackCustomer
 * @param {Customer} customer
 */

/**
 * @param {{
 * customers: Customer[];
 * onEdit: CallbackCustomer;
 * onRemove: CallbackCustomer;
 * onShowTopology: CallbackCustomer;
 * onClickBilling: CallbackCustomer;
 * customerOrderBy: string;
 * customerOrder: string;
 * readOnly: boolean;
 * showKtp: (ktpUrl) => void;
 * rewritePPPoE: CallbackCustomer;
 * onShowHistoryDataOLT: CallbackCustomer;
 * onShowHistoryLastdown: CallbackCustomer;
 * onRebootOnu: CallbackCustomer
 *  }} param0
 */
function AreaConfigurationCustomerTable({
  customers,
  onEdit,
  onRemove,
  onShowTopology,
  onClickBilling,
  customerOrder,
  customerOrderBy,
  readOnly = false,
  showKtp,
  rewritePPPoE,
  onShowHistoryDataOLT,
  onShowHistoryLastdown,
  onRebootOnu,
}) {
  const { isAdmin, isLo } = usePrivilege();
  const dispatch = useDispatch();
  const headers = [
    {
      label: 'Pelanggan',
      id: 'fullname',
      sortable: true,
    },
    {
      label: 'Tagihan',
      id: 'tagihan',
      sortable: false,
    },
    {
      label: 'Odp',
      id: 'odp',
      sortable: true,
    },
    {
      label: 'PPPoE',
      id: 'network',
      sortable: false,
    },
    {
      label: 'Remote OLT',
      id: 'olt',
      sortable: false,
    },
    {
      label: 'Redaman OLT',
      id: 'lastRx',
      sortable: false,
    },
    {
      label: 'Actions',
      id: '_',
      sortable: false,
    },
  ];

  const [expandIndex, setExpandIndex] = useState([]);

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

  function sort(key) {
    const sortBy = changeSorter(customerOrder);
    if (key !== customerOrderBy) {
      dispatch(setAreaConfigurationState({ key: 'customerOrderBy', value: key }));
    }
    dispatch(setAreaConfigurationState({ key: 'customerOrder', value: sortBy }));
  }

  return (
    <Table>
      <TableHead>
        <TableRow>
          {headers.map((h) => (
            <TableCell key={h.id} sortDirection={h.id === customerOrderBy ? customerOrder : false}>
              {h.sortable ? (
                <TableSortLabel
                  direction={customerOrderBy === h.id ? customerOrder : 'asc'}
                  onClick={() => sort(h.id)}
                  className="tw-gap-2"
                  IconComponent={() => (
                    <Iconify
                      icon={
                        customerOrderBy === h.id
                          ? customerOrder === 'asc'
                            ? 'mdi:menu-up'
                            : 'mdi:menu-down'
                          : 'mdi:menu-up'
                      }
                    />
                  )}
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
        {customers.map((customer, i) => (
          <Fragment key={i}>
            <TableRow
              sx={{
                backgroundColor: expandIndex.includes(i) ? 'rgba(0, 0, 0, 0.05)' : 'white',
                borderCollapse: 'collapse',
                borderTop: expandIndex.includes(i) ? 'solid 1px' : 'transparent',
                borderRight: expandIndex.includes(i) ? 'solid 1px' : 'transparent',
                borderLeft: expandIndex.includes(i) ? 'solid 1px' : 'transparent',
              }}
            >
              <TableCell>
                <div className="tw-flex tw-flex-row tw-gap-2 tw-items-center">
                  <IconButton aria-label="expand row" size="small" onClick={() => toggleExpand(i)}>
                    {expandIndex.includes(i) ? (
                      <Iconify icon="ic:baseline-keyboard-arrow-up" />
                    ) : (
                      <Iconify icon="ic:baseline-keyboard-arrow-down" />
                    )}
                  </IconButton>
                  {customer.ktp ? (
                    <button
                      type="button"
                      onClick={() => showKtp(customer.ktp)}
                      className="tw-flex-none"
                    >
                      <img
                        src={`/public/uploads/${customer.ktp.replaceAll('/public/uploads', '')}`}
                        className="tw-w-12 tw-aspect-square tw-rounded-full tw-object-cover tw-object-center tw-flex-none"
                        alt="KTP"
                        onError={(c) => {
                          c.currentTarget.onerror = null;
                          c.currentTarget.src = '/assets/avatar-25.webp';
                        }}
                      />
                    </button>
                  ) : (
                    <img
                      src="/assets/avatar-25.webp"
                      className="tw-w-12 tw-aspect-square tw-rounded-full tw-object-cover tw-object-center"
                      alt="KTP"
                    />
                  )}
                  <div className="tw-flex tw-flex-col tw-gap-0.5">
                    <span className="tw-text-xs tw-font-semibold">{customer.fullname}</span>
                    <p className="tw-text-xs tw-text-gray-500">{customer.customerId}</p>
                    <p className="tw-text-xs tw-text-gray-500">{customer.phone}</p>
                    <ChipStatus status={customer.status} />
                    {/* <p className="tw-text-xs tw-text-gray-500">{customer.address}</p> */}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="tw-flex tw-flex-col tw-gap-1">
                  {customer.billingDebt > 0 ? (
                    <span className="tw-text-xs">Rp. {customer.billingDebt?.formatCurrency()}</span>
                  ) : (
                    <Chip
                      label="Lunas"
                      size="small"
                      color="success"
                      className="tw-w-min"
                      variant="soft"
                    />
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="tw-flex tw-flex-col tw-gap-1">
                  <span className="tw-text-xs">- {customer.ODPDetail?.name}</span>
                  <span className="tw-text-xs">- {customer.vlan}</span>
                </div>
              </TableCell>
              <TableCell>
                <ConnectionStatus pppActive={customer.pppActive} />
              </TableCell>
              <TableCell>
                <OnuInfo info={customer?.onuInfo} />
              </TableCell>
              <TableCell>
                <Stack alignItems="center">
                  <OnuLastRx
                    value={customer?.onuInfo?.ReceivedOpticalPower}
                    info={customer?.onuInfo}
                    onChartRx={() => onShowHistoryDataOLT?.(customer)}
                    onShowHistoryLastdown={() => onShowHistoryLastdown?.(customer)}
                    onRebootOnu={() => {
                      // console.log(onRebootOnu);
                      onRebootOnu?.(customer);
                    }}
                  />
                  {/* <Tooltip title="Chart RX">
                    <IconButton
                      className="tw-w-min"
                      onClick={() => {
                        onShowHistoryDataOLT?.(customer);
                      }}
                    >
                      <Iconify icon="fe:line-chart" />
                    </IconButton>
                  </Tooltip> */}
                </Stack>
              </TableCell>
              <TableCell>
                <div className="tw-grid tw-grid-cols-3 2xl:tw-flex tw-flex-row tw-whitespace-nowrap tw-gap-1">
                  {(isAdmin || isLo) && (
                    <>
                      <Button className="tw-w-min" onClick={() => onClickBilling(customer)}>
                        <Iconify icon="token:idrt" fontSize={24} />
                      </Button>
                      <Button className="tw-w-min" onClick={() => rewritePPPoE(customer)}>
                        <Iconify icon="codicon:vm-connect" fontSize={24} />
                      </Button>
                    </>
                  )}
                  <Button className="tw-w-min" onClick={() => onShowTopology(customer)}>
                    <Iconify icon="iconoir:network" fontSize={24} />
                  </Button>
                  {!readOnly && (
                    <>
                      <Button className="tw-w-min" color="success" onClick={() => onEdit(customer)}>
                        <Iconify icon="ic:baseline-edit" fontSize={24} />
                      </Button>
                      <Button className="tw-w-min" color="error" onClick={() => onRemove(customer)}>
                        <Iconify icon="uiw:stop-o" fontSize={24} />
                      </Button>
                    </>
                  )}
                </div>
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
              <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={4}>
                <Collapse in={expandIndex.includes(i)}>
                  <Grid container spacing={0.5} className="tw-py-3 tw-px-10">
                    <Grid item xs={6}>
                      <Stack spacing={1}>
                        <p className="tw-text-xs tw-text-gray-500">Telepon: {customer.phone}</p>
                        <p className="tw-text-xs tw-text-gray-500">
                          Harga Paket: Rp. {customer.activePackage?.price.formatCurrency()}
                        </p>
                        <p className="tw-text-xs tw-text-gray-500">
                          {customer.activePackage.package}
                        </p>
                        <p className="tw-text-xs tw-text-gray-500">SSID: {customer.routerSsid}</p>
                        <p className="tw-text-xs tw-text-gray-500">
                          Password: {customer.routerPassword}
                        </p>
                      </Stack>
                    </Grid>
                    <Grid item xs={6}>
                      <Stack spacing={1}>
                        <Chip
                          label={customer.isolated ? 'Isolated' : 'Not Isolated'}
                          size="small"
                          className="tw-w-min tw-mt-0.5 tw-text-primary"
                        />
                        {customer.location?.lat && customer.location?.lng ? (
                          <Chip
                            title="Lokasi"
                            label="Lokasi"
                            size="small"
                            className="tw-w-min"
                            onClick={() => {
                              goToGoogleMaps(customer.location.lat, customer.location.lng);
                            }}
                          />
                        ) : null}
                        {customer.isSpecial && (
                          <Chip
                            size="small"
                            color="primary"
                            label="Pelanggan Spesial"
                            variant="outlined"
                            className="tw-w-min"
                          />
                        )}
                        <p className="tw-text-xs tw-text-gray-500">
                          Area: {customer.area?.title ?? '-'}
                        </p>
                        <p className="tw-text-xs tw-text-gray-500">
                          PPPoE Name: {customer.pppoeName}
                        </p>
                        <p className="tw-text-xs tw-text-gray-500">
                          PPPoE Password: {customer.pppoePassword}
                        </p>
                        <p className="tw-text-xs tw-text-gray-500">
                          GPON MAC: {customer.routerMac ?? '-'}
                        </p>
                        <p className="tw-text-xs tw-text-gray-500">
                          GPON SN: {customer.routerSerialNumber ?? '-'}
                        </p>
                      </Stack>
                    </Grid>
                  </Grid>
                </Collapse>
              </TableCell>
            </TableRow>
          </Fragment>
        ))}
      </TableBody>
    </Table>
  );
}

const mapStateToProps = (state, ownProps) => {
  const { customerOrder, customerOrderBy } = state.areaConfigurationStore;
  const {onRebootOnu} = ownProps
  return { customerOrder, customerOrderBy, onRebootOnu };
};

const DataTableComponent = connect(mapStateToProps)(AreaConfigurationCustomerTable);

/**
 * @param {{customer: Customer, onEdit: void, onRemove: void; onShowTopology: void; onClickBilling: void; readOnly: boolean;
 * showKtp: (ktp: string) => void; rewritePPPoE: CallbackCustomer; onShowHistoryDataOLT: CallbackCustomer
 * }} props
 */

function AreaConfigurationCustomerMobile({
  customer,
  onEdit,
  onRemove,
  onShowTopology,
  onClickBilling,
  readOnly = false,
  showKtp,
  rewritePPPoE,
  onShowHistoryDataOLT,
}) {
  const { isAdmin, isLo } = usePrivilege();

  return (
    <div className="tw-ring-1 tw-ring-gray-300 tw-rounded-lg tw-w-full">
      <Accordion className="tw-w-full">
        <AccordionSummary className="tw-w-full">
          <Stack className="tw-w-full" spacing={1}>
            <Stack className="tw-w-full" direction="row" spacing={1} justifyContent="end">
              <ChipStatus status={customer.status} />
            </Stack>
            <Divider />
            <div className="tw-flex tw-flex-row tw-gap-2 tw-items-start tw-justify-between tw-w-full">
              {customer.ktp ? (
                <button type="button" onClick={() => showKtp(customer.ktp)}>
                  <img
                    src={`/public/uploads/${customer.ktp.replaceAll('/public/uploads', '')}`}
                    className="tw-w-12 tw-aspect-square tw-rounded-full tw-object-cover tw-object-center"
                    alt="KTP"
                    onError={(c) => {
                      c.currentTarget.onerror = null;
                      c.currentTarget.src = '/assets/avatar-25.webp';
                    }}
                  />
                </button>
              ) : (
                <img
                  src="/assets/avatar-25.webp"
                  className="tw-w-12 tw-aspect-square tw-rounded-full tw-object-cover tw-object-center"
                  alt="KTP"
                />
              )}
              <div className="tw-flex tw-flex-col tw-w-full">
                <p className="tw-text-sm tw-font-semibold tw-uppercase">{customer.fullname}</p>
                <p className="tw-text-xs tw-text-gray-500 tw-uppercase">{customer.customerId}</p>
                <p className="tw-text-xs tw-text-gray-500 tw-uppercase">{customer.phone}</p>
                {/* <p className="tw-text-xs tw-text-gray-500">{customer.address}</p> */}
              </div>
              {customer.isSpecial && (
                <Chip size="small" label="Spesial" variant="outlined" color="success" />
              )}
            </div>
          </Stack>
        </AccordionSummary>
        <AccordionDetails>
          {customer.isSpecial && (
            <Chip
              size="small"
              color="primary"
              label="Pelanggan Spesial"
              variant="outlined"
              className="tw-w-min"
            />
          )}
          <Divider sx={{ marginBottom: 1 }} />
          <div className="tw-flex tw-flex-col tw-gap-3">
            <ConnectionStatus pppActive={customer.pppActive} />
            <Stack direction="row" alignItems="center" spacing={2} flexWrap="wrap">
              <OnuInfo info={customer?.onuInfo} />
              <Tooltip title="Chart RX">
                <IconButton className="tw-w-min" onClick={() => onShowHistoryDataOLT?.(customer)}>
                  <Iconify icon="fe:line-chart" />
                </IconButton>
              </Tooltip>
            </Stack>
            <OnuLastRx value={customer.onuInfo?.ReceivedOpticalPower} />

            <div className="tw-flex tw-flex-col tw-mt-2">
              <p className="tw-text-xs tw-text-gray-500">Sisa Tagihan</p>
              <div className="tw-flex tw-flex-col tw-gap-1">
                {customer.billingDebt > 0 ? (
                  <span className="tw-text-xs">Rp. {customer.billingDebt?.formatCurrency()}</span>
                ) : (
                  <Chip
                    label="Lunas"
                    size="small"
                    color="success"
                    className="tw-w-min"
                    variant="soft"
                  />
                )}
              </div>
            </div>

            <div className="tw-flex tw-flex-col tw-mt-2">
              <p className="tw-text-xs tw-text-gray-500">GPON SN</p>
              <p className="tw-text-xs tw-font-medium">{customer.routerSerialNumber ?? '-'}</p>
            </div>
            <div className="tw-flex tw-flex-col">
              <p className="tw-text-xs tw-text-gray-500">GPON MAC</p>
              <p className="tw-text-xs tw-font-medium">{customer.routerMac ?? '-'}</p>
            </div>
            <div className="tw-flex tw-flex-col">
              <p className="tw-text-xs tw-text-gray-500">SSID</p>
              <p className="tw-text-xs tw-font-medium">{customer.routerSsid ?? '-'}</p>
            </div>
            <div className="tw-flex tw-flex-col">
              <p className="tw-text-xs tw-text-gray-500">Password</p>
              <p className="tw-text-xs tw-font-medium">{customer.routerPassword ?? '-'}</p>
            </div>
            <div className="tw-flex tw-flex-col">
              <p className="tw-text-xs tw-text-gray-500">Area / POP</p>
              <p className="tw-text-xs tw-font-medium">{customer.area?.title ?? '-'}</p>
            </div>
          </div>

          <Divider
            sx={{
              marginY: 1,
            }}
          />
          <div className="tw-flex tw-flex-col tw-gap-0.5">
            <p className="tw-text-xs">{customer.activePackage.package}</p>
            <p className="tw-text-xs tw-text-gray-500">
              Rp. {customer.activePackage?.price.formatCurrency()}
            </p>
            {customer.location?.lat && customer.location?.lng ? (
              <Chip
                title="Lokasi"
                label="Lokasi"
                size="small"
                className="tw-w-min"
                onClick={() => {
                  goToGoogleMaps(customer.location.lat, customer.location.lng);
                }}
              />
            ) : null}
          </div>
          <Divider
            sx={{
              marginY: 2,
            }}
          />
          <div className="tw-flex tw-flex-col">
            <p className="tw-text-xs">{customer.ipRemote}</p>
            <Chip
              // color={customer.isolated ? 'primary' : 'error'}
              label={customer.isolated ? 'Isolated' : 'Not Isolated'}
              size="small"
              className="tw-w-min tw-mt-0.5"
            />
          </div>
          <Divider
            sx={{
              marginY: 2,
            }}
          />
          <div className="tw-flex tw-flex-col tw-gap-1.5">
            <p className="tw-text-xs tw-text-gray-500">{customer?.ODPDetail?.name ?? '-'}</p>
            <p className="tw-text-xs tw-text-gray-500">{customer?.vlan ?? '-'}</p>
          </div>
        </AccordionDetails>
        <AccordionActions>
          <div className="tw-flex tw-flex-wrap tw-gap-3">
            {(isAdmin || isLo) && (
              <>
                <Button className="tw-w-min" onClick={onClickBilling}>
                  <Icon icon="token:idrt" fontSize={24} />
                </Button>
                <Button className="tw-w-min" onClick={() => rewritePPPoE(customer)}>
                  <Icon icon="codicon:vm-connect" fontSize={24} />
                </Button>
              </>
            )}
            <Button className="tw-w-min" onClick={onShowTopology}>
              <Icon icon="iconoir:network" style={{ fontSize: 18 }} />
            </Button>

            {!readOnly && (
              <>
                <Button className="tw-w-min" color="success" onClick={onEdit}>
                  <Icon icon="ic:baseline-edit" style={{ fontSize: 18 }} />
                </Button>
                <Button className="tw-w-min" color="error" onClick={onRemove}>
                  <Icon icon="uiw:stop-o" style={{ fontSize: 18 }} />
                </Button>
              </>
            )}
          </div>
        </AccordionActions>
      </Accordion>
    </div>
  );
}

function ConnectionStatus({ pppActive }) {
  let status = pppActive?.status ?? 0;
  const uptime = pppActive?.uptime ?? '-';
  const address = pppActive?.address ?? '-';
  const lastLoggedOut = pppActive?.lastLoggedOut;

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
      <span className="tw-text-xs tw-text-[12px] tw-text-gray-500 tw-uppercase">UPTIME</span>
      <span className="tw-text-xs tw-text-[12px] tw-text-gray-500 tw-uppercase">
        IP: <span className="tw-text-black">{address}</span>
      </span>
      <span className="tw-text-xs tw-text-[12px] tw-text-gray-500 tw-uppercase">
        LAST CONNECT: <span className="tw-text-black">{lastLoggedOut}</span>
      </span>
    </Stack>
  );
}

function ChipStatus({ status }) {
  const label =
    {
      active: 'Active',
      inactive: 'Inactive',
      banned: 'Banned',
    }[status] ?? status;

  const color =
    {
      active: 'success',
      inactive: 'error',
      banned: 'error',
    }[status] ?? 'info';

  return <Chip label={label} size="small" color={color} className="tw-w-min" variant="soft" />;
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
          <Tooltip title="Chart RX">
            <IconButton sx={{ p: 0 }} className="tw-w-min" onClick={() => onChartRx()}>
              <Iconify icon="fe:line-chart" />
            </IconButton>
          </Tooltip>
        </Stack>
        |
        <Stack direction="row" spacing={1} alignItems="center">
          TX: <span className="tw-uppercase">{info?.TransmittedOpticalPower ?? '-0.00'}</span>
        </Stack>
      </Stack>
      <Button size="small" color="warning" variant="soft" onClick={onRebootOnu}>
        Reboot
      </Button>
      <div className="tw-my-1">
        <Divider />
      </div>
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
      {/* <span className="tw-text-xs tw-text-[12px] tw-text-gray-500 tw-uppercase tw-whitespace-nowrap">
        TX: <span className="tw-text-black">{info?.TransmittedOpticalPower}</span>
      </span> */}
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
      {/* <div className="tw-my-1">
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
      </div> */}

      {/* <span className="tw-text-xs tw-text-[12px] tw-text-gray-500 tw-uppercase">
        Temp: <span className="tw-text-black">{info?.WorkTemperature}</span>
      </span>
      <span className="tw-text-xs tw-text-[12px] tw-text-gray-500 tw-uppercase">
        Volt: <span className="tw-text-black">{info?.WorkVoltage}</span>
      </span> */}
    </Stack>
  );
}

export const AreaConfigurationCustomerData = {
  Mobile: AreaConfigurationCustomerMobile,
  Table: DataTableComponent,
};
