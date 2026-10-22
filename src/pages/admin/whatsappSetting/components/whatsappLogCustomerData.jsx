import { Iconify } from '@components/iconify';
import { useExpansionToggle } from '@hooks/use-expansion-toggle';

import {
  Chip,
  Table,
  Stack,
  Button,
  Tooltip,
  Divider,
  TableRow,
  TableCell,
  TableHead,
  TableBody,
  Accordion,
  IconButton,
  AccordionSummary,
  AccordionDetails,
  AccordionActions,
} from '@mui/material';

import 'src/extension/date';
import 'src/extension/string';
/** @typedef {import('src/repositories/whatsappLog').WhatsappLogCustomer} WhatsappLogCustomer */

export const WhatsappLogCustomerData = {
  Table: WhatsappLogCustomerTable,
  Mobile: WhatsappLogCustomerMobile,
};

/**
 * @param {{data: WhatsappLogCustomer[]; onResend: (WhatsappLogCustomer) => void}} param0
 */
function WhatsappLogCustomerTable({ data, onResend }) {
  const toggle = useExpansionToggle();
  const headers = ['Pelanggan', 'Whatsapp Node', 'Tanggal', 'Pesan', 'Status', 'Error', ''];

  return (
    <Table>
      <TableHead>
        <TableRow>
          {headers.map((header, index) => (
            <TableCell key={index} className="tw-p-2 tw-text-left tw-font-semibold">
              {header}
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {data.map((item, index) => (
          <TableRow key={index}>
            <TableCell width={200}>
              <Stack direction="row">
                <IconButton onClick={() => toggle.toggle(item._id)} className="tw-p-0 tw-mr-2">
                  <Iconify
                    icon="ic:twotone-arrow-right"
                    className={`tw-duration-300 ${
                      toggle.isIncludes(item._id) ? 'tw-rotate-90' : 'tw-rotate-0'
                    }`}
                  />
                </IconButton>
                <Stack>
                  <span className="tw-text-xs tw-font-semibold">{item.customerFullname}</span>
                  <span className="tw-text-xs">{item.customerId}</span>
                  <span className="tw-text-xs tw-text-gray-500">{item.customerPhone}</span>
                </Stack>
              </Stack>
            </TableCell>
            <TableCell className="tw-p-2" width={180}>
              <Stack spacing={0.5}>
                <span className="tw-text-xs">{item.fromWhatsappNode ?? '-'}</span>
                <span className="tw-text-xs">{item.fromWhatsappNodePhone ?? '-'}</span>
              </Stack>
            </TableCell>
            <TableCell className="tw-p-2" width={150}>
              <Stack spacing={0.5}>
                <span className="tw-text-xs">
                  {item.createdAt?.toDate().format('dd MMM yyyy HH:mm:ss') ?? '-'}
                </span>
                <CategoryChip messageCategory={item.messageCategory} />
              </Stack>
            </TableCell>
            <TableCell>
              <p
                className={`tw-text-xs ${
                  toggle.isIncludes(item._id)
                    ? 'tw-line-clamp-none tw-whitespace-pre-line'
                    : 'tw-line-clamp-3'
                }`}
              >
                {item.message}
              </p>
            </TableCell>
            <TableCell>
              <Chip
                label={item.success ? 'Success' : 'Failed'}
                color={item.success ? 'success' : 'error'}
                size="small"
                className="tw-text-xs tw-capitalize"
                variant="soft"
              />
            </TableCell>
            <TableCell>
              <span className="tw-text-xs">{item.errorReason ?? '-'}</span>
            </TableCell>
            <TableCell>
              <Tooltip title="Kirim ulang">
                <IconButton disabled={item.success} color="primary" onClick={() => onResend(item)}>
                  <Iconify icon="material-symbols:send" />
                </IconButton>
              </Tooltip>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

/**
 * @param {{data: WhatsappLogCustomer[]; onResend: (WhatsappLogCustomer) => void}} param0
 */
function WhatsappLogCustomerMobile({ data, onResend }) {
  return data.map((item, index) => (
    <div className="tw-ring-1 tw-ring-gray-300 tw-w-full tw-rounded-lg" key={index}>
      <Accordion className="tw-w-full">
        <AccordionSummary className="tw-w-full">
          <Stack spacing={1} className="tw-w-full">
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              className="tw-w-full"
            >
              <span className="tw-text-xs">
                {item.createdAt?.toDate().format('dd MMM yyyy HH:mm:ss') ?? '-'}
              </span>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="end"
                className="tw-w-min"
                spacing={0.5}
              >
                <CategoryChip messageCategory={item.messageCategory} />
                <Chip
                  label={item.success ? 'Success' : 'Failed'}
                  color={item.success ? 'success' : 'error'}
                  size="small"
                  variant="soft"
                />
              </Stack>
            </Stack>
            <Divider />
            <Stack>
              <span className="tw-text-xs tw-font-semibold">{item.customerFullname}</span>
              <span className="tw-text-xs">{item.customerId}</span>
              <span className="tw-text-xs">{item.customerPhone}</span>
            </Stack>
          </Stack>
        </AccordionSummary>
        <AccordionDetails className="tw-w-full">
          <Stack className="tw-w-full" spacing={2}>
            <Stack className="tw-w-full">
              <span className="tw-text-xs tw-text-gray-500">Whatsapp Node</span>
              <span className="tw-text-xs">{item.fromWhatsappNode ?? '-'}</span>
              <span className="tw-text-xs">{item.fromWhatsappNodePhone ?? '-'}</span>
            </Stack>
            <Stack className="tw-w-full">
              <span className="tw-text-xs tw-text-gray-500">Pesan</span>
              <p className="tw-whitespace-pre-line tw-text-xs tw-w-full">{item.message}</p>
            </Stack>
          </Stack>
        </AccordionDetails>
        <AccordionActions>
          <Button
            variant="contained"
            disabled={item.success}
            color="primary"
            className="tw-gap-2"
            onClick={() => onResend(item)}
            size="small"
          >
            <Iconify icon="material-symbols:send" /> Kirim Ulang
          </Button>
        </AccordionActions>
      </Accordion>
    </div>
  ));
}

/**
 * @param {{messageCategory: string | null}} props
 */
function CategoryChip({ messageCategory }) {
  if (!messageCategory) return null;

  const label =
    {
      broadcast: 'Broadcast',
      auto_broadcast: 'Auto Broadcast',
      auto_reply: 'Auto Reply',
      auto_reply_payment: 'Auto Reply Pembayaran',
      auto_reply_reject_payment: 'Auto Reply Penolakan Pembayaran',
      notification: 'Notifikasi',
      message: 'Pesan',
      test: 'Test',
      payment_notification: 'Notifikasi Pembayaran',
      otp: 'OTP',
    }[messageCategory] ?? messageCategory;

  const color =
    {
      broadcast: 'primary',
      auto_broadcast: 'warning',
      auto_reply: 'warning',
      auto_reply_payment: 'warning',
      auto_reply_reject_payment: 'error',
      notification: 'info',
      message: 'default',
      test: 'default',
      payment_notification: 'info',
      otp: 'warning',
    }[messageCategory] ?? 'default';

  return <Chip label={label} color={color} variant="soft" size="small" className="tw-w-min" />;
}
