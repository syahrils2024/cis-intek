import OtpInput from '@components/OtpInput';
import { Iconify } from '@components/iconify';
import { forwardRef, useImperativeHandle } from 'react';

import { LoadingButton } from '@mui/lab';
import {
  Stack,
  Button,
  Dialog,
  TextField,
  IconButton,
  DialogTitle,
  DialogActions,
  DialogContent,
  InputAdornment,
} from '@mui/material';

import { useLoginOtpDialogState } from './otpDialog.state';

const OtpDialog = forwardRef(({ dialogTitle = 'Verifikasi' }, ref) => {
  const { state, handler } = useLoginOtpDialogState();
  useImperativeHandle(ref, () => ({ open: handler.open, close: handler.close }));

  return (
    <Dialog
      maxWidth="xs"
      fullWidth
      open={state.showDialog.value}
      onClose={() => handler.close(false)}
      fullScreen={state.isMobile}
    >
      <DialogTitle>{dialogTitle}</DialogTitle>
      <DialogContent>
        {/* OTP Field */}
        {state.showOtpField ? (
          <Stack className="tw-py-1" spacing={1}>
            <OtpInput
              value={state.otp}
              onChange={handler.setOtp}
              size="small"
            />
            <Stack direction="row" spacing={1} justifyContent="center" alignItems="center">
              {state.otpCounter != null ? (
                <span className="tw-text-sm">Kirim ulang dalam {state.otpCounter} detik</span>
              ) : (
                <Button onClick={() => handler.resendOtp()} size="small" color="primary">
                  Kirim Ulang OTP
                </Button>
              )}
              <span className="tw-text-sm">atau</span>

              <Button onClick={() => state.showPassword.onTrue()} size="small" color="primary">
                Gunakan Password
              </Button>
            </Stack>
          </Stack>
        ) : null}
        {/* Password Field */}
        {state.showPassword.value ? (
          <Stack className="tw-py-2" spacing={1}>
            <TextField
              fullWidth
              value={state.password}
              onChange={(e) => handler.setPassword(e.target.value)}
              onKeyUp={(e) => e.key === "Enter" && handler.submit()}
              name="password"
              label="Password"
              placeholder="Masukkan Password"
              type={state.showPasswordText.value ? 'text' : 'password'}
              InputLabelProps={{ shrink: true }}
              size="small"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={state.showPasswordText.onToggle} edge="end">
                      <Iconify
                        icon={
                          state.showPasswordText.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'
                        }
                      />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Button onClick={() => state.showPassword.onFalse()} size="small" color="primary">
              Gunakan OTP
            </Button>
          </Stack>
        ) : null}
      </DialogContent>
      <DialogActions>
        <Button color="error" variant="text" onClick={() => handler.close(false)}>
          Tutup
        </Button>
        <LoadingButton
          disabled={state.disabledSubmit}
          loading={state.loading.value}
          variant="contained"
          color="primary"
          onClick={handler.submit}
        >
          Login
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
});

export default OtpDialog;
