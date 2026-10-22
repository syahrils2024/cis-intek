/**
 * @typedef {import("src/repositories/user").User} User
 * @typedef {import('src/repositories/installation').InstallationRequest} InstallationRequest
 */

import { z } from 'zod';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { useState, useEffect } from 'react';
import { Form, Field } from '@components/hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Stack, Button, Dialog, DialogTitle, DialogActions, DialogContent } from '@mui/material';

import { userRepository, installationRequestRepository } from 'src/repositories';

/**
 * @callback OnPickCallback
 * @param {User} engineer
 */

/**
 * @param {{show: boolean; onPick: OnPickCallback; onClose: void; selectedItem: InstallationRequest}} props
 */
export default function InstallationRequestEngineerPicker({ show, onPick, onClose, selectedItem }) {
  const dispatch = useDispatch();
  // const engineerSelector = createSelector([(state) => state.userStore], (userStore) =>
  //   userStore.engineer
  //     .filter((e) => e.status !== 'inactive')
  //     .map((e) => ({ label: e.fullname, value: e._id }))
  // );

  // /** @type {User[]} */
  // const engineerList = useSelector(engineerSelector);
  const [engineers, setEngineers] = useState([]);

  const prefetch = async () => {
    try {
      const snapshotEngineers = await userRepository.getUserByPrivilege('engineer', {
        area: selectedItem.areaDetail._id,
      });

      const snapshotLo = await userRepository.getUserByPrivilege('liaison_officer', {
        area: selectedItem.areaDetail._id,
      });

      const activeUser = [...snapshotEngineers, ...snapshotLo].filter((e) => e.status === 'active');
      setEngineers(activeUser);

      const currentInstallationRequest =
        await installationRequestRepository.getSomeInstallationRequest(selectedItem._id);

      methods.setValue('engineer', currentInstallationRequest?.engineers ?? []);
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
    onPick(data.engineer);
  });

  useEffect(() => {
    if (!show) {
      methods.reset();
      setEngineers([]);
      return;
    }
    prefetch();
  }, [show]);

  return (
    <Form methods={methods}>
      <Dialog open={show} onClose={onClose} fullWidth maxWidth="sm">
        <DialogTitle>Pilih Teknisi</DialogTitle>
        <DialogContent>
          <Stack className="tw-py-2">
            <Field.MultiSelect
              name="engineer"
              label="Teknisi"
              options={engineers.map((e) => ({ label: e.fullname, value: e._id }))}
              size="small"
              helperText="Pastikan data registrasi telah lengkap, apabila data tidak akan keluar peringatan untuk melengkapi data"
            />
            {/* <Field.Select name="engineer" label="Teknisi">
              <MenuItem disabled value="">
                Pilih Teknisi
              </MenuItem>
              {engineerList.map((e, i) => (
                <MenuItem value={e._id} key={i}>
                  {e.fullname}
                </MenuItem>
              ))}
            </Field.Select> */}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button color="error" onClick={onClose}>
            Batal
          </Button>
          <Button color="success" onClick={onSubmit}>
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </Form>
  );
}
