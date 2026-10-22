/**
 * @typedef {import("@/repositories/invoiceTemp").InvoiceTemp} InvoiceTemp
 */

import { usePrivilege } from '@auth/hooks/privileges';

import {
  Chip,
  Stack,
  Button,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';

import 'src/extension/date';
import 'src/extension/string';
import 'src/extension/number';

/**
 * @param {{
 * invoiceTemporaries: InvoiceTemp[];
 * onMenu: (e: Event, item: InvoiceTemp) => void;
 * onDetail: (item: InvoiceTemp) => void;
 * showKtp: (url: string) => void
 * }} props
 */
export default function InvoiceTempMobile({ invoiceTemporaries = [], onMenu, onDetail, showKtp }) {
  const { isAdmin } = usePrivilege();

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

  return invoiceTemporaries.map((invoice, i) => (
    <div key={i} className="tw-ring-1 tw-ring-gray-300 tw-rounded-lg">
      <Accordion>
        <AccordionSummary>
          <div className="tw-flex tw-flex-col tw-w-full tw-gap-2">
            <div className="tw-flex tw-flex-row tw-w-full tw-items-center tw-justify-between">
              <span className="tw-text-xs tw-font-medium">{invoice.areaTitle}</span>
              <Button
                size="small"
                color="primary"
                variant="outlined"
                className="tw-gap-2"
                onClick={() => onDetail(invoice)}
              >
                {/* <Iconify icon="mdi:menu" /> */}
                Detail
              </Button>
            </div>
            <Divider />
            <div className="tw-flex tw-flex-row tw-gap-2 tw-items-center tw-w-full">
              {invoice.customerData.ktp ? (
                <button type="button" onClick={() => showKtp(invoice.customerData.ktp)}>
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
              <Stack>
                <span className="tw-text-xs tw-font-medium">{invoice.customerData.fullname}</span>
                <span className="tw-text-xs tw-text-gray-500">
                  {invoice.customerData.customerId}
                </span>
                <span className="tw-text-xs tw-text-gray-500">{invoice.customerData.phone}</span>
              </Stack>
            </div>
            <Divider />
            <div className="tw-flex tw-flex-row tw-w-full">
              <Chip
                label={statusLabel(invoice.status)}
                size="small"
                color={statusColor(invoice.status)}
                variant="outlined"
                className="tw-w-min tw-whitespace-nowrap"
              />
            </div>
          </div>
        </AccordionSummary>
        <AccordionDetails>
          <div className="tw-flex tw-flex-col tw-gap-3">
            <Divider />

            <div className="tw-flex tw-flex-col">
              <span className="tw-text-xs tw-text-gray-400">Pengajuan Oleh</span>
              <span className="tw-text-xs tw-font-medium">{invoice.createdUserFullname}</span>
              <span className="tw-text-xs">
                {invoice.createdAt?.toDate().format('dd-MM-yyyy HH:mm:ss') ?? '-'}
              </span>
            </div>
            <div className="tw-flex tw-flex-col">
              <span className="tw-text-xs tw-text-gray-400">Approve / Reject</span>
              <span className="tw-text-xs tw-font-medium">{invoice.actionUserFullname}</span>
              <span className="tw-text-xs">
                {invoice.actionAt?.toDate().format('dd-MM-yyyy HH:mm:ss') ?? '-'}
              </span>
            </div>
            <div className="tw-flex tw-flex-col">
              <span className="tw-text-xs tw-text-gray-400">Total Pembayaran</span>
              <span className="tw-text-xs tw-font-medium">
                Rp. {invoice.amount.formatCurrency()}
              </span>
            </div>
            <div className="tw-flex tw-flex-col">
              <span className="tw-text-xs tw-text-gray-400">Jenis Pembayaran</span>
              <span className="tw-text-xs tw-font-medium">
                {invoice.paymentMethod} - {invoice.depositMethodTitle}
              </span>
            </div>
            <div className="tw-flex tw-flex-col">
              <span className="tw-text-xs tw-text-gray-400">Tanggal</span>
              <span className="tw-text-xs tw-font-medium">
                {invoice.date.toDate().formatDateTime()}
              </span>
            </div>
            <Divider />
            {/* <div className="tw-flex tw-flex-row tw-gap-2 tw-items-center">
              <div className="tw-flex tw-flex-col">
                <span className="tw-text-xs tw-text-gray-400">PPPoE Name</span>
                <span className="tw-text-xs tw-font-medium">
                  {invoice.customerData.pppoeName ?? '-'}
                </span>
              </div>
              {invoice.customerData.pppoeName && (
                <Button
                  variant="text"
                  size="small"
                  color="primary"
                  sx={{ height: '10px' }}
                  onClick={() => {
                    copyText(invoice.customerData.pppoeName, 'PPPoE Name disalin');
                  }}
                >
                  Salin
                </Button>
              )}
            </div> */}
            {/* <div className="tw-flex tw-flex-row tw-gap-2 tw-items-center">
              <div className="tw-flex tw-flex-col">
                <span className="tw-text-xs tw-text-gray-400">PPPoE Password</span>
                <span className="tw-text-xs tw-font-medium">
                  {invoice.customerData.pppoeName ?? '-'}
                </span>
              </div>
              {invoice.customerData.pppoePassword && (
                <Button
                  variant="text"
                  size="small"
                  color="primary"
                  sx={{ height: '10px' }}
                  onClick={() => {
                    copyText(invoice.customerData.pppoePassword, 'PPPoE Password disalin');
                  }}
                >
                  Salin
                </Button>
              )}
            </div> */}
          </div>
        </AccordionDetails>
      </Accordion>
    </div>
  ));
}
