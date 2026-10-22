import { toast } from 'sonner';
import { z as zod } from 'zod';
import { useForm } from 'react-hook-form';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';

import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import InputAdornment from '@mui/material/InputAdornment';

import { useBoolean } from 'src/hooks/use-boolean';

import { authRepository } from 'src/repositories';

import { Iconify } from 'src/components/iconify';
import { AnimateLogo2 } from 'src/components/animate';
import { Form, Field } from 'src/components/hook-form';
// ----------------------------------------------------------------------

export const SignInSchema = zod.object({
  email: zod
    .string()
    .min(1, { message: 'Email is required!' })
    .email({ message: 'Email must be a valid email address!' }),
  password: zod
    .string()
    .min(1, { message: 'Password is required!' })
    .min(6, { message: 'Password must be at least 6 characters!' }),
});

// ----------------------------------------------------------------------

export default function LoginPage() {
  const navigate = useNavigate();
  const password = useBoolean();

  const defaultValues = { email: '', password: '' };

  const methods = useForm({
    resolver: zodResolver(SignInSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      const result = await authRepository.login(data.email, data.password);
      if (result.info.status !== 'active') throw new Error('User not active');
      localStorage.setItem('token', result.token);
      localStorage.setItem('email', result.info.email);
      localStorage.setItem('fullname', result.info.fullname);
      localStorage.setItem('privilege', JSON.stringify(result.info.privilege));
      localStorage.setItem('userId', result.info._id);
      navigate('/', { replace: true });
      window.location.reload();
    } catch (error) {
      toast.error(error.message);
    }
  });

  const renderLogo = <AnimateLogo2 sx={{ mb: 3, mx: 'auto' }} />;

  const renderHead = (
    <Stack alignItems="center" spacing={1.5} sx={{ mb: 5 }}>
      <Typography variant="h5">Masuk Ke Akun Anda</Typography>
    </Stack>
  );

  const renderForm = (
    <Stack spacing={3}>
      <Field.Text
        name="email"
        label="Email address"
        placeholder="Masukkan Email"
        InputLabelProps={{ shrink: true }}
      />

      <Stack spacing={1.5}>
        <Field.Text
          name="password"
          label="Password"
          placeholder="Masukkan Password"
          type={password.value ? 'text' : 'password'}
          InputLabelProps={{ shrink: true }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={password.onToggle} edge="end">
                  <Iconify icon={password.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Stack>

      <LoadingButton
        fullWidth
        color="inherit"
        size="large"
        type="submit"
        variant="contained"
        loading={isSubmitting}
        loadingIndicator="Sign in..."
      >
        Sign in
      </LoadingButton>
    </Stack>
  );

  return (
    <>
      <Helmet>
        <title> Login </title>
      </Helmet>
      {renderLogo}
      {renderHead}
      <Form methods={methods} onSubmit={onSubmit}>
        {renderForm}
      </Form>
    </>
  );
}
