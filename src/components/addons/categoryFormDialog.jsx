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
  DialogContent,
  useMediaQuery,
} from '@mui/material';

import { addonsRepository } from 'src/repositories';

/**
 * @typedef {import('src/repositories/addons').AddonsCategory} AddonsCategory
 */

const validator = z.object({
  category: z.string().min(1, 'Tidak boleh kosong'),
});

const AddonsCategoryFormDialog = forwardRef((props, ref) => {
  const show = useBoolean(false);
  const isLoading = useBoolean(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  /** @type {[AddonsCategory, void]} */
  const [currentData, setCurrentData] = useState(null);

  const defaultValues = {
    category: '',
  };

  const methods = useForm({ defaultValues, resolver: zodResolver(validator) });
  const { handleSubmit, reset } = methods;
  const resolver = useRef();

  /**
   * @param {AddonsCategory} d
   */
  function open(d) {
    setCurrentData(null);
    reset();
    if (d) {
      setCurrentData(d);
      methods.setValue('category', d.category);
    }
    show.onTrue();

    return new Promise((resolve) => {
      resolver.current = resolve;
    });
  }

  const submit = handleSubmit(async (data) => {
    isLoading.onTrue();
    try {
      if (currentData) {
        await addonsRepository.updateAddonsCategory(currentData._id, data);
      } else {
        await addonsRepository.createAddonsCategory(data);
      }
      toast.success('Berhasil menyimpan');
      close();
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
    } finally {
      isLoading.onFalse();
    }
  });

  function close() {
    show.onFalse();
    resolver.current();
  }

  useImperativeHandle(ref, () => ({ open }));

  return (
    <Dialog open={show.value} fullWidth maxWidth="sm" fullScreen={isMobile}>
      <DialogTitle>Addons Category</DialogTitle>
      <DialogContent>
        <Stack sx={{ paddingY: 2 }}>
          <Form methods={methods}>
            <Field.Text name="category" label="Kategori" variant="filled" />
          </Form>
        </Stack>
      </DialogContent>
      <DialogActions>
        {!isLoading.value && (
          <Button color="error" variant="text" onClick={() => close()}>
            Tutup
          </Button>
        )}
        <LoadingButton
          loading={isLoading.value}
          color="primary"
          variant="contained"
          onClick={submit}
        >
          Simpan
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
});

export default AddonsCategoryFormDialog;
