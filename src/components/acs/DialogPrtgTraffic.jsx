import { useState } from 'react';

import { Stack, Select, MenuItem } from '@mui/material';

import PrtgTrafficView from './PrtgTrafficView';

export default function DialogPrtgTraffic({ customer_id }) {
  const [trafficMode, setTrafficMode] = useState('live');
  const trafficOptions = [
    { label: 'Live', value: 'live' },
    { label: '48 hours', value: 'last48Hours' },
    { label: '30 days', value: '30days' },
    { label: '365 days', value: '365days' },
  ];

  return (
    <Stack>
      <div className="tw-w-full md:tw-max-w-32 tw-self-end">
        <Select
          fullWidth
          value={trafficMode}
          onChange={(e) => setTrafficMode(e.target.value)}
          size="small"
        >
          {trafficOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </div>
      <PrtgTrafficView customer_id={customer_id} trafficMode={trafficMode} />
    </Stack>
  );
}
