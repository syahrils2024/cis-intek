import { z } from 'zod';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { useBoolean } from '@hooks/use-boolean';
import { Form, Field } from '@components/hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRef, useState, forwardRef, useImperativeHandle } from 'react';

import { LoadingButton } from '@mui/lab';
import Grid from '@mui/material/Unstable_Grid2';
import {
  Stack,
  Dialog,
  Button,
  useTheme,
  DialogTitle,
  useMediaQuery,
  DialogActions,
  DialogContent,
} from '@mui/material';

import { customerRepository } from 'src/repositories';

/**
 * @typedef {import('src/repositories/customer').Customer} Customer
 */

const validator = z.object({
  note: z.string().min(1, 'Tidak boleh kosong'),
});

const CustomerNoteFormDialog = forwardRef((props, ref) => {
  const show = useBoolean(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  /** @type {[Customer, void]} */
  const [customer, setCustomer] = useState(null);
  const loading = useBoolean(false);
  const resolver = useRef();

  const defaultValues = {
    note: '',
  };
  const methods = useForm({ defaultValues, resolver: zodResolver(validator) });
  const { handleSubmit } = methods;

  async function prefetch(customerId) {
    loading.onTrue();
    try {
      const snapshot = await customerRepository.getCustomer(customerId);
      setCustomer(snapshot);
      methods.setValue('note', snapshot.note ?? '');
    } catch (error) {
      toast.error(error.message);
    } finally {
      loading.onFalse();
    }
  }

  function open(customerId) {
    console.log(customerId);
    methods.reset();
    setCustomer(null);
    prefetch(customerId);
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
    loading.onTrue();
    try {
      await customerRepository.updateNote(customer._id, data.note);
      close();
    } catch (error) {
      toast.error(error.message);
    } finally {
      loading.onFalse();
    }
  });

  useImperativeHandle(ref, () => ({ open }));

  return (
    <Dialog open={show.value} fullWidth maxWidth="sm" fullScreen={isMobile} onClose={() => close()}>
      <DialogTitle>Catatan Pelanggan</DialogTitle>
      <DialogContent>
        <Form methods={methods}>
          <Stack spacing={2}>
            <Grid container rowSpacing={2}>
              <Grid xs={6}>
                <Stack>
                  <span className="tw-text-xs tw-text-gray-500">ID</span>
                  <span className="tw-text-xs tw-font-semibold">{customer?.customerId ?? '-'}</span>
                </Stack>
              </Grid>
              <Grid xs={6}>
                <Stack>
                  <span className="tw-text-xs tw-text-gray-500">Pelanggan</span>
                  <span className="tw-text-xs tw-font-semibold">{customer?.fullname ?? '-'}</span>
                </Stack>
              </Grid>
              <Grid xs={6}>
                <Stack>
                  <span className="tw-text-xs tw-text-gray-500">Area / POP</span>
                  <span className="tw-text-xs tw-font-semibold">{customer?.areaName ?? '-'}</span>
                </Stack>
              </Grid>
              <Grid xs={6}>
                <Stack>
                  <span className="tw-text-xs tw-text-gray-500">ODP</span>
                  <span className="tw-text-xs tw-font-semibold">{customer?.ODPName ?? '-'}</span>
                </Stack>
              </Grid>
              <Grid xs={6}>
                <Stack>
                  <span className="tw-text-xs tw-text-gray-500">Paket saat ini</span>
                  <span className="tw-text-xs tw-font-semibold">
                    {customer?.packageData?.title}
                  </span>
                </Stack>
              </Grid>
              <Grid xs={6}>
                <Stack>
                  <span className="tw-text-xs tw-text-gray-500">Biaya Bulanan</span>
                  <span className="tw-text-xs tw-font-semibold">
                    Rp. {customer?.activePackage?.price.formatCurrency()}
                  </span>
                </Stack>
              </Grid>
              <Grid xs={6}>
                <Stack>
                  <span className="tw-text-xs tw-text-gray-500">Jenis Layanan</span>
                  <span className="tw-text-xs tw-font-semibold">
                    {customer?.isPrepaid ? 'Prabayar / Bayar Depan' : 'Pascabayar / Bayar Belakang'}
                  </span>
                </Stack>
              </Grid>
            </Grid>
            <Field.Text name="note" label="Catatan" multiline rows={3} />
          </Stack>
        </Form>
      </DialogContent>
      <DialogActions>
        <Button variant="text" color="error" onClick={() => close()}>
          Tutup
        </Button>
        <LoadingButton loading={loading.value} variant="contained" color="primary" onClick={submit}>
          Simpan
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
});

export default CustomerNoteFormDialog;
