/**
 * @typedef {import("src/repositories/customerTransactionAdmin").CustomerTransactionAdmin} CustomerTransactionAdmin
 */

import { getBankImagePath } from '@utils/getBankImage';

import {
  Chip,
  Table,
  Stack,
  Button,
  Divider,
  TableRow,
  TableCell,
  TableHead,
  TableBody,
} from '@mui/material';

import 'src/extension/string';
import 'src/extension/number';
import 'src/extension/date';

/**
 * @param {{
 * items: CustomerTransactionAdmin[];
 * showKtp: (path: string) => void;
 * onDetail: (item: CustomerTransactionAdmin) => void
 * }}
 */
export default function CustomerTransactionAdminTable({ items, showKtp, onDetail }) {
  const headers = [
    'Pelanggan',
    'Tujuan Rekening',
    'Nominal',
    'Pengirim',
    'Tanggal',
    'Agent',
    'Action',
  ];

  const chipStatus = (status) => {
    const color =
      {
        expired: 'error',
        reject: 'error',
        cancel: 'error',
        unpaid: 'warning',
        verify: 'primary',
        paid: 'success',
      }[status] ?? 'primary';

    const label =
      {
        expired: 'Expired',
        reject: 'Ditolak',
        cancel: 'Batal',
        unpaid: 'Menunggu Pembayaran',
        verify: 'Menunggu Verifikasi',
        paid: 'Selesai',
      }[status] ?? status;

    return (
      <Chip
        label={label}
        color={color}
        size="small"
        className="tw-capitalize tw-w-min"
        variant="soft"
      />
    );
  };

  return (
    <Table>
      <TableHead>
        <TableRow>
          {headers.map((h, i) => (
            <TableCell key={i}>{h}</TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {items.map((item, i) => (
          <TableRow key={i}>
            <TableCell width={400}>
              <div className="tw-flex tw-flex-row tw-gap-4">
                {item.customerKtp ? (
                  <button
                    type="button"
                    onClick={() => showKtp(item.customerKtp)}
                    className=" tw-flex-none "
                  >
                    <img
                      src={`/public/uploads/${item.customerKtp.replaceAll('/public/uploads', '')}`}
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
                <Stack spacing={0.3}>
                  <span className="tw-text-xs tw-uppercase">
                    <span className="tw-font-semibold">{item.customerFullname}</span> -{' '}
                    {item.customerPhone}
                  </span>
                  <span className="tw-text-xs tw-uppercase">{item.customerId}</span>
                  <span className="tw-text-xs tw-uppercase">{item.customerAddress}</span>
                  <span className="tw-text-xs tw-uppercase">{item.customerAreaTitle}</span>
                </Stack>
              </div>
            </TableCell>
            <TableCell width={300}>
              <div className="tw-flex tw-flex-row tw-gap-4 tw-items-center">
                <img
                  src={`/assets/bank/${getBankImagePath(item.accountBank)}`}
                  alt={item.accountBank}
                  className="tw-h-auto tw-object-contain tw-w-16"
                />
                <Stack>
                  <span className="tw-text-xs tw-uppercase">{item.accountName}</span>
                  <span className="tw-text-xs tw-uppercase">{item.accountNumber}</span>
                </Stack>
              </div>
            </TableCell>
            <TableCell>
              <Stack spacing={0.5}>
                <span className="tw-text-xs">
                  Rp. {item.totalAmount.toString().toNumber().formatCurrency()}
                </span>
                <Divider />
                {chipStatus(item.status)}
                {item.rejectReason ? (
                  <span className="tw-text-xs tw-text-red-500">{item.rejectReason}</span>
                ) : null}
              </Stack>
            </TableCell>
            <TableCell>
              <span className="tw-text-xs tw-uppercase">{item?.senderName ?? '-'}</span>
            </TableCell>
            <TableCell>
              <span className="tw-text-xs">
                {item.createdAt?.toDate().format('dd-MM-yyyy HH:mm:ss')}
              </span>
            </TableCell>
            <TableCell>
              <Stack>
                <span className="tw-text-xs">{item.actionUserFullname ?? '-'}</span>
                <span className="tw-text-xs">
                  {item.actionAt?.toDate().format('dd-MM-yyyy HH:mm:ss') ?? '-'}
                </span>
              </Stack>
            </TableCell>
            <TableCell>
              <Button
                variant="outlined"
                color="primary"
                size="small"
                onClick={() => onDetail(item)}
              >
                Detail
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
