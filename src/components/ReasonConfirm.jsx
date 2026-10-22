import { useBoolean } from '@hooks/use-boolean';
import { useRef, useState, forwardRef, useImperativeHandle } from 'react';

import {
  Stack,
  Dialog,
  Button,
  useTheme,
  Checkbox,
  TextField,
  DialogTitle,
  DialogContent,
  useMediaQuery,
  DialogActions,
  FormControlLabel,
} from '@mui/material';

const ReasonConfirm = forwardRef((props, ref) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const show = useBoolean(false);
  const checked = useBoolean(false);
  const [reason, setReason] = useState('');
  const [dialogTitle, setDialogTitle] = useState('Konfirmasi');
  const [checkboxLabel, setCheckboxLabel] = useState('Saya mengerti konsekuensinya');
  const [hintText, setHintText] = useState('');

  const resolver = useRef();

  function reset() {
    setReason('');
    checked.onFalse();
    setDialogTitle('Konfirmasi');
    setCheckboxLabel('Saya mengerti konsekuensinya');
    setHintText('');
  }

  function open({ title, confirmMessage, hint }) {
    reset();
    if (title) setDialogTitle(title);
    if (confirmMessage) setCheckboxLabel(confirmMessage);
    if (hint) setHintText(hint);
    show.onTrue();
    return new Promise((resolve) => {
      resolver.current = resolve;
    });
  }

  function close() {
    show.onFalse();
    resolver.current();
  }

  function submit() {
    if (!checked.value) return;
    show.onFalse();
    resolver.current(reason);
  }

  useImperativeHandle(ref, () => ({ open }));

  return (
    <Dialog open={show.value} onClose={() => close()} fullWidth maxWidth="sm" fullScreen={isMobile}>
      <DialogTitle>{dialogTitle}</DialogTitle>
      <DialogContent>
        <Stack className="tw-py-2" spacing={1}>
          <TextField
            label="Alasan"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            multiline
            rows={4}
          />
          <FormControlLabel
            label={checkboxLabel}
            control={
              <Checkbox checked={checked.value} onChange={(e, value) => checked.setValue(value)} />
            }
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button color="error" variant="text" onClick={() => close()}>
          Batal
        </Button>
        <Button disabled={!checked.value} onClick={() => submit()} color="primary" variant="soft">
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
});

export default ReasonConfirm;
