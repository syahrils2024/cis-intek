import { Table, Stack, Divider, TableRow, TableCell, TableHead, TableBody } from '@mui/material';

import 'src/extension/number';
import 'src/extension/string';

/**
 * @typedef {import("src/repositories/xlsx").CustomerTemplateValidation} CustomerTemplateValidation
 */

/**
 *
 * @param {{data: CustomerTemplateValidation[]; coloringData: CustomerTemplateValidation}} param0
 */
export default function CustomerImportTable({ data, coloringData }) {
  const headers = [
    'Pelanggan',
    'Paket',
    'Area / POP',
    'ODP',
    'VLAN',
    'IP Remote',
    'PPPoE',
    'Router',
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
              <TableCell width={250}>
                <Stack>
                  <span className="tw-text-xs">
                    <span className="tw-font-semibold">{d.customerFullname}</span> -{' '}
                    {d.customerPhone}
                  </span>
                  <span className="tw-text-xs">{d.customerId}</span>
                  <span className="tw-text-xs">{d.customerAddress}</span>
                </Stack>
              </TableCell>
              <TableCell>
                <Stack>
                  <span className="tw-text-xs">{d.package}</span>
                  <span className="tw-text-xs">
                    Rp. {d.packagePrice.toString().toNumber().formatCurrency()}
                  </span>
                </Stack>
              </TableCell>
              <TableCell>
                <Stack>
                  <span className="tw-text-xs">{d.areaTitle}</span>
                </Stack>
              </TableCell>
              <TableCell>
                <Stack>
                  <span className="tw-text-xs">{d.odpTitle}</span>
                </Stack>
              </TableCell>
              <TableCell>
                <Stack>
                  <span className="tw-text-xs">{d.vlan}</span>
                </Stack>
              </TableCell>
              <TableCell>
                <Stack>
                  <span className="tw-text-xs">{d.ipRemote}</span>
                </Stack>
              </TableCell>
              <TableCell>
                <Stack gap={0.3}>
                  <span className="tw-text-xs">Name: {d.pppoeName}</span>
                  <Divider />
                  <span className="tw-text-xs">Password: {d.pppoePassword}</span>
                </Stack>
              </TableCell>
              <TableCell>
                <Stack gap={0.3}>
                  <span className="tw-text-xs">Serial Number: {d.routerSerialNumber}</span>
                  <Divider />
                  <span className="tw-text-xs">SSID: {d.routerSsid}</span>
                  <Divider />
                  <span className="tw-text-xs">Password: {d.routerPassword}</span>
                </Stack>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
