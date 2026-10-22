import { toast } from 'sonner';
import { Iconify } from '@components/iconify';
import { useBoolean } from '@hooks/use-boolean';
import { useRef, useMemo, useState, forwardRef, useImperativeHandle } from 'react';

import { LoadingButton } from '@mui/lab';
import {
  Grid,
  Stack,
  Button,
  Dialog,
  Checkbox,
  TextField,
  DialogTitle,
  DialogActions,
  DialogContent,
  FormControlLabel,
} from '@mui/material';

import 'src/extension/number';
import 'src/extension/string';
import { userWalletRepository } from 'src/repositories';

/**
 * @typedef {import('src/repositories/userWallet').UserWallet} UserWallet
 */

const UserWithdrawConfirm = forwardRef((props, ref) => {
  const [userWallet, setUserWallet] = useState(/** @type {UserWallet} */ (null));
  const show = useBoolean(false);
  const resolver = useRef();
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState(0);
  const checked = useBoolean(false);
  const loading = useBoolean(false);
  /** @type {[File[], Function]} */
  const [evidences, setEvidences] = useState([]);

  const headers = useMemo(() => {
    const items = {
      User: userWallet?.fullname ?? '-',
      'Kas Kolektor': userWallet?.balance.formatCurrency() ?? '-',
    };

    return Object.entries(items).map(([label, value]) => ({ label, value }));
  }, [userWallet]);

  function reset() {
    setDescription('');
    setAmount(0);
    checked.onFalse();
  }

  function open(item) {
    reset();
    setUserWallet(item);
    show.onTrue();
    return new Promise((resolve) => {
      resolver.current = resolve;
    });
  }

  function close(refresh = false) {
    setUserWallet(null);
    show.onFalse();
    resolver.current?.(refresh);
  }

  function validation() {
    if (amount <= 0) {
      toast.error('Jumlah harus lebih besar dari 0');
      return false;
    }
    if (amount > userWallet.balance) {
      toast.error('Kas Kolektor kurang');
      return false;
    }
    if (description.trim() === '') {
      toast.error('Keterangan harus diisi');
      return false;
    }
    return true;
  }

  function removeImage(index) {
    setEvidences((prev) => prev.filter((_, i) => i !== index));
  }

  function addImage(){
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    input.onchange = (e) => {
      const files = Array.from(e.target.files);
      setEvidences((prev) => [...prev, ...files]);
    };
    input.click();
  }

  async function submit() {
    const isValidated = validation();
    if (!isValidated) return;

    loading.onTrue();
    try {
      await userWalletRepository.withdraw({
        userId: userWallet._id,
        amount: amount.toString().toNumber(),
        description,
        evidences
      });

      close(true);
      toast.success('Berhasil menarik kas kolektor');
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
    } finally {
      loading.onFalse();
    }
  }

  useImperativeHandle(ref, () => ({ open }));

  return (
    <Dialog open={show.value} onClose={() => close()} fullWidth maxWidth="xs">
      <DialogTitle>Tarik Kas Kolektor</DialogTitle>
      <DialogContent>
        <Stack spacing={2} className="tw-py-2">
          <Grid container>
            {headers.map(({ label, value }) => (
              <Grid item xs={6} key={label}>
                <Stack>
                  <span className="tw-text-xs tw-text-gray-500">{label}</span>
                  <span className="tw-text-xs tw-font-semibold">{value}</span>
                </Stack>
              </Grid>
            ))}
          </Grid>
          {/* Form */}
          <TextField
            value={amount.toString().toNumber().formatCurrency()}
            onChange={(e) => setAmount(e.target.value.toString().toNumber())}
            size="small"
            label="Jumlah"
          />
          <TextField
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            size="small"
            label="Keterangan"
            multiline
            rows={2}
          />

          <div className="tw-w-full tw-grid tw-grid-cols-2 md:tw-grid-cols-4 tw-gap-2 md:tw-col-span-2">
            {evidences.map((t, i) => (
              <div key={i} className="tw-relative">
                <button
                  type="button"
                  className="tw-absolute tw-top-3 tw-right-1 tw-bg-white/80 tw-rounded-full tw-w-7 tw-h-7 tw-flex tw-items-center tw-justify-center"
                  onClick={() => removeImage(i)}
                >
                  <Iconify icon="mdi:close" />
                </button>
                <img
                  src={URL.createObjectURL(t)}
                  className="tw-w-full tw-aspect-square tw-rounded-lg  tw-object-cover tw-object-center"
                  alt="Thumbnail"
                />
              </div>
            ))}
            <button type="button" className='tw-w-full tw-rounded tw-ring-1 tw-ring-gray-500 tw-flex tw-items-center tw-justify-center tw-aspect-square' onClick={() => addImage()}>
              <Iconify icon="mdi:plus" className="tw-w-6 tw-h-6 tw-mx-auto" />
            </button>
          </div>
           <FormControlLabel
            control={
              <Checkbox
                checked={checked.value}
                onChange={(v) => checked.setValue(v.target.checked)}
              />
            }
            label="Saya menyetujui menarik kas kolektor"
          />
          {/* End Form */}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => close()} color="error" variant="text">
          Batal
        </Button>
        <LoadingButton
          loading={loading.value}
          disabled={!checked.value}
          onClick={() => submit()}
          color="primary"
          variant="contained"
        >
          Tarik
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
});

export default UserWithdrawConfirm;
