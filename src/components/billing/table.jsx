/**
 * @typedef {import("src/stores/billingStore").Subscription} Subscription
 */

import { Icon } from '@iconify/react';
import { Fragment, useState } from 'react';
import { changeSorter } from '@utils/sort';
import { Iconify } from '@components/iconify';
import { goToGoogleMaps } from '@utils/goToMaps';
import { connect, useDispatch } from 'react-redux';

import Grid2 from '@mui/material/Unstable_Grid2';
import {
  Chip,
  Table,
  Stack,
  Alert,
  Button,
  Tooltip,
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

/**
 * @callback baseCallback
 * @param {Event} event
 * @param {Subscription} subscription
 */

/**
 * @param {{ headers: string[],
 * subscription: Subscription[],
 * onShowMenu: baseCallback,
 * onPrint: baseCallback
 * showPrint: boolean
 * order: string
 * orderBy: string
 * showKtp: (path) => void
 * onEditNote: baseCallback
 * onRemoveNote: baseCallback
 * onInvoiceTempClick: (invoiceTemp: string) => void
 * onCancelSystemNote: (subscription: Subscription) => void
 * }} props
 */
function BillingTable({
  subscription,
  onShowMenu,
  onPrint,
  showPrint = true,
  order,
  orderBy,
  showKtp,
  onEditNote,
  onRemoveNote,
  onInvoiceTempClick,
  onCancelSystemNote,
}) {
  const dispatch = useDispatch();
  const [expandIndex, setExpandIndex] = useState([]);
  const headers = [
    {
      label: 'Data Pelanggan',
      id: 'customer',
      sortable: true,
    },
    {
      label: 'Paket',
      id: 'packet',
      sortable: true,
    },
    {
      label: 'Last Payment',
      id: 'lastBill',
      sortable: true,
    },
    {
      label: 'Jatuh Tempo',
      id: 'nextBill',
      sortable: false,
    },
    {
      label: 'Net Status',
      id: 'networkStatus',
      sortable: false,
    },
    {
      label: 'Keterangan',
      id: 'description',
      sortable: false,
    },
    {
      label: 'Actions',
      id: '_',
      sortable: false,
    },
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

  /**
   *  @param {Subscription} subscription
   */
  const totalBilling = (s) => {
    const total = s.billingDebt;
    if (total === 0) return 0;
    return total?.toString().toNumber().formatCurrency() ?? 0;
  };

  const statusIcon = {
    paid: 'material-symbols:check',
    unpaid: 'material-symbols:close',
  };

  const statusColor = {
    paid: 'success',
    unpaid: 'error',
  };

  function sort(key) {
    const sortBy = changeSorter(order);
    if (key !== orderBy) {
      dispatch(setBillingState({ key: 'orderBy', value: key }));
    }
    dispatch(setBillingState({ key: 'order', value: sortBy }));
  }

  return (
    <Table>
      <TableHead>
        <TableRow>
          {headers.map((h) => (
            <TableCell key={h.id}>
              {h.sortable ? (
                <TableSortLabel
                  direction={orderBy === h.id ? order : 'asc'}
                  onClick={() => sort(h.id)}
                  className="tw-gap-2"
                  IconComponent={() => (
                    <Iconify
                      icon={
                        orderBy === h.id
                          ? order === 'asc'
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
        {subscription.map((s, i) => (
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
              <TableCell width={400}>
                <Stack>
                  <div className="tw-flex tw-flex-row tw-gap-4 tw-items-center">
                    <IconButton
                      aria-label="expand row"
                      size="small"
                      onClick={() => toggleExpand(i)}
                      className="tw-w-min tw-h-min"
                    >
                      {expandIndex.includes(i) ? (
                        <Icon icon="ic:baseline-keyboard-arrow-up" />
                      ) : (
                        <Icon icon="ic:baseline-keyboard-arrow-down" />
                      )}
                    </IconButton>
                    {s.customerKtp ? (
                      <button
                        type="button"
                        onClick={() => showKtp(s.customerKtp)}
                        className=" tw-flex-none "
                      >
                        <img
                          src={`/public/uploads/${s.customerKtp.replaceAll('/public/uploads', '')}`}
                          className="tw-w-16 tw-flex-none tw-aspect-square tw-rounded-full tw-object-cover tw-object-center"
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
                        className="tw-w-16 tw-flex-none tw-aspect-square tw-rounded-full tw-object-cover tw-object-center"
                        alt="KTP"
                      />
                    )}
                    <div className="tw-flex tw-flex-col tw-w-auto">
                      <span className="tw-text-xs tw-uppercase">
                        <span className=" tw-font-semibold">{s.fullname}</span>
                      </span>
                      <ul className="tw-pl-5 tw-list-disc tw-gap-2">
                        <li>
                          <span className="tw-text-xs tw-uppercase tw-text-gray-500">
                            {s.customerId}
                          </span>
                        </li>
                        <li>
                          <span className="tw-text-xs tw-uppercase tw-text-gray-500">
                            {s.phone} | {s.area}
                          </span>
                        </li>
                        <li>
                          <p className="tw-text-xs tw-uppercase tw-text-gray-500">{s.address}</p>
                        </li>
                      </ul>
                    </div>
                  </div>
                  {!!s.note && (
                    <div className="tw-mt-2 tw-text-xs tw-w-full">
                      <Alert
                        icon={false}
                        severity="warning"
                        action={
                          <div className="tw-w-full tw-flex tw-flex-row tw-items-center tw-gap-2">
                            <IconButton
                              type="button"
                              onClick={() => onEditNote(s)}
                              size="small"
                              color="success"
                            >
                              <Iconify icon="mdi:pencil" />
                            </IconButton>
                            <IconButton
                              type="button"
                              onClick={() => onRemoveNote(s)}
                              size="small"
                              color="error"
                            >
                              <Iconify icon="mdi:close" />
                            </IconButton>
                          </div>
                        }
                      >
                        <div className="tw-w-full tw-flex tw-flex-row tw-items-center tw-gap-2">
                          <span className="tw-text-xs tw-w-full">{s.note}</span>
                        </div>
                      </Alert>
                    </div>
                  )}
                  {!!s.systemNote && (
                    <Alert
                      severity="info"
                      className="tw-mt-2 tw-w-full"
                      action={
                        <IconButton
                          type="button"
                          onClick={() => onCancelSystemNote(s)}
                          size="small"
                          color="error"
                        >
                          <Iconify icon="mdi:close" />
                        </IconButton>
                      }
                    >
                      <Stack className="tw-w-full">
                        <div className="tw-w-full tw-flex tw-flex-row tw-items-center tw-gap-2">
                          <span className="tw-text-xs tw-w-full">{s.systemNote}</span>
                        </div>
                        <span className="tw-text-xs tw-w-full tw-mt-2">- by {s.systemNoteBy}</span>
                      </Stack>
                      <div className="tw-flex-grow" />
                    </Alert>
                  )}
                </Stack>
              </TableCell>
              <TableCell>
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
                          : ' tw-text-red-500'
                      }
                    >
                      {s.status}
                    </span>
                  </span>
                  {/* <span className="tw-text-xs tw-uppercase tw-text-gray-500">Rp. {s.price?.formatCurrency()}</span> */}
                  {/* {s.isolated && <Chip label="Isolated" className="tw-w-min" size="small" />} */}
                </Stack>
              </TableCell>
              <TableCell>
                {s.lastInvoiceDate != null && s.lastInvoiceAmount != null ? (
                  <Stack>
                    <span className="tw-text-xs tw-uppercase tw-font-medium">
                      Rp. {s.lastInvoiceAmount.toString().toNumber().formatCurrency()}
                    </span>
                    <span className="tw-text-xs tw-uppercase tw-text-gray-500">
                      {s.lastInvoiceDate.toDate().formatSummaryDate()}
                    </span>
                  </Stack>
                ) : (
                  <span className="tw-text-xs tw-uppercase tw-text-gray-500">Tidak Ada</span>
                )}
              </TableCell>
              <TableCell>
                <Stack spacing={0.5}>
                  <span className="tw-text-xs tw-uppercase">
                    {s.duoDate?.toDate().format('EEE, dd MMM yyyy') ?? '-'}
                  </span>
                  {s.duoDate != null &&
                  totalBilling(s) > 0 &&
                  new Date().getTime() > s.duoDate.toDate().getTime() ? (
                    <Chip
                      label="Jatuh Tempo"
                      color="error"
                      variant="soft"
                      className="tw-w-min"
                      size="small"
                    />
                  ) : null}
                </Stack>
              </TableCell>
              <TableCell>
                <Stack spacing={0.5}>
                  <span className="tw-text-xs tw-uppercase tw-text-gray-500">
                    {s.isolatedAt?.toDate().formatSummaryDate()}
                  </span>
                  <Stack spacing={0.5}>
                    <Tooltip
                      title={
                        s.isolatedCode === 'M'
                          ? 'Manual'
                          : s.isolatedCode === 'S'
                            ? 'System'
                            : 'Unknown'
                      }
                    >
                      <Chip
                        variant="soft"
                        color={s.isolated ? 'error' : 'success'}
                        label={s.isolated ? `Isolir` : 'Open'}
                        size="small"
                        className="tw-w-min"
                      />
                    </Tooltip>
                    {s.isolatedCode === 'scheduled' ? (
                      <Chip
                        variant="soft"
                        color="warning"
                        label="Schedule Isolir"
                        size="small"
                        className="tw-w-min"
                      />
                    ) : null}
                  </Stack>
                  {/* {s.isolatedCode === 'scheduled' ? (
                    <Chip
                      variant="soft"
                      color="warning"
                      label="Schedule Isolir"
                      size="small"
                      className="tw-w-min"
                    />
                  ) : (
                    <Stack spacing={0.5}>
                      <Tooltip
                        title={
                          s.isolatedCode === 'M'
                            ? 'Manual'
                            : s.isolatedCode === 'S'
                              ? 'System'
                              : 'Unknown'
                        }
                      >
                        <Chip
                          variant="soft"
                          color={s.isolated ? 'error' : 'success'}
                          label={s.isolated ? `Isolir` : 'Open'}
                          size="small"
                          className="tw-w-min"
                        />
                      </Tooltip>
                    </Stack>
                  )} */}

                  {/* {s.isolated ? 'Isolir' : 'Open'} */}
                </Stack>
              </TableCell>
              <TableCell>
                <Stack spacing={0.5}>
                  <span className="tw-text-xs tw-uppercase tw-text-gray-500">
                    Jumlah Tagihan: Rp. {totalBilling(s)}
                  </span>
                  <div className="tw-flex tw-flex-wrap tw-gap-2">
                    <Chip
                      size="small"
                      color={s.billingDebt <= 0 ? 'success' : 'error'}
                      label={s.billingDebt <= 0 ? 'Lunas' : 'Belum Lunas'}
                      variant="soft"
                      className="tw-w-min"
                    />
                    {s.isSpecial ? (
                      <Chip
                        size="small"
                        color="primary"
                        label="Pelanggan Spesial"
                        variant="soft"
                        className="tw-w-min"
                      />
                    ) : null}
                    {!!s.invoiceTemp ? (
                      <button
                        type="button"
                        className="tw-w-min"
                        onClick={() => onInvoiceTempClick(s.invoiceTemp)}
                      >
                        <Chip
                          size="small"
                          color="warning"
                          label="Req Payment"
                          variant="soft"
                          className="tw-w-min"
                        />
                      </button>
                    ) : null}
                  </div>
                </Stack>
              </TableCell>
              <TableCell>
                <Grid2 container spacing={2}>
                  <Grid2>
                    <Stack direction="row" spacing={1}>
                      <Tooltip title="Menu">
                        <IconButton
                          onClick={(e) => onShowMenu(e, s)}
                          id={`${i}-basic-button`}
                          color="default"
                          variant="contained"
                        >
                          <Icon icon="gg:menu-round" />
                        </IconButton>
                      </Tooltip>

                      {!s.note && (
                        <Tooltip title="Catatan">
                          <IconButton
                            variant="text"
                            color="primary"
                            size="small"
                            onClick={() => onEditNote(s)}
                          >
                            <Iconify icon="ci:note-edit" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Stack>
                  </Grid2>
                  {/* <Grid2>
                    <Button
                      onClick={(e) => onShowMenu(e, s)}
                      id={`${i}-basic-button`}
                      color="info"
                      variant="contained"
                    >
                      <Icon icon="ic:baseline-menu" className="tw-mr-2" />
                    </Button>
                  </Grid2> */}
                  <Grid2>
                    {showPrint && (
                      <Button onClick={() => onPrint(s)} color="primary" variant="outlined">
                        <Icon icon="ph:printer" className="tw-mr-2" />
                        Cetak
                      </Button>
                    )}
                  </Grid2>
                </Grid2>
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
              <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
                <Collapse in={expandIndex.includes(i)}>
                  <Grid2 container spacing={2} className="tw-py-3 tw-px-10">
                    {/* <Grid2 xs={6}>
                      <div className="tw-flex tw-flex-col">
                        <span className="tw-text-xs tw-uppercase tw-text-gray-500">Area / POP</span>
                        <span className="tw-text-xs tw-uppercase tw-font-medium">{s.area}</span>
                      </div>
                    </Grid2> */}
                    <Grid2 xs={6}>
                      <div className="tw-flex tw-flex-col">
                        <span className="tw-text-xs tw-uppercase tw-text-gray-500">ODP</span>
                        <span className="tw-text-xs tw-uppercase tw-text-gray-500">{s.odp}</span>
                      </div>
                    </Grid2>
                    <Grid2 xs={6}>
                      <div className="tw-flex tw-flex-col">
                        <span className="tw-text-xs tw-uppercase tw-text-gray-500">VLAN</span>
                        <span className="tw-text-xs tw-uppercase tw-text-gray-500">{s.vlan}</span>
                      </div>
                    </Grid2>
                    <Grid2 xs={6}>
                      <div className="tw-flex tw-flex-col">
                        <span className="tw-text-xs tw-uppercase tw-text-gray-500">SSID</span>
                        <span className="tw-text-xs tw-uppercase tw-text-gray-500">
                          {s.routerSsid}
                        </span>
                      </div>
                    </Grid2>
                    <Grid2 xs={6}>
                      <div className="tw-flex tw-flex-col">
                        <span className="tw-text-xs tw-uppercase tw-text-gray-500">Password</span>
                        <span className="tw-text-xs tw-uppercase tw-text-gray-500">
                          {s.routerPassword}
                        </span>
                      </div>
                    </Grid2>
                    <Grid2 xs={6}>
                      <div className="tw-flex tw-flex-col">
                        <span className="tw-text-xs tw-uppercase tw-text-gray-500">
                          Serial Number
                        </span>
                        <span className="tw-text-xs tw-uppercase tw-text-gray-500">
                          {s.routerSerialNumber}
                        </span>
                      </div>
                    </Grid2>
                    <Grid2 xs={6}>
                      <div className="tw-flex tw-flex-col">
                        <span className="tw-text-xs tw-uppercase tw-text-gray-500">
                          Mulai Aktif
                        </span>
                        <span className="tw-text-xs tw-uppercase tw-text-gray-500">
                          {s.customerStart?.toDate().formatSummaryDate() ?? '-'}
                        </span>
                      </div>
                    </Grid2>
                    {s.location && (
                      <Grid2 xs={6}>
                        <Button
                          size="small"
                          variant="text"
                          color="primary"
                          onClick={() => {
                            goToGoogleMaps(s.location.lat, s.location.lng);
                          }}
                        >
                          Lokasi
                        </Button>
                      </Grid2>
                    )}
                  </Grid2>
                </Collapse>
              </TableCell>
            </TableRow>
          </Fragment>
        ))}
      </TableBody>
    </Table>
  );
}

const mapStateToProps = (state) => {
  const { order, orderBy } = state.billingStore;
  return { order, orderBy };
};

export default connect(mapStateToProps)(BillingTable);
