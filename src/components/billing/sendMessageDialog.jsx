import { toast } from 'sonner';
import { useBoolean } from '@hooks/use-boolean';
import { connect, useDispatch } from 'react-redux';
import { useMemo, useState, useEffect } from 'react';

import { LoadingButton } from '@mui/lab';
import {
  Stack,
  Button,
  Dialog,
  useTheme,
  MenuItem,
  Checkbox,
  TextField,
  DialogTitle,
  DialogActions,
  DialogContent,
  useMediaQuery,
  FormControlLabel,
} from '@mui/material';

import { setData } from 'src/stores/broadcastStore';
import { customerRepository, broadcastTemplateRepository } from 'src/repositories';

/**
 * @typedef {import('src/repositories/customer').Customer} Customer
 * @typedef {import('src/repositories/subscription').Subscription} Subscription
 * @typedef {import('src/repositories/broadcastTemplate').BroadcastTemplate} BroadcastTemplate
 * @param {{show: boolean; customer: Subscription; onClose: void; templates: BroadcastTemplate[]; year: number; month: number}} props -- react props
 * @returns
 */
const SendMessageDialog = ({ show, customer, onClose, templates, month, year }) => {
  const dispatch = useDispatch();
  const loading = useBoolean(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [message, setMessage] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const isPaid = useBoolean(false);
  const isUnpaid = useBoolean(false);
  const isPartiallyPaid = useBoolean(false);
  const sendInvoice = useBoolean(false);

  const showMessageBox = useMemo(() => selectedTemplate == null);

  const send = async () => {
    try {
      loading.onTrue();
      if (message === '' && selectedTemplate == null) throw new Error('Mohon mengisi pesan');
      const status = [];
      if (isPaid.value) status.push('paid');
      if (isUnpaid.value) status.push('unpaid');
      if (isPartiallyPaid.value) status.push('partially_paid');
      await customerRepository.sendMessage(
        {
          customerId: customer._id,
          message,
          templateId: selectedTemplate,
          sendInvoice: sendInvoice.value,
          status,
        },
        year,
        month
      );
      toast.success('Berhasil mengirim pesan');
      onClose();
    } catch (error) {
      toast.error(error.message);
    } finally {
      loading.onFalse();
    }
  };

  async function prefetch() {
    if (templates.length <= 0) {
      const snapshotTemplate = await broadcastTemplateRepository
        .getBroadcastTemplate()
        .catch(() => []);
      dispatch(setData(snapshotTemplate));
    }
  }

  useEffect(() => {
    if (show) prefetch();
  }, [show]);

  return (
    <Dialog open={show} onClose={onClose} fullWidth maxWidth="sm" fullScreen={isMobile}>
      <DialogTitle>Kirim Pesan</DialogTitle>
      <DialogContent>
        <Stack spacing={2} className="tw-py-2">
          <TextField label="Pelanggan" disabled value={customer?.fullname} />
          <TextField
            label="Template"
            value={selectedTemplate}
            select
            size="small"
            onChange={(e) => setSelectedTemplate(e.target.value)}
          >
            <MenuItem value={null}>Tanpa Template</MenuItem>
            {templates.map((t, i) => (
              <MenuItem key={i} value={t._id}>
                {t.title}
              </MenuItem>
            ))}
          </TextField>
          {showMessageBox ? (
            <TextField
              multiline
              rows={3}
              label="Pesan"
              value={message}
              onChange={(e) => e.target.value.length <= 500 && setMessage(e.target.value)}
              helperText={`${message.length} / 500`}
            />
          ) : (
            <div className="tw-flex tw-flex-wrap tw-gap-3">
              <FormControlLabel
                checked={isPaid.value}
                control={<Checkbox />}
                label="Paid"
                onClick={(e) => isPaid.onToggle()}
              />
              <FormControlLabel
                checked={isPartiallyPaid.value}
                control={<Checkbox />}
                label="Partially Paid"
                onClick={(e) => isPartiallyPaid.onToggle()}
              />
              <FormControlLabel
                checked={isUnpaid.value}
                control={<Checkbox />}
                label="Unpaid"
                onClick={(e) => isUnpaid.onToggle()}
              />
              <FormControlLabel
                checked={sendInvoice.value}
                control={<Checkbox />}
                label="Send Invoice"
                onClick={(e) => sendInvoice.onToggle()}
              />
            </div>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="error">
          Batal
        </Button>
        <LoadingButton onClick={send} color="primary" variant="contained" loading={loading.value}>
          Kirim
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
};

const mapStateToProps = (state) => ({
  templates: state.broadcastStore.data,
});

export default connect(mapStateToProps)(SendMessageDialog);
