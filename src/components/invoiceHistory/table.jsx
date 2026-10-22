/**
 * @typedef {import("src/repositories/subscription").InvoiceHistory} InvoiceHistory
 */

import { Fragment } from 'react';
import { changeSorter } from '@utils/sort';
import { Iconify } from '@components/iconify';
import { connect, useDispatch } from 'react-redux';

import {
  Table,
  Stack,
  Button,
  TableRow,
  TableCell,
  TableHead,
  TableBody,
  TableSortLabel,
} from '@mui/material';

import 'src/extension/date';
import 'src/extension/string';
import 'src/extension/number';
import { setInvoiceStore } from 'src/stores/invoiceStore';

/**
 * @param {{order: string; orderBy: string; data: InvoiceHistory[]; showEvidence: () => void}} param0
 */
function InvoiceHistoryTable({ order, data, orderBy, showEvidence }) {
  const dispatch = useDispatch();

  const headers = [
    {
      label: 'Pelanggan',
      id: 'orderBy',
      sortable: true,
    },
    {
      label: 'Paket',
      id: 'packet',
      sortable: true,
    },
    {
      label: 'Jumlah Pembayaran',
      id: 'payment',
      sortable: true,
    },
    {
      label: 'Catatan',
      id: 'note',
      sortable: false,
    },
    {
      label: 'Resi',
      id: 'resi',
      sortable: false,
    },
    {
      label: 'Tanggal',
      id: 'date',
      sortable: true,
    },
    {
      label: 'Admin',
      id: 'recipient',
      sortable: false,
    },
  ];

  function sort(key) {
    const sortBy = changeSorter(order);
    if (key !== orderBy) {
      dispatch(setInvoiceStore({ key: 'orderBy', value: key }));
    }
    dispatch(setInvoiceStore({ key: 'order', value: sortBy }));
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
        {data?.map((d, i) => (
          <Fragment key={i}>
            <TableRow>
              <TableCell>
                <Stack>
                  <span className="tw-text-xs tw-font-semibold">{d.customerFullname}</span>
                  <span className="tw-text-xs tw-text-gray-500">{d.customerId}</span>
                  <span className="tw-text-xs tw-text-gray-500">{d.customerPhone}</span>
                  <span className="tw-text-xs tw-text-gray-500">{d.customerAddress}</span>
                </Stack>
              </TableCell>
              <TableCell>
                <Stack>
                  <span className="tw-text-xs tw-font-semibold">{d.customerPackage}</span>
                  <span className="tw-text-xs tw-text-gray-500">
                    Rp. {d.customerPackagePrice?.toString().toNumber().formatCurrency() ?? '-'}
                  </span>
                </Stack>
              </TableCell>
              <TableCell>
                <div className="tw-flex tw-flex-row tw-gap-2 tw-items-center">
                  <Stack>
                    <span className="tw-text-xs tw-font-semibold">
                      Rp. {d.amount?.toString().toNumber().formatCurrency() ?? '-'}
                    </span>
                    <span className="tw-text-xs tw-text-gray-500">
                      {d.paymentMethod} - {d.depositMethod}
                    </span>
                  </Stack>
                </div>
              </TableCell>
              <TableCell>
                <div className="tw-flex tw-flex-row tw-gap-2 tw-items-center">
                  <Stack>
                    <span className="tw-text-xs tw-text-gray-500">{d.note ?? '-'}</span>
                  </Stack>
                </div>
              </TableCell>
              <TableCell>
                {(d.paymentEvidences?.length >= 1 ?? 0) >= 1 ? (
                  <Button
                    color="primary"
                    variant="text"
                    size="small"
                    onClick={() => showEvidence(d)}
                  >
                    <img
                      className="tw-aspect-square tw-h-14 tw-object-cover tw-object-center tw-rounded-full"
                      src={`/public/uploads/${d.paymentEvidences[0].replaceAll(
                        '/public/uploads/',
                        ''
                      )}`}
                      alt="Bukti Pembayaran"
                    />
                  </Button>
                ) : (
                  <span className="tw-text-xs tw-text-gray-500">Tidak ada resi</span>
                )}
              </TableCell>
              <TableCell>
                <Stack>
                  <span className="tw-text-xs tw-font-semibold">
                    {d.date?.toDate().formatDateTime() ?? '-'}
                  </span>
                </Stack>
              </TableCell>
              <TableCell>
                <Stack>
                  <span className="tw-text-xs tw-font-semibold">{d.recipientName}</span>
                </Stack>
              </TableCell>
            </TableRow>
          </Fragment>
        ))}
      </TableBody>
    </Table>
  );
}

const mapStateToProps = (state) => {
  const { order } = state.invoiceStore;
  return { order };
};

export default connect(mapStateToProps)(InvoiceHistoryTable);
