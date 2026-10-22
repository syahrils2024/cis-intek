import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { useBoolean } from '@hooks/use-boolean';
import { Form, Field } from '@components/hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRef, forwardRef, useImperativeHandle } from 'react';

import { Button, Dialog, DialogTitle, DialogActions, DialogContent } from '@mui/material';

const validator = z.object({
  reason: z.string().min(1, 'Tidak boleh kosong'),
});

export default forwardRef((props, ref) => {
  const show = useBoolean(false);
  const resolver = useRef();

  const initalValue = {
    reason: '',
  };

  const methods = useForm({
    defaultValues: initalValue,
    resolver: zodResolver(validator),
  });

  const { handleSubmit } = methods;

  const open = () => {
    show.onTrue();
    return new Promise((resolve) => {
      resolver.current = resolve;
    });
  };

  const close = (reason) => {
    show.onFalse();
    resolver.current(reason);
    methods.reset();
  };

  const submit = handleSubmit((data) => {
    close(data.reason);
  });

  useImperativeHandle(ref, () => ({ open }));

  return (
    <Form methods={methods}>
      <Dialog open={show.value} fullWidth maxWidth="sm">
        <DialogTitle>Tolak</DialogTitle>
        <DialogContent>
          <div className="tw-py-2">
            <Field.Text name="reason" label="Alasan" multiline maxRows={4} />
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => close(undefined)}>Batal</Button>
          <Button onClick={submit} variant="contained" color="error">
            Reject
          </Button>
        </DialogActions>
      </Dialog>
    </Form>
  );
});
