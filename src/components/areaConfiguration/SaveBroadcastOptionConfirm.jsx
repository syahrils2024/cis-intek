import { toast } from 'sonner';
import { useBoolean } from '@hooks/use-boolean';
import { useRef, useState, forwardRef, useImperativeHandle } from 'react';

import {
  Stack,
  Button,
  Dialog,
  TextField,
  DialogTitle,
  DialogActions,
  DialogContent,
} from '@mui/material';

const SaveBroadcastOptionConfirm = forwardRef((props, ref) => {
  const show = useBoolean(false);
  const [name, setName] = useState('');
  const resolver = useRef();

  function reset() {
    setName('');
  }

  function open() {
    reset();
    show.onTrue();
    return new Promise((resolve) => {
      resolver.current = resolve;
    });
  }

  // eslint-disable-next-line consistent-return
  function close(result) {
    if (typeof result === 'string' && result.trim() === '') {
      return toast.error('Profile Broadcast Title Harus Diisi');
    }

    show.onFalse();
    resolver.current?.(result);
  }

  useImperativeHandle(ref, () => ({
    open,
  }));

  return (
    <Dialog open={show.value} maxWidth="sm" fullWidth>
      <DialogTitle>Simpan Profile Broadcast</DialogTitle>
      <DialogContent>
        <Stack className="tw-py-1">
          <TextField
            fullWidth
            label="Profile Broadcast Title"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button variant="text" onClick={() => close()}>
          Batal
        </Button>
        <Button variant="contained" color="primary" onClick={() => close(name)}>
          Simpan
        </Button>
      </DialogActions>
    </Dialog>
  );
});

export default SaveBroadcastOptionConfirm;
