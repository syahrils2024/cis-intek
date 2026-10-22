import {
  Chip,
  Table,
  Stack,
  Divider,
  TableRow,
  TableCell,
  TableHead,
  TableBody,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';

import 'src/extension/date';
import 'src/extension/string';

/**
 * @typedef {import("src/repositories/customer").CustomerMigrationPackageLog} CustomerMigrationPackageLog
 */

/**
 * @param {{data: CustomerMigrationPackageLog[]}} param0
 */

export default function CustomerMigrationPackageLogMobile({ data }) {
  const headers = ['Pelanggan', 'Agent', 'Sebelumnya', 'Sesudahnya', 'Timestamp'];

  return data.map((d, i) => (
    <div className="tw-rounded-lg tw-ring-1 tw-ring-gray-400" key={i}>
      <Accordion>
        <AccordionSummary className="tw-w-full">
          <Stack gap={1} className="tw-w-full">
            <Stack direction="row" alignItems="center" justifyContent="end" className="tw-w-full">
              <Chip
                label={d.createdAt.toDate().format('dd MMM yyyy, HH:mm')}
                size="small"
                color="success"
                variant="soft"
              />
            </Stack>
            <Divider />
            <Stack>
              <span className="tw-text-xs tw-font-semibold">{d.customerFullname}</span>
              <span className="tw-text-xs tw-text-gray-500">{d.customerId}</span>
              <span className="tw-text-xs tw-text-gray-500">{d.customerPhone}</span>
            </Stack>
          </Stack>
        </AccordionSummary>
        <AccordionDetails>
          <Stack gap={1.5} className="tw-w-full">
            <Stack>
              <span className="tw-text-xs tw-text-gray-500">Agent</span>
              <span className="tw-text-xs">{d.createdByFullname}</span>
              <span className="tw-text-xs">{d.createdByEmail}</span>
            </Stack>
            <Stack>
              <span className="tw-text-xs tw-text-gray-500">Paket Sebelumnya</span>
              <span className="tw-text-xs">{d.fromPackageName}</span>
            </Stack>
            <Stack>
              <span className="tw-text-xs tw-text-gray-500">Paket Sesudahnya</span>
              <span className="tw-text-xs">{d.toPackageName}</span>
            </Stack>
          </Stack>
        </AccordionDetails>
      </Accordion>
    </div>
  ));

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
