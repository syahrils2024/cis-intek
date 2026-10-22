import { Iconify } from '@components/iconify';

import { Stack, Button, TextField } from '@mui/material';

/**
 * @param {{
 * profileName: String,
 * setProfileName: Function,
 * areas: Array<{_id: String, title: string}>,
 * onAddArea: Function,
 * onRemoveArea: Function,
 * }} param0
 */
export function FeeProfileFormDialogTabArea({
  profileName,
  setProfileName,
  areas,
  onAddArea,
  onRemoveArea,
}) {
  return (
    <Stack spacing={2}>
      <TextField
        label="Nama Profile"
        value={profileName}
        onChange={(e) => setProfileName(e.target.value)}
        size="small"
        fullWidth
      />
      <div className="tw-flex tw-flex-col tw-p-4 tw-ring-1 tw-ring-gray-400 tw-rounded-md tw-gap-4">
        <div className="tw-flex tw-flex-col tw-gap-2">
          {areas.map((a, i) => (
            <div
              key={i}
              className="tw-w-full tw-ring-1 tw-flex tw-flex-row tw-p-2 tw-rounded-md tw-items-center tw-justify-between tw-pl-4"
            >
              <span className="tw-flex-1 tw-text-xs">{a.title}</span>
              <Button color="error" variant="text" onClick={() => onRemoveArea(i)}>
                <Iconify icon="eva:close-fill" />
              </Button>
            </div>
          ))}
        </div>
        <div className="tw-flex tw-flex-row tw-items-center tw-justify-end tw-gap-2">
          <Button variant="soft" onClick={() => onAddArea()} color="primary">
            <Iconify icon="eva:plus-fill" /> Tambah Area
          </Button>
        </div>
      </div>
    </Stack>
  );
}
