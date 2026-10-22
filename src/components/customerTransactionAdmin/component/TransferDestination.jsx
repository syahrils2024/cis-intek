import { Iconify } from '@components/iconify';
import { getBankImagePath } from '@utils/getBankImage';

import { Stack, Tooltip, IconButton } from '@mui/material';

const TransferDestination = ({ data, pickDepositMethod }) => (
  <Stack>
    <span className="tw-text-xs">Tujuan Transfer</span>
    <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
      <div className="tw-flex tw-flex-row tw-gap-4 tw-items-center">
        <img
          src={`/assets/bank/${getBankImagePath(data?.accountBank ?? '')}`}
          alt={data?.accountBank}
          className="tw-w-12 tw-object-contain"
        />
        <Stack>
          <span className="tw-text-xs tw-uppercase">{data?.accountName}</span>
          <span className="tw-text-xs tw-uppercase">{data?.accountNumber}</span>
        </Stack>
      </div>
      {['unpaid', 'verify', 'expired'].includes(data?.status) && (
        <Tooltip title="Edit Tujuan Transfer">
          <IconButton onClick={pickDepositMethod} size="small">
            <Iconify icon="mdi:edit" />
          </IconButton>
        </Tooltip>
      )}
    </Stack>
  </Stack>
);

export default TransferDestination;
