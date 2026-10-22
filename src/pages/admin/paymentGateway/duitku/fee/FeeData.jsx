/**
 * @typedef {import("src/repositories/duitku").DuitkuFee} DuitkuFee
 */

import { Iconify } from '@components/iconify';

import {
  Table,
  Stack,
  Tooltip,
  TableRow,
  Checkbox,
  TableCell,
  TableHead,
  TableBody,
  Accordion,
  IconButton,
  AccordionSummary,
  AccordionDetails,
  AccordionActions,
} from '@mui/material';

import 'src/extension/string';
import 'src/extension/number';

export const FeeData = {
  Table: FeeDatatable,
  Mobile: MobileData,
};

/**
 * @typedef {Object} FeeDataProps
 * @property {DuitkuFee[]} data - Array of Duitku fee records to display
 * @property {(item: DuitkuFee) => void} onEdit - Callback function when an edit action is triggered
 * @property {boolean} hideActions - Callback function when a remove action is triggered
 */

/** @param {FeeDataProps} */
export function FeeDatatable({ data, onEdit, hideActions = false }) {
  const headers = ['Jenis Pembayaran', 'Kode', 'Biaya Tetap', 'Biaya Persen', 'Active', ''];

  return (
    <Table>
      <TableHead>
        <TableRow>
          {headers.map((h) => (
            <TableCell key={h}>{h}</TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {data.map((item, i) => (
          <TableRow key={i}>
            <TableCell width={350}>
              <Stack direction="row" spacing={2} alignItems="center">
                <img
                  src={item.imageUrl}
                  alt={item.paymentName}
                  className="tw-w-24 tw-object-contain"
                />
                <Stack>
                  <span className="tw-text-xs">{item.paymentName}</span>
                </Stack>
              </Stack>
            </TableCell>
            <TableCell>
              <span className="tw-text-xs">{item.code}</span>
            </TableCell>
            <TableCell>
              <span className="tw-text-xs">Rp. {item.fee.formatCurrency()}</span>
            </TableCell>
            <TableCell>
              <span className="tw-text-xs">{item.feePercentage.toFixed(2)}%</span>
            </TableCell>
            <TableCell>
              <Checkbox checked={!!item.active} />
            </TableCell>
            <TableCell>
              {!hideActions ? (
                <Tooltip title="Edit">
                  <IconButton color="success" disabled={!onEdit} onClick={() => onEdit?.(item)}>
                    <Iconify icon="mdi:pencil" />
                  </IconButton>
                </Tooltip>
              ) : null}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

/** @param {FeeDataProps} */
export function MobileData({ data, onEdit, hideActions = false }) {
  return data.map((item, i) => (
    <div className="tw-ring-1 tw-ring-gray-400 tw-rounded-md" key={i}>
      <Accordion>
        <AccordionSummary>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <img src={item.imageUrl} alt={item.paymentName} className="tw-w-24 tw-object-contain" />
            <Stack>
              <span className="tw-text-xs">{item.paymentName}</span>
            </Stack>
          </Stack>
        </AccordionSummary>
        <AccordionDetails>
          <Stack spacing={2}>
            <Stack>
              <span className="tw-text-xs tw-font-semibold">Kode</span>
              <span className="tw-text-xs">{item.code}</span>
            </Stack>
            <Stack>
              <span className="tw-text-xs tw-font-semibold">Biaya Tetap</span>
              <span className="tw-text-xs">Rp. {item.fee.formatCurrency()}</span>
            </Stack>
            <Stack>
              <span className="tw-text-xs tw-font-semibold">Biaya Persen</span>
              <span className="tw-text-xs">{item.feePercentage.toFixed(2)}%</span>
            </Stack>
          </Stack>
        </AccordionDetails>
        <AccordionActions>
          {!hideActions ? (
            <Tooltip title="Edit">
              <IconButton color="success" disabled={!onEdit} onClick={() => onEdit?.(item)}>
                <Iconify icon="mdi:pencil" />
              </IconButton>
            </Tooltip>
          ) : null}
        </AccordionActions>
      </Accordion>
    </div>
  ));
}
