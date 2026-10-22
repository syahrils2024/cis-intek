import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { Iconify } from '@components/iconify';
import { useBoolean } from '@hooks/use-boolean';
import { connect, useDispatch } from 'react-redux';
import { Form, Field } from '@components/hook-form';
import { useMemo, useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';

import { TabPanel, TabContext, LoadingButton } from '@mui/lab';
import {
  Stack,
  Dialog,
  Button,
  Divider,
  MenuItem,
  useTheme,
  TextField,
  IconButton,
  DialogTitle,
  DialogContent,
  DialogActions,
  useMediaQuery,
  InputAdornment,
} from '@mui/material';

import { setArea } from 'src/stores/areaStore';
import { setUserProfileStore } from 'src/stores/userProfileStore';
import { areaRepository, userProfileRepository } from 'src/repositories';
/**
 * @typedef {import("src/repositories/user").UserRequest} UserRequest
 * @typedef {import("src/repositories/area").Area} Area[]
 * @typedef {import("src/repositories/user").User} User
 * @typedef {import('src/stores/areaStore').AreaStore} AreaStore
 * @typedef {import('src/stores/userProfileStore').UserProfileStore} UserProfileStore
 * @typedef {import('src/repositories/userProfile').UserProfile} UserProfile
 * @typedef {import('src/repositories/auth').CurrentAuth} CurrentAuth
 * @typedef {import('src/stores/meStore').MeStore} MeStore
 *
 * @callback UserFormCallback
 * @param {UserRequest} user
 */

/**
 * @param {{areaList: Area[];
 * show: boolean; selectedUser: User | null | undefined;
 * handlerSubmit: UserFormCallback;
 * profileList: UserProfile[];
 * isLoading: boolean;
 * currentAuth: CurrentAuth
 * onClose: void}} props -  react props
 */
function UserFormDialog({
  areaList,
  show,
  handlerSubmit,
  selectedUser,
  onClose,
  profileList,
  currentAuth,
  isLoading,
}) {
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const showPassword = useBoolean(false);
  const [selectedTab, setSelectedTab] = useState('profile');
  const usingProfile = useBoolean(true);
  const tabList = [
    { label: 'Profil', value: 'profile' },
    { label: 'Permission', value: 'permission' },
  ];

  const defaultValues = {
    email: '',
    fullname: '',
    phone: '',
    password: '',
    address: '',
    status: 'active',
    isAdmin: false,
    isEngineer: false,
    isMarketing: false,
    isLo: false,
    isNetworkOperationCenter: false,
    isAdminLo: false,
    areaCategory: [],
    allowCreateUser: false,
    allowEditUser: false,
    profile: '',
  };

  const schemaValidator = z.object({
    email: z.string().min(1, 'Email tidak boleh kosong').email('Email tidak valid'),
    fullname: z.string().min(1, 'Nama lengkap tidak boleh kosong'),
    password: z.string().min(selectedUser ? 0 : 1, 'password tidak boleh kosong'),
    phone: z
      .string()
      .min(1, 'nomor telepon tidak boleh kosong')
      .regex(indonesianPhoneNumberRegex, 'Tidak valid'),
    address: z.string().min(1, 'Alamat tidak boleh kosong'),
    status: z.string().min(1, 'Status tidak boleh kosong'),
    areaCategory: z.array(z.string()).min(0).optional(),
    isAdmin: z.boolean(),
    isEngineer: z.boolean(),
    isMarketing: z.boolean(),
    isNetworkOperationCenter: z.boolean(),
    isLo: z.boolean(),
    isAdminLo: z.boolean(),
    // Permisson
    allowCreateUser: z.boolean(),
    allowEditUser: z.boolean(),
    // Profile
    profile: z.string().or(z.null()).optional(),
  });

  const methods = useForm({
    resolver: zodResolver(schemaValidator),
    defaultValues,
  });

  const availableArea = useMemo(() => {
    const maping = [];

    areaList.forEach((a) => {
      // maping.push(a.title);
      a.area.forEach((area) => {
        maping.push(area);
      });
    });

    return maping;
  });

  const { setValue, handleSubmit } = methods;

  const prefetchUser = () => {
    if (selectedUser) {
      setValue('email', selectedUser.email);
      setValue('fullname', selectedUser.fullname);
      setValue('phone', selectedUser.phone);
      // setValue('password', selectedUser.password);
      setValue('address', selectedUser.address);
      setValue('isAdmin', selectedUser.privilege.includes('admin'));
      setValue('isAdminLo', selectedUser.privilege.includes('admin_lo'));
      setValue('isEngineer', selectedUser.privilege.includes('engineer'));
      setValue('isMarketing', selectedUser.privilege.includes('marketing'));
      setValue(
        'isNetworkOperationCenter',
        selectedUser.privilege.includes('network_operation_center')
      );
      setValue('isLo', selectedUser.privilege.includes('liaison_officer'));
      setValue('areaCategory', selectedUser.areas);

      setValue('allowCreateUser', selectedUser.permission?.allowCreateUser ?? false);
      setValue('allowEditUser', selectedUser.permission?.allowEditUser ?? false);
      setValue('profile', selectedUser.profile ?? null);

      if (selectedUser.profile) {
        usingProfile.onTrue();
      } else {
        usingProfile.onFalse();
      }
    }
  };

  const prefetchArea = async () => {
    if (areaList.length >= 1) return;
    const snapshot = await areaRepository.getAllArea();
    dispatch(setArea(snapshot));
  };

  const prefetchProfile = async () => {
    if (profileList.length >= 1) return;
    const snapshot = await userProfileRepository.list();
    dispatch(setUserProfileStore({ key: 'data', value: snapshot }));
  };

  /**
   * @param {string[]} itemsKey
   */
  const setInactivePrivilege = (itemsKey) => {
    itemsKey.forEach((key) => {
      methods.setValue(key, false);
    });
  };

  const onBeforeSubmit = handleSubmit((data) => {
    if (!usingProfile.value) data.profile = null;
    handlerSubmit(data);
  });

  useEffect(() => {
    if (!show) {
      methods.reset();
      return;
    }
    prefetchProfile();
    prefetchArea();
    prefetchUser();
  }, [show]);

  return (
    <Form methods={methods}>
      <Dialog
        open={show}
        onClose={onClose}
        maxWidth="sm"
        scroll="paper"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle>User Form</DialogTitle>
        <DialogContent>
          <TabContext value={selectedTab}>
            {/* <TabList onChange={(e, value) => setSelectedTab(value)}>
              {tabList.map((e) => (
                <Tab key={e.value} value={e.value} label={e.label} />
              ))}
            </TabList> */}
            <TabPanel value="profile" sx={{ padding: 0 }}>
              <Stack spacing={2} className="tw-py-2">
                <Field.Text size="small" label="Nama Lengkap" name="fullname" />
                <Field.Text size="small" label="Email" name="email" />
                <Field.Text
                  size="small"
                  label="Password"
                  name="password"
                  type={showPassword.value ? 'text' : 'password'}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={showPassword.onToggle} edge="end">
                          <Iconify
                            icon={showPassword.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'}
                          />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <Field.Text size="small" label="Nomor HP" name="phone" />
                <Field.Text size="small" label="Alamat" name="address" rows={2} multiline />
                <Field.Select size="small" label="Pilih Status" name="status">
                  <MenuItem value="active">Aktif</MenuItem>
                  <MenuItem value="inactive">Nonaktif</MenuItem>
                </Field.Select>
                <TextField
                  select
                  value={usingProfile.value}
                  label="TAG"
                  onChange={(e) => usingProfile.setValue(e.target.value)}
                  size="small"
                >
                  <MenuItem value>Profile</MenuItem>
                  <MenuItem value={false}>Area</MenuItem>
                </TextField>
                {usingProfile.value ? (
                  <Field.Text checkbox size="small" name="profile" label="Profile User" select>
                    {profileList.map((profile, i) => (
                      <MenuItem key={i} value={profile._id}>
                        {profile.title}
                      </MenuItem>
                    ))}
                  </Field.Text>
                ) : (
                  <Field.MultiSelect
                    checkbox
                    size="small"
                    name="areaCategory"
                    label="Kategori Area"
                    options={availableArea.map((area) => ({ label: area.title, value: area._id }))}
                  />
                )}

                <span className="tw-text-xs tw-pl-2">Privilege</span>
                <div className="tw-flex tw-flex-wrap tw-items-center tw-gap-1">
                  {!currentAuth?.privilege.includes('liaison_officer') && (
                    <Field.Switch name="isAdmin" label="Admin" />
                  )}
                  <Field.Switch name="isEngineer" label="Engineer" />
                  <Field.Switch name="isMarketing" label="Marketing" />
                  <Field.Switch name="isNetworkOperationCenter" label="NOC" />
                  {!currentAuth?.privilege.includes('liaison_officer') && (
                    <Field.Switch name="isLo" label="LO" />
                  )}
                </div>
              </Stack>
            </TabPanel>
            <TabPanel value="permission">
              <Stack spacing={2}>
                <span className="tw-text-xs">User Management</span>
                <Divider />
                <Stack>
                  <Field.Switch name="allowCreateUser" label="Create User" size="small" />
                  <Field.Switch name="allowEditUser" label="Edit User" size="small" />
                </Stack>
              </Stack>
            </TabPanel>
          </TabContext>
        </DialogContent>
        <DialogActions>
          {!isLoading && (
            <Button variant="text" color="error" onClick={onClose}>
              Batal
            </Button>
          )}

          <LoadingButton
            loading={isLoading}
            variant="contained"
            color="primary"
            onClick={onBeforeSubmit}
          >
            Simpan
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </Form>
  );
}

const indonesianPhoneNumberRegex = /^(?:\+62|62|0)[2-9][0-9]{7,16}$/;

/** @param {{areaStore: AreaStore, userProfileStore: UserProfileStore; meStore: MeStore}} */
const mapsStateToProps = ({ areaStore, userProfileStore, meStore }) => ({
  areaList: areaStore.all,
  profileList: userProfileStore.data,
  currentAuth: meStore.me,
});

export default connect(mapsStateToProps)(UserFormDialog);
