import { z } from 'zod';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { useBoolean } from '@hooks/use-boolean';
import { Form, Field } from '@components/hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRef, useState, forwardRef, useImperativeHandle } from 'react';

import { LoadingButton } from '@mui/lab';
import {
  Stack,
  Button,
  Dialog,
  useTheme,
  DialogTitle,
  DialogActions,
  useMediaQuery,
  DialogContent,
} from '@mui/material';

import { faqRepository } from 'src/repositories';

/**
 * @typedef {import('src/repositories/faq').Faq} Faq
 */

const validator = z.object({
  title: z.string().min(1, 'Judul tidak boleh kosong'),
  content: z.string().min(1, 'Konten tidak boleh kosong'),
  isActive: z.boolean(),
  isTechnical: z.boolean().optional(),
});

const FaqFormDialog = forwardRef((props, ref) => {
  const show = useBoolean(false);
  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down('md'));
  const resolver = useRef();
  const loading = useBoolean(false);

  /** @type {[Faq, Function]} */
  const [selectedData, setSelectedData] = useState(null);

  const initialValues = {
    title: '',
    content: '',
    isActive: true,
    isTechnical: false,
  };

  const methods = useForm({
    defaultValues: initialValues,
    resolver: zodResolver(validator),
  });

  const { handleSubmit } = methods;

  function reset() {
    methods.reset();
    show.onFalse();
    loading.onFalse();
    setSelectedData(null);
  }

  async function fetchData(id) {
    loading.onTrue();
    try {
      const snapshot = await faqRepository.findDetail(id);
      setSelectedData(snapshot);
      methods.setValue('title', snapshot.question);
      methods.setValue('content', snapshot.answer);
      methods.setValue('isActive', snapshot.isActive);
      methods.setValue('isTechnical', snapshot.isTechnical);
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
    } finally {
      loading.onFalse();
    }
  }

  function open(id) {
    reset();
    show.onTrue();
    if (id) fetchData(id);
    return new Promise((resolve) => {
      resolver.current = resolve;
    });
  }

  function close() {
    resolver.current();
    show.onFalse();
  }

  const submit = handleSubmit(async (data) => {
    loading.onTrue();

    /** @type {Promise<void>} */
    let promises;

    if (selectedData) {
      promises = faqRepository.update(selectedData._id, {
        title: data.title,
        content: data.content,
        isActive: data.isActive,
        isTechnical: data.isTechnical,
      });
    } else {
      promises = faqRepository.create({
        title: data.title,
        content: data.content,
        isActive: data.isActive,
        isTechnical: data.isTechnical,
      });
    }

    toast.promise(promises, {
      loading: 'Menyimpan...',
      success: (d) => {
        loading.onFalse();
        show.onFalse();
        resolver.current(d);
        return 'Berhasil menyimpan FAQ';
      },
      error: (err) => `Gagal menyimpan FAQ: ${err.message}`,
    });
  });

  useImperativeHandle(ref, () => ({
    open,
    close,
  }));

  return (
    <Dialog open={show.value} fullWidth maxWidth="sm" fullScreen={mobile}>
      <DialogTitle>Faq Form</DialogTitle>
      <DialogContent>
        <Form methods={methods}>
          <Stack spacing={2}>
            <Field.Text name="title" variant="filled" label="Judul" />
            <Field.Text multiline rows={5} name="content" variant="filled" label="Konten" />
            <Field.Checkbox name="isActive" label="Aktif" />
            <Field.Checkbox name="isTechnical" label="Panduan Troubleshooting" />
          </Stack>
        </Form>
      </DialogContent>
      <DialogActions>
        <Button variant="text" color="error" onClick={() => close()}>
          Tutup
        </Button>
        <LoadingButton loading={loading.value} variant="contained" color="primary" onClick={submit}>
          Simpan
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
});

export default FaqFormDialog;
