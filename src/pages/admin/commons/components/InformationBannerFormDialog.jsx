import { z } from 'zod';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { Iconify } from '@components/iconify';
import { useBoolean } from '@hooks/use-boolean';
import { Form, Field } from '@components/hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import AreaPickerFilter from '@components/billing/areaPickerFilter';
import { useRef, useState, forwardRef, useImperativeHandle } from 'react';

import { LoadingButton } from '@mui/lab';
import {
  Chip,
  Stack,
  Dialog,
  Button,
  useTheme,
  MenuItem,
  DialogTitle,
  useMediaQuery,
  DialogContent,
  DialogActions,
  FormHelperText,
} from '@mui/material';

import { bannerInformationRepository } from 'src/repositories';
/** @typedef {import('src/repositories/bannerInformation').BannerInformation} BannerInformation */

const validator = z.object({
  title: z.string().min(1, 'Judul wajib diisi'),
  description: z.string().min(1, 'Deskripsi wajib diisi'),
  type: z.string().min(1, 'Jenis wajib diisi'),
  show: z.boolean(),
});

const initialValue = {
  title: '',
  description: '',
  type: '',
  show: true,
};

const typeList = [
  { value: 'info', label: 'Informasi' },
  { value: 'mass_internet_disorder', label: 'Gangguan Internet Massal' },
];

const InformationBannerFormDialog = forwardRef((props, ref) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const show = useBoolean(false);
  const methods = useForm({ defaultValues: initialValue, resolver: zodResolver(validator) });
  const { handleSubmit } = methods;
  const resolver = useRef();
  const areaPickerRef = useRef();
  const loading = useBoolean(false);
  const [id, setId] = useState(null);

  /** @type {[{_id: string; title: string; }[], Function]} */
  const [areas, setAreas] = useState([]);

  /** @param {BannerInformation} item */
  async function load(item) {
    methods.setValue('title', item.title);
    methods.setValue('description', item.description);
    methods.setValue('type', item.type);
    methods.setValue('show', item.show);
    setAreas(item.area);
    setId(item._id);
  }

  async function pickArea() {
    const result = await areaPickerRef.current?.open(areas, false);
    if (!result) return;
    setAreas((prev) => [...prev, result]);
  }

  async function removeArea(index) {
    setAreas((prev) => prev.filter((a, i) => i !== index));
  }

  function reset() {
    methods.reset();
    setAreas([]);
    setId(null);
  }

  function open(item) {
    reset();
    show.onTrue();
    if (item) load(item);
    return new Promise((resolve) => {
      resolver.current = resolve;
    });
  }

  function close() {
    show.onFalse();
    resolver.current?.();
  }

  const submit = handleSubmit(async (data) => {
    loading.onTrue();
    try {
      const areaIds = areas.map((area) => area._id);
      if (id) {
        await bannerInformationRepository.update(id, {
          ...data,
          area: areaIds,
        });
      } else {
        await bannerInformationRepository.create({
          ...data,
          area: areaIds,
        });
      }

      resolver.current?.(true);
      close();
      toast.success('Berhasil menyimpan');
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
    } finally {
      loading.onFalse();
    }
  });

  useImperativeHandle(ref, () => ({ open, close }));

  return (
    <>
      <Dialog
        open={show.value}
        maxWidth="sm"
        onClose={() => close()}
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle>Form Informasi Mobile</DialogTitle>

        <DialogContent>
          <Form methods={methods}>
            <Stack spacing={1.5} className="tw-py-2">
              <Field.Text name="title" label="Judul" size="small" />
              <Field.Text name="type" label="Jenis" size="small" select>
                {typeList.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Field.Text>
              <Field.Text multiline rows={4} name="description" label="Deskripsi" size="small" />
              <Field.Checkbox name="show" label="Tampilkan" size="small" />

              <div className="tw-p-2 tw-ring-1 tw-ring-gray-300 tw-rounded tw-gap-2">
                <div className="tw-flex tw-flex-wrap tw-gap-2">
                  {areas.map((area, i) => (
                    <Chip
                      color="success"
                      variant="soft"
                      key={area._id}
                      label={area.title}
                      onDelete={() => removeArea(i)}
                    />
                  ))}
                </div>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <FormHelperText>Kosongkan apabila anda ingin memilih semua area</FormHelperText>
                  <Button variant="text" onClick={() => pickArea()}>
                    <Iconify icon="mdi:plus" className="tw-mr-1" /> Tambah Area
                  </Button>
                </Stack>
              </div>
            </Stack>
          </Form>
        </DialogContent>
        <DialogActions>
          <Button color="error" onClick={() => close()}>
            Tutup
          </Button>
          <LoadingButton loading={loading.value} color="primary" variant="soft" onClick={submit}>
            Simpan
          </LoadingButton>
        </DialogActions>
      </Dialog>
      <AreaPickerFilter ref={areaPickerRef} />
    </>
  );
});

export default InformationBannerFormDialog;
