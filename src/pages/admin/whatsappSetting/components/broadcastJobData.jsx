/**
 * @typedef {import("src/repositories/broadcastJobRunner").BroadcastJobRunner} BroadcastJobRunner
 */

import { Iconify } from '@components/iconify';

import {
  Chip,
  Grid,
  Stack,
  Table,
  Tooltip,
  Divider,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  Accordion,
  IconButton,
  AccordionSummary,
  AccordionDetails,
  AccordionActions,
} from '@mui/material';

import 'src/extension/date';
import 'src/extension/string';

export const BroadcastJobData = {
  Table: BroadcastJobDataTable,
  Mobile: BroadcastJobAccordion,
};

/**
 * @typedef {Object} props
 * @property {Array<BroadcastJobRunner>} data
 * @property {boolean} onCancel
 */

/** @param {props} props */
function BroadcastJobAccordion({ data, onCancel }) {
  return data?.map((item, i) => (
    <div key={i} className="tw-ring-1 tw-ring-gray-400 tw-rounded">
      <Accordion key={i} className="tw-w-full">
        <AccordionSummary className="tw-w-full">
          <Stack spacing={1} className="tw-w-full">
            <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
              <span className="tw-text-xs">{item.createdUseFullname ?? 'Auto (System)'}</span>
              <span className="tw-text-xs">
                {item.createdAt?.toDate().format('dd MMM yyyy HH:mm:ss') ?? '-'}
              </span>
            </Stack>
            <Divider />
            <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
              <span className="tw-text-xs font-medium">{item.template}</span>
              <StatusChip status={item.status} />
            </Stack>
          </Stack>
        </AccordionSummary>

        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <span className="tw-text-xs font-medium mb-2">Node</span>
              <ol className="tw-list-disc tw-ml-4">
                {item.whatsappNodes?.map((node, idx) => (
                  <li key={idx} className="tw-text-xs">
                    {node.title}
                  </li>
                ))}
              </ol>
            </Grid>

            <Grid item xs={12} md={6}>
              <span className="tw-text-xs font-medium mb-2">Target</span>
              <ol className="tw-list-disc tw-ml-4">
                {item.area?.map((area, idx) => (
                  <li key={idx} className="tw-text-xs">
                    {area.title}
                  </li>
                ))}
              </ol>
            </Grid>
            <Grid item xs={12} md={6}>
              <Stack spacing={0.5}>
                <span className="tw-text-xs font-medium">Checked Billing</span>
                {item.checkBillingMonth && item.checkBillingYear ? (
                  <span className="tw-text-xs">
                    {new Date(item.checkBillingYear, item.checkBillingMonth - 1).format(
                      'MMMM yyyy'
                    )}
                  </span>
                ) : null}
                <StatusBillingChip billingStatus={item.checkBillingStatus} />
              </Stack>
            </Grid>

            <Grid item xs={12} md={6}>
              <span className="tw-text-xs font-medium">Running At :</span>
              <span className="tw-text-xs">
                {item.runningAt?.toDate().format('dd MMM yyyy HH:mm:ss')}
              </span>
            </Grid>

            <Grid item xs={12} md={6}>
              <span className="tw-text-xs font-medium">Finished At :</span>
              <span className="tw-text-xs">
                {item.finishedAt?.toDate().format('dd MMM yyyy HH:mm:ss')}
              </span>
            </Grid>

            <Grid item xs={12} md={3}>
              <span className="tw-text-xs font-medium">Total :</span>
              <span className="tw-text-xs">{item.totalItem}</span>
            </Grid>

            <Grid item xs={12} md={3}>
              <span className="tw-text-xs font-medium">Total Run :</span>
              <span className="tw-text-xs">{item.sentItem}</span>
            </Grid>

            <Grid item xs={12} md={6}>
              <span className="tw-text-xs font-medium">Action Agent :</span>
              <Stack spacing={0.5}>
                <span className="tw-text-xs">{item.actionUserFullname ?? '-'}</span>
                <span className="tw-text-xs">
                  {item.actionAt?.toDate().format('dd MMM yyyy HH:mm:ss') ?? '-'}
                </span>
              </Stack>
            </Grid>
          </Grid>
        </AccordionDetails>

        <Divider />
        <AccordionActions>
          <Tooltip title="Cancel">
            <IconButton
              disabled={!['pending', 'running', 'cancelled'].includes(item.status) || !onCancel}
              onClick={() => onCancel(item)}
              size="small"
              color="error"
            >
              <Iconify icon="mdi:cancel" />
            </IconButton>
          </Tooltip>
        </AccordionActions>
      </Accordion>
    </div>
  ));
}

/** @param {props} props */
function BroadcastJobDataTable({ data, onCancel }) {
  const headers = [
    'Node',
    'Target',
    'Template',
    'Status',
    'Running At',
    'Finish At',
    'Total',
    'Total Run',
    'Created Agent',
    'Cancel By',
    '',
  ];

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
        {data?.map((item, i) => (
          <TableRow key={i}>
            <TableCell width={220}>
              <Stack spacing={1}>
                <ol className="tw-list-disc tw-ml-4">
                  {item.whatsappNodes?.map((node, idx) => (
                    <li key={idx} className="tw-text-xs">
                      {node.title}
                    </li>
                  ))}
                </ol>
              </Stack>
            </TableCell>
            <TableCell>
              <Stack spacing={1}>
                <ol className="tw-list-disc tw-ml-4">
                  {item.area?.map((node, idx) => (
                    <li key={idx} className="tw-text-xs">
                      {node.title}
                    </li>
                  ))}
                </ol>
              </Stack>
            </TableCell>
            <TableCell>
              <Stack spacing={1}>
                {Array.isArray(item.template) ? (
                  <ol className="tw-list-disc tw-ml-5">
                    {item.template.map((t, idx) => (
                      <li key={idx}>
                        <span className="tw-text-xs">{t}</span>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <span className="tw-text-xs">{item.template}</span>
                )}

                <Divider />
                <StatusBillingChip billingStatus={item.checkBillingStatus} />
              </Stack>
            </TableCell>
            <TableCell>
              <StatusChip status={item.status} />
            </TableCell>
            <TableCell>
              <span className="tw-text-xs">
                {item.runningAt?.toDate().format('dd MMM yyyy HH:mm:ss')}
              </span>
            </TableCell>
            <TableCell>
              <span className="tw-text-xs">
                {item.finishedAt?.toDate().format('dd MMM yyyy HH:mm:ss')}
              </span>
            </TableCell>
            <TableCell>
              <span className="tw-text-xs">{item.totalItem}</span>
            </TableCell>
            <TableCell>
              <span className="tw-text-xs">{item.sentItem}</span>
            </TableCell>
            <TableCell>
              <Stack spacing={1}>
                <span className="tw-text-xs">{item.createdUseFullname ?? '-'}</span>
                <span className="tw-text-xs">
                  {item.createdAt?.toDate().format('dd MMM yyyy HH:mm:ss')}
                </span>
              </Stack>
            </TableCell>
            <TableCell>
              <Stack spacing={1}>
                <span className="tw-text-xs">{item.actionUserFullname ?? '-'}</span>
                <span className="tw-text-xs">
                  {item.actionAt?.toDate().format('dd MMM yyyy HH:mm:ss') ?? '-'}
                </span>
              </Stack>
            </TableCell>
            <TableCell>
              <Tooltip title="Cancel">
                <IconButton
                  disabled={!['pending', 'running', 'cancelled'].includes(item.status) || !onCancel}
                  onClick={() => onCancel(item)}
                  size="small"
                  color="error"
                >
                  <Iconify icon="mdi:cancel" />
                </IconButton>
              </Tooltip>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

/** @param {{billingStatus: []}} props */
const StatusBillingChip = ({ billingStatus }) => {
  const color = (status) =>
    ({
      unpaid: 'error',
      paid: 'success',
      partially_paid: 'warning',
      overdue: 'default',
      cancelled: 'error',
    })[status] || 'default';

  const label = (status) =>
    ({
      unpaid: 'Unpaid',
      paid: 'Paid',
      partially_paid: 'Partially',
      overdue: 'default',
      cancelled: 'Cancel',
    })[status] || status;

  return (
    <ol className="tw-list-disc tw-ml-4">
      {billingStatus?.map((status, i) => (
        <li key={i} className="tw-text-xs">
          {label(status)}
        </li>
      ))}
    </ol>
  );

  return (
    <div className="tw-flex flex-wrap tw-gap-2">
      {billingStatus.map((status, i) => (
        <Chip key={i} label={label(status)} color={color(status)} variant="soft" size="small" />
      ))}
    </div>
  );
};

const StatusChip = ({ status }) => {
  const label =
    {
      pending: 'On Progress',
      running: 'On Progress',
      finished: 'Finished',
      canceled: 'Cancel',
    }[status] ?? status;

  const color =
    {
      pending: 'warning',
      running: 'warning',
      finished: 'success',
      canceled: 'error',
    }[status] ?? 'default';

  return <Chip size="small" label={label} color={color} variant="soft" />;
};
