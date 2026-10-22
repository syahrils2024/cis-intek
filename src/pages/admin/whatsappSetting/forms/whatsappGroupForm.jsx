import { z } from 'zod';
import { toast } from 'sonner';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useBoolean } from '@hooks/use-boolean';
import { Form, Field } from '@components/hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { LoadingButton } from '@mui/lab';
import { Stack, Dialog, Button, DialogTitle, DialogContent, DialogActions } from '@mui/material';

import { whatsappGroupRepository } from 'src/repositories';

/**
 * @typedef {import('src/repositories/inventory').Inventory} Inventory
 */

/**
 *
 * @param {{show: boolean, onClose: void, selectedItem?: Inventory}} props
 * @returns
 */
export default function WhatsappGroupForm({ show, onClose, selectedItem }) {
  const loading = useBoolean(false);

  const defaultValues = {
    id: '',
    name: '',
  };

  const methods = useForm({ defaultValues, resolver: zodResolver(schemaValidator) });
  const { handleSubmit } = methods;

  const submit = async (data) => {
    try {
      let result;
      if(!data.id) result = await whatsappGroupRepository.createWhatsappGroup(data.name);
      if(data.id) result = await whatsappGroupRepository.updateWhatsappGroup(data.id, data.name);
      toast.info('Berhasil disimpan');
      onClose(true);
    } catch (error) {
      toast.error(error.message);
    } finally {
      loading.onFalse();
    }
  };

  const prefetchEdit = async () => {
    try {
      methods.setValue('name', selectedItem.name);
      methods.setValue('id', selectedItem._id);
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (!show) {
      methods.reset();
      return;
    }

    if (selectedItem) prefetchEdit();
  }, [show]);

  return (
    <Form methods={methods}>
      <Dialog open={show} onClose={onClose} fullWidth maxWidth="sm" scroll="paper">
        <DialogTitle>Form Whatsapp Group</DialogTitle>
        <DialogContent>
          <Stack spacing={2} className="tw-py-1 tw-relative">
            <Field.Text name="name" label="Nama Item" />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button color="error" onClick={onClose}>
            Tutup
          </Button>
          <LoadingButton
            loading={loading.value}
            color="success"
            variant="contained"
            onClick={handleSubmit(submit)}
          >
            Submit
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </Form>
  );
}

const schemaValidator = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Nama tidak boleh kosong'),
});
