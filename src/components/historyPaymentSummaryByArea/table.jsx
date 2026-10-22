/**
 * @typedef {import("@/repositories/subscription").PaymentHistorySummaryByAreaCategory} PaymentHistorySummaryByAreaCategory
 */

import { Fragment } from 'react';
import { Iconify } from '@components/iconify';
import { useExpansionToggle } from '@hooks/use-expansion-toggle';

import {
  Table,
  Divider,
  TableRow,
  Collapse,
  TableCell,
  TableHead,
  TableBody,
  IconButton,
} from '@mui/material';

import 'src/extension/number';

/**
 * @param {{data: PaymentHistorySummaryByAreaCategory[]}} param0
 */
export default function HistoryPaymentSummaryByAreaTable({ data }) {
  const headers = ['Wilayah', 'Total'];
  const expansion = useExpansionToggle();

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
        {data.map((d, i) => (
          <Fragment key={i}>
            <TableRow>
              <TableCell>
                <div className="tw-flex tw-flex-row tw-items-center tw-gap-2">
                  <IconButton onClick={() => expansion.toggle(d._id)}>
                    <Iconify icon="mdi:menu-down" />
                  </IconButton>
                  <span className="tw-text-xs tw-font-semibold tw-uppercase">{d.areaCategory}</span>
                </div>
              </TableCell>
              <TableCell>
                <span className="tw-text-xs tw-font-semibold tw-uppercase">
                  Rp. {d.total.formatCurrency()}
                </span>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell colSpan={2} sx={{ padding: 0 }}>
                <Collapse in={expansion.isIncludes(d._id)}>
                  <div className="tw-flex tw-flex-col tw-p-3 tw-gap-2">
                    <ul className="tw-list-disc tw-px-8">
                      {d.items.map((item, j) => (
                        <li key={j}>
                          <div className="tw-flex tw-flex-col gap-2">
                            <div className="tw-flex tw-flex-row tw-items-center tw-gap-4 tw-my-2">
                              <span className="tw-text-xs tw-w-72">{item.areaTitle}</span>
                              <span className="tw-text-xs tw-font-semibold">
                                : Rp. {item.total.formatCurrency()}
                              </span>
                            </div>
                            <Divider />
                          </div>
                        </li>
                      ))}
                    </ul>
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
