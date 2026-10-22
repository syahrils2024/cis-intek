import { Iconify } from '@components/iconify';
import Overloading from '@components/overloading';

import { Stack, Button } from '@mui/material';

import BroadcastProfileForm from './broadcastProfileForm';
import { BroadcastProfileData } from './broadcastProfile.data';
import { useBroadcastProfileState } from '../states/broadcastProfile.state';

export default function BroadcastProfile() {
  const { state, handlers, ref } = useBroadcastProfileState();
  return (
    <Stack className="tw-relative" spacing={1}>
      <Overloading loading={state.loading} />
      <Stack direction="row" className="w-full" alignItems="center" justifyContent="end">
        <div className="tw-w-full md:tw-max-w-min">
          <Button fullWidth variant="contained" color="primary" onClick={handlers.add}>
            <Iconify icon="mdi:plus" />
            Tambah
          </Button>
        </div>
      </Stack>
      {state.mobile ? (
        <BroadcastProfileData.Mobile
          items={state.data}
          onRemove={handlers.remove}
          onEdit={handlers.edit}
        />
      ) : (
        <BroadcastProfileData.Table
          items={state.data}
          onRemove={handlers.remove}
          onEdit={handlers.edit}
        />
      )}
      <BroadcastProfileForm ref={ref.broadcastProfileTemplateFormRef} />
    </Stack>
  );
}
