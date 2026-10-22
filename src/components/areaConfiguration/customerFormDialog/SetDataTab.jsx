import { Iconify } from '@components/iconify';
import { Field } from '@components/hook-form';
import { useFieldArray } from 'react-hook-form';

import { Stack, Button, Tooltip, TextField, IconButton } from '@mui/material';

/**
 * @param {{
 *   methods: any;
 *   placeholderKtp: string | null;
 *   setPlaceholderKtp: (val: string | null) => void;
 *   changeKtp: (acceptedFiles: File[]) => void;
 *   cropKtp: () => Promise<void>;
 *   scanOcrKtp: (file: File) => Promise<void>;
 *   pickPhone: (phone: string) => void;
 *   checkWhatsapp: () => void;
 *   seperateLatLng: (value: string) => void;
 *   showMaps: { onTrue: () => void };
 *   isEdit: boolean;
 * }} props
 */
export default function SetDataTab({
  methods,
  placeholderKtp,
  setPlaceholderKtp,
  changeKtp,
  cropKtp,
  scanOcrKtp,
  pickPhone,
  checkWhatsapp,
  seperateLatLng,
  showMaps,
  isEdit = false,
}) {
  const { fields, append, remove } = useFieldArray({
    control: methods.control,
    name: 'additionalPhoneNumber',
  });

  return (
    <Stack spacing={2} className="tw-w-full">
      {placeholderKtp ? (
        <div className="tw-flex tw-relative">
          <img
            src={
              placeholderKtp.includes('blob') ? placeholderKtp : `/public/uploads/${placeholderKtp}`
            }
            alt="KTP"
            className="tw-w-full tw-rounded-lg tw-aspect-video object tw-object-cover"
          />
          <div className="tw-absolute tw-right-3 tw-top-3 tw-flex tw-flex-row tw-gap-3">
            <div className="tw-bg-white tw-rounded-full ">
              <IconButton onClick={() => cropKtp()} color="success">
                <Iconify icon="mdi:pencil" />
              </IconButton>
            </div>
            <div className="tw-bg-white tw-rounded-full ">
              <IconButton
                onClick={() => {
                  setPlaceholderKtp(null);
                  methods.setValue('ktpImage', null);
                }}
                color="error"
              >
                <Iconify icon="mdi:close" />
              </IconButton>
            </div>
          </div>
        </div>
      ) : (
        <Field.Upload
          name="ktpImage"
          helperText="Upload Foto KTP"
          onDrop={changeKtp}
          onRemove={() => {
            methods.setValue('ktpImage', null);
          }}
          onRemoveAll={() => methods.setValue('ktpImage', null)}
        />
      )}
      <Field.Text size="small" name="fullname" label="Nama Lengkap" />
      {/* Phone Number */}
      <div className={isEdit ? "tw-p-3 tw-pt-4 tw-ring-1 tw-ring-gray-400 tw-rounded-lg tw-flex tw-flex-col tw-gap-2" : ""}>
        <div className="tw-flex tw-flex-row tw-items-center">
          <Field.Text
            size="small"
            name="phone"
            label="Nomor Whatsapp"
            onChange={(e) => pickPhone(e.target.value)}
          />
          <Tooltip title="Cek Whatsapp">
            <IconButton onClick={() => checkWhatsapp()}>
              <Iconify icon="logos:whatsapp-icon" />
            </IconButton>
          </Tooltip>
        </div>

        {/* Additional Phone Numbers */}
        <Stack spacing={1} className="tw-mt-2">
          {fields.map((field, index) => (
            <div key={field.id} className="tw-flex tw-flex-row tw-items-center tw-gap-2">
              <Field.Text
                size="small"
                name={`additionalPhoneNumber.${index}`}
                label={`Nomor Whatsapp lain ${index + 1}`}
                fullWidth
              />
              <IconButton color="error" onClick={() => remove(index)}>
                <Iconify icon="mdi:close" />
              </IconButton>
            </div>
          ))}
          {isEdit ? (
            <Button
              size="small"
              variant="outlined"
              startIcon={<Iconify icon="mdi:plus" />}
              onClick={() => append('')}
              className="tw-w-28 tw-justify-end tw-place-self-end"
            >
              Tambah
            </Button>
          ) : null}
        </Stack>
      </div>
      {/* End Phone Number */}

      {/* <Field.DatePicker
        name="birth"
        label="Tanggal Lahir"
        slotProps={{ textField: { size: 'small' } }}
      /> */}
      <Field.Text size="small" name="address" label="Alamat" />
      <TextField
        label="Paste Kordinat Maps"
        size="small"
        onChange={(e) => seperateLatLng(e.target.value)}
      />
      <Field.Text
        fullWidth
        size="small"
        name="lat"
        label="Lat"
        className="tw-w-full"
        inputProps={{ readOnly: true }}
      />
      <div className="tw-flex tw-flex-row tw-items-center tw-justify-between tw-gap-2">
        <Field.Text
          fullWidth
          size="small"
          name="long"
          label="Lng"
          inputProps={{ readOnly: true }}
        />
        <IconButton onClick={() => showMaps.onTrue()} color="primary">
          <Iconify icon="pepicons-print:map" />
        </IconButton>
      </div>
      <Field.Checkbox
        name="isSpecial"
        label="Pelanggan Spesial"
        size="small"
        helperText="Centang ini jika pelanggan tidak ingin terisolir secara sistem"
      />
    </Stack>
  );
}
