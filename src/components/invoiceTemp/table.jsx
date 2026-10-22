/**
 * @typedef {import("@/repositories/invoiceTemp").InvoiceTemp} InvoiceTemp
 */

import { Fragment } from 'react';
import { changeSorter } from '@utils/sort';
import { Iconify } from '@components/iconify';
import { connect, useDispatch } from 'react-redux';
import { usePrivilege } from '@auth/hooks/privileges';
import { useExpansionToggle } from '@hooks/use-expansion-toggle';

import Grid from '@mui/material/Unstable_Grid2';
import {
  Chip,
  Table,
  Stack,
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
import { setInvoiceTempStore } from 'src/stores/invoiceTempStore';

/**
 * @param {{
 * invoiceTemporaries: InvoiceTemp[];
 * onMenu: (e: Event, item: InvoiceTemp) => void
 * onDetail: (item: InvoiceTemp) => void
 * orderBy: string
 * order: string
 * showKtp: (url: string) => void
 * }} props
 */
function InvoiceTempTable({ invoiceTemporaries = [], onMenu, onDetail, order, orderBy, showKtp }) {
  const dispatch = useDispatch();
  const headers = [
    { label: 'Pelanggan', id: 'customer', sortable: true },
    {
      label: 'Pembayaran',
      id: 'payment',
      sortable: true,
    },
    {
      label: 'Pengajuan Oleh',
      id: 'requestBy',
      sortable: true,
    },
    {
      label: 'status',
      id: 'status',
      sortable: false,
    },
    {
      label: 'Keterangan',
      id: 'description',
      sortable: false,
    },
    {
      label: 'Approve / Reject User',
      id: 'user',
      sortable: false,
    },
    {
      label: '',
      id: '_',
    },
  ];
  const { isAdmin } = usePrivilege();
  const expansion = useExpansionToggle();

  const statusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'approve':
        return 'success';
      case 'reject':
        return 'error';
      default:
        return 'default';
    }
  };

  const statusLabel = (status) => {
    switch (status) {
      case 'pending':
        return 'Waiting Approval';
      case 'approve':
        return 'Disetujui';
      case 'reject':
        return 'Ditolak';
      default:
        return '-';
    }
  };

  function sort(key) {
    const sortBy = changeSorter(order);
    if (key !== orderBy) {
      dispatch(setInvoiceTempStore({ key: 'orderBy', value: key }));
    }
    dispatch(setInvoiceTempStore({ key: 'order', value: sortBy }));
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
        {invoiceTemporaries.map((invoice, i) => (
          <Fragment key={i}>
            <TableRow>
              <TableCell width={400}>
                <div className="tw-flex tw-flex-row tw-gap-2 tw-items-center tw-w-full">
                  <IconButton onClick={() => expansion.toggle(invoice._id)}>
                    <Iconify icon="ic:baseline-keyboard-arrow-down" />
                  </IconButton>
                  {invoice.customerData.ktp ? (
                    <button
                      type="button"
                      onClick={() => showKtp(invoice.customerData.ktp)}
                      className="tw-flex-none"
                    >
                      <img
                        src={`/public/uploads/${invoice.customerData.ktp.replaceAll('/public/uploads', '')}`}
                        className="tw-w-16 tw-aspect-square tw-rounded-full tw-object-cover tw-object-center"
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
                      className="tw-w-16 tw-aspect-square tw-rounded-full tw-object-cover tw-object-center"
                      alt="KTP"
                    />
                  )}
                  <Stack className="tw-w-auto">
                    <span className="tw-text-xs">
                      <span className="tw-font-semibold"> {invoice.customerData?.fullname}</span> -{' '}
                      {invoice.customerData?.phone}
                    </span>
                    <span className="tw-text-xs tw-text-gray-500">
                      {invoice.customerData?.customerId}
                    </span>
                    <span className="tw-text-xs tw-text-gray-500">{invoice.areaTitle}</span>
                    <span className="tw-text-xs tw-text-gray-500">
                      {invoice.customerData.address}
                    </span>
                  </Stack>
                </div>
              </TableCell>
              <TableCell>
                <Stack>
                  <span className="tw-text-xs tw-font-medium">
                    Rp. {invoice.amount.formatCurrency()}
                  </span>
                  <span className="tw-text-xs tw-text-gray-500 tw-uppercase">
                    {invoice.paymentMethod} - {invoice.depositMethodTitle}
                  </span>
                  <span className="tw-text-xs tw-text-gray-500">
                    {invoice.date.toDate().formatDateTime()}
                  </span>
                </Stack>
              </TableCell>
              <TableCell>
                <Stack spacing={0.2}>
                  <span className="tw-text-xs tw-font-medium">{invoice.createdUserFullname}</span>{' '}
                  <span className="tw-text-xs">
                    {invoice.createdAt?.toDate().format('dd-MM-yyyy HH:mm:ss') ?? '-'}
                  </span>
                </Stack>
              </TableCell>
              <TableCell>
                <Stack spacing={0.7}>
                  <Chip
                    label={statusLabel(invoice.status)}
                    variant="soft"
                    color={statusColor(invoice.status)}
                    className="tw-w-min"
                  />
                  {!!invoice.rejectReason ? (
                    <span className="tw-text-xs tw-text-red-500">{invoice.rejectReason}</span>
                  ) : null}
                </Stack>
              </TableCell>
              <TableCell>
                <span className="tw-text-xs tw-text-gray-500">{invoice.note}</span>
              </TableCell>
              <TableCell>
                <Stack>
                  <span className="tw-text-xs">{invoice.actionUserFullname}</span>
                  <span className="tw-text-xs">
                    {invoice.actionAt?.toDate().format('dd-MM-yyyy HH:mm:ss')}
                  </span>
                </Stack>
              </TableCell>
              <TableCell>
                <Button
                  size="small"
                  color="primary"
                  variant="outlined"
                  className="tw-gap-2"
                  onClick={() => onDetail(invoice)}
                >
                  {/* <Iconify icon="mdi:menu" />  */}
                  Detail
                </Button>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ padding: 0 }} colSpan={4}>
                <Collapse in={expansion.isIncludes(invoice._id)}>
                  <Grid container spacing={1} className="tw-py-3 tw-pl-14 tw-text-gray-500">
                    {/* <Grid xs={6}>
                      <div className="tw-flex tw-flex-row tw-items-center tw-gap-1">
                        <Iconify icon="mdi:dot" />
                        <p className="tw-text-xs tw-font-medium">
                          PPPoE Name: {invoice.customerData?.pppoeName ?? '-'}
                        </p>
                        <Button
                          variant="text"
                          size="small"
                          color="primary"
                          sx={{ height: '10px' }}
                          onClick={() => {
                            copyText(invoice.customerData?.pppoeName, 'PPPoE Name disalin');
                          }}
                        >
                          Salin
                        </Button>
                      </div>
                    </Grid> */}
                    <Grid xs={6}>
                      <p className="tw-text-xs tw-font-medium">
                        <Iconify icon="mdi:dot" /> {invoice.customerData?.vlan ?? '-'}
                      </p>
                    </Grid>
                    {/* <Grid xs={6}>
                      <div className="tw-flex tw-flex-row tw-items-center tw-gap-1">
                        <Iconify icon="mdi:dot" />
                        <p className="tw-text-xs tw-font-medium">
                          PPPoE Password: {invoice.customerData?.pppoePassword ?? '-'}
                        </p>
                        <Button
                          variant="text"
                          size="small"
                          color="primary"
                          sx={{ height: '10px' }}
                          onClick={() => {
                            copyText(
                              invoice.customerData?.pppoePassword ?? '-',
                              'PPPoE Password disalin'
                            );
                          }}
                        >
                          Salin
                        </Button>
                      </div>
                    </Grid> */}
                    <Grid xs={6}>
                      <p className="tw-text-xs tw-font-medium">
                        <Iconify icon="mdi:dot" /> IP Remote:{' '}
                        {invoice.customerData?.ipRemote ?? '-'}
                      </p>
                    </Grid>
                    <Stack spacing={1}>
                      {/* {invoice.customerData.status === 'processed' && (
                        <p className="tw-text-xs tw-font-medium">
                          Teknisi:{' '}
                          {invoice.customerData.engineersData?.map((e) => e.fullname).join(', ') ?? invoice.customerData.engineerName}
                        </p>
                      )} */}
                    </Stack>
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
  const { order, orderBy } = state.invoiceTempStore;
  return { order, orderBy };
};

export default connect(mapStateToProps)(InvoiceTempTable);
