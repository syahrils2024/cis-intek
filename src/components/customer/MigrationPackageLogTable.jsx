import { Table, Stack, TableRow, TableCell, TableHead, TableBody } from '@mui/material';

import 'src/extension/date';
import 'src/extension/string';

/**
 * @typedef {import("src/repositories/customer").CustomerMigrationPackageLog} CustomerMigrationPackageLog
 */

/**
 * @param {{data: CustomerMigrationPackageLog[]}} param0
 */

export default function CustomerMigrationPackageLogTable({ data }) {
  const headers = ['Pelanggan', 'Agent', 'Sebelumnya', 'Sesudahnya', 'Timestamp'];

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
          <TableRow key={i}>
            <TableCell>
              <Stack>
                <span className="tw-text-xs tw-font-semibold">{d.customerFullname}</span>
                <span className="tw-text-xs tw-text-gray-500">{d.customerId}</span>
                <span className="tw-text-xs tw-text-gray-500">{d.customerPhone}</span>
              </Stack>
            </TableCell>
            <TableCell>
              <Stack>
                <span className="tw-text-xs tw-font-semibold">{d.createdByFullname}</span>
                <span className="tw-text-xs">{d.createdByEmail}</span>
              </Stack>
            </TableCell>
            <TableCell>
              <span className="tw-text-xs">{d.fromPackageName}</span>
            </TableCell>
            <TableCell>
              <span className="tw-text-xs">{d.toPackageName}</span>
            </TableCell>
            <TableCell>
              <span className="tw-text-xs">
                {d.createdAt.toDate().format('dd MMM yyyy, HH:mm')}
              </span>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
