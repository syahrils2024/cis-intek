/**
 * @typedef {import("src/repositories/userActivity").UserActivity} UserActivity
 */

import { Table, TableRow, TableCell, TableHead, TableBody } from '@mui/material';

import 'src/extension/date';
import 'src/extension/string';

/**
 * @param {{data: UserActivity[]}} param0
 */

export default function UserActivityTable({ data }) {
  const headers = ['Deskripsi', 'Waktu'];

  return (
    <Table>
      <TableHead>
        <TableRow>
          {headers.map((header, index) => (
            <TableCell key={index}>{header}</TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {data.map((item, index) => (
          <TableRow key={index}>
            <TableCell>
              <span className="tw-text-xs">{item.description}</span>
            </TableCell>
            <TableCell>
              <span className="tw-text-xs">
                {item.createdAt.toDate().format('dd MMM yyyy HH:mm:ss')}
              </span>
            </TableCell>
          </TableRow>
        ))}
        {data.length === 0 && (
          <TableRow>
            <TableCell colSpan={headers.length} align="center">
              Tidak ada data
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
