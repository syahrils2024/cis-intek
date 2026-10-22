import { useRef, useState } from 'react';
import { Iconify } from '@components/iconify';

import { Stack, Select, MenuItem, IconButton } from '@mui/material';

import { PrtgTrafficView } from './PrtgTrafficView';

export default function PrtgTraffic({ customer_id }) {
  const [trafficMode, setTrafficMode] = useState('live');
  const trafficViewRef = useRef();
  const trafficOptions = [
    { label: 'Live', value: 'live' },
    { label: '48 hours', value: 'last48Hours' },
    { label: '30 days', value: '30days' },
    { label: '365 days', value: '365days' },
  ];

  return (
    <Stack>
      <div className="tw-w-full md:tw-max-w-32 tw-self-end tw-flex tw-flex-row">
        <IconButton>
          <Iconify icon="mdi:refresh" onClick={() => trafficViewRef.current?.loadImage()} />
        </IconButton>
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
      <PrtgTrafficView ref={trafficViewRef} customer_id={customer_id} trafficMode={trafficMode} />
    </Stack>
  );
}
