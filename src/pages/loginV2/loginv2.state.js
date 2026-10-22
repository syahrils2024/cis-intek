import { toast } from 'sonner';
import { z as zod } from 'zod';
import { useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';

import { useBoolean } from 'src/hooks/use-boolean';

import { authRepository } from 'src/repositories';

// ----------------------------------------------------------------------

export const SignInSchema = zod.object({
  email: zod.string().min(1, { message: 'Email is required!' }),
});

// ----------------------------------------------------------------------

export function useLoginV2State() {
  const navigate = useNavigate();
  const password = useBoolean();
  const otpDialogRef = useRef();

  const defaultValues = { email: '' };

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
      const result = await authRepository.loginOtp({ email: data.email });
      const isVerified = await otpDialogRef.current.open(data.email);
      console.log(isVerified);
      if (!isVerified) return;
      navigate('/', { replace: true });
      window.location.reload();
    } catch (error) {
      toast.error(error.message);
    }
  });

  return {
    state: {
      password,
      methods,
      isSubmitting,
    },
    ref: {
      otpDialogRef,
    },
    handler: {
      onSubmit,
    },
  };
}
