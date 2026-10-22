/**
 * @typedef {import('@/repositories/area').PPPOEItems} OLT
 */

import { z } from 'zod';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { useBoolean } from '@hooks/use-boolean';
import { Form, Field } from '@components/hook-form';
import { useAppPicker } from '@hooks/use-app-picker';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRef, useState, forwardRef, useImperativeHandle } from 'react';

import { LoadingButton } from '@mui/lab';
import {
  Chip,
  Stack,
  Dialog,
  Button,
  Divider,
  useTheme,
  TextField,
  DialogTitle,
  Autocomplete,
  DialogContent,
  useMediaQuery,
  DialogActions,
  FormHelperText,
} from '@mui/material';

import { getOlt } from 'src/repositories/area';
import { userProfileRepository } from 'src/repositories';
import { setProfile, useMeStore } from 'src/stores/meStore';
import { getGroups } from 'src/repositories/networkMonitoring';

const validator = z.object({
  title: z.string().min(3),
  allowEditUser: z.boolean(),
  allowCreateUser: z.boolean(),
  allowEditAreaConfig: z.boolean(),
  allowCreateAreaConfig: z.boolean(),
  allowEditBilling: z.boolean(),
  allowSimplePSB: z.boolean(),
  allowShowFinanceData: z.boolean(),
  allowEditProfile: z.boolean(),
  allowAccessWhatsappPanel: z.boolean(),
  allowAccessNetworkMonitoring: z.boolean(),
  allowEditNetworkMonitoring: z.boolean(),
});

const UserProfileForm = forwardRef((props, ref) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const dispatch = useDispatch();
  const me = useMeStore((state) => state.me);
  const setProfileStore = useMeStore((state) => state.setProfile);

  const showDialog = useBoolean(false);
  const resolver = useRef();
  const duplicate = useBoolean(false);
  const appPicker = useAppPicker();

  const defaultValues = {
    title: '',
    allowEditUser: false,
    allowCreateUser: false,
    allowEditAreaConfig: false,
    allowCreateAreaConfig: false,
    allowEditBilling: false,
    allowSimplePSB: false,
    allowShowFinanceData: false,
    allowEditProfile: false,
    allowAccessWhatsappPanel: false,
    allowAccessNetworkMonitoring: false,
    allowEditNetworkMonitoring: false,
  };

  const methods = useForm({ defaultValues, resolver: zodResolver(validator) });
  const { handleSubmit } = methods;

  /**
   * @type {[OLT[], (data: OLT[]) => void]}
   */
  const [oltList, setOltLit] = useState([]);

  const loading = useBoolean(false);

  const [currentId, setCurrentId] = useState(null);
  /**
   * @type {[{_id: string; name: string; title: string;}[], void]}
   */
  const [selectedItem, setSelectedItem] = useState([]);
  /** @type {[Array<{id: string, name: string}>, Function]} */
  const [nmGroups, setNmGroups] = useState([]);
  /** @type {[Array<{id: string, name: string}>, Function]} */
  const [nmWhitelist, setNmWhitelist] = useState([]);

  async function pickArea() {
    const ids = selectedItem.map((a) => a._id);
    const area = await appPicker.area.openMultiple(ids);
    if (!area) return;
    setSelectedItem(area);
  }

  async function prefetch(id, isDuplicate = false) {
    try {
      const [snapshotOlt, groups] = await Promise.all([getOlt(), getGroups()]);
      setOltLit(snapshotOlt);
      setNmGroups(groups);

      if (id) {
        setCurrentId(id);
        const snapshot = await userProfileRepository.findOne(id);
        const snapshotTitle = isDuplicate ? `${snapshot.title} (Duplicate)` : snapshot.title;
        setSelectedItem(snapshot.areaData ?? []);
        methods.setValue('title', snapshotTitle);
        methods.setValue('allowCreateUser', snapshot?.permission?.allowCreateUser ?? false);
        methods.setValue('allowEditUser', snapshot?.permission?.allowEditUser ?? false);
        methods.setValue('allowEditAreaConfig', snapshot.permission?.allowEditAreaConfig ?? false);
        methods.setValue(
          'allowCreateAreaConfig',
          snapshot.permission?.allowCreateAreaConfig ?? false
        );
        methods.setValue('allowEditBilling', snapshot.permission?.allowEditBilling ?? false);
        methods.setValue('allowSimplePSB', snapshot.permission?.allowSimplePSB ?? false);
        methods.setValue(
          'allowShowFinanceData',
          snapshot.permission?.allowShowFinanceData ?? false
        );
        methods.setValue('allowEditProfile', snapshot.permission?.allowEditProfile ?? false);
        methods.setValue(
          'allowAccessWhatsappPanel',
          snapshot.permission?.allowAccessWhatsappPanel ?? false
        );
        methods.setValue(
          'allowAccessNetworkMonitoring',
          snapshot.permission?.allowAccessNetworkMonitoring ?? false
        );
        methods.setValue(
          'allowEditNetworkMonitoring',
          snapshot.permission?.allowEditNetworkMonitoring ?? false
        );
        const whitelistedIds = snapshot.networkMonitoringGroupId ?? [];
        setNmWhitelist(groups.filter((g) => whitelistedIds.includes(g.id)));
      } else {
        setNmWhitelist([]);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      showDialog.onTrue();
    }
  }

  function close(allowPrefetch) {
    showDialog.onFalse();
    resolver.current(allowPrefetch ?? false);
    methods.reset();
    setCurrentId(null);
    setNmWhitelist([]);
  }

  const submit = handleSubmit(async (data) => {
    loading.onTrue();
    try {
      Object.assign(data, {
        areas: selectedItem.map((a) => a._id),
        networkMonitoringGroupId: nmWhitelist.map((g) => g.id),
      });
      const isUpdate = currentId && !duplicate.value;

      if (isUpdate) {
        await userProfileRepository.update(currentId, data);
        if (me?.profile === currentId) {
          const updated = await userProfileRepository.findOne(currentId);
          setProfileStore(updated);
          dispatch(setProfile(updated));
        }
      } else {
        await userProfileRepository.submit(data);
      }

      close(true);
      toast.info('Berhasil menyimpan');
    } catch (error) {
      toast.error(error.message);
    } finally {
      loading.onFalse();
    }
  });

  function open(id, isDuplicate = false) {
    duplicate.setValue(isDuplicate);
    showDialog.onTrue();
    prefetch(id, isDuplicate);
    return new Promise((resolve) => {
      resolver.current = resolve;
    });
  }

  useImperativeHandle(ref, () => ({ open }));

  return (
    <Form methods={methods}>
      <Dialog open={showDialog.value} maxWidth="sm" fullWidth fullScreen={isMobile} scroll="paper">
        <DialogTitle>User Profile Form</DialogTitle>
        <DialogContent>
          <div className="tw-flex tw-flex-col tw-py-2 tw-gap-4">
            <Field.Text size="small" label="Title" name="title" />
            <Button
              variant="soft"
              className="tw-self-end"
              color="success"
              size="small"
              onClick={() => pickArea()}
            >
              Pilih Area
            </Button>
            <div className="tw-flex tw-flex-col">
              {/* {JSON.stringify(selectedItem)} */}
              <ul className="tw-list-disc tw-pl-8">
                {selectedItem?.map((item, i) => (
                  <li key={i}>
                    <span className="tw-text-xs">{item.title}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="tw-p-5 tw-ring-1 tw-ring-gray-300 tw-rounded-lg tw-relative tw-mt-2">
              <span className="tw-text-xs tw-text-gray-500 tw-absolute -tw-top-2 tw-px-2 tw-bg-white">
                User Permission
              </span>
              <Stack spacing={2}>
                {/* User Management */}
                <span className="tw-text-xs">User Management</span>
                <Divider />
                <Stack>
                  <Field.Switch name="allowCreateUser" label="Create User" size="small" />
                  <Field.Switch name="allowEditUser" label="Edit User" size="small" />
                  <Field.Switch name="allowEditProfile" label="Edit Profile" size="small" />
                </Stack>
                {/* Area Config */}
                <span className="tw-text-xs">Area Config</span>
                <Divider />
                <Stack>
                  <Field.Switch
                    name="allowCreateAreaConfig"
                    label="Create Area Config"
                    size="small"
                  />
                  <Field.Switch name="allowEditAreaConfig" label="Edit Area Config" size="small" />
                </Stack>
                {/* Billing */}
                <span className="tw-text-xs">Billing</span>
                <Divider />
                <Stack>
                  <Field.Switch name="allowEditBilling" label="Edit Billing" size="small" />
                  <Field.Switch
                    name="allowShowFinanceData"
                    label="Show Finance Data"
                    size="small"
                  />
                </Stack>
                {/* PSB */}
                <span className="tw-text-xs">PSB</span>
                <Divider />
                <Stack>
                  <Field.Switch name="allowSimplePSB" label="Simple PSB" size="small" />
                  <FormHelperText>
                    Gunakan untuk memotong proses alur pendaftaran PSB menjadi lebih singkat
                  </FormHelperText>
                </Stack>
                {/* Whatsapp Panel */}
                <span className="tw-text-xs">Whatsapp Panel</span>
                <Divider />
                <Stack>
                      <Field.Switch name="allowAccessWhatsappPanel" label="Access Whatsapp Panel" size="small" />
                  <FormHelperText>
                    Gunakan agar user dapat mengakses panel Whatsapp
                  </FormHelperText>
                </Stack>
                {/* Network Map */}
                <span className="tw-text-xs">Network Map</span>
                <Divider />
                <Stack>
                  <Field.Switch
                    name="allowAccessNetworkMonitoring"
                    label="Access Network Monitoring"
                    size="small"
                  />
                  <Field.Switch
                    name="allowEditNetworkMonitoring"
                    label="Edit Network Monitoring"
                    size="small"
                  />
                  <Autocomplete
                    multiple
                    size="small"
                    options={nmGroups}
                    value={nmWhitelist}
                    getOptionLabel={(option) => option.name}
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    onChange={(_, newValue) => setNmWhitelist(newValue)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Whitelist Group"
                        placeholder="Pilih group"
                      />
                    )}
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => (
                        <Chip
                          {...getTagProps({ index })}
                          key={option.id}
                          label={option.name}
                          size="small"
                        />
                      ))
                    }
                  />
                  <FormHelperText>
                    Batasi group yang dapat diakses. Kosongkan untuk akses semua group.
                  </FormHelperText>
                </Stack>
              </Stack>
            </div>
          </div>
        </DialogContent>
        <DialogActions>
          {!loading.value && (
            <Button variant="text" color="error" size="small" onClick={() => close()}>
              Batal
            </Button>
          )}
          <LoadingButton
            loading={loading.value}
            variant="contained"
            color="primary"
            size="small"
            onClick={submit}
          >
            Simpan
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </Form>
  );
});

export default UserProfileForm;
