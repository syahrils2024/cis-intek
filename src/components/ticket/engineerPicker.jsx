/**
 * @typedef {import("src/repositories/user").User} User
 * @typedef {import('src/repositories/installation').InstallationRequest} InstallationRequest
 */

import { z } from 'zod';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { useBoolean } from '@hooks/use-boolean';
import { createSelector } from '@reduxjs/toolkit';
import { Form, Field } from '@components/hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDispatch, useSelector } from 'react-redux';
import { useRef, forwardRef, useImperativeHandle } from 'react';

import { Stack, Button, Dialog, DialogTitle, DialogActions, DialogContent } from '@mui/material';

import { userRepository } from 'src/repositories';
import { setEngineer } from 'src/stores/userStore';

export const TicketEngineerPicker = forwardRef((props, ref) => {
  const dispatch = useDispatch();
  const show = useBoolean(false);

  const resolver = useRef();

  const engineerSelector = createSelector([(state) => state.userStore], (userStore) =>
    userStore.engineer
      .filter((e) => e.status !== 'inactive')
      .map((e) => ({ label: e.fullname, value: e._id }))
  );

  /** @type {User[]} */
  const engineerList = useSelector(engineerSelector);

  /**
   * @param {string} engineerIds
   */
  const prefetch = async (engineerIds) => {
    try {
      if (engineerList.length <= 0) {
        const snapshotEngineer = await userRepository.getUserByPrivilege('engineer');
        dispatch(setEngineer(snapshotEngineer));
      }

      methods.setValue('engineer', engineerIds ?? []);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const defaultValues = {
    engineer: [],
  };

  const validator = z.object({
    engineer: z.array(z.string()).min(1, { message: 'Minimal pilih 1 teknisi' }),
  });

  const methods = useForm({ defaultValues, resolver: zodResolver(validator) });
  const { handleSubmit } = methods;

  const onSubmit = handleSubmit((data) => {
    show.onFalse();
    resolver.current(data.engineer);
    methods.reset();
  });

  const close = () => {
    show.onFalse();
    resolver.current();
    methods.reset();
  };

  /**
   * @param {*} engineerIds
   */
  const open = (engineerIds) => {
    prefetch(engineerIds);
    show.onTrue();
    return new Promise((resolve) => {
      resolver.current = resolve;
    });
  };

  useImperativeHandle(ref, () => ({ open }));

  return (
    <Form methods={methods}>
      <Dialog open={show.value} fullWidth maxWidth="sm">
        <DialogTitle>Ganti Teknisi</DialogTitle>
        <DialogContent>
          <Stack className="tw-py-2">
            <Field.MultiSelect name="engineer" label="Teknisi" options={engineerList} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button color="error" onClick={close}>
            Batal
          </Button>
          <Button color="success" onClick={onSubmit}>
            Ganti
          </Button>
        </DialogActions>
      </Dialog>
    </Form>
  );
});
