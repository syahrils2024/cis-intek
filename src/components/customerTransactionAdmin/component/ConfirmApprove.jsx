import { useBoolean } from '@hooks/use-boolean';
import { useRef, useState, forwardRef, useImperativeHandle } from 'react';

import {
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

const CustomerTransactionConfirmApproveDialog = forwardRef((props, ref) => {
  const show = useBoolean(false);
  const confirmChecked = useBoolean(false);
  const [customerNote, setCustomerNote] = useState('');
  const resolver = useRef();

  function open() {
    show.onTrue();
    setCustomerNote('');
    return new Promise((resolve) => {
      resolver.current = resolve;
    });
  }

  function submit() {
    show.onFalse();
    const note = !!customerNote.trim() ? customerNote.trim() : null;
    resolver.current?.({ customerNote: note });
  }

  function close() {
    show.onFalse();
    resolver.current?.(null);
  }

  useImperativeHandle(ref, () => ({ open }));

  return (
    <Dialog open={show.value} onClose={() => close()} fullWidth maxWidth="sm">
      <DialogTitle>Confirm Approval</DialogTitle>
      <DialogContent>
        <Stack spacing={1} className="tw-py-2">
          <TextField
            label="Catatan untuk pelanggan"
            placeholder="eg: Pelanggan kelebihan transfer Rp. 5000 pada periode ini"
            value={customerNote}
            onChange={(e) => setCustomerNote(e.target.value)}
            fullWidth
            multiline
            minRows={3}
          />
          <FormControlLabel
            control={
              <Checkbox checked={confirmChecked.value} onClick={() => confirmChecked.onToggle()} />
            }
            label="Saya yakin ingin menyetujui transaksi ini"
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => close()} color="error" variant="text">
          Batal
        </Button>
        <Button
          variant="soft"
          color="primary"
          onClick={() => submit()}
          disabled={!confirmChecked.value}
        >
          Approve
        </Button>
      </DialogActions>
    </Dialog>
  );
});

export default CustomerTransactionConfirmApproveDialog;
