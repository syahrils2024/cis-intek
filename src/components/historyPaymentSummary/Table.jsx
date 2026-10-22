/**
 * @typedef {import("src/repositories/subscription").PaymentHistorySummary} PaymentHistorySummary
 */

import { Fragment } from 'react';
import { Iconify } from '@components/iconify';
import { useExpansionToggle } from '@hooks/use-expansion-toggle';

import {
  Stack,
  Table,
  Avatar,
  Divider,
  TableRow,
  Collapse,
  TableBody,
  TableCell,
  TableHead,
  IconButton,
} from '@mui/material';

import 'src/extension/string';
import 'src/extension/number';

/**
 *
 * @param {{data: PaymentHistorySummary[]}} param0
 */
export default function HistoryPaymentSummaryTable({ data }) {
  const headers = ['User', 'Jumlah'];
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
              <TableCell width={500}>
                <div className="tw-flex tw-flex-row tw-items-center tw-justify-between tw-gap-2">
                  <IconButton onClick={() => expansion.toggle(d._id)}>
                    <Iconify icon="ic:baseline-keyboard-arrow-down" />
                  </IconButton>
                  <Stack spacing={2} direction="row" alignItems="center" className="tw-w-full">
                    <Avatar src="https://api-dev-minimal-v6.vercel.app/assets/images/avatar/avatar-17.webp" />
                    <Stack sx={{ typography: 'body2', flex: '1 1 auto', alignItems: 'flex-start' }}>
                      <span className="tw-text-xs tw-font-medium">{d.fullname}</span>
                      <span className="tw-text-xs tw-text-gray-500">{d.email}</span>
                      <span className="tw-text-xs tw-text-gray-500">{d.address}</span>
                    </Stack>
                  </Stack>
                </div>
              </TableCell>
              <TableCell>
                <span className="tw-text-xs">
                  Rp. {d.amount?.toString().toNumber().formatCurrency()}
                </span>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell colSpan={2} sx={{ padding: 0 }}>
                <Collapse in={expansion.isIncludes(d._id)}>
                  <div className="tw-flex tw-flex-col tw-w-full tw-mx-auto tw-p-5 tw-gap-1.5">
                    {d.details?.map((detail, j) => (
                      <Fragment key={j}>
                        <div className="tw-flex tw-flex-row tw-w-full tw-items-center tw-justify-between">
                          <span className="tw-text-xs tw-uppercase">
                            {detail.paymentMethod} - {detail.depositMethod}
                          </span>
                          <span className="tw-text-xs tw-text-right tw-font-medium">
                            Rp. {detail.amount?.toString().toNumber().formatCurrency()}
                          </span>
                        </div>
                        <Divider />
                      </Fragment>
                    ))}
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
