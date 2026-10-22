/**
 * @typedef {import("src/repositories/subscription").Billing} Billing
 */

import { Iconify } from '@components/iconify';

import {
  Grid,
  Chip,
  Table,
  Stack,
  Button,
  TableRow,
  Checkbox,
  TableCell,
  TableHead,
  TableBody,
  Accordion,
  IconButton,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';

import 'src/extension/date';
import 'src/extension/string';
import 'src/extension/number';

/**
 * @typedef {Object} PropsData
 * @property {Billing[]} items
 * @property {Function} onCancel
 * @property {Function} onOpen
 * @property {Function} onEdit
 * @property {Function} onRestore
 * @property {Function} onToggleChecked
 * @property {boolean} allowAction
 * @property {boolean} checkedAll
 * @property {Function} onCheckAll
 * @property {Function} onRemove
 */

export const BillingData = {
  Table: PaymentDialogBillingDataTable,
  Mobile: PaymentDialogBillingAccordion,
};

/**
 * @param {PropsData} props
 */
function PaymentDialogBillingDataTable({
  items,
  onCancel,
  onOpen,
  onEdit,
  onToggleChecked,
  onRestore,
  allowAction = true,
  checkedAll,
  onCheckAll,
  onRemove,
}) {
  const headers = ['', 'Periode', 'Generated', 'Paket', 'Status', 'Jumlah', 'Actions'];

  return (
    <Table>
      <TableHead>
        <TableRow>
          {headers.map((header, index) => (
            <TableCell sx={{ py: 1 }} key={index}>
              {index === 0 ? (
                <Checkbox checked={checkedAll} onClick={() => onCheckAll()} />
              ) : (
                header
              )}
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {items.length <= 0 ? (
          <TableRow>
            <TableCell colspan={headers.length}>
              <div className="tw-w-full tw-items-center tw-justify-center tw-text-center tw-flex">
                <span className="tw-text-xs">Tidak ada billing</span>
              </div>
            </TableCell>
          </TableRow>
        ) : null}
        {items.map((item, index) => (
          <TableRow key={index}>
            <TableCell sx={{ py: 0 }}>
              <Checkbox
                disabled={item.status === 'canceled'}
                checked={item.checked}
                onClick={() => onToggleChecked(item)}
              />
            </TableCell>
            <TableCell sx={{ py: 0 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <span className="tw-text-xs">{item.summaryPeriode}</span>
              </Stack>
            </TableCell>
            <TableCell sx={{ py: 0.5 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Chip
                  label={!!item.createdBy ? 'MANUAL' : 'AUTO'}
                  color={!!item.createdBy ? 'warning' : 'success'}
                  variant="soft"
                  size="small"
                  className="tw-w-min"
                />
                <span className="tw-text-xs">
                  {item.createdAt?.toDate().format('dd MMM yyyy') ?? '-'}
                </span>
              </Stack>
            </TableCell>
            <TableCell sx={{ py: 0 }}>
              <span className="tw-text-xs">{item.services?.join(' ')}</span>
            </TableCell>
            <TableCell sx={{ py: 0 }}>
              <span className="tw-text-xs">{statusLabel(item.status)}</span>
            </TableCell>
            <TableCell sx={{ py: 0 }}>
              <span className="tw-text-xs">
                Rp. {item.amount?.toString().toNumber().formatCurrency()}
              </span>
            </TableCell>
            <TableCell sx={{ py: 0 }}>
              <Stack direction="row" spacing={1}>
                <IconButton
                  disabled={!allowAction}
                  variant="contained"
                  size="small"
                  color="error"
                  onClick={() => onRemove(item)}
                >
                  <Iconify icon="mdi:close" />
                </IconButton>
                {item.status === 'canceled' ? (
                  <IconButton
                    disabled={!allowAction}
                    variant="contained"
                    size="small"
                    color="primary"
                    onClick={() => onRestore(item)}
                  >
                    <Iconify icon="mdi:restore" />
                  </IconButton>
                ) : (
                  <IconButton
                    disabled={!allowAction}
                    variant="contained"
                    size="small"
                    color="error"
                    onClick={() => onCancel(item)}
                  >
                    <Iconify icon="mdi:cancel" />
                  </IconButton>
                )}
                <IconButton
                  disabled={!allowAction}
                  variant="contained"
                  size="small"
                  color="success"
                  onClick={() => onEdit(item)}
                >
                  <Iconify icon="mdi:pencil" />
                </IconButton>
                <IconButton
                  variant="contained"
                  size="small"
                  color="primary"
                  onClick={() => onOpen(item)}
                >
                  <Iconify icon="mdi:web" />
                </IconButton>
              </Stack>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

/** @param {PropsData} props */
function PaymentDialogBillingAccordion({
  allowAction = true,
  items,
  onCancel,
  onOpen,
  onEdit,
  onRestore,
  onToggleChecked,
  onRemove,
}) {
  return items.map((item, i) => (
    <div key={i} className="tw-ring-1 tw-ring-gray-400 tw-rounded-md">
      <Accordion expanded>
        <AccordionSummary>
          <div className="tw-flex flex-row tw-items-center tw-w-full tw-justify-between">
            <div className="tw-flex flex-row tw-items-center">
              <Checkbox
                disabled={item.status === 'canceled'}
                checked={item.checked}
                onClick={() => onToggleChecked(item)}
              />
              <span className="tw-text-xs tw-font-medium">{item.summaryPeriode}</span>
            </div>
            <div className="tw-flex tw-flex-row tw-items-center tw-justify-end">
              <IconButton
                disabled={!allowAction}
                variant="contained"
                size="small"
                color="error"
                onClick={() => onRemove(item)}
              >
                <Iconify icon="mdi:close" />
              </IconButton>
              {item.status === 'canceled' ? (
                <Button
                  variant="contained"
                  size="small"
                  color="primary"
                  onClick={() => onRestore(item)}
                >
                  Pulihkan
                </Button>
              ) : (
                <>
                  {onCancel && (
                    <IconButton
                      variant="contained"
                      size="small"
                      color="error"
                      onClick={() => onCancel(item)}
                    >
                      <Iconify icon="mdi:cancel" />
                    </IconButton>
                  )}
                  {onEdit && (
                    <IconButton
                      variant="contained"
                      size="small"
                      color="success"
                      onClick={() => onEdit(item)}
                    >
                      <Iconify icon="mdi:pencil" />
                    </IconButton>
                  )}
                </>
              )}{' '}
              <IconButton
                variant="contained"
                size="small"
                color="primary"
                onClick={() => onOpen(item)}
              >
                <Iconify icon="mdi:web" />
              </IconButton>
            </div>
          </div>
        </AccordionSummary>
        <AccordionDetails sx={{ paddingTop: 0, paddingBottom: 1 }}>
          <div className="tw-w-full tw-h-[0.5px] tw-bg-gray-300 tw-mb-2" />
          <Stack>
            <Grid container>
              <Grid item xs={4}>
                <span className="tw-text-xs tw-font-medium">Paket :</span>
              </Grid>
              <Grid item xs={8}>
                <ul className="tw-list-disc">
                  {item.services.map((s, j) => (
                    <li label={s} key={j} className="tw-text-xs tw-font-medium">
                      {s}
                    </li>
                  ))}
                </ul>
              </Grid>
              <Grid item xs={4}>
                <span className="tw-text-xs tw-font-medium">Status :</span>
              </Grid>
              <Grid item xs={8}>
                <span className="tw-text-xs tw-font-medium">{statusLabel(item.status)}</span>
              </Grid>
              <Grid item xs={4}>
                <span className="tw-text-xs tw-font-medium">Jumlah :</span>
              </Grid>
              <Grid item xs={8}>
                <span className="tw-text-xs tw-font-medium">
                  Rp. {item.amount.formatCurrency()}
                </span>
              </Grid>
            </Grid>
          </Stack>
        </AccordionDetails>
      </Accordion>
    </div>
  ));
}

function statusLabel(status) {
  return (
    {
      canceled: 'Canceled',
      unpaid: 'Unpaid',
      partially_paid: 'Partially Paid',
    }[status] ?? status
  );
}
