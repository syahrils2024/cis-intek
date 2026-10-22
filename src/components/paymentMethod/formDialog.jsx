/**
 * @typedef {import("src/repositories/depositMethod").PaymentMethod} PaymentMethod
 * @typedef {import('src/repositories/mutasiBank').IMutasiBankAccount} MutasiBankAccount
 */

import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { useBoolean } from '@hooks/use-boolean';
import { useRef, useState, useEffect } from 'react';
import { Form, Field } from '@components/hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import {
  Stack,
  Button,
  Dialog,
  Divider,
  MenuItem,
  useTheme,
  DialogTitle,
  DialogActions,
  DialogContent,
  useMediaQuery,
} from '@mui/material';

import MutasiBankPicker, { MutasiBankCard } from './mutasiBankPicker';

/**
 * @callback onSubmit
 * @param {PaymentMethod} data
 */

/**
 * @param {{show: boolean; onSubmit: onSubmit, onClose: void; selectedData: PaymentMethod | null}} param0
 */
export default function PaymentMethodFormDialog({ show, onSubmit, onClose, selectedData }) {
  const theme = useTheme();
  /** @type {[MutasiBankAccount, void]} */
  const [mutasiBankAccount, setMutasiBankAccount] = useState(null);
  const defaultValues = {
    title: '',
    status: 'active',
    paymentMethod: '',
    bankName: '',
    bankUsername: '',
    bankNumber: '',
    showAndroid: false,
    isDefault: false,
    isAuto: false,
    isManual: false,
    internalCode: 0,
  };

  const showBankOptions = useBoolean(true);

  const methods = useForm({
    defaultValues,
    resolver: zodResolver(schemaValidator),
  });

  const { handleSubmit } = methods;
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const mutasiBankPickerRef = useRef();

  async function pickAccount() {
    /** @type {MutasiBankAccount} */
    const result = await mutasiBankPickerRef.current.open(mutasiBankAccount?.id);
    if (result) {
      setMutasiBankAccount(result);
      methods.setValue('bankName', result.bank, { shouldTouch: true, shouldDirty: true });
      methods.setValue('bankNumber', result.account_no, { shouldTouch: true, shouldDirty: true });
      methods.setValue('bankUsername', result.account_name, {
        shouldTouch: true,
        shouldDirty: true,
      });
    }
  }

  useEffect(() => {
    if (show && selectedData) {
      methods.setValue('title', selectedData.title);
      methods.setValue('status', selectedData.status);
      methods.setValue('paymentMethod', selectedData.paymentMethod);
      methods.setValue('isDefault', selectedData.isDefault ?? false);
      methods.setValue('showAndroid', selectedData.showAndroid ?? false);
      methods.setValue('bankName', selectedData.bankName ?? '');
      methods.setValue('bankNumber', selectedData.bankNumber ?? '');
      methods.setValue('bankUsername', selectedData.bankUsername ?? '');
      methods.setValue('isAuto', selectedData.isAuto ?? null);
      methods.setValue('isManual', selectedData.isManual ?? null);
      methods.setValue('internalCode', selectedData.internalCode ?? 0);
      if (selectedData.mutasiBankData) setMutasiBankAccount(selectedData.mutasiBankData);
    } else {
      setMutasiBankAccount(null);
      methods.reset();
    }
  }, [show]);

  const beforeSubmit = handleSubmit((data) => {
    data.mutasiBankId = mutasiBankAccount?.id.toString() ?? null;
    onSubmit(data);
  });

  return (
    <Form methods={methods}>
      <Dialog open={show} onClose={onClose} fullWidth maxWidth="sm" fullScreen={isMobile}>
        <DialogTitle>Form Metode Pembayaran</DialogTitle>
        <DialogContent>
          <Stack spacing={2} className="tw-py-2">
            <Field.Text name="title" label="Judul Metode Pembayaran" size="small" />
            <Field.Text type="number" name="internalCode" label="Kode Internal" size="small" />
            <Field.Select name="status" label="Status" size="small">
              <MenuItem value="active">Aktif</MenuItem>
              <MenuItem value="inactive">Non Aktif</MenuItem>
            </Field.Select>
            <Field.Select
              name="paymentMethod"
              label="Jenis Pembayaran"
              size="small"
              onChange={(e) => {
                const { value } = e.target;
                if (value === 'cash') showBankOptions.onFalse();
                else showBankOptions.onTrue();
                methods.setValue('paymentMethod', value);
              }}
            >
              <MenuItem value="transfer">Transfer</MenuItem>
              <MenuItem value="cash">Cash</MenuItem>
              <MenuItem value="ewallet">E-Wallet</MenuItem>
            </Field.Select>
            {showBankOptions.value && (
              <>
                <Divider />
                <Stack>
                  <span className="tw-text-xs tw-text-gray-500">Nama Bank / E-Wallet</span>
                  <Field.Text name="bankName" size="small" />
                </Stack>

                <Stack>
                  <span className="tw-text-xs tw-text-gray-500">Atas Nama Rekening / E-Wallet</span>
                  <Field.Text name="bankUsername" size="small" />
                </Stack>

                <Stack>
                  <span className="tw-text-xs tw-text-gray-500">Nomor Rekening / E-Wallet</span>
                  <Field.Text name="bankNumber" size="small" />
                </Stack>
              </>
            )}


            <Field.Checkbox name="showAndroid" label="Tampilkan di Android" size="small" />
            <Field.Checkbox name="isManual" label="Manual" size="small" />
            <Field.Checkbox name="isAuto" label="Otomatis" size="small" />
            {/* <Field.Switch name="isDefault" label="Default" size="small" /> */}
            {mutasiBankAccount && (
              <Stack spacing={2}>
                <Divider />
                <span className="tw-text-xs">Rekening Tertaut</span>
                <MutasiBankCard
                  account={mutasiBankAccount}
                  onRemove={() => setMutasiBankAccount(null)}
                />
              </Stack>
            )}
            <div className="tw-flex tw-flex-row tw-items-center tw-justify-end tw-w-full">
              <Button color="primary" size="small" variant="outlined" onClick={() => pickAccount()}>
                Tautkan ke Rekening
              </Button>
            </div>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} variant="error">
            Tutup
          </Button>
          <Button onClick={beforeSubmit} color="success" variant="contained">
            Simpan
          </Button>
        </DialogActions>
      </Dialog>
      <MutasiBankPicker ref={mutasiBankPickerRef} />
    </Form>
  );
}

const schemaValidator = z.object({
  title: z.string().min(1, 'Tidak boleh kosong'),
  paymentMethod: z.string().min(1, 'Tidak boleh kosong'),
  status: z.string().min(1, 'Tidak boleh kosong'),
  isDefault: z.boolean().optional(),
  bankName: z.string(),
  bankUsername: z.string(),
  bankNumber: z.string(),
  showAndroid: z.boolean().nullable().optional(),
  isManual: z.boolean().nullable().optional(),
  isAuto: z.boolean().nullable().optional(),
  internalCode: z
    .number()
    .min(1, 'Internal Code harus lebih besar dari 0')
    .max(100, 'Internal Code harus kurang dari 100'),
});
