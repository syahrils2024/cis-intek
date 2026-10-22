import { Iconify } from '@components/iconify';

import {
  Chip,
  Stack,
  Divider,
  Tooltip,
  Accordion,
  IconButton,
  AccordionSummary,
  AccordionDetails,
  AccordionActions,
} from '@mui/material';

import 'src/extension/date';

/**
 * @typedef {import("src/repositories/mikrotik").MikrotikActionLog} MikrotikActionLog
 */

/**
 *
 * @param {{data: MikrotikActionLog; onRedo: Function(data: MikrotikActionLog): void}} props
 */

export default function HistoryLogMikrotikMobileCard({ data, onRedo }) {
  return (
    <div className="tw-p-1 tw-ring-1 tw-ring-gray-400 tw-rounded-lg">
      <Accordion>
        <AccordionSummary className="w-full">
          <Stack className="tw-w-full" spacing={2}>
            <div className="tw-flex tw-flex-row tw-justify-between tw-w-full tw-items-center">
              {data.isAutomatic ? (
                <Chip variant="outlined" color="primary" label="OTOMATIS" size="small" />
              ) : (
                <Chip variant="outlined" color="primary" label="MANUAL" size="small" />
              )}
              {data.isSuccess ? (
                <Chip variant="outlined" color="success" label="SUCCESS" size="small" />
              ) : (
                <Chip variant="outlined" color="error" label="FAILED" size="small" />
              )}
            </div>
            <Divider />
            <Stack>
              <span className="tw-text-xs tw-font-semibold">
                {data.customerFullname.toUpperCase()}
              </span>
              <span className="tw-text-xs">{data.customerId.toUpperCase()}</span>
              <span className="tw-text-xs">
                {new Date(data.createdAt).format('dd-MM-yyyy, HH:mm:ss')}
              </span>
            </Stack>
          </Stack>
        </AccordionSummary>
        <AccordionDetails>
          <Stack spacing={2}>
            <Stack>
              <span className="tw-text-xs tw-text-gray-500">Agent</span>
              <span className="tw-text-xs tw-font-semibold">
                {data.createdUserFullname?.toUpperCase()}
              </span>
              <span className="tw-text-xs ">{data.createdUserEmail?.toUpperCase()}</span>
            </Stack>
            <Stack>
              <span className="tw-text-xs tw-text-gray-500">Tag</span>
              <span className="tw-text-xs tw-font-semibold">{data.type.toUpperCase()}</span>
            </Stack>
            <Stack>
              <span className="tw-text-xs tw-text-gray-500">POP Remote</span>
              <span className="tw-text-xs tw-font-semibold">{data.area?.toUpperCase()}</span>
              <span className="tw-text-xs">{data.remote.toUpperCase()}</span>
            </Stack>
            <Stack>
              <span className="tw-text-xs tw-font-semibold">Commands :</span>
              <ol className="tw-list-disc tw-px-5 tw-mt-1 tw-gap-2´">
                {data.commands.map((command, j) => (
                  <li className="tw-text-xs" key={j}>
                    {command}
                  </li>
                ))}
              </ol>
            </Stack>
            {(data.errorMessage?.length ?? 0) > 0 && (
              <Stack>
                <span className="tw-text-xs tw-font-semibold">Error Message :</span>
                <ol className="tw-list-disc tw-px-5 tw-mt-1 tw-gap-2´">
                  {data.errorMessage.map((command, j) => (
                    <li className="tw-text-xs tw-text-red-600" key={j}>
                      {command}
                    </li>
                  ))}
                </ol>
              </Stack>
            )}
          </Stack>
        </AccordionDetails>
        <AccordionActions>
          <Tooltip title="Jalankan ulang">
            <IconButton color="primary" onClick={() => onRedo(data)} disabled={data.isSuccess}>
              <Iconify icon="hugeicons:redo" />
            </IconButton>
          </Tooltip>
        </AccordionActions>
      </Accordion>
    </div>
  );
}
