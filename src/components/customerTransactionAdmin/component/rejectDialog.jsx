import { toast } from 'sonner';
import { useBoolean } from '@hooks/use-boolean';
import { useRef, useState, forwardRef, useImperativeHandle } from 'react';

import {
  Stack,
  Button,
  Dialog,
  useTheme,
  TextField,
  DialogTitle,
  DialogActions,
  DialogContent,
  useMediaQuery,
} from '@mui/material';

const CustomerTransactionAdminRejectDialog = forwardRef((props, ref) => {
  const show = useBoolean(false);
  const [text, setText] = useState('');
  const resolver = useRef();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  function reset() {
    setText('');
  }

  function close() {
    show.onFalse();
    resolver.current?.();
  }

  function open() {
    reset();
    show.onTrue();
    return new Promise((resolve) => {
      resolver.current = resolve;
    });
  }

  function submit() {
    if (text.trim() === '') {
      toast.error('Alasan tidak boleh kosong');
      return;
    }
    show.onFalse();
    resolver.current?.(text);
  }

  useImperativeHandle(ref, () => ({ open }));

  return (
    <Dialog open={show.value} fullWidth maxWidth="sm" fullScreen={isMobile}>
      <DialogTitle>Reject</DialogTitle>
      <DialogContent>
        <Stack className="tw-py-2">
          <TextField
            fullWidth
            size="small"
            multiline
            rows={3}
            maxRows={3}
            value={text}
            label="Alasan"
            onChange={(e) => setText(e.target.value)}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button variant="text" onClick={() => close()}>
          Batal
        </Button>
        <Button color="error" variant="soft" onClick={() => submit()}>
          Reject
        </Button>
      </DialogActions>
    </Dialog>
  );
});

export default CustomerTransactionAdminRejectDialog;
