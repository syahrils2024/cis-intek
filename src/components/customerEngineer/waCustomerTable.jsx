/**
 * @typedef {import("src/repositories/mikrotik").MikrotikActionLog} MikrotikActionLog
 */

import { Fragment } from 'react';
import { useExpansionToggle } from '@hooks/use-expansion-toggle';

import {
  Table,
  Stack,
  TableRow,
  TableCell,
  TableHead,
  TableBody,
} from '@mui/material';

import 'src/extension/date';

/**
 * @param {{data: MikrotikActionLog[]}} props
 */
export default function WaCustomerTable({ data }) {
  const headers = ['From', 'Number', 'Message'];
  const expand = useExpansionToggle();

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
                <Stack>
                  <span className="tw-text-xs tw-text-gray-500">
                    {d.fromWhatsappNode?.toUpperCase() ?? '-'}
                  </span>
                </Stack>
              </TableCell>
              <TableCell>
                <Stack>
                  <span className="tw-text-xs tw-font-semibold">{d.fromWhatsappNodePhone?.toUpperCase()}</span>
                </Stack>
              </TableCell>
              <TableCell>
                <span className="tw-text-xs">{d.message.substring(0, d.message.length)}</span>
              </TableCell>
            </TableRow>
          </Fragment>
        ))}
      </TableBody>
    </Table>
  );
}
