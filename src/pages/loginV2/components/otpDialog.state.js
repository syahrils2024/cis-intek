/* eslint-disable consistent-return */
import { toast } from 'sonner';
import { useBoolean } from '@hooks/use-boolean';
import { useRef, useMemo, useState } from 'react';

import { useTheme, useMediaQuery } from '@mui/material';

import { authRepository } from 'src/repositories';

/**
 * State and Handler for Login OTP Dialog
 * only for component OtpDialog.jsx
 * @returns
 */
export function useLoginOtpDialogState() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  /** @type {[String, Function]} */
  const [email, setEmail] = useState('');

  /** @type {[String, Function]} */
  const [otp, setOtp] = useState('');

  /** @type {[String, Function]} */
  const [password, setPassword] = useState(false);

  const showPassword = useBoolean(false);

  const showPasswordText = useBoolean(false);

  /** @type {[String, Function]} */
  const [otpCounter, setOtpCounter] = useState(null);

  /** @type {[Boolean, Function]} */
  const showOtpField = useMemo(() => !showPassword.value, [showPassword.value]);

  const loading = useBoolean(false);

  const showDialog = useBoolean(false);

  const resolver = useRef();

  const [otpCounterDuration, setOtpCounterDuration] = useState(10);

  const showPasswordValue = showPassword.value;
  const disabledSubmit = useMemo(() => {
    if (showPasswordValue) {
      return password.length < 1;
    }
    return otp.length !== 6;
  }, [otp, password, showPasswordValue]);

  let interval;

  function startOtpCounter(initial = 10) {
    clearInterval(interval);
    setOtpCounterDuration(initial);
    setOtpCounter(initial);
    interval = setInterval(() => {
      setOtpCounter((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setOtpCounter(null);
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  }

  function resendOtp() {
    /**
     * Resend OTP logic here
     */
    toast.promise(authRepository.loginOtp({ email }), {
      loading: 'Mengirim ulang OTP...',
      success: () => {
        startOtpCounter(otpCounterDuration * 2);
        return 'OTP berhasil dikirim ulang!';
      },
      error: (err) => `Gagal mengirim ulang OTP: ${err.message}`,
    });
  }

  function reset() {
    clearInterval(interval);
    setEmail('');
    setOtp('');
    setPassword('');
    showPassword.onFalse();
    setOtpCounter(null);
  }

  function open(mail) {
    reset();
    setEmail(mail);
    showDialog.onTrue();
    return new Promise((resolve) => {
      resolver.current = resolve;
    });
  }

  // eslint-disable-next-line consistent-return
  async function submit() {
    const passwordEmpty = password.trim() === '';
    if(passwordEmpty) return;
    loading.onTrue();
    try {
      /**
       * Login using password
       * and save secret to localstorage
       */
      if (showPassword.value) {
        const result = await authRepository.login(email, password);
        setStorage({
          fullname: result.info.fullname,
          mail: result.info.email,
          privilege: result.info.privilege,
          token: result.token,
          userId: result.info._id,
        });
        return close(true);
      }

      /**
       * Login using OTP
       * and save secret to localstorage
       */
      const result = await authRepository.loginOtp({ email, otp });
      setStorage({
        fullname: result.info.fullname,
        mail: result.info.email,
        privilege: result.info.privilege,
        token: result.token,
        userId: result.info._id,
      });
      return close(true);
    } catch (error) {
      setOtp('');
      if (error instanceof Error) toast.error(error.message);
    } finally {
      loading.onFalse();
    }
  }

  function setStorage({ token, mail, fullname, privilege, userId }) {
    localStorage.setItem('token', token);
    localStorage.setItem('email', mail);
    localStorage.setItem('fullname', fullname);
    localStorage.setItem('privilege', JSON.stringify(privilege));
    localStorage.setItem('userId', userId);
  }

  function close(value = false) {
    showDialog.onFalse();
    resolver.current?.(value);
  }

  return {
    state: {
      email,
      otp,
      password,
      showPassword,
      showOtpField,
      otpCounter,
      showDialog,
      otpCounterDuration,
      loading,
      showPasswordText,
      disabledSubmit,
      isMobile
    },
    handler: {
      setEmail,
      setOtp,
      setPassword,
      setOtpCounter,
      open,
      reset,
      resolver,
      resendOtp,
      submit,
      close,
      startOtpCounter,
    },
  };
}
