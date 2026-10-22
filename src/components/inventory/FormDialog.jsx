import { z } from 'zod';
import { toast } from 'sonner';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useBoolean } from '@hooks/use-boolean';
import { Form, Field } from '@components/hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { LoadingButton } from '@mui/lab';
import { Stack, Dialog, Button, DialogTitle, DialogContent, DialogActions } from '@mui/material';

import { inventoryRepository } from 'src/repositories';

/**
 * @typedef {import('src/repositories/inventory').Inventory} Inventory
 */

/**
 *
 * @param {{show: boolean, onClose: void, selectedItem?: Inventory}} props
 * @returns
 */
export default function InventoryFormDialog({ show, onClose, selectedItem }) {
  const loading = useBoolean(false);

  const defaultValues = {
    id: '',
    name: '',
    barcode: '',
    description: '',
    unitType: '',
    photo: null,
  };

  const methods = useForm({ defaultValues, resolver: zodResolver(schemaValidator) });
  const { handleSubmit } = methods;

  const submit = async (data) => {
    loading.onTrue();
    try {
      const result = await inventoryRepository.upsertItem({
        ...data,
        id: selectedItem?._id ?? null,
      });
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
      const inventory = await inventoryRepository.getInventoryItemDetail(selectedItem._id);
      methods.setValue('id', inventory._id);
      methods.setValue('name', inventory.name);
      methods.setValue('barcode', inventory.barcode ?? '');
      methods.setValue('description', inventory.description);
      methods.setValue('unitType', inventory.unitType);
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
        <DialogTitle>Form Inventory</DialogTitle>
        <DialogContent>
          <Stack spacing={2} className="tw-py-1 tw-relative">
            <Field.Text name="name" label="Nama Item" />
            <Field.Text name="barcode" label="Barcode" />
            <Field.Text name="description" label="Deskripsi" multiline rows={2} />
            <Field.Text name="unitType" label="Satuan" />
            <Field.Upload name="photo" helperText="Upload Foto atau gambar Produk atau Item" />
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
  name: z.string().min(1, 'Nama tidak boleh kosong'),
  description: z.string().min(1, 'Deskripsi tidak boleh kosong'),
  unitType: z.string().min(1, 'Satuan tidak boleh kosong'),
});
