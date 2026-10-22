/**
 * @typedef {import("@/repositories/customer").CustomerListFromEngineer} CustomerListFromEngineer
 */

import { toast } from 'sonner';
import { Fragment } from 'react';
import { changeSorter } from '@utils/sort';
import { copyText } from '@utils/clipboard';
import { Iconify } from '@components/iconify';
import { goToGoogleMaps } from '@utils/goToMaps';
import { connect, useDispatch } from 'react-redux';
import { useExpansionToggle } from '@hooks/use-expansion-toggle';

import Grid from '@mui/material/Unstable_Grid2';
import {
  Chip,
  Table,
  Button,
  TableRow,
  Collapse,
  TableCell,
  TableHead,
  TableBody,
  IconButton,
  TableSortLabel,
} from '@mui/material';

import 'src/extension/date';
import 'src/extension/string';
import 'src/extension/number';
import { setCustomerEngineerStore } from 'src/stores/customerEngineerStore';
/**
 *
 * @param {{customers: CustomerListFromEngineer[], onAction: (e: Event, data: CustomerListFromEngineer) => void; order: string; orderBy: string; showKtp: (ktp: string) => void}} param0
 */
function CustomerEngineerTable({ customers, onAction, order, orderBy, showKtp }) {
  // const headers = ['Pelanggan', 'Paket', 'Pembayaran', ''];
  const dispatch = useDispatch();
  const expansionToggle = useExpansionToggle();
  const headers = [
    {
      label: 'Pelanggan',
      id: 'customer',
      sortable: true,
    },
    {
      label: 'Paket',
      id: 'packet',
      sortable: true,
    },
    {
      label: 'Pembayaran',
      id: 'payment',
      sortable: true,
    },
    {
      label: '',
      id: '_',
      sortable: false,
    },
  ];

  /**
   * @param {Odp} odp
   */
  const onLocationODP = (odp) => {
    if (!odp.lat || !odp.lng) {
      toast.info('Lokasi ODP belum ditentukan');
      return;
    }

    goToGoogleMaps(odp.lat, odp.lng);
  };

  function sort(key) {
    const sortBy = orderBy === key ? changeSorter(order) : 'asc';
    if (key !== orderBy) {
      dispatch(setCustomerEngineerStore({ key: 'orderBy', value: key }));
    }
    dispatch(setCustomerEngineerStore({ key: 'order', value: sortBy }));
  }

  return (
    <Table>
      <TableHead>
        <TableRow>
          {headers.map((h) => (
            <TableCell key={h.id} sortDirection={h.id === orderBy ? order : false}>
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
        {customers.map((c, i) => (
          <Fragment key={i}>
            <TableRow
              className={
                expansionToggle.isIncludes(c._id) &&
                'tw-bg-gray-200 tw-border-t tw-border-x tw-border-gray-400'
              }
            >
              <TableCell>
                <div className="tw-flex tw-flex-row tw-items-center tw-gap-2">
                  <IconButton onClick={() => expansionToggle.toggle(c._id)}>
                    <Iconify icon="mdi:menu-down" />
                  </IconButton>
                  {c.ktp ? (
                    <button type="button" onClick={() => showKtp(c.ktp)}>
                      <img
                        src={`/public/uploads/${c.ktp.replaceAll('/public/uploads', '')}`}
                        className="tw-w-16 tw-flex-none tw-aspect-square tw-rounded-full tw-object-cover tw-object-center"
                        alt="KTP"
                        onError={({ currentTarget }) => {
                          currentTarget.onerror = null;
                          currentTarget.src = '/assets/avatar-25.webp';
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
                  <div className="tw-flex tw-flex-col">
                    <span className="tw-text-xs tw-font-medium">{c.fullname}</span>
                    <span className="tw-text-xs">{c.customerId}</span>
                    <span className="tw-text-xs">{c.phone}</span>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="tw-flex tw-flex-col">
                  <span className="tw-text-xs tw-font-medium">{c.packageData?.title}</span>
                  <Chip
                    variant="outlined"
                    label={c.isolated ? 'Isolir' : 'Non Isolir'}
                    color={c.isolated ? 'error' : 'success'}
                    size="small"
                    className="tw-w-min tw-mt-2"
                  />
                  {/* <span className="tw-text-xs">{c.isolated ? 'Isolir' : 'Non Isolir'}</span> */}
                </div>
              </TableCell>
              <TableCell>
                {c.billingData ? (
                  <div className="tw-flex tw-flex-col">
                    <span className="tw-text-xs tw-font-medium">
                      {new Date(
                        c.billingData.year,
                        c.billingData.month
                      ).formatSummaryDateMonthYear()}
                    </span>
                    <span className="tw-text-xs">
                      Rp. {c.activePackage?.price.formatCurrency()}
                    </span>
                    <span className="tw-text-xs">
                      {c.billingData.status === 'Paid' ? 'Dibayar' : 'Belum Dibayar'}
                    </span>
                  </div>
                ) : (
                  <span>Pembayaran Terakhir tidak ditemukan</span>
                )}
              </TableCell>
              <TableCell>
                <Button
                  color="primary"
                  variant="contained"
                  size="small"
                  onClick={(e) => onAction(e, c)}
                >
                  <Iconify icon="mdi-menu" className="tw-mr-2" />
                  Action
                </Button>
              </TableCell>
            </TableRow>
            <TableRow
              className={
                expansionToggle.isIncludes(c._id) &&
                'tw-bg-gray-200 tw-border-b tw-border-x tw-border-gray-400'
              }
            >
              <TableCell sx={{ padding: 0 }} colSpan={4}>
                <Collapse in={expansionToggle.isIncludes(c._id)}>
                  <Grid container spacing={1} className="tw-py-3 tw-pl-24 tw-text-gray-500">
                    <Grid xs={6}>
                      <div className="tw-flex tw-flex-row tw-items-center tw-gap-1">
                        <p className="tw-text-xs tw-font-medium">
                          <Iconify icon="mdi:dot" /> {c.odpName ?? '-'}
                        </p>
                        {c.odpData && (
                          <Button
                            variant="text"
                            size="small"
                            color="primary"
                            sx={{ height: '10px' }}
                            onClick={() => {
                              onLocationODP(c.odpData);
                            }}
                          >
                            Lokasi
                          </Button>
                        )}
                      </div>
                    </Grid>
                    {/* {isAdmin && ( */}
                    <Grid xs={6}>
                      <p className="tw-text-xs tw-font-medium">
                        <Iconify icon="mdi:dot" /> Area Server: {c.areaData?.title ?? '-'}
                      </p>
                    </Grid>
                    {/* )} */}
                    <Grid xs={6}>
                      <div className="tw-flex tw-flex-row tw-items-center tw-gap-1">
                        <Iconify icon="mdi:dot" />
                        <p className="tw-text-xs tw-font-medium">
                          PPPoE Name: {c.pppoeName ?? '-'}
                        </p>
                        <Button
                          variant="text"
                          size="small"
                          color="primary"
                          sx={{ height: '10px' }}
                          onClick={() => {
                            copyText(c.pppoeName, 'PPPoE Name disalin');
                          }}
                        >
                          Salin
                        </Button>
                      </div>
                    </Grid>
                    <Grid xs={6}>
                      <p className="tw-text-xs tw-font-medium">
                        <Iconify icon="mdi:dot" /> {c.vlan ?? '-'}
                      </p>
                    </Grid>
                    <Grid xs={6}>
                      <div className="tw-flex tw-flex-row tw-items-center tw-gap-1">
                        <Iconify icon="mdi:dot" />
                        <p className="tw-text-xs tw-font-medium">
                          PPPoE Password: {c.pppoePassword ?? '-'}
                        </p>
                        <Button
                          variant="text"
                          size="small"
                          color="primary"
                          sx={{ height: '10px' }}
                          onClick={() => {
                            copyText(c.pppoePassword, 'PPPoE Password disalin');
                          }}
                        >
                          Salin
                        </Button>
                      </div>
                    </Grid>
                    <Grid xs={6}>
                      <p className="tw-text-xs tw-font-medium">
                        <Iconify icon="mdi:dot" /> IP Remote: {c.ipRemote ?? '-'}
                      </p>
                    </Grid>
                    <Grid xs={6}>
                      <div className="tw-flex tw-flex-row tw-items-center tw-gap-1">
                        <Iconify icon="mdi:dot" />
                        <p className="tw-text-xs tw-font-medium">SSID: {c.routerSsid ?? '-'}</p>
                      </div>
                    </Grid>
                    <Grid xs={6}>
                      <div className="tw-flex tw-flex-row tw-items-center tw-gap-1">
                        <Iconify icon="mdi:dot" />
                        <p className="tw-text-xs tw-font-medium">
                          Password: {c.routerPassword ?? '-'}
                        </p>
                      </div>
                    </Grid>
                    <Grid xs={6}>
                      <div className="tw-flex tw-flex-row tw-items-center tw-gap-1">
                        <Iconify icon="mdi:dot" />
                        <p className="tw-text-xs tw-font-medium">
                          S/N: {c.routerSerialNumber ?? '-'}
                        </p>
                      </div>
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

const mapStateToProps = (state) => {
  const { order, orderBy } = state.customerEngineerStore;
  return { order, orderBy };
};

export default connect(mapStateToProps)(CustomerEngineerTable);
