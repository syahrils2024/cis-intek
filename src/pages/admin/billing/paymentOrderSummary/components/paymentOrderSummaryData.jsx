import { Fragment } from 'react';
import { Iconify } from '@components/iconify';
import { useExpansionToggle } from '@hooks/use-expansion-toggle';

import {
  Table,
  Stack,
  TableRow,
  Collapse,
  TableCell,
  TableHead,
  TableBody,
  Accordion,
  IconButton,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';

import 'src/extension/string';
import 'src/extension/number';

/**
 * @typedef {import("src/repositories/paymetOrder").PaymentGatewaySummaryArea} PaymentGatewaySummaryArea
 * @typedef {import('src/repositories/paymetOrder').PaymentGatewaySummaryPayment} PaymentGatewaySummaryPayment
 */

/**
 * @typedef {Object} PaymentOrderSummaryDataProps
 * @property {PaymentGatewaySummaryArea[]} data - Array of payment order summaries by area
 */

/**
 * @typedef {Object} PaymentOrderSummaryDataComponent
 * @property {PaymentGatewaySummaryPayment[]} payments;
 */

export const PaymentOrderSummaryData = {
  Table: DataTable,
  Mobile: MobileData,
};

/**
 * @param {PaymentOrderSummaryDataProps} param0
 */
function MobileData({ data }) {
  // Create Mobile version of data table using Accordion you can see DataTable for reference
  // and wrap accordion using div

  return data.map((item, i) => (
    <div key={i} className="tw-border tw-rounded tw-mb-4">
      <Accordion>
        <AccordionSummary>
          <span className="tw-text-xs">{item.title}</span>
        </AccordionSummary>
        <AccordionDetails>
          <Stack spacing={2}>
            <Stack direction="row" justifyContent="space-between">
              <span className="tw-text-xs">Jumlah Transaksi</span>
              <span className="tw-text-xs">Rp. {item.totalAmount.formatCurrency()}</span>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <span className="tw-text-xs">Jumlah Fee</span>
              <span className="tw-text-xs">
                Rp. {item.totalFee.toFixed(0).toNumber().formatCurrency()}
              </span>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <span className="tw-text-xs">Total</span>
              <span className="tw-text-xs">
                Rp. {(item.totalAmount + item.totalFee).toFixed(0).toNumber().formatCurrency()}
              </span>
            </Stack>
            <SubDataTable payments={item.payments} />
          </Stack>
        </AccordionDetails>
      </Accordion>
    </div>
  ));
}

/**
 * @param {PaymentOrderSummaryDataProps} param0
 */
function DataTable({ data }) {
  const headers = ['Area', 'Jumlah Transaksi', 'Jumlah Fee', 'Total'];
  const expansions = useExpansionToggle();

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
        {data.map((item, i) => (
          <Fragment key={i}>
            <TableRow>
              <TableCell>
                <IconButton onClick={() => expansions.toggle(item._id)}>
                  <Iconify icon="mdi:menu-down" />
                </IconButton>
                <span className="tw-text-xs">{item.title}</span>
              </TableCell>
              <TableCell>
                <span className="tw-text-xs">Rp. {item.totalAmount.formatCurrency()}</span>
              </TableCell>
              <TableCell>
                <span className="tw-text-xs">
                  Rp. {item.totalFee.toFixed(0).toNumber().formatCurrency()}
                </span>
              </TableCell>
              <TableCell>
                <span className="tw-text-xs">
                  Rp. {(item.totalAmount + item.totalFee).toFixed(0).toNumber().formatCurrency()}
                </span>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ padding: 0 }} colSpan={headers.length}>
                <Collapse sx={{ padding: 0 }} in={expansions.isIncludes(item._id)}>
                  <div className="tw-p-4">
                    <SubDataTable payments={item.payments} />
                  </div>
                </Collapse>
              </TableCell>
            </TableRow>
          </Fragment>
        ))}
      </TableBody>
    </Table>
  );
}

/** @param {PaymentOrderSummaryDataComponent} param0 */
function SubDataTable({ payments }) {
  const headers = ['Metode Pembayaran', 'Jumlah Transaksi', 'Jumlah Fee', 'Total'];

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
        {payments.map((item, i) => (
          <TableRow key={i}>
            <TableCell>
              <span className="tw-text-xs">{item._id}</span>
            </TableCell>
            <TableCell>
              <span className="tw-text-xs">Rp. {item.totalAmount.formatCurrency()}</span>
            </TableCell>
            <TableCell>
              <span className="tw-text-xs">
                Rp. {item.totalFee.toFixed(0).toNumber().formatCurrency()}
              </span>
            </TableCell>
            <TableCell>
              <span className="tw-text-xs">
                Rp. {(item.totalAmount + item.totalFee).toFixed(0).toNumber().formatCurrency()}
              </span>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
