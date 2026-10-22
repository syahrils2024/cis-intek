import { z } from 'zod';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { useBoolean } from '@hooks/use-boolean';
import { Form, Field } from '@components/hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRef, useState, forwardRef, useImperativeHandle } from 'react';

import { LoadingButton } from '@mui/lab';
import { Dialog, Button, DialogTitle, DialogContent, DialogActions } from '@mui/material';

import 'src/extension/number';
import 'src/extension/string';
import { subscriptionRepository } from 'src/repositories';

const validator = z.object({
  amount: z.string(),
  summaryPeriode: z.string(),
  services: z.string(),
  reason: z.string().optional(),
});

const BillingUpdateForm = forwardRef((props, ref) => {
  const showDialog = useBoolean(false);
  const [billingId, setBillingId] = useState('');
  const loading = useBoolean(false);
  const [reason, setReason] = useState('');
  const defaultValues = {
    services: '',
    amount: '0',
    summaryPeriode: '',
    reason: '',
  };

  const resolver = useRef();

  const methods = useForm({ defaultValues, resolver: zodResolver(validator) });
  const { handleSubmit } = methods;

  function reset() {
    setReason('');
    methods.reset();
    showDialog.onFalse();
    setBillingId('');
  }

  function close() {
    reset();
    resolver.current();
  }

  /**
   * @param {string} idBilling
   * @param {{amount: number; summaryPeriode: string; services: string[]}} param1
   */
  function open(idBilling, { amount, summaryPeriode, services } = {}) {
    setBillingId(idBilling);
    methods.setValue('amount', amount.formatCurrency());
    methods.setValue('summaryPeriode', summaryPeriode ?? '');
    methods.setValue('services', services[0]);
    showDialog.onTrue();

    return new Promise((resolve) => {
      resolver.current = resolve;
    });
  }

  const save = handleSubmit(async (data) => {
    loading.onTrue();
    try {
      await subscriptionRepository.updateSomeBilling(billingId, {
        amount: data.amount.toNumber(),
        summaryPeriode: data.summaryPeriode,
        services: [data.services],
        reason: data.reason,
      });
      resolver.current(true);
      showDialog.onFalse();
      reset();
    } catch (error) {
      toast.error(error.message);
    } finally {
      loading.onFalse();
    }
  });

  useImperativeHandle(ref, () => ({ open }));

  return (
    <Dialog open={showDialog.value} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Billing</DialogTitle>
      <DialogContent>
        <Form methods={methods}>
          <div className="tw-flex tw-flex-col tw-gap-4 tw-py-2">
            <Field.Text label="Title" name="services" size="small" />
            <Field.Text
              label="Jumlah"
              name="amount"
              size="small"
              onChange={(e) =>
                methods.setValue('amount', e.target.value.toString().toNumber().formatCurrency())
              }
            />
            <Field.Text label="Deskripsi" name="summaryPeriode" size="small" />
            <Field.Text label="Alasan" name="reason" multiline rows={4} />
          </div>
        </Form>
      </DialogContent>
      <DialogActions>
        {!loading.value && (
          <Button variant="text" color="error" onClick={() => close()}>
            Batal
          </Button>
        )}

        <LoadingButton loading={loading.value} variant="contained" color="primary" onClick={save}>
          Simpan
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
});

export default BillingUpdateForm;
