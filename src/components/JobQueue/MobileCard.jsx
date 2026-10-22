import {
  Chip,
  Stack,
  Button,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  AccordionActions,
} from '@mui/material';

import 'src/extension/date';

/**
 * @typedef {import("src/repositories/jobQueue").JobQueue} JobQueue
 * @param {{data: JobQueue; onCancel: (data: JobQueue) => void}} param0
 */
export default function JobQueueMobileCard({ data, onCancel }) {
  function statusColor(status) {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'success':
        return 'success';
      case 'failed':
        return 'error';
      case 'canceled':
        return 'error';
      default:
        return undefined;
    }
  }

  return (
    <div className="tw-ring-1 tw-ring-gray-300 tw-rounded-lg">
      <Accordion className="tw-w-full">
        <AccordionSummary className="tw-w-full">
          <Stack className="tw-w-full" spacing={1}>
            <div className="tw-flex tw-flex-row tw-items-center tw-justify-between tw-w-full tw-gap-4">
              <span className="tw-text-xs tw-font-semibold">{data.areaTitle}</span>
              <Chip
                label={data.status.toUpperCase()}
                size="small"
                color={statusColor(data.status)}
                variant="outlined"
              />
            </div>
            <Divider />
            <Stack>
              <span className="tw-text-xs tw-font-semibold">{data.customerFullname}</span>
              <span className="tw-text-xs tw-text-gray-500">{data.customerId}</span>
              <span className="tw-text-xs tw-text-gray-500">{data.customerPhone}</span>
            </Stack>
          </Stack>
        </AccordionSummary>
        <AccordionDetails>
          <Stack spacing={2}>
            <Stack>
              <span className="tw-text-xs tw-text-gray-500">Next Run</span>
              <span className="tw-text-xs tw-font-semibold">
                {new Date(data.runAt).format('dd-MM-yyyy HH:mm')}
              </span>
            </Stack>
            <Stack>
              <span className="tw-text-xs tw-text-gray-500">Repeat</span>
              <span className="tw-text-xs tw-font-semibold">
                {data.repeat} / {data.maxRepeat}
              </span>
            </Stack>
            <Stack>
              <span className="tw-text-xs tw-text-gray-500">Created At</span>
              <span className="tw-text-xs">{data.createdUserFullname ?? 'no agent'}</span>
              <span className="tw-text-xs tw-font-semibold">
                {new Date(data.createdAt).format('dd-MM-yyyy HH:mm')}
              </span>
            </Stack>
            <Stack>
              <span className="tw-text-xs tw-text-gray-500">commands :</span>
              <ol className="tw-list-disc tw-pl-6">
                <li>
                  {data.commands.map((c, j) => (
                    <span key={j} className="tw-text-xs">
                      {c}
                    </span>
                  ))}
                </li>
              </ol>
              {data.failedReason && (
                <>
                  <span className="tw-text-xs tw-text-gray-500 tw-mt-2">Failed Reason :</span>
                  <span className="tw-text-xs tw-font-semibold tw-pl-3 tw-mt-1 tw-text-red-600">
                    {data.failedReason ?? '-'}
                  </span>
                </>
              )}
            </Stack>
          </Stack>
        </AccordionDetails>
        <AccordionActions>
          <Button
            disabled={
              data.canceled ||
              data.repeat >= data.maxRepeat ||
              ['success', 'canceled'].includes(data.status)
            }
            variant="outlined"
            color="error"
            size="small"
            onClick={() => onCancel(data)}
          >
            Cancel
          </Button>
        </AccordionActions>
      </Accordion>
    </div>
  );
}
