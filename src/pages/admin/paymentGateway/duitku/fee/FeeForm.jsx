import { toast } from 'sonner';
import { useBoolean } from '@hooks/use-boolean';
import { useRef, useState, forwardRef, useImperativeHandle } from 'react';

import { LoadingButton } from '@mui/lab';
import {
  Stack,
  Dialog,
  Button,
  useTheme,
  Checkbox,
  TextField,
  DialogTitle,
  useMediaQuery,
  DialogContent,
  DialogActions,
  InputAdornment,
  FormControlLabel,
} from '@mui/material';

import 'src/extension/string';
import 'src/extension/number';
import { duitkuRepository } from 'src/repositories';

/** @typedef {import('src/repositories/duitku').DuitkuFee} DuitkuFee */

const FeeFormDialog = forwardRef((props, ref) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

  /** @type {[DuitkuFee, Function]} */
  const [detail, setDetail] = useState(null);

  const [fee, setFee] = useState(0);
  const [feePercentage, setFeePercentage] = useState(0);
  const active = useBoolean(false);

  const show = useBoolean(false);
  const loadingSubmit = useBoolean(false);
  const resolver = useRef();

  function reset() {
    setDetail(null);
    setFee(0);
    setFeePercentage(0);
  }

  function close() {
    show.onFalse();
    resolver.current?.(null);
  }

  /** @param {DuitkuFee} item */
  function open(item) {
    reset();
    show.onTrue();
    setDetail(item);
    setFee(item.fee);
    setFeePercentage(item.feePercentage);
    active.setValue(item.active);
    return new Promise((resolve) => {
      resolver.current = resolve;
    });
  }

  async function submit() {
    if (!detail) return;

    loadingSubmit.onTrue();
    const promises = duitkuRepository.updateFee({
      code: detail.code,
      fee: fee.toString().toNumber(),
      feePercentage: parseFloat(feePercentage.toString()),
      imageUrl: detail.imageUrl,
      paymentName: detail.paymentName,
      active: active.value,
    });
    toast.promise(promises, {
      loading: 'Menyimpan perubahan...',
      success: () => {
        close();
        return 'Berhasil menyimpan';
      },
      finally: () => {
        loadingSubmit.onFalse();
      },
      error: (err) => {
        const message = err?.response?.data?.message || err.message || 'Gagal menyimpan perubahan';
        return message;
      },
    });
  }

  useImperativeHandle(ref, () => ({ open }));

  return (
    <Dialog maxWidth="xs" fullWidth open={show.value} fullScreen={fullScreen}>
      <DialogTitle>Edit Biaya Tambahan</DialogTitle>
      <DialogContent>
        {detail ? (
          <Stack spacing={2} className="tw-py-2">
            <img src={detail.imageUrl} alt={detail.paymentName} />
            <TextField
              label="Jenis Pembayaran"
              InputProps={{ readOnly: true }}
              value={detail.paymentName}
              size="small"
            />
            <TextField
              label="Kode Pembayaran"
              InputProps={{ readOnly: true }}
              value={detail.code}
              size="small"
            />
            <TextField
              label="Biaya Tetap"
              value={fee.toString().toNumber().formatCurrency()}
              onChange={(e) => setFee(e.target.value.toString().toNumber())}
              size="small"
              slotProps={{
                input: {
                  startAdornment: <InputAdornment position="start">Rp. </InputAdornment>,
                },
              }}
            />
            <TextField
              label="Biaya Persentase (%)"
              value={feePercentage.toString()}
              onChange={(e) => {
                const { value } = e.target;
                // Allow: empty, digits, one optional dot, no letters
                if (value === '' || /^-?\d*\.?\d*$/.test(value)) {
                  setFeePercentage(value.toString());
                }
              }}
              size="small"
            />
            <FormControlLabel
              label="Active"
              control={<Checkbox checked={active.value} onChange={() => active.onToggle()} />}
            />
          </Stack>
        ) : null}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => close()} color="error" variant="text">
          Tutup
        </Button>
        <LoadingButton
          variant="soft"
          loading={loadingSubmit.value}
          onClick={() => submit()}
          color="primary"
        >
          Simpan
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
});

export default FeeFormDialog;
