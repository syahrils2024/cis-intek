import { useMemo, useEffect } from 'react';
import { Iconify } from '@components/iconify';
import Overloading from '@components/overloading';

import {
  Grid,
  Stack,
  Button,
  MenuItem,
  Checkbox,
  TextField,
  IconButton,
  FormControlLabel,
} from '@mui/material';

import { useCommonState } from './common.state';

export default function CommonPage() {
  const {
    callCenter,
    whatsapp,
    fetchCommons,
    setCallCenter,
    loading,
    save,
    setWhatsapp,
    loadingSubmit,
    companyEmail,
    companyPhone,
    setCompanyEmail,
    setCompanyPhone,
    defaultPayment,
    setDefaultPayment,
    paymentList,
    forceAppUpdate,
    setForceAppUpdate,
    mobile,
    placeholder,
    changeAppImage
  } = useCommonState();

  const data = useMemo(() => [
    {
      title: 'WhatsApp',
      value: whatsapp,
      onChange: (e) => setWhatsapp(e.target.value),
    },
    {
      title: 'Call Center',
      value: callCenter,
      onChange: (e) => setCallCenter(e.target.value),
    },
    {
      title: 'Company Email',
      value: companyEmail,
      onChange: (e) => setCompanyEmail(e.target.value),
    },
    {
      title: 'Company Phone',
      value: companyPhone,
      onChange: (e) => setCompanyPhone(e.target.value),
    },
  ]);

  const checkboxData = useMemo(() => [
    {
      title: 'Force App Update',
      checked: forceAppUpdate,
      onChange: (e) => setForceAppUpdate(e.target.checked),
    },
  ]);

  useEffect(() => {
    fetchCommons();
  }, []);

  return (
    <div className="tw-p-5 tw-w-full">
      <Stack className="tw-w-full">
        <h1 className="tw-text-md tw-font-semibold">Pengaturan Lainnya</h1>
        <p className="tw-text-gray-600 tw-text-xs">
          Halaman ini digunakan untuk mengatur informasi umum yang akan ditampilkan di berbagai
          bagian aplikasi.
        </p>
        <div className="tw-relative tw-mt-4 tw-w-full tw-flex tw-flex-col">
          <Overloading loading={loading.value} />
          <Stack direction={mobile ? 'column' : 'row'} spacing={1}>
            {/* App Logo Changes */}
            <div className="tw-relative tw-w-2/3 md:tw-w-32">
              <img
                src={placeholder}
                alt="App Logo"
                className="tw-w-full tw-object-contain tw-border tw-border-gray-400 tw-rounded-full tw-aspect-square tw-flex-none"
              />
              <div className="tw-absolute tw-bottom-0 tw-right-6 md:tw-right-0 md:tw-bottom-4 tw-bg-white">
                <IconButton
                  className="tw-ring-1 tw-ring-gray-400 tw-rounded-full tw-bg-white"
                  onClick={() => changeAppImage()}
                >
                  <Iconify icon="mdi:camera-outline" />
                </IconButton>
              </div>
            </div>
            {/* End App Logo Changes */}
            <Grid container>
              {data.map((item, index) => (
                <Grid item xs={12} sm={6} md={3} key={index} className="tw-p-2">
                  <TextField
                    value={item.value}
                    onChange={item.onChange}
                    label={item.title}
                    fullWidth
                    variant="filled"
                  />
                </Grid>
              ))}
              <Grid item xs={12} sm={6} md={3} className="tw-p-2">
                <TextField
                  value={defaultPayment}
                  onChange={(onChange) => setDefaultPayment(onChange.target.value)}
                  label="My.INTEK Payment"
                  fullWidth
                  variant="filled"
                  select
                >
                  {paymentList.map((payment) => (
                    <MenuItem key={payment.value} value={payment.value}>
                      {payment.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              {checkboxData.map((item, index) => (
                <Grid item xs={12} sm={6} md={3} key={index} className="tw-p-2">
                  <FormControlLabel
                    control={<Checkbox checked={item.checked} onChange={item.onChange} />}
                    label={item.title}
                  />
                </Grid>
              ))}
            </Grid>
          </Stack>
          <div className="tw-flex tw-flex-row tw-items-center tw-justify-end tw-mt-4 tw-w-full">
            <Button
              color="primary"
              variant="contained"
              className="tw-gap-1"
              disabled={loadingSubmit.value}
              onClick={() => save()}
            >
              <Iconify icon="mdi:content-save" /> Simpan
            </Button>
          </div>
        </div>
      </Stack>
    </div>
  );
}
