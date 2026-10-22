import { format } from "date-fns";

import { Tooltip } from "@mui/material";

export function NetIndicatorAreaTree({ status, timestamp }) {
  const color = status === 'up' ? '#22c55e' : status === 'down' ? '#ef4444' : '#9ca3af';
  const label = timestamp
    ? `Last Checked: ${format(new Date(timestamp), 'dd MMM yyyy HH:mm:ss')}`
    : 'timestamp -';

  return (
    <Tooltip title={label} arrow>
      <span
        aria-label={label}
        className="tw-inline-block tw-h-2.5 tw-w-2.5 tw-rounded-full"
        style={{ backgroundColor: color }}
      />
    </Tooltip>
  );
}
