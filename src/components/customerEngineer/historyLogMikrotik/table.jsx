/**
 * @typedef {import("src/repositories/mikrotik").MikrotikActionLog} MikrotikActionLog
 */

import { Fragment } from 'react';
import { Iconify } from '@components/iconify';
import { useExpansionToggle } from '@hooks/use-expansion-toggle';

import Grid2 from '@mui/material/Unstable_Grid2';
import {
  Chip,
  Table,
  Stack,
  Tooltip,
  TableRow,
  Collapse,
  TableCell,
  TableHead,
  TableBody,
  IconButton,
} from '@mui/material';

import 'src/extension/date';

/**
 * @param {{data: MikrotikActionLog[]; onRedo: Function(data: MikrotikActionLog): void}} props
 */
export default function HistoryLogMikrotikTable({ data, onRedo }) {
  const headers = ['Pelanggan', 'Agent', 'POP Remote', 'Tag', 'Status', 'Timestamp', ''];
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
        {data.length <= 0 ? (
          <TableRow>
            <TableCell colSpan={headers.length} sx={{ textAlign: 'center' }}>
              Tidak ada data
            </TableCell>
          </TableRow>
        ) : null}
        {data.map((d, i) => (
          <Fragment key={i}>
            <TableRow>
              <TableCell>
                <div className="tw-flex tw-flex-row tw-gap-4 tw-items-center">
                  <IconButton onClick={() => expand.toggle(d._id)}>
                    <Iconify icon="mdi:menu-down" />
                  </IconButton>
                  <Stack>
                    <span className="tw-text-xs tw-font-semibold">
                      {d.customerFullname.toUpperCase()}
                    </span>
                    <span className="tw-text-xs">{d.customerId.toUpperCase()}</span>
                  </Stack>
                </div>
              </TableCell>
              <TableCell>
                <Stack>
                  <span className="tw-text-xs tw-font-semibold">
                    {d.createdUserFullname?.toUpperCase() ?? '-'}
                  </span>
                  <span className="tw-text-xs tw-text-gray-500">
                    {d.createdUserEmail?.toUpperCase() ?? '-'}
                  </span>
                </Stack>
              </TableCell>
              <TableCell>
                <Stack>
                  <span className="tw-text-xs tw-font-semibold">{d.area?.toUpperCase()}</span>
                  <span className="tw-text-xs">{d.remote.toUpperCase()}</span>
                </Stack>
              </TableCell>
              <TableCell>
                <span className="tw-text-xs">{d.type.toUpperCase()}</span>
              </TableCell>

              <TableCell>
                <div className="tw-flex tw-flex-row tw-gap-2">
                  {d.isAutomatic ? (
                    <Chip variant="outlined" color="primary" label="OTOMATIS" size="small" />
                  ) : (
                    <Chip variant="outlined" color="warning" label="MANUAL" size="small" />
                  )}
                  {d.isSuccess ? (
                    <Chip variant="outlined" color="success" label="SUCCESS" size="small" />
                  ) : (
                    <Chip variant="outlined" color="error" label="FAILED" size="small" />
                  )}
                </div>
              </TableCell>
              <TableCell>
                <span className="tw-text-xs">
                  {new Date(d.createdAt).format('dd-MM-yyyy, HH:mm:ss')}
                </span>
              </TableCell>
              <TableCell>
                <Tooltip title="Jalankan ulang">
                  <IconButton color="primary" onClick={() => onRedo(d)} disabled={d.isSuccess}>
                    <Iconify icon="hugeicons:redo" />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell colSpan={5} sx={{ padding: 0 }}>
                <Collapse in={expand.isIncludes(d._id)}>
                  <div className="tw-p-5 tw-w-full">
                    <Grid2 container gap={4}>
                      <Grid2 xs={(d.errorMessage?.length ?? 0) > 1 ? 6 : 12}>
                        <Stack>
                          <span className="tw-text-xs tw-font-semibold">Commands :</span>
                          <ol className="tw-list-disc tw-px-5 tw-mt-1 tw-gap-2´">
                            {d.commands.map((command, j) => (
                              <li className="tw-text-xs" key={j}>
                                {command}
                              </li>
                            ))}
                          </ol>
                        </Stack>
                      </Grid2>
                      {(d.errorMessage?.length ?? 0) >= 1 && (
                        <Grid2 xs={6}>
                          <Stack>
                            <span className="tw-text-xs tw-font-semibold">Error Message :</span>
                            <ol className="tw-list-disc tw-px-5 tw-mt-1 tw-gap-2´">
                              {d.errorMessage.map((command, j) => (
                                <li className="tw-text-xs tw-text-red-600" key={j}>
                                  {command}
                                </li>
                              ))}
                            </ol>
                          </Stack>
                        </Grid2>
                      )}
                    </Grid2>
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
