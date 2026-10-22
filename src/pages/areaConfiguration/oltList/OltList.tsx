// @ts-nocheck
import { Iconify } from '@components/iconify';
import Overloading from '@components/overloading';
import AreaPickerFilter from '@components/billing/areaPickerFilter';

import { Stack, Button, Tooltip, TextField } from '@mui/material';

import { useOltListState } from './oltList.state';
import { OltDeviceData } from './components/Data';
import OltFormDialog from './components/FormDialog';
import DuplicatedOnuDialog from './components/DuplicatedOnuDialog';

export default function OltList() {
  const { handlers, state, ref } = useOltListState();

  return (
    <>
      <Stack className="tw-relative" spacing={2}>
        <Overloading loading={state.loading} />
        <Stack direction="row" justifyContent="flex-end" spacing={2} alignItems="center" mb={2}>
          <div className="tw-w-full md:tw-max-w-44">
            <TextField
              size="small"
              fullWidth
              value={state.selectedAreaName}
              InputProps={{ readOnly: true }}
              label="Area"
              onClick={handlers.pickArea}
            />
          </div>
          <Tooltip title="Duplicated ONU data">
            <Button
              color="warning"
              className="tw-gap-2"
              variant="soft"
              onClick={handlers.openDuplicatedOnuDialog}
            >
              <Iconify icon="fluent-mdl2:merge-duplicate" /> <span>Duplicated ONU Data</span>
            </Button>
          </Tooltip>
          <Button variant="contained" color="primary" onClick={handlers.add}>
            <Iconify icon="mdi:add" /> Tambah
          </Button>
        </Stack>
        {/* Content */}
        {state.isMobile ? (
          <OltDeviceData.Mobile
            oltDevices={state.filteredOltList}
            onDelete={handlers.remove}
            onEdit={handlers.edit}
            onQuery={handlers.query}
            onRebuild={handlers.rebuild}
          />
        ) : (
          <OltDeviceData.Table
            oltDevices={state.filteredOltList}
            onDelete={handlers.remove}
            onEdit={handlers.edit}
            onQuery={handlers.query}
            onRebuild={handlers.rebuild}
          />
        )}

        {/* End Content */}
      </Stack>
      <OltFormDialog ref={ref.formDialogRef} />
      <DuplicatedOnuDialog ref={ref.duplicatedOnuDialogRef} />
      <AreaPickerFilter ref={ref.areaPickerRef} />
    </>
  );
}
