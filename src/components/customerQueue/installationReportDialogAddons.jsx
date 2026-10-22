import { useMemo } from 'react';
import { Form } from '@components/hook-form';
import { pickFile } from '@utils/filePicker';
import { Iconify } from '@components/iconify';
import { UploadAvatar } from '@components/upload';

import { Stack, IconButton } from '@mui/material';

/**
 * @param {Object} props
 * @param {Array<{addons: string; addonsName: string; photo?: string; file?: File}>} props.addons - Array of addon objects.
 * @param {Function} props.onAddonChange - Callback function for addon changes.
 * @returns {JSX.Element}
 */
export default function InstallationReportDialogAddons({ addons = [], onAddonChange }) {
  const computedAddons = useMemo(() =>
    addons.map((addon) => {
      if (addon.file && addon.file instanceof File) {
        return {
          ...addon,
          photo: URL.createObjectURL(addon.file),
        };
      }
      return addon;
    })
  );

  async function handleChangeFile(index) {
    const file = await pickFile('image/*');
    if (!file) return;
    const copy = [...addons];
    copy[index].file = file;
    onAddonChange(copy);
  }

  function handleRemoveAddon(index) {
    const copy = [...addons];
    copy[index].photo = null;
    copy[index].file = null;
    onAddonChange(copy);
  }

  return (
    <Form>
      <Stack>
        {computedAddons.map((addon, index) => (
          <Stack key={index}>
            {addon.photo ? (
              <div className="tw-relative tw-w-1/2 md:tw-w-1/3 tw-mx-auto tw-items-center tw-justify-center tw-flex">
                <div className="tw-absolute tw-top-0 tw-right-0">
                  <IconButton color="error" onClick={() => handleRemoveAddon(index)}>
                    <Iconify icon="mdi:close" />
                  </IconButton>
                </div>
                <img
                  src={
                    addon.photo?.includes('.png') ? `/public/uploads/${addon.photo}` : addon.photo
                  }
                  className="tw-rounded-full tw-aspect-square tw-object-cover"
                  alt={addon.addonsName}
                />
              </div>
            ) : (
              <button type="button" onClick={() => handleChangeFile(index)}>
                <UploadAvatar label={`Upload foto ${addon.addonsName}`} disabled />
              </button>
            )}

            <span className="tw-text-xs tw-font-semibold tw-text-center">
              {addon.addonsName ?? '???'}
            </span>
          </Stack>
        ))}
      </Stack>
    </Form>
  );
}
