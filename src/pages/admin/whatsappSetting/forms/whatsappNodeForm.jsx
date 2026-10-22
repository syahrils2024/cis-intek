import { z } from 'zod';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { useMemo, useEffect } from 'react';
import { useBoolean } from '@hooks/use-boolean';
import { Form, Field } from '@components/hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { LoadingButton } from '@mui/lab';
import { Stack, Dialog, Button, DialogTitle, DialogContent, DialogActions } from '@mui/material';

import { whatsappNodeRepository } from 'src/repositories';

import useWhatsappSettingStore from '../whatsappSetting.store';

/**
 *
 * @param {{show: boolean, onRemove: void, onClose: void, selectedItem?: import('src/repositories/whatsappNode').WhatsappNode}} props
 * @returns
 */
export default function WhatsappNodeForm({
  show,
  onClose,
  selectedItem,
  onRemove,
  isClone = false,
}) {
  const loading = useBoolean(false);
  const store = useWhatsappSettingStore();
  const availableRemove = useBoolean(false);

  const defaultValues = {
    id: '',
    title: '',
    groupId: [],
    phone: '',
    description: '',
    autoStart: true,
  };

  const methods = useForm({ defaultValues, resolver: zodResolver(schemaValidator) });
  const { handleSubmit } = methods;

  const groupList = useMemo(() =>
    store.whatsappGroups.map((e) => ({ label: e.name, value: e._id }))
  );

  const handleWa = () => {};

  const submit = async (data) => {
    try {
      loading.onTrue();

      const isUpdate = !!data.id && !isClone;

      if (isUpdate) {
        const result = await whatsappNodeRepository.updateWhatsappNodeData(data.id, data);
      } else {
        const result = await whatsappNodeRepository.createWhatsappNode({
          ...data,
          id: !data.id ? undefined : data.id,
        });
      }
      toast.info('Berhasil disimpan');
      onClose(true);
    } catch (error) {
      toast.error(error.message);
    } finally {
      loading.onFalse();
    }
  };

  const prefetchEdit = async () => {
    try {
      availableRemove.onTrue();
      methods.setValue('title', selectedItem.title);
      if (isClone) methods.setValue('title', `${selectedItem.title} (Clone)`);
      if (isClone) methods.setValue('autoStart', false);
      methods.setValue('id', selectedItem._id);
      methods.setValue('phone', selectedItem.phone);
      methods.setValue(
        'groupId',
        selectedItem.groups.map((e) => e._id)
      );
      methods.setValue('description', selectedItem.description);
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (!show) {
      methods.reset();
      availableRemove.onFalse();
      return;
    }

    if (selectedItem) prefetchEdit();
  }, [show]);

  return (
    <Form methods={methods}>
      <Dialog open={show} onClose={onClose} fullWidth maxWidth="sm" scroll="paper">
        <DialogTitle>Form Whatsapp</DialogTitle>
        <DialogContent>
          <Stack spacing={2} className="tw-py-1 tw-relative">
            <Field.Text name="title" label="Nama Item" />
            <Field.Text name="phone" label="Nomor WA" />
            <div className="tw-flex tw-flex-col tw-mt-2">
              <Field.MultiSelect name="groupId" label="Group" options={groupList} />
            </div>
            <Field.Text name="description" label="Nama Perangkat" />
            <Field.Switch name="autoStart" label="Auto Start" />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Stack direction="row" justifyContent="space-between" spacing={2} className="tw-w-full">
            <Button
              color="error"
              variant="contained"
              onClick={onRemove}
              disabled={!availableRemove.value}
            >
              Hapus
            </Button>
            <Stack direction="row">
              <Button color="error" onClick={onClose}>
                Tutup
              </Button>
              <LoadingButton
                loading={loading.value}
                color="success"
                variant="contained"
                onClick={handleSubmit(submit)}
              >
                Submit
              </LoadingButton>
            </Stack>
          </Stack>
        </DialogActions>
      </Dialog>
    </Form>
  );
}

const schemaValidator = z.object({
  id: z.string().optional(),
  title: z.string().min(1, 'Title tidak boleh kosong'),
  phone: z
    .string()
    .min(1, 'Nomor tidak boleh kosong')
    .regex(
      /^08[1-9][0-9]{7,10}$/,
      'Nomor wa tidak valid (harus diawali 08 dan berjumlah 11–13 digit)'
    ),
  groupId: z.array(z.string()).optional(),
  description: z.string().optional(),
  autoStart: z.boolean().optional(),
});
