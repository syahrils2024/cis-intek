// @ts-nocheck

import { Upload } from '@components/upload';
import { Iconify } from '@components/iconify';
import { Form, Field } from '@components/hook-form';
import { forwardRef, useImperativeHandle } from 'react';
import CustomerDeactivateDialog from '@components/customer/DeactivateDialog';

import { LoadingButton } from '@mui/lab';
import {
  Grid,
  Stack,
  Button,
  Dialog,
  useTheme,
  MenuItem,
  Checkbox,
  DialogTitle,
  DialogActions,
  useMediaQuery,
  DialogContent,
  FormControlLabel,
} from '@mui/material';

import CustomerPickerDialog from './CustomerPicker';
import { useTicketFormDialogState } from './formDialog.state';

const TicketFormDialog = forwardRef(({ disabledPickCustomer = false }, ref) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const { state, handlers } = useTicketFormDialogState();

  const {
    customerPickerRef,
    deactivateDialogRef,
    show,
    loading,
    customer,
    preview,
    ticketTypes,
    engineerList,
    customerHeader,
    methods,
    engineers,
    sendImage,
  } = state;

  const { open, close, pickCustomer, submit, onAddImage, onRemoveImage, pickEngineer } = handlers;

  useImperativeHandle(ref, () => ({ open }));

  return (
    <>
      <Form methods={methods}>
        <Dialog open={show.value} fullWidth maxWidth="sm" fullScreen={isMobile}>
          <DialogTitle>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              Form Ticket
              <Stack direction="row" alignItems="center" justifyContent="end" spacing={1}>
                <Button
                  color="success"
                  variant="outlined"
                  size="small"
                  disabled={!customer}
                  onClick={() => pickEngineer()}
                >
                  Pilih Teknisi
                </Button>
                {!disabledPickCustomer ? (
                  <Button
                    color="primary"
                    variant="outlined"
                    size="small"
                    onClick={() => pickCustomer()}
                  >
                    Pilih Pelanggan
                  </Button>
                ) : null}
              </Stack>
            </Stack>
          </DialogTitle>
          <DialogContent>
            <Stack spacing={0.5}>
              <div className="tw-flex tw-flex-col tw-gap-2">
                <Grid container spacing={1}>
                  {customerHeader.map((item, index) => (
                    <Grid xs={12} sm={6} key={index} item>
                      <Stack>
                        <span className="tw-text-xs">{item.label}</span>
                        <span className="tw-text-xs tw-font-medium">{item.value}</span>
                      </Stack>
                    </Grid>
                  ))}
                </Grid>
              </div>
              <div className="tw-flex tw-flex-col tw-mt-4">
                <Field.Text label="Jenis Tiket" name="ticketType" select size="small">
                  {ticketTypes.map((t, i) => (
                    <MenuItem disabled={t.disabled ?? false} key={i} value={t.value}>
                      {t.label}
                    </MenuItem>
                  ))}
                </Field.Text>
              </div>
              <div className="tw-flex tw-flex-col tw-mt-2">
                <Field.Text
                  label="Deskripsi"
                  name="description"
                  maxRows={2}
                  multiline
                  minRows={2}
                />
              </div>
              {engineers.length > 0 ? (
                <div className="tw-flex tw-flex-col tw-mt-2 tw-pl-4">
                  <span className="tw-text-xs tw-text-gray-500">Teknisi :</span>
                  <ul className="tw-list-disc tw-pl-5 tw-text-xs tw-mt-2">
                    {engineers.map((engineer, i) => (
                      <li key={i}>
                        <Stack direction="row">{engineer.fullname}</Stack>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {/* <div className="tw-flex tw-flex-col tw-mt-2">
                <Field.MultiSelect
                  name="engineers"
                  label="Teknisi"
                  options={engineerList}
                  size="small"
                />
              </div> */}
              <div className="tw-flex tw-flex-col tw-mt-2">
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Upload accept="image/*" onDrop={(files) => onAddImage(files[0])} />
                  </Grid>
                  {preview.map((t, i) => (
                    <Grid key={i} item xs={12} md={4}>
                      <div className="tw-relative">
                        <button
                          type="button"
                          className="tw-absolute tw-top-3 tw-right-1 tw-bg-white/80 tw-rounded-full tw-w-7 tw-h-7 tw-flex tw-items-center tw-justify-center"
                          onClick={() => onRemoveImage(i)}
                        >
                          <Iconify icon="mdi:close" />
                        </button>
                        <img
                          src={t}
                          className="tw-w-full tw-aspect-video tw-rounded-lg  tw-object-contain tw-object-center"
                          alt="Thumbnail"
                        />
                      </div>
                    </Grid>
                  ))}
                </Grid>
                {preview.length > 0 ? (
                  <FormControlLabel
                    label="Kirim Foto ke Grup Whatsapp"
                    control={
                      <Checkbox
                        value={sendImage.value}
                        onChange={(e) => sendImage.setValue(e.target.value)}
                      />
                    }
                  />
                ) : null}
              </div>
            </Stack>
          </DialogContent>
          <DialogActions>
            <LoadingButton
              loading={loading.value}
              color="error"
              variant="text"
              onClick={() => close()}
            >
              Batal
            </LoadingButton>
            <LoadingButton
              loading={loading.value}
              color="primary"
              variant="contained"
              onClick={submit}
            >
              Kirim
            </LoadingButton>
          </DialogActions>
        </Dialog>
      </Form>
      <CustomerPickerDialog ref={customerPickerRef} />
      <CustomerDeactivateDialog ref={deactivateDialogRef} />
    </>
  );
});

export default TicketFormDialog;
