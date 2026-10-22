import { z } from 'zod';
import { useEffect } from 'react';
import { Icon } from '@iconify/react';
import { useForm } from 'react-hook-form';
import { Form, Field } from '@components/hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Grid from '@mui/material/Unstable_Grid2';
import {
  List,
  Stack,
  Dialog,
  Button,
  Divider,
  ListItem,
  Typography,
  DialogTitle,
  ListItemText,
  ListItemIcon,
  DialogContent,
  DialogActions,
  ListItemButton,
} from '@mui/material';

const broadcastFormSchema = z.object({
  title: z.string().min(1, { message: 'Title is required!' }),
  content: z.string().min(1, { message: 'Content is required!' }),
  notificationTitle: z.string().optional(),
});

/**
 * @typedef {import('src/repositories/broadcastTemplate').BroadcastTemplate} BroadcastTemplate
 *
 * @typedef {object} BroadcastFormSubmit
 * @property {string} title
 * @property {string} title
 * @property {string | null} _id
 *
 * @callback BroadcastFormCallback
 * @param {BroadcastFormSubmit} data
 */

/**
 * @param {{show: boolean; onClose: void, onSubmit: BroadcastFormCallback, selectedItem: BroadcastTemplate}} props - React Props
 */
export default function BroadcastFormDialog({ show, onClose, onSubmit, selectedItem }) {
  const defaultValues = { _id: null, title: '', content: '', notificationTitle: '' };
  const methods = useForm({
    resolver: zodResolver(broadcastFormSchema),
    defaultValues,
  });

  const variablesContent = [
    { label: 'customer_id', value: 'Customer ID' },
    { label: 'customer_fullname', value: 'Customer Fullname' },
    { label: 'customer_phone', value: 'Customer Phone' },
    { label: 'package_name', value: 'The package name' },
    { label: 'server_name', value: 'The server name' },
    { label: 'package_price', value: 'Current package price' },
    { label: 'current_bill', value: 'Current Bill' },
    { label: 'month', value: 'Month, ex: January' },
    { label: 'year', value: 'Year, ex: 2022' },
    { label: 'status', value: 'Payment Status' },
    { label: 'total_partially', value: 'Total Partially' },
    { label: 'total_paid', value: 'Total Paid' },
    { label: 'billing_item', value: 'Billing Item' },
  ];

  const {
    handleSubmit,
    formState: { validatingFields, isSubmitting },
  } = methods;

  const submitForm = (data) => {
    onSubmit(data);
    onClose(true);
  };

  const addVariables = (variable) => {
    let currentText = methods.getValues('content');
    currentText += `{${variable}}`;
    methods.setValue('content', currentText);
  };

  useEffect(() => {
    if (!show) {
      methods.reset();
    }
    if (show && selectedItem) {
      // console.log(selectedItem);
      methods.setValue('title', selectedItem.title);
      methods.setValue('content', selectedItem.content);
      methods.setValue('_id', selectedItem._id);
      methods.setValue('notificationTitle', selectedItem.notificationTitle || '');
    }
  }, [show]);

  return (
    <Form methods={methods}>
      <Dialog open={show} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>Form Broadcast Template</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid xs={12} lg={6}>
              <Stack spacing={3} className="tw-py-3">
                <Field.Text name="title" label="Title" InputLabelProps={{ shrink: true }} />
                <Field.Text name="notificationTitle" label="Notification Title App" InputLabelProps={{ shrink: true }} />
                <Field.Text
                  multiline
                  name="content"
                  label="Content"
                  rows={13}
                  InputLabelProps={{ shrink: true }}
                />
              </Stack>
            </Grid>
            <Grid xs={12} lg={6}>
              <Typography>Variables</Typography>
              <Divider />
              <List>
                {variablesContent.map((v, i) => (
                  <ListItem key={i} disablePadding>
                    <ListItemButton onClick={() => addVariables(v.label)}>
                      <ListItemIcon>
                        <Icon icon="icon-park-outline:dot" />
                      </ListItemIcon>
                      <ListItemText>
                        {v.label} ({v.value})
                      </ListItemText>
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="error">
            Batal
          </Button>
          <Button onClick={handleSubmit(submitForm)} color="primary" variant="contained">
            Simpan
          </Button>
        </DialogActions>
      </Dialog>
    </Form>
  );
}
