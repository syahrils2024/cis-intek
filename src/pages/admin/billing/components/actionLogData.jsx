/**
 * @typedef {import("src/repositories/subscription").BillingActionLog} BillingActionLog
 */

import {
  Chip,
  Table,
  Stack,
  TableRow,
  TableCell,
  TableHead,
  TableBody,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';

import 'src/extension/date';
import 'src/extension/number';

export const BillingActionLogData = {
  Table: BillingActionLogDataTable,
  Mobile: BillingActionLogDataAccordion,
};

/**
 * @param {{data: BillingActionLog[]}} param0
 */
function BillingActionLogDataTable({ data }) {
  const headers = ['Timestamp', 'Agent', 'Category', 'Description'];
  return (
    <Table>
      <TableHead>
        <TableRow>
          {headers.map((header) => (
            <TableCell key={header}>{header}</TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {data?.map((log) => (
          <TableRow key={log.id}>
            <TableCell>
              <span className="tw-text-xs">
                {log?.createdAt?.toDate().format('dd MMM yyyy, HH:mm')}
              </span>
            </TableCell>
            <TableCell>
              <span className="tw-text-xs">{log?.userFullname}</span>
            </TableCell>
            <TableCell>
              <span className="tw-text-xs">
                <BillingActionLogChip category={log?.action ?? 'unknown'} />
              </span>
            </TableCell>
            <TableCell>
              <span className="tw-text-xs tw-whitespace-pre-line">{log?.description}</span>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

/**
 * @param {{data: BillingActionLog[]}} param0
 */
function BillingActionLogDataAccordion({ data }) {
  return data?.map((log, i) => (
    <div key={i} className="tw-ring-1 tw-rounded-md tw-ring-gray-400">
      <Accordion>
        <AccordionSummary>
          <Stack direction="row" justifyContent="space-between" className="tw-w-full" spacing={1}>
            <span className="tw-text-xs">{log.userFullname}</span>
            <span className="tw-text-xs">
              {log?.createdAt?.toDate().format('dd MMM yyyy, HH:mm')}
            </span>
          </Stack>
        </AccordionSummary>
        <AccordionDetails>
          <span className="tw-text-xs tw-whitespace-pre-line">{log.description}</span>
        </AccordionDetails>
      </Accordion>
    </div>
  ));
}

function BillingActionLogChip({ category }) {
  const label =
    {
      created: 'Generated',
      updated: 'Updated',
      canceled: 'Canceled',
      payment_recorded: 'Payment',
      status_changed: 'Status Changed',
      recovered: 'Recovered',
      rollback_payment: 'Rollback Payment',
      removed: 'Removed',
    }[category] ?? category;

  const color =
    {
      created: 'success',
      updated: 'warning',
      canceled: 'error',
      payment_recorded: 'success',
      status_changed: 'warning',
      recovered: 'success',
      rollback_payment: 'warning',
      removed: 'error',
    }[category] || 'default';

  return <Chip label={label} color={color} size="small" className="tw-w-min" variant="soft" />;
}
