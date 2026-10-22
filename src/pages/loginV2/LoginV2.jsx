import { Helmet } from 'react-helmet-async';

import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';

import { AnimateLogo2 } from 'src/components/animate';
import { Form, Field } from 'src/components/hook-form';

import OtpDialog from './components/OtpDialog';
import { useLoginV2State } from './loginv2.state';

// ----------------------------------------------------------------------

export default function LoginPage() {
  const { state, handler, ref } = useLoginV2State();
  const { password, methods, isSubmitting } = state;
  const { onSubmit } = handler;

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
        label="Email / Whatsapp"
        placeholder="Masukkan Email"
        InputLabelProps={{ shrink: true }}
      />

      <LoadingButton
        fullWidth
        color="inherit"
        size="large"
        type="submit"
        variant="contained"
        loading={isSubmitting}
        loadingIndicator="Login..."
      >
        Login
      </LoadingButton>
      <OtpDialog ref={ref.otpDialogRef} />
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
