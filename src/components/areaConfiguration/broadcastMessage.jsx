/**
 * @typedef {import("src/repositories/broadcastTemplate").BroadcastRequest} BroadcastRequest
 * @typedef {import('src/repositories/broadcastTemplate').BroadcastTemplate} BroadcastTemplate
 * @typedef {import('src/stores/broadcastStore').BroadcastStore} BroadcastStore
 */

/**
 * @callback OnsubmitBroadcast
 * @param {BroadcastRequest} data
 */

import { z } from 'zod';
import dayjs from 'dayjs';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { useForm } from 'react-hook-form';
import { useState, useEffect } from 'react';
import { useBoolean } from '@hooks/use-boolean';
import { Form, Field } from '@components/hook-form';
import { useDispatch, useSelector } from 'react-redux';

import { DatePicker } from '@mui/x-date-pickers';
import {
  Stack,
  Button,
  Dialog,
  useTheme,
  MenuItem,
  DialogTitle,
  DialogActions,
  DialogContent,
  useMediaQuery,
} from '@mui/material';

import { setData } from 'src/stores/broadcastStore';
import { broadcastTemplateRepository } from 'src/repositories';

/**
 * @param {{show: boolean; onClose: boolean; onSubmit: OnsubmitBroadcast}} param0
 */
export function BroadcastMessageDialog({ show, onClose, onSubmit }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const dispatch = useDispatch();

  /** @type {[dayjs.Dayjs, void]} */
  const [date, setDate] = useState(dayjs());
  const isUsingMessage = useBoolean(true);

  const defaultValues = {
    template: '',
    message: '',
    paid: false,
    unpaid: false,
    partially_paid: false,
    canceled: false,
    date: new Date().toISOString(),
    sendInvoice: false,
    special: false,
  };

  const methods = useForm({ defaultValues });
  const { handleSubmit } = methods;

  /** @type {BroadcastStore} */
  const templates = useSelector((state) => state.broadcastStore);

  const submit = handleSubmit((data) => {
    try {
      if (data.message === '' && data.template === '') {
        throw new Error('Mohon memilih template atau mengisi pesan');
      }

      const d = date.toDate();
      const target = [
        data.paid ? 'paid' : '',
        data.canceled ? 'canceled' : '',
        data.unpaid ? 'unpaid' : '',
        data.partially_paid ? 'partially_paid' : '',
      ].filter((t) => t !== '');

      /** @type {BroadcastRequest} */
      const submitData = {
        month: format(d, 'MM'),
        year: format(d, 'yyyy'),
        sendInvoice: data.sendInvoice,
        message: !!data.message ? data.message : '',
        template: data.template,
        target,
        special: data.special,
      };

      onSubmit(submitData);
    } catch (error) {
      toast.error(error.message);
    }
  });

  methods.watch((data) => {
    if (data.template === '') {
      isUsingMessage.onTrue();
    } else {
      isUsingMessage.onFalse();
    }
  });

  const prefetch = async () => {
    try {
      const snapshot = await broadcastTemplateRepository.getBroadcastTemplate();
      dispatch(setData(snapshot));
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (!show && templates.data.length >= 1) return;
    prefetch();
  }, [show]);

  return (
    <Form methods={methods}>
      <Dialog open={show} onClose={onClose} fullWidth maxWidth="sm" fullScreen={isMobile}>
        <DialogTitle>Broadcast Pesan</DialogTitle>
        <DialogContent>
          <Stack className="tw-py-2" spacing={2}>
            <Field.Select name="template" label="Template" size="small">
              <MenuItem value="">Pesan</MenuItem>
              {templates.data.map((t, i) => (
                <MenuItem key={i} value={t._id}>
                  {t.title}
                </MenuItem>
              ))}
            </Field.Select>
            <DatePicker
              views={['year', 'month']}
              label="Year and Month"
              maxDate={dayjs(new Date())}
              value={date}
              onChange={(newValue) => {
                setDate(newValue);
              }}
              slotProps={{ textField: { fullWidth: true, size: 'small' } }}
            />
            <div className="tw-flex tw-flex-wrap tw-gap-2 tw-items-center">
              <Field.Checkbox name="paid" label="Dibayar" />
              <Field.Checkbox name="unpaid" label="Belum dibayar" />
              <Field.Checkbox name="partially_paid" label="Sebagian dibayar" />
              <Field.Checkbox name="canceled" label="Dibatalkan" />
              <Field.Checkbox name="special" label="Pelanggan Special" />
              <Field.Checkbox name="sendInvoice" label="Kirim Invoice" />
            </div>
            {isUsingMessage.value && (
              <Field.Text name="message" label="Pesan" size="small" multiline rows={3} />
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="error">
            Batal
          </Button>
          <Button onClick={submit} color="primary" variant="contained">
            Kirim
          </Button>
        </DialogActions>
      </Dialog>
    </Form>
  );
}

const validator = z.object({
  template: z.string(),
  message: z.string(),
  paid: z.boolean(),
  unpaid: z.boolean(),
  partially_paid: z.boolean(),
  cancelled: z.boolean(),
  date: z.string(),
  sendInvoice: z.boolean(),
  special: z.boolean(),
});
