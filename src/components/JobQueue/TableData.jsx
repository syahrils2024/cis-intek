/**
 * @typedef {import("src/repositories/jobQueue").JobQueue} JobQueue
 */

import { Fragment } from 'react';
import { Iconify } from '@components/iconify';
import { useExpansionToggle } from '@hooks/use-expansion-toggle';

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
} from '@mui/material';

import 'src/extension/date';

/**
 *
 * @param {{data: JobQueue[]; onCancel: (data: JobQueue) => void}} param0
 */

export default function JobQueueTable({ data, onCancel }) {
  const headers = ['Pelanggan', 'Area', 'Run Count', 'Status', 'Created', 'Next Run', 'Action'];
  const expansion = useExpansionToggle();

  function statusColor(status) {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'success':
        return 'success';
      case 'failed':
        return 'error';
      case 'canceled':
        return 'error';
      default:
        return undefined;
    }
  }

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
        {data.map((d, i) => (
          <Fragment key={i}>
            <TableRow>
              <TableCell>
                <Stack direction="row">
                  <IconButton onClick={() => expansion.toggle(d._id)}>
                    <Iconify icon="mdi:menu-down" />
                  </IconButton>
                  <Stack>
                    <span className="tw-text-xs tw-font-semibold">{d.customerFullname}</span>
                    <span className="tw-text-xs tw-text-gray-500">{d.customerId}</span>
                    <span className="tw-text-xs tw-text-gray-500">{d.customerPhone}</span>
                  </Stack>
                </Stack>
              </TableCell>
              <TableCell>
                <span className="tw-text-xs tw-font-semibold">{d.areaTitle}</span>
              </TableCell>
              <TableCell>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <span className="tw-text-xs tw-font-semibold">
                    {d.repeat} / {d.maxRepeat}
                  </span>
                </Stack>
              </TableCell>
              <TableCell>
                <span className="tw-text-xs tw-font-semibold">
                  <Chip
                    label={d.status.toUpperCase()}
                    size="small"
                    color={statusColor(d.status)}
                    variant="outlined"
                  />
                </span>
              </TableCell>
              <TableCell>
                <Stack>
                  <span className="tw-text-xs">{d.createdUserFullname ?? 'no agent'}</span>
                  <span className="tw-text-xs tw-font-semibold">
                    {new Date(d.createdAt).format('dd-MM-yyyy HH:mm')}
                  </span>
                </Stack>
              </TableCell>
              <TableCell>
                <span className="tw-text-xs tw-font-semibold">
                  {new Date(d.runAt).format('dd-MM-yyyy HH:mm')}
                </span>
              </TableCell>
              <TableCell>
                <Button
                  disabled={
                    d.canceled ||
                    d.repeat >= d.maxRepeat ||
                    ['success', 'canceled'].includes(d.status)
                  }
                  variant="outlined"
                  color="error"
                  size="small"
                  onClick={() => onCancel(d)}
                >
                  Cancel
                </Button>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell colSpan={7} sx={{ padding: 0 }}>
                <Collapse in={expansion.isIncludes(d._id)}>
                  <Stack className="tw-p-4">
                    <span className="tw-text-xs tw-text-gray-500">commands :</span>
                    <ol className="tw-list-disc tw-pl-6">
                      <li>
                        {d.commands.map((c, j) => (
                          <span key={j} className="tw-text-xs">
                            {c}
                          </span>
                        ))}
                      </li>
                    </ol>
                    {d.failedReason && (
                      <>
                        <span className="tw-text-xs tw-text-gray-500 tw-mt-2">Failed Reason :</span>
                        <span className="tw-text-xs tw-font-semibold tw-pl-3 tw-mt-1 tw-text-red-600">
                          {d.failedReason ?? '-'}
                        </span>
                      </>
                    )}
                  </Stack>
                </Collapse>
              </TableCell>
            </TableRow>
          </Fragment>
        ))}
      </TableBody>
    </Table>
  );
}
