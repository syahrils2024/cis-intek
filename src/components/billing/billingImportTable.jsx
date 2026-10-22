import { Table, Stack, TableRow, TableCell, TableHead, TableBody } from '@mui/material';

import 'src/extension/number';
import 'src/extension/string';

/**
 * @typedef {import("src/repositories/xlsx").CustomerTemplateValidation} CustomerTemplateValidation
 */

/**
 *
 * @param {{data: import('src/repositories/xlsx').BillingTemplateValidation[]}}
 */
export default function BillingImportTable({ data }) {
  const headers = [
    'Pelanggan',
    'Periode',
    'Tagihan',
    'Bayar',
    'Dibayar Pada',
    'Area',
    'Paket',
    'Jatuh Tempo',
  ];

  return (
    <div className="tw-flex tw-flex-col tw-gap-4">
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
            <TableRow key={i}>
              <TableCell>
                <Stack>
                  <span className="tw-text-xs">
                    {d.customerFullname} - {d.customerPhone}
                  </span>
                  <span className="tw-text-xs">{d.customerId}</span>
                  <span className="tw-text-xs">{d.customerAddress}</span>
                </Stack>
              </TableCell>
              <TableCell width={250}>
                <Stack>
                  <span className="tw-text-xs">{d.summaryPeriode}</span>
                </Stack>
              </TableCell>
              <TableCell>
                <Stack>
                  <span className="tw-text-xs">
                    {d.amount.toString().toNumber().formatCurrency()}
                  </span>
                </Stack>
              </TableCell>
              <TableCell>
                <Stack>
                  <span className="tw-text-xs">
                    {d.pay?.toString().toNumber().formatCurrency()}
                  </span>
                </Stack>
              </TableCell>
              <TableCell>
                <Stack>
                  <span className="tw-text-xs">{d.payAt?.toDate().format('dd MMM yyyy')}</span>
                </Stack>
              </TableCell>
              <TableCell>
                <Stack>
                  <span className="tw-text-xs">{d.areaTitle}</span>
                </Stack>
              </TableCell>
              <TableCell>
                <Stack>
                  <span className="tw-text-xs">{d.services}</span>
                </Stack>
              </TableCell>
              <TableCell>
                <Stack>
                  <span className="tw-text-xs">{d.duoDate?.toDate().format('dd MMM yyyy')}</span>
                </Stack>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
