import { z } from 'zod';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { parseLatLng } from '@utils/location';
import { useBoolean } from '@hooks/use-boolean';
import { Form, Field } from '@components/hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import MapsPickerDialog from '@components/mapsPicker/Maps';
import { useRef, useMemo, useState, useEffect } from 'react';

import Grid from '@mui/material/Unstable_Grid2';
import { TabList, TabPanel, TabContext } from '@mui/lab';
import {
  Tab,
  Stack,
  Button,
  Dialog,
  TextField,
  DialogTitle,
  DialogActions,
  DialogContent,
} from '@mui/material';

import { areaRepository } from 'src/repositories';

import AddAreaDialogNotificationForm from './AddAreaDialog/notificationForm';

/**
 *
 * @param {{show: boolean; onClose: void; onSubmit; selectedArea: import('./AreaTree').AreaCategory; showNotifications: boolean}} param0
 * @returns
 */

export default function AddAreaDialog({
  show,
  onClose,
  onSubmit,
  selectedArea,
  showNotifications = true,
}) {
  const notificationRef = useRef();
  const [tab, setTab] = useState('profile');
  const tabList = [
    { label: 'Profil Area / Wilayah', value: 'profile' },
    { label: 'Notifikasi Whatsapp', value: 'notification' },
  ];

  const reactiveTablist = useMemo(() => {
    if (showNotifications) return tabList;
    return tabList.slice(0, 1);
  });

  const [notifications, setNotifications] = useState([]);

  const defaultValues = {
    title: '',
    description: '',
    lat: '',
    lng: '',
  };

  const validator = z.object({
    title: z.string().min(1, 'Tidak boleh kosong'),
    description: z.string(),
    lat: z.string().or(z.number()),
    lng: z.string().or(z.number()),
  });

  const methods = useForm({ defaultValues, resolver: zodResolver(validator) });
  const showMaps = useBoolean(false);

  const onPickMaps = ([lat, lng]) => {
    methods.setValue('lat', lat.toString());
    methods.setValue('lng', lng.toString());
    showMaps.onFalse();
  };

  const { handleSubmit } = methods;

  const prefetch = async () => {
    setNotifications([]);
    if (!selectedArea) return;
    try {
      const snapshot = await areaRepository.getAreaCategoryData(
        selectedArea.id ?? selectedArea._id
      );
      methods.setValue('description', snapshot.description);
      methods.setValue('title', snapshot.title);
      methods.setValue('lat', snapshot.lat?.toString());
      methods.setValue('lng', snapshot.lng?.toString());
      methods.setValue('groupId', snapshot.whatsappId);
      setNotifications(snapshot.notifications ?? []);
    } catch (error) {
      toast.error(error);
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

  const beforeSubmit = handleSubmit((data) => {
    try {
      const n = notificationRef.current?.getDataAndValidate();
      data.notifications = n ?? [];
      if (!data.lat) data.lat = 0;
      if (!data.lng) data.lng = 0;
      onSubmit(data);
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
    }
  });

  return (
    <Form methods={methods}>
      <Dialog open={show} onClose={onClose} fullWidth maxWidth="sm">
        <DialogTitle>Area Form</DialogTitle>
        <DialogContent>
          <TabContext value={tab}>
            <TabList onChange={(e, value) => setTab(value)} sx={{ paddingX: 0 }}>
              {reactiveTablist.map((t, i) => (
                <Tab label={t.label} value={t.value} key={t} />
              ))}
            </TabList>
            <TabPanel value="profile" sx={{ paddingX: 0 }}>
              <Stack className="tw-py-2" spacing={2}>
                <Field.Text name="title" label="Nama Area" size="small" />
                <Field.Text name="description" label="Deskripsi" size="small" />
                {/* <Field.Text name="groupId" label="Whatsapp ChatId Group" size="small" /> */}
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
                      inputProps={{ readOnly: true }}
                      onClick={() => showMaps.onTrue()}
                    />
                  </Grid>
                  <Grid xs={6}>
                    <Field.Text
                      fullWidth
                      name="lng"
                      label="Lng"
                      size="small"
                      inputProps={{ readOnly: true }}
                      onClick={() => showMaps.onTrue()}
                    />
                  </Grid>
                </Grid>
              </Stack>
            </TabPanel>
            <TabPanel value="notification" sx={{ paddingX: 0 }}>
              <AddAreaDialogNotificationForm
                ref={notificationRef}
                items={notifications}
                setItems={setNotifications}
              />
            </TabPanel>
          </TabContext>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="error">
            Tutup
          </Button>
          <Button color="primary" onClick={beforeSubmit} variant="contained">
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
