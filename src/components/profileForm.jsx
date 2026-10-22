import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { useState, useEffect } from 'react';
import { useBoolean } from '@hooks/use-boolean';
import { createSelector } from '@reduxjs/toolkit';
import { connect, useDispatch, useSelector } from 'react-redux';

import {
  Stack,
  Button,
  Dialog,
  Divider,
  useTheme,
  MenuItem,
  IconButton,
  DialogTitle,
  DialogActions,
  DialogContent,
  useMediaQuery,
  InputAdornment,
} from '@mui/material';

import { useMeStore } from 'src/stores/meStore';
import { setShow } from 'src/stores/profileStore';
import { authRepository, depositMethodRepository } from 'src/repositories';
import { paymentMethodStoreSetState } from 'src/stores/paymentMethodStore';

import { Iconify } from './iconify';
import { Form, Field } from './hook-form';

/**
 * @typedef {import('src/stores/meStore').MeStore} MeStore
 * @typedef {import('src/repositories/depositMethod').PaymentMethod} PaymentMethod
 * @typedef {import('src/stores/paymentMethodStore').PaymentMethodStore} PaymentMethodStore
 */

/**
 * @param {{show: boolean} & PaymentMethodStore} props -- react props
 */
function ProfileForm({ cash, transfer }) {
  const dispatch = useDispatch();
  const theme = useTheme();
  const showPassword = useBoolean();
  const showConfirmPassword = useBoolean();

  /** @type {MeStore} */
  const { me } = useMeStore();

  /** @type {[import('@/repositories/auth').CurrentAuth, void]} */
  const [currentUser, setCurrentUser] = useState(null);

  const defaultValues = {
    fullname: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    confirmPassword: '',
    defaultDataTransferDepositMethodId: '',
    defaultDataCashDepositMethodId: '',
  };

  const showSelector = createSelector(
    [(state) => state.profileStore],
    (profileStore) => profileStore.show
  );
  const show = useSelector(showSelector);

  const methods = useForm({ defaultValues });
  const { handleSubmit } = methods;
  const onSubmit = handleSubmit(async (data) => {
    try {
      if (data.password !== '' && data.password !== data.confirmPassword) {
        throw new Error('Konfirmasi password tidak sama');
      }
      const body = { ...currentUser };
      body.fullname = data.fullname;
      body.phone = data.phone;
      body.address = data.address;

      if (data.password !== '') body.password = data.password;
      toast.success('Berhasil menyimpan profil');
      await authRepository.updateCurrentUser(data);

      dispatch(setShow(false));
    } catch (error) {
      toast.error(error.message);
    }
  });

  async function prefetchDepositMethod() {
    try {
      if (cash.length <= 0) {
        const snapshotCash = await depositMethodRepository.getPaymentMethod('cash');
        dispatch(
          paymentMethodStoreSetState({
            key: 'cash',
            value: snapshotCash.filter((c) => c.status === 'active'),
          })
        );
      }

      if (transfer.length <= 0) {
        const snapshotTransfer = await depositMethodRepository.getPaymentMethod('transfer');
        dispatch(
          paymentMethodStoreSetState({
            key: 'transfer',
            value: snapshotTransfer.filter((c) => c.status === 'active'),
          })
        );
      }
    } catch (error) {
      toast.error(error.message);
    }
  }

  const prefetch = async () => {
    try {
      const snapshot = await authRepository.getCurrentUser();
      setCurrentUser(snapshot);
      methods.setValue('fullname', snapshot.fullname);
      methods.setValue('email', snapshot.email);
      methods.setValue('phone', snapshot.phone);
      methods.setValue('address', snapshot.address);

      if (me?.defaultData?.cashDepositMethodId)
        methods.setValue(
          'defaultDataCashDepositMethodId',
          me?.defaultData?.cashDepositMethodId ?? ''
        );

      if (me?.defaultData?.transferDepositMethodId)
        methods.setValue(
          'defaultDataTransferDepositMethodId',
          me?.defaultData?.transferDepositMethodId ?? ''
        );
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (!show) return;
    prefetchDepositMethod();
    prefetch();
  }, [show]);

  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  return (
    <Form methods={methods}>
      <Dialog
        open={show}
        onClose={() => dispatch(setShow(false))}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle>Profile</DialogTitle>
        <DialogContent>
          <Stack spacing={2} className="tw-py-2">
            <Field.Text size="small" label="Nama Lengkap" name="fullname" />
            <Field.Text size="small" label="Email" name="email" disabled />
            <Field.Text size="small" label="Nomor Telepon" name="phone" />
            <Field.Text size="small" label="Alamat" name="address" />
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
            <Field.Text
              size="small"
              label="Konfirmasi Password"
              name="confirmPassword"
              type={showConfirmPassword.value ? 'text' : 'password'}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={showConfirmPassword.onToggle} edge="end">
                      <Iconify
                        icon={
                          showConfirmPassword.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'
                        }
                      />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Divider />
            {/* Default Deposit Method */}
            <span className="tw-text-xs">Default Metode Pembayaran</span>
            <Field.Text label="Cash" name="defaultDataCashDepositMethodId" size="small" select>
              {cash.map((c, i) => (
                <MenuItem key={i} value={c._id}>
                  {c.title}
                </MenuItem>
              ))}
            </Field.Text>
            <Field.Text
              label="Transfer"
              name="defaultDataTransferDepositMethodId"
              size="small"
              select
            >
              {transfer.map((t, i) => (
                <MenuItem key={i} value={t._id}>
                  {t.title}
                </MenuItem>
              ))}
            </Field.Text>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button color="error" onClick={() => dispatch(setShow(false))}>
            Batal
          </Button>
          <Button color="success" onClick={onSubmit} variant="contained">
            Simpan
          </Button>
        </DialogActions>
      </Dialog>
    </Form>
  );
}

/** @param {{paymentMethodStore: PaymentMethodStore}} */
const mapStateToProps = ({ paymentMethodStore }) => ({
  cash: paymentMethodStore.cash,
  transfer: paymentMethodStore.transfer,
});

export default connect(mapStateToProps)(ProfileForm);
