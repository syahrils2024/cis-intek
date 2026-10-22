/**
 * @typedef {import("src/repositories/customer").CustomerListFromEngineer} Customer
 * @typedef {import('src/stores/userStore').UserStore} UserStore
 * @typedef {import('src/repositories/user').User} User
 */

import { z } from 'zod';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { useMemo, useEffect } from 'react';
import { useBoolean } from '@hooks/use-boolean';
import { connect, useDispatch } from 'react-redux';
import { Form, Field } from '@components/hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { LoadingButton } from '@mui/lab';
import {
  Dialog,
  useTheme,
  MenuItem,
  DialogTitle,
  DialogActions,
  useMediaQuery,
  DialogContent,
} from '@mui/material';

import { setEngineer } from 'src/stores/userStore';
import { userRepository, ticketRepository } from 'src/repositories';

/**
 * @param {{customer: Customer; show: boolean; onClose: () => void; engineers: User[]}} props
 */
function TicketForm({ customer, show, onClose, engineers }) {
  const theme = useTheme();
  const dispatch = useDispatch();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const loading = useBoolean(false);
  const ticketTypes = [
    { label: 'Lainnya', value: 'other' },
    { label: 'Perbaikan', value: 'maintenance' },
    { label: 'Kendala Jaringan', value: 'internet_trouble' },
    { label: 'Upgrade Internet', value: 'upgrade_request' },
    { label: 'Dismantle', value: 'dismaintenance' },
  ];

  const defaultValues = {
    description: '',
    ticketType: 'maintenance',
    engineers: [],
  };

  const methods = useForm({ defaultValues, resolver: zodResolver(schemaValidator) });
  const { handleSubmit } = methods;

  async function prefetchEngineer() {
    try {
      const snapshotUser = await userRepository.getUserByPrivilege('engineer');
      dispatch(setEngineer(snapshotUser));
    } catch (error) {
      toast.error(error.message);
    }
  }

  useEffect(() => {
    if (!show) {
      methods.reset();
      return;
    }
    if (show) {
      if (engineers.length <= 0) prefetchEngineer();
    }
  }, [show]);

  const engineerList = useMemo(() =>
    engineers
      .filter((e) => e.status !== 'inactive')
      .map((e) => ({ label: e.fullname, value: e._id }))
  );

  const submit = handleSubmit(async (data) => {
    loading.onTrue();
    try {
      await ticketRepository.submit({
        customerId: customer._id,
        description: data.description,
        engineers: data.engineers,
        ticketType: data.ticketType,
      });
      toast.success('Berhasil membuat tiket');
      onClose();
    } catch (error) {
      toast.error(error.message);
    } finally {
      loading.onFalse();
    }
  });

  return (
    <Form methods={methods}>
      <Dialog open={show} fullWidth maxWidth="sm" fullScreen={isMobile}>
        <DialogTitle>Form E-Ticket</DialogTitle>
        <DialogContent>
          <div className="tw-flex tw-flex-col tw-gap-2">
            <div className="tw-flex tw-flex-col">
              <span className="tw-text-xs tw-text-gray-500">Customer ID</span>
              <span className="tw-text-xs tw-font-medium">{customer?.customerId ?? '-'}</span>
            </div>
            <div className="tw-flex tw-flex-col">
              <span className="tw-text-xs tw-text-gray-500">Nama Lengkap</span>
              <span className="tw-text-xs tw-font-medium">{customer?.fullname ?? '-'}</span>
            </div>
            <div className="tw-flex tw-flex-col">
              <span className="tw-text-xs tw-text-gray-500">ODP</span>
              <span className="tw-text-xs tw-font-medium">{customer?.odpName ?? '-'}</span>
            </div>
            <div className="tw-flex tw-flex-col">
              <span className="tw-text-xs tw-text-gray-500">POP</span>
              <span className="tw-text-xs tw-font-medium">{customer?.areaData?.title ?? '-'}</span>
            </div>
            <div className="tw-flex tw-flex-col tw-mt-4">
              <Field.Text label="Jenis Tiket" name="ticketType" select size="small">
                {ticketTypes.map((t, i) => (
                  <MenuItem key={i} value={t.value}>
                    {t.label}
                  </MenuItem>
                ))}
              </Field.Text>
            </div>
            <div className="tw-flex tw-flex-col tw-mt-2">
              <Field.MultiSelect
                name="engineers"
                label="Teknisi"
                options={engineerList}
                size="small"
              />
            </div>
            <div className="tw-flex tw-flex-col tw-mt-2">
              <Field.Text label="Deskripsi" name="description" maxRows={2} multiline minRows={2} />
            </div>
          </div>
        </DialogContent>
        <DialogActions>
          <LoadingButton color="error" variant="text" loading={loading.value} onClick={onClose}>
            Batal
          </LoadingButton>
          <LoadingButton
            color="primary"
            variant="contained"
            loading={loading.value}
            onClick={submit}
          >
            Kirim
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </Form>
  );
}

const mapStateToProps = (state) => ({ engineers: state.userStore.engineer });
export default connect(mapStateToProps)(TicketForm);

const schemaValidator = z.object({
  description: z.string(),
  ticketType: z.string(),
  engineers: z.array(z.string()).min(1, 'Pilih minimal 1 teknisi'),
});
