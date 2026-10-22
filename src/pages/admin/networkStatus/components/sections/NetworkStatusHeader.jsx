import { Iconify } from '@components/iconify';

import { Button, Typography } from '@mui/material';

/**
 * Page header with title and the "Unbind SN List" action.
 *
 * @param {{ isMobile: boolean, unbindSerialNumber: () => Promise<void> }} props
 */
export default function NetworkStatusHeader({ isMobile, unbindSerialNumber }) {
  return (
    <div className="tw-flex tw-flex-row tw-w-full tw-items-center tw-justify-between tw-gap-2 tw-mb-10">
      <Typography variant={isMobile ? 'h6' : 'h5'}>Network Status</Typography>
      <Button size="small" color="primary" variant="soft" onClick={unbindSerialNumber}>
        <Iconify icon="material-symbols:search-off" />
        {isMobile ? null : <span>Unbind SN List</span>}
      </Button>
    </div>
  );
}
