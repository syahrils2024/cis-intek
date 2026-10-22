/** @typedef {import("src/repositories/notification").CustomerNotification} CustomerNotification */

import { Iconify } from '@components/iconify';
import { useExpansionToggle } from '@hooks/use-expansion-toggle';

import {
  Chip,
  Table,
  Stack,
  Divider,
  TableRow,
  TableCell,
  TableHead,
  TableBody,
  Accordion,
  IconButton,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';

import 'src/extension/date';

export const AppNotificationData = {
  Table: AppNotificationDataTable,
  Mobile: AppNotificationDataMobile,
};

/**
 * @param {{notifications: CustomerNotification[]}} param0
 */
function AppNotificationDataTable({ notifications }) {
  const headers = ['Pelanggan', 'Area / POP', 'Tanggal', 'Konten'];
  const expansionItem = useExpansionToggle();

  return (
    <Table>
      <TableHead>
        <TableRow>
          {headers.map((header, i) => (
            <TableCell key={i}>{header}</TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {notifications.map((notification, i) => (
          <TableRow key={i}>
            <TableCell width="250">
              <Stack direction="row">
                <IconButton
                  className={
                    expansionItem.isIncludes(notification._id) ? 'tw-rotate-90' : 'rotate-0'
                  }
                  onClick={() => expansionItem.toggle(notification._id)}
                >
                  <Iconify icon="material-symbols:arrow-right" />
                </IconButton>
                <Stack>
                  <span className="tw-text-xs tw-font-semibold">
                    {notification.customerFullname}
                  </span>
                  <span className="tw-text-xs tw-text-gray-500">{notification.customerId}</span>
                  <span className="tw-text-xs tw-text-gray-500">{notification.customerPhone}</span>
                </Stack>
              </Stack>
            </TableCell>
            <TableCell width="230">
              <span className="tw-text-xs">{notification.customerArea}</span>
            </TableCell>
            <TableCell width="130">
              <Stack spacing={0.5}>
                <span className="tw-text-xs">
                  {notification.createdAt?.toDate().format('dd MMM yyyy HH:mm')}
                </span>
                {LabelChip(notification.readStatus)}
              </Stack>
            </TableCell>
            <TableCell>
              <Stack spacing={1}>
                <span className="tw-text-xs">{notification.title}</span>
                <span
                  className={`tw-text-xs ${
                    expansionItem.isIncludes(notification._id) ? 'tw-whitespace-pre-line' : ''
                  }`}
                >
                  {notification.body}
                </span>
              </Stack>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

/**
 * @param {{notifications: CustomerNotification[]}} param0
 */
function AppNotificationDataMobile({ notifications }) {
  return notifications.map((notification, i) => (
    <div key={i} className="tw-ring-1 tw-ring-gray-400 tw-rounded-md tw-w-full">
      <Accordion className="tw-w-full">
        <AccordionSummary className="tw-w-full">
          <Stack className="tw-w-full" spacing={1}>
            <Stack
              direction="row"
              className="tw-w-full"
              justifyContent="space-between"
              alignItems="center"
            >
              <span className="tw-text-xs">
                {notification.createdAt?.toDate().format('dd MMM yyyy HH:mm')}
              </span>
              {LabelChip(notification.readStatus)}
            </Stack>
            <Divider />
            <Stack>
              <span className="tw-text-xs tw-font-semibold">{notification.customerFullname}</span>
              <span className="tw-text-xs tw-text-gray-500">{notification.customerId}</span>
              <span className="tw-text-xs tw-text-gray-500">{notification.customerPhone}</span>
            </Stack>
          </Stack>
        </AccordionSummary>
        <AccordionDetails>
          <Stack spacing={1}>
            <span className="tw-text-xs">{notification.title}</span>
            <p className="tw-text-xs tw-whitespace-pre-line tw-overflow-hidden">
              {notification.body}
            </p>
          </Stack>
        </AccordionDetails>
      </Accordion>
    </div>
  ));
}

function LabelChip(readStatus) {
  const labels =
    {
      0: 'Belum Dibaca',
      1: 'Sudah Dibaca',
    }[readStatus] ?? 'Belum Dibaca';

  const color =
    {
      0: 'warning',
      1: 'success',
    }[readStatus] ?? 'warning';

  return <Chip label={labels} color={color} size="small" variant="soft" />;
}
