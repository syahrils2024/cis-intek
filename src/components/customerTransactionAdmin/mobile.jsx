/**
 * @typedef {import("src/repositories/customerTransactionAdmin").CustomerTransactionAdmin} CustomerTransactionAdmin
 */

import { getBankImagePath } from '@utils/getBankImage';

import {
  Chip,
  Stack,
  Button,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  AccordionActions,
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
export default function CustomerTransactionAdminMobile({ items, showKtp, onDetail }) {
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

  return items.map((item, i) => (
    <div key={i} className="tw-flex tw-flex-col tw-ring-1 tw-ring-gray-400 tw-rounded-lg tw-w-full">
      <Accordion>
        <AccordionSummary>
          <div className="tw-flex tw-flex-col tw-gap-2 tw-w-full">
            <div className="tw-flex tw-flex-row tw-items-center tw-justify-between tw-w-full">
              <span className="tw-text-xs tw-uppercase">{item.customerAreaTitle}</span>
              {chipStatus(item.status)}
            </div>
            <Divider />
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
                  <span className="tw-font-semibold">{item.customerFullname}</span>
                </span>
                <span className="tw-text-xs tw-uppercase">{item.customerId}</span>
                <span className="tw-text-xs tw-uppercase">{item.customerPhone}</span>
                <span className="tw-text-xs tw-uppercase">{item.customerAddress}</span>
              </Stack>
            </div>
            {typeof item.rejectReason === 'string' ? (
              <>
                <Divider />
                <span className="tw-text-xs tw-text-red-500">{item.rejectReason}</span>
              </>
            ) : null}
          </div>
        </AccordionSummary>
        <AccordionDetails>
          <Stack spacing={1.5}>
            <Divider />
            <Stack>
              <span className="tw-text-xs">Agent</span>
              <span className="tw-text-xs tw-font-semibold">{item.actionUserFullname ?? '-'}</span>
              <span className="tw-text-xs">
                {item.actionAt?.toDate().format('dd-MM-yyyy HH:mm:ss') ?? '-'}
              </span>
            </Stack>
            <Stack>
              <span className="tw-text-xs">Nama Rekening Pengirim</span>
              <span className="tw-text-xs tw-font-semibold">{item.senderName ?? '-'}</span>
            </Stack>
            <Stack>
              <span className="tw-text-xs">Nominal</span>
              <span className="tw-text-xs tw-font-semibold">
                Rp. {item.totalAmount?.toString().toNumber().formatCurrency()}
              </span>
            </Stack>
            <Stack>
              <span className="tw-text-xs">Tanggal</span>
              <span className="tw-text-xs tw-font-semibold">
                {item.createdAt?.toDate().format('dd-MM-yyyy HH:mm')}
              </span>
            </Stack>
            <Stack>
              <span className="tw-text-xs">Tujuan Transfer</span>
              <div className="tw-flex tw-flex-row tw-gap-4 tw-items-center">
                <img
                  src={`/assets/bank/${getBankImagePath(item.accountBank)}`}
                  alt={item.accountBank}
                  className="tw-h-6"
                />
                <Stack>
                  <span className="tw-text-xs tw-uppercase">{item.accountName}</span>
                  <span className="tw-text-xs tw-uppercase">{item.accountNumber}</span>
                </Stack>
              </div>
            </Stack>
          </Stack>
        </AccordionDetails>
        <AccordionActions>
          <Button size="small" variant="outlined" color="primary" onClick={() => onDetail(item)}>
            Detail
          </Button>
        </AccordionActions>
      </Accordion>
    </div>
  ));
}
