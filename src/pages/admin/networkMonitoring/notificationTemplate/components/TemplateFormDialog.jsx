import { z } from 'zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Form, Field } from '@components/hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { LoadingButton } from '@mui/lab';
import { Chip, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';

/**
 * @param {Object} props
 * @param {boolean} props.open
 * @param {() => void} props.onClose
 * @param {import('src/repositories/networkMonitoringNotificationTemplate').NetworkMonitoringNotificationTemplate|null} props.selectedTemplate
 * @param {(data: import('src/repositories/networkMonitoringNotificationTemplate').NetworkMonitoringNotificationTemplateRequest) => Promise<void>} props.onSubmit
 * @param {boolean} props.loading
 */
export default function TemplateFormDialog({ open, onClose, selectedTemplate, onSubmit, loading }) {
  const isEdit = !!selectedTemplate;

  const schema = z.object({
    templateName: z.string().min(1, 'Nama template harus diisi'),
    template: z.string().min(1, 'Template harus diisi'),
  });

  const methods = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      templateName: '',
      template: '',
    },
  });

  const {
    reset,
    setValue,
    getValues,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const VARIABLES = {
    ipAddress: '{ipAddress}',
    device: '{device}',
    status: '{status}',
    timestamp: '{timestamp}',
  };

  const handleAppendVariable = (variable) => {
    const currentValue = getValues('template');
    const cursorPos = document.activeElement?.selectionStart ?? currentValue.length;
    const newValue = currentValue.slice(0, cursorPos) + variable + currentValue.slice(cursorPos);
    setValue('template', newValue);
  };

  useEffect(() => {
    if (open) {
      if (selectedTemplate) {
        reset({
          templateName: selectedTemplate.templateName,
          template: selectedTemplate.template,
        });
      } else {
        reset({ templateName: '', template: '' });
      }
    }
  }, [open, selectedTemplate, reset]);

  const onSubmitHandler = handleSubmit(async (data) => {
    await onSubmit(data);
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <Form methods={methods} onSubmit={onSubmitHandler}>
        <DialogTitle sx={{ px: { xs: 1.5, sm: 3 } }}>
          {isEdit ? 'Edit Template Notifikasi' : 'Tambah Template Notifikasi'}
        </DialogTitle>
        <DialogContent sx={{ px: { xs: 1.5, sm: 3 } }}>
          <div className="tw-flex tw-flex-col tw-gap-4 tw-py-2 tw-w-full">
            <Field.Text
              name="templateName"
              label="Nama Template"
              placeholder="Masukkan nama template"
            />
            <Field.Text
              name="template"
              label="Template"
              placeholder="Masukkan template notifikasi"
              multiline
              minRows={5}
              maxRows={12}
            />
            <div className="tw-flex tw-flex-wrap tw-gap-2">
              {Object.entries(VARIABLES).map(([key, value]) => (
                <Chip
                  key={key}
                  label={key}
                  size="small"
                  color="primary"
                  variant="outlined"
                  onClick={() => handleAppendVariable(value)}
                />
              ))}
            </div>
          </div>
        </DialogContent>
        <DialogActions>
          <LoadingButton
            type="submit"
            variant="contained"
            color="primary"
            loading={loading || isSubmitting}
          >
            {isEdit ? 'Simpan' : 'Tambah'}
          </LoadingButton>
        </DialogActions>
      </Form>
    </Dialog>
  );
}
