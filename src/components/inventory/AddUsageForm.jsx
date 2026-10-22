/**
 * @typedef {import("src/repositories/inventory").Inventory} Inventory
 * @typedef {import("src/repositories/inventory").InventoryAvailableStock} InventoryAvailableStock
 * @typedef {import("src/repositories/area").Area} Area
 * @typedef {import("src/repositories/user").User} User
 */

import { z } from 'zod';
import { toast } from 'sonner';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useBoolean } from '@hooks/use-boolean';
import { Form, Field } from '@components/hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { LoadingButton } from '@mui/lab';
import {
  Stack,
  Alert,
  Dialog,
  MenuItem,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
} from '@mui/material';

import { inventoryRepository } from 'src/repositories';

/**
 * @param {{show: boolean; onClose: void; areas: Area[]; officers: User[]; item: Inventory}} param0
 */
export default function InventoryAddUsageForm({ show, onClose, areas, officers, item }) {
  /** @type {[InventoryAvailableStock, void]} */
  const [availableStock, setAvailableStock] = useState(null);

  const isLoading = useBoolean(false);
  const defaultValues = {
    quantity: 1,
    officer: '',
    serialNumber: '',
    photo: null,
    area: '',
    sourceArea: '',
  };

  const methods = useForm({ defaultValues, resolver: zodResolver(schemaValidator) });
  const { handleSubmit } = methods;

  const prefetchStock = async (e) => {
    const sourceArea = e.target.value;
    methods.setValue(e.target.name, e.target.value);
    if (!sourceArea) return;
    isLoading.onTrue();
    try {
      const snapshot = await inventoryRepository.getAvailableStock(item._id, sourceArea);
      setAvailableStock(snapshot);
    } catch (error) {
      toast.error(error.message);
    } finally {
      isLoading.onFalse();
    }
  };

  const onSubmit = handleSubmit(async (data) => {
    isLoading.onFalse();
    try {
      if (!item) throw new Error('Mohon memuat ulang');
      await inventoryRepository.submitInventoryUsage(item._id, data);
      onClose(true);
      toast.info('Penggunaan stok berhasil');
    } catch (error) {
      toast.error(error.message);
    } finally {
      isLoading.onFalse();
    }
  });

  const onSubmitAndReAdd = async (data) => {
    isLoading.onTrue();
    try {
      const currentSourceArea = methods.getValues('sourceArea');
      if (!item) throw new Error('Mohon memuat ulang');
      await inventoryRepository.submitInventoryUsage(item._id, data);
      await prefetchStock({ target: { name: 'sourceArea', value: currentSourceArea } });
      methods.reset();
      toast.info('Penggunaan stok berhasil');
    } catch (error) {
      toast.error(error.message);
    } finally {
      isLoading.onFalse();
    }
  };

  return (
    <Form methods={methods}>
      <Dialog open={show} onClose={onClose}>
        <DialogTitle>Form Penggunaan Stok</DialogTitle>
        <DialogContent>
          <Stack spacing={2} className="tw-py-2">
            <Alert severity="warning">
              Stok yang telah digunakan tidak dapat dihapus, mohon teliti saat melakukan penambahan
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
            <Field.Select
              name="sourceArea"
              label="Asal Area"
              InputProps={{
                onChange: prefetchStock,
              }}
            >
              <MenuItem disabled value="">
                Pilih Asal Area
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
              helperText={
                availableStock
                  ? `Stok tersedia: ${availableStock?.available ?? 0} ${item?.unitType ?? ''}`
                  : 'Pilih asal area agar stok tampil'
              }
            />
            <Field.Text label="Nomor Seri" name="serialNumber" />
            <Field.Upload name="photo" />
            <Field.Select name="officer" label="Teknisi / Petugas">
              <MenuItem disabled value="">
                Pilih Teknisi
              </MenuItem>
              {officers.map((o, i) => (
                <MenuItem key={i} value={o._id}>
                  <div className="tw-pl-5">{o.fullname}</div>
                </MenuItem>
              ))}
            </Field.Select>
          </Stack>
        </DialogContent>
        <DialogActions>
          <div className="tw-flex tw-flex-wrap tw-gap-2 tw-items-end tw-justify-end">
            {!isLoading.value && (
              <>
                <LoadingButton loading={isLoading.value} onClick={onClose} color="error">
                  Batal
                </LoadingButton>
                <LoadingButton
                  loading={isLoading.value}
                  onClick={handleSubmit(onSubmitAndReAdd)}
                  color="success"
                  variant="outlined"
                >
                  Simpan & Input Ulang
                </LoadingButton>
              </>
            )}

            <LoadingButton
              loading={isLoading.value}
              onClick={handleSubmit(onSubmit)}
              color="success"
              variant="contained"
            >
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
  sourceArea: z.string().min(1, 'Asal Area tidak boleh kosong'),
  officer: z.string().min(1, 'Teknisi / Petugas tidak boleh kosong'),
  serialNumber: z.string(),
});
