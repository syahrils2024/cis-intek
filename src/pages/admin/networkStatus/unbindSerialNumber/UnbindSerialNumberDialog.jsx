import { useBoolean } from '@hooks/use-boolean';
import { useRef, forwardRef, useImperativeHandle } from 'react';

import {
  Stack,
  Button,
  Dialog,
  useTheme,
  DialogTitle,
  DialogActions,
  DialogContent,
  useMediaQuery,
} from '@mui/material';

import { UnbindSerialNumber } from './UnbindSerialNumber';

export const UnbindSerialNumberDialog = forwardRef((props, ref) => {
  const open = useBoolean(false);
  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down('md'));
  const unbindSerialNumberRef = useRef();

  const resolver = useRef();

  function openDialog() {
    open.onTrue();
    setTimeout(() => {
      unbindSerialNumberRef.current.load();
    }, 500);
    return new Promise((resolve) => {
      resolver.current = resolve;
    });
  }

  function closeDialog() {
    open.onFalse();
    unbindSerialNumberRef.current?.reset();
    resolver.current?.();
  }

  useImperativeHandle(ref, () => ({ open: openDialog, close: closeDialog }));

  return (
    <Dialog open={open.value} fullScreen={mobile} fullWidth maxWidth="md">
      <DialogTitle>Unbind Serial Number</DialogTitle>
      <DialogContent>
        <Stack className="tw-py-2 tw-relative">
          <UnbindSerialNumber ref={unbindSerialNumberRef} />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button color="error" variant="text" onClick={() => closeDialog()}>
          Tutup
        </Button>
      </DialogActions>
    </Dialog>
  );
});
