/**
 * @typedef {import("src/repositories/inventory").Inventory} Inventory
 * @typedef {import('src/repositories/area').Area} Area
 */

import { z } from 'zod';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { useBoolean } from '@hooks/use-boolean';
import { Form, Field } from '@components/hook-form';
import { inventoryRepository } from '@repositories';
import { zodResolver } from '@hookform/resolvers/zod';

import { LoadingButton } from '@mui/lab';
import {
  Alert,
  Stack,
  Dialog,
  MenuItem,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
} from '@mui/material';

/**
 * @param {{show: boolean; onClose: void; item: Inventory; areas: Area[]}} props -- react props
 */
export default function InventoryAddStockFormDialog({ show, onClose, item, areas }) {
  const isLoading = useBoolean(false);
  const defaultValues = {
    area: '',
    quantity: 1,
    serialNumber: '',
    photo: null,
  };

  const methods = useForm({ defaultValues, resolver: zodResolver(schemaValidator) });
  const { handleSubmit } = methods;

  const onSubmit = handleSubmit(async (data) => {
    isLoading.onFalse();
    try {
      if (!item) throw new Error('Mohon memuat ulang');
      await inventoryRepository.submitInventoryStock(item._id, data);
      onClose(true);
      toast.info('Tambah stok berhasil');
    } catch (error) {
      toast.error(error.message);
    } finally {
      isLoading.onFalse();
    }
  });

  const onSubmitAndReAdd = async (data) => {
    isLoading.onTrue();
    try {
      if (!item) throw new Error('Mohon memuat ulang');
      await inventoryRepository.submitInventoryStock(item._id, data);
      methods.reset();
      toast.info('Tambah stok berhasil');
    } catch (error) {
      toast.error(error.message);
    } finally {
      isLoading.onFalse();
    }
  };

  return (
    <Form methods={methods}>
      <Dialog open={show} onClose={onClose} fullWidth maxWidth="sm">
        <DialogTitle>Tambah Stok</DialogTitle>
        <DialogContent>
          <Stack spacing={2} className="tw-py-2">
            <Alert severity="warning">
              Stok yang telah ditambahkan tidak dapat dihapus, mohon teliti saat melakukan
              penambahan
            </Alert>
            <Field.Select name="area" label="Area">
              <MenuItem disabled value="">
                Pilih Area
              </MenuItem>
              {areas.map((a, i) =>
                typeof a === 'string' ? (
                  <MenuItem disabled key={i}>
                    {a}
                  </MenuItem>
                ) : (
                  <MenuItem key={i} value={a._id}>
                    <div className="tw-pl-5">{a.title}</div>
                  </MenuItem>
                )
              )}
            </Field.Select>
            <Field.Text
              name="quantity"
              label="Quantity"
              type="number"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="start">{item?.unitType ?? ''}</InputAdornment>
                ),
              }}
            />
            <Field.Text label="Nomor Seri" name="serialNumber" />
            <Field.Upload name="photo" />
          </Stack>
        </DialogContent>
        <DialogActions>
          <div className="tw-flex tw-flex-wrap tw-gap-2 tw-items-end tw-justify-end">
            <LoadingButton onClick={onClose} color="error">
              Batal
            </LoadingButton>
            <LoadingButton
              onClick={handleSubmit(onSubmitAndReAdd)}
              color="success"
              variant="outlined"
            >
              Simpan & Input Ulang
            </LoadingButton>
            <LoadingButton onClick={handleSubmit(onSubmit)} color="success" variant="contained">
              Simpan
            </LoadingButton>
          </div>
        </DialogActions>
      </Dialog>
    </Form>
  );
}

const schemaValidator = z.object({
  area: z.string().min(1, 'Area tidak boleh kosong'),
  quantity: z.number().min(1, 'Quantity minimal 1'),
  serialNumber: z.string(),
});
