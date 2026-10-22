import { z } from 'zod';
import { toast } from 'sonner';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useBoolean } from '@hooks/use-boolean';
import { Form, Field } from '@components/hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { LoadingButton } from '@mui/lab';
import { Stack, Button, Dialog, DialogTitle, DialogActions, DialogContent } from '@mui/material';

import { duoDateChargeRepository } from 'src/repositories';

/**
 * @typedef {import('src/repositories/duoDateCharge').DuoDateCharge} DuoDateCharge
 */

/**
 * @param {{show: boolean; onClose: (isPrefetch: boolean) void; selectedData: DuoDateCharge}} param0
 */
export default function DuoDateChargeForm({ show, onClose, selectedData }) {
  const loading = useBoolean(false);
  const defaultValues = {
    name: '',
    charge: 0,
  };

  const methods = useForm({
    defaultValues,
    resolver: zodResolver(validator),
  });
  const { handleSubmit } = methods;

  const prefetch = () => {
    if (!selectedData) return;
    methods.setValue('name', selectedData.name);
    methods.setValue('charge', selectedData.charge);
  };

  const submit = handleSubmit(async (data) => {
    loading.onTrue();
    try {
      if (selectedData) {
        await duoDateChargeRepository.update(selectedData._id, data);
      } else {
        await duoDateChargeRepository.insert(data);
      }

      toast.success('Berhasil menyimpan');
      onClose(true);
    } catch (error) {
      toast.error(error.message);
    } finally {
      loading.onFalse();
    }
  });

  useEffect(() => {
    if (!show) {
      methods.reset();
      return;
    }
    prefetch();
  }, [show]);

  return (
    <Form methods={methods}>
      <Dialog open={show} fullWidth>
        <DialogTitle>Form Template Denda</DialogTitle>
        <DialogContent>
          <Stack spacing={2} className="tw-py-2">
            <Field.Text name="name" label="Nama Denda" />
            <Field.Text type="number" name="charge" label="Denda" />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => onClose(false)} color="error">
            Tutup
          </Button>
          <LoadingButton
            loading={loading.value}
            onClick={submit}
            color="success"
            variant="contained"
          >
            Simpan
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </Form>
  );
}

const validator = z.object({
  name: z.string().min(1, 'Tidak boleh kosong'),
  charge: z.number().min(0, 'Tidak boleh kosong'),
});
