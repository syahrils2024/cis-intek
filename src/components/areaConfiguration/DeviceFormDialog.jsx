import { z } from 'zod';
import { toast } from 'sonner';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { parseLatLng } from '@utils/location';
import { useBoolean } from '@hooks/use-boolean';
import { Form, Field } from '@components/hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import MapsPickerDialog from '@components/mapsPicker/Maps';

import Grid from '@mui/material/Unstable_Grid2';
import {
  Stack,
  Button,
  Dialog,
  useTheme,
  MenuItem,
  TextField,
  DialogTitle,
  Breadcrumbs,
  DialogActions,
  DialogContent,
  useMediaQuery,
} from '@mui/material';

import { areaRepository } from 'src/repositories';

const validator = z.object({
  deviceType: z.string(),
  name: z.string().min(1, 'Tidak boleh kosong'),
  description: z.string(),
  lat: z.string().or(z.number()),
  lng: z.string().or(z.number()),
  port: z.number().min(0, 'Minimal 0'),
});

/**
 * @typedef {import('src/stores/areaConfiguration').AreaConfigurationStore} AreaConfigurationStore
 */

/**
 * @param {{
 * show: boolean;
 * onClose: void;
 * onSubmit: void;
 * selectedItem: import('src/repositories/area').Area
 * }} props
 */
export default function DeviceFormDialog({ show, onClose, onSubmit, selectedItem }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const defaultValues = {
    deviceType: 'ODP',
    name: '',
    description: '',
    lat: '',
    lng: '',
    port: 0,
  };

  const deviceTypes = ['ODP', 'ODC', 'PON'];

  /** @type {AreaConfigurationStore} */
  const { currentArea } = useSelector((state) => state.areaConfigurationStore);

  const methods = useForm({
    defaultValues,
    resolver: zodResolver(validator),
  });

  const { handleSubmit } = methods;

  const showMaps = useBoolean(false);

  const onPickMaps = ([lat, lng]) => {
    methods.setValue('lat', lat.toString());
    methods.setValue('lng', lng.toString());
    showMaps.onFalse();
  };

  const prefetch = async () => {
    if (!selectedItem) return;
    try {
      const snapshot = await areaRepository.getODPData(selectedItem._id ?? selectedItem.id);
      const name = snapshot.name.split(' ');
      const prefix = name.splice(0, 1)[0] || undefined;
      // console.log({ name, prefix });
      if (['ODP', 'ODC', 'PON'].includes(prefix)) {
        methods.setValue('deviceType', prefix);
        methods.setValue('name', name.join(' '));
      } else {
        methods.setValue('name', snapshot.name);
      }
      methods.setValue('address', snapshot.address);
      methods.setValue('lat', snapshot.lat?.toString() ?? '');
      methods.setValue('lng', snapshot.lng?.toString() ?? '');
      methods.setValue('port', snapshot.port ?? 0);
      methods.setValue('description', snapshot.description);
    } catch (error) {
      toast.error(error.message);
    }
  };

  /**
   * @param {string} name
   * @param {string} value
   */
  const seperateLatLng = (value) => {
    if (value.includes(',')) {
      const result = parseLatLng(value);
      if (result == null) return;
      const { lat, lng } = result;
      methods.setValue('lat', lat?.toString());
      methods.setValue('lng', lng?.toString());
      return;
    }
  };

  useEffect(() => {
    if (!show) {
      methods.reset();
      return;
    }
    prefetch();
  }, [show]);

  const submit = handleSubmit((data) => {
    data.name = `${data.deviceType} ${data.name}`;
    onSubmit(data);
  });

  return (
    <Form methods={methods}>
      <Dialog open={show} onClose={onClose} fullWidth maxWidth="sm" fullScreen={isMobile}>
        <DialogTitle>
          <div className="tw-flex tw-flex-col">
            <span>{selectedItem ? 'Edit' : 'Tambah'} Perangkat</span>
            <Breadcrumbs separator=">">
              {currentArea && <span>{currentArea.title}</span>}
              {selectedItem && <span>{selectedItem.title ?? selectedItem.name}</span>}
            </Breadcrumbs>
          </div>
        </DialogTitle>
        <DialogContent>
          <Stack className="tw-py-2" spacing={2}>
            <Field.Text
              select
              name="deviceType"
              label="Jenis Perangkat"
              size="small"
              placeholder="Misal ODP, ODC, PON"
            >
              {deviceTypes.map((d) => (
                <MenuItem key={d} value={d}>
                  {d}
                </MenuItem>
              ))}
            </Field.Text>
            <Field.Text name="name" label="Nama Perangkat" size="small" />
            <Field.Text name="description" label="Deskripsi" size="small" />
            <Field.Text type="number" name="port" label="Jumlah Port" size="small" />
            <TextField
              label="Paste Kordinat Maps"
              size="small"
              onChange={(e) => seperateLatLng(e.target.value)}
            />
            <Grid container spacing={2}>
              <Grid xs={6}>
                <Field.Text
                  fullWidth
                  name="lat"
                  label="Lat"
                  size="small"
                  onClick={() => showMaps.onTrue()}
                />
              </Grid>
              <Grid xs={6}>
                <Field.Text
                  fullWidth
                  name="lng"
                  label="Lng"
                  size="small"
                  onClick={() => showMaps.onTrue()}
                />
              </Grid>
            </Grid>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="error">
            Tutup
          </Button>
          <Button color="primary" onClick={submit} variant="contained">
            Simpan
          </Button>
        </DialogActions>
      </Dialog>
      <MapsPickerDialog
        show={showMaps.value}
        onPick={onPickMaps}
        onClose={() => showMaps.onFalse()}
      />
    </Form>
  );
}
