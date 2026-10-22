import { z } from 'zod';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { parseLatLng } from '@utils/location';
import { useBoolean } from '@hooks/use-boolean';
import { Form, Field } from '@components/hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import MapsPickerDialog from '@components/mapsPicker/Maps';
import AreaPickerFilter from '@components/billing/areaPickerFilter';
import { useRef, useState, forwardRef, useImperativeHandle } from 'react';

import { LoadingButton } from '@mui/lab';
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

const DeviceFormDialog2 = forwardRef((props, ref) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const show = useBoolean(false);
  const isLoading = useBoolean(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const defaultValues = {
    deviceType: 'ODP',
    name: '',
    description: '',
    lat: '',
    lng: '',
    port: 0,
  };

  const areaPickerFilterRef = useRef();
  const deviceTypes = ['ODP', 'ODC', 'PON'];
  const resolver = useRef();

  const [selectedArea, setSelectedArea] = useState(null);

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

  const prefetch = async (deviceId) => {
    try {
      const snapshot = await areaRepository.getODPData(deviceId);
      setSelectedItem(snapshot);
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

  async function prefetchCurrentArea(areaId) {
    try {
      const snapshotArea = await areaRepository.getAreaDetail(areaId);
      setSelectedArea({
        _id: areaId,
        name: snapshotArea.title,
      });
    } catch (error) {
      // toast.error(error.message);
    }
  }

  function open(deviceId, currentArea) {
    methods.reset();
    if (deviceId) prefetch(deviceId);
    if (currentArea) prefetchCurrentArea(currentArea);
    show.onTrue();
    return new Promise((resolve) => {
      resolver.current = resolve;
    });
  }

  function close() {
    show.onFalse();
    resolver.current();
  }

  const submit = handleSubmit(async (data) => {
    data.name = `${data.deviceType} ${data.name}`;
    isLoading.onTrue();
    try {
      if (!selectedArea) throw new Error('Pilih Area / POP');
      await areaRepository.submitODP({
        ...data,
        parentArea: selectedArea._id,
      });
      setTimeout(() => {
        toast.success('Berhasil menyimpan perangkat');
        close();
        isLoading.onFalse();
      }, 2000);
    } catch (error) {
      toast.error(error.message);
      isLoading.onFalse();
    }
    // onSubmit(data);
  });

  async function pickArea() {
    const result = await areaPickerFilterRef.current.open(null, false);
    if (!result) return;
    setSelectedArea(result);
  }

  useImperativeHandle(ref, () => ({ open, close }));

  return (
    <>
      <Form methods={methods}>
        <Dialog
          open={show.value}
          onClose={() => close()}
          fullWidth
          maxWidth="sm"
          fullScreen={isMobile}
        >
          <DialogTitle>
            <div className="tw-flex tw-flex-col">
              <span>{selectedItem ? 'Edit' : 'Tambah'} Perangkat</span>
              <Breadcrumbs separator=">">
                {selectedItem && <span>{selectedItem.title ?? selectedItem.name}</span>}
              </Breadcrumbs>
            </div>
          </DialogTitle>
          <DialogContent>
            <Stack className="tw-py-2" spacing={2}>
              <Stack spacing={0.3}>
                <span className="tw-text-xs">Area / POP</span>
                <TextField
                  size="small"
                  InputProps={{ readOnly: true }}
                  onClick={() => pickArea()}
                  value={selectedArea?.name}
                />
              </Stack>

              <Stack spacing={0.3}>
                <span className="tw-text-xs">Jenis Perangkat</span>
                <Field.Text select name="deviceType" size="small" placeholder="Misal ODP, ODC, PON">
                  {deviceTypes.map((d) => (
                    <MenuItem key={d} value={d}>
                      {d}
                    </MenuItem>
                  ))}
                </Field.Text>
              </Stack>

              <Stack spacing={0.3}>
                <span className="tw-text-xs">Nama Perangkat</span>
                <Field.Text name="name" size="small" />
              </Stack>

              <Stack spacing={0.3}>
                <span className="tw-text-xs">Deskripsi</span>
                <Field.Text name="description" size="small" />
              </Stack>

              <Stack spacing={0.3}>
                <span className="tw-text-xs">Jumlah Port</span>
                <Field.Text type="number" name="port" size="small" />
              </Stack>

              <Stack spacing={0.3}>
                <span className="tw-text-xs">Paste Kordinat Maps</span>
                <TextField size="small" onChange={(e) => seperateLatLng(e.target.value)} />
              </Stack>

              <Grid container spacing={2}>
                <Grid xs={6}>
                  <Stack spacing={0.3}>
                    <span className="tw-text-xs">Lat</span>
                    <Field.Text
                      fullWidth
                      name="lat"
                      size="small"
                      onClick={() => showMaps.onTrue()}
                    />
                  </Stack>
                </Grid>
                <Grid xs={6}>
                  <Stack spacing={0.3}>
                    <span className="tw-text-xs">Lng</span>
                    <Field.Text
                      fullWidth
                      name="lng"
                      size="small"
                      onClick={() => showMaps.onTrue()}
                    />
                  </Stack>
                </Grid>
              </Grid>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => close()} color="error">
              Tutup
            </Button>
            <LoadingButton
              loading={isLoading.value}
              color="primary"
              onClick={submit}
              variant="contained"
            >
              Simpan
            </LoadingButton>
          </DialogActions>
        </Dialog>
        <MapsPickerDialog
          show={showMaps.value}
          onPick={onPickMaps}
          onClose={() => showMaps.onFalse()}
        />
      </Form>
      <AreaPickerFilter ref={areaPickerFilterRef} />
    </>
  );
});

export default DeviceFormDialog2;
