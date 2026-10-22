/**
 * @typedef {import("src/stores/paymentMethodStore").PaymentMethod} PaymentMethod
 * @typedef {import('src/stores/paymentMethodStore').PaymentMethodStore} PaymentMethodStore
 */

import { toast } from 'sonner';
import { Icon } from '@iconify/react';
import { useState, useEffect } from 'react';
import { useConfirm } from 'material-ui-confirm';
import Overloading from '@components/overloading';
import { connect, useDispatch } from 'react-redux';
import PaymentMethodTable from '@components/paymentMethod/table';
import PaymentMethodMobileCard from '@components/paymentMethod/mobileCard';
import PaymentMethodFormDialog from '@components/paymentMethod/formDialog';

import Grid from '@mui/material/Unstable_Grid2';
import { Button, useTheme, Typography, useMediaQuery } from '@mui/material';

import { depositMethodRepository } from 'src/repositories';
import { paymentMethodStoreSetStateMulti } from 'src/stores/paymentMethodStore';
/**
 * @param {PaymentMethodStore} props -- react props
 */
function PaymentMethod({ transfer, cash, ewallet }) {
  const theme = useTheme();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  /** @type {[PaymentMethod, void]} */
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const items = [...cash, ...transfer, ...ewallet];
  const confirm = useConfirm();

  const prefetch = async () => {
    setLoading(true);
    const snapshotCash = await depositMethodRepository.getPaymentMethod('cash').catch((err) => {
      toast.error(err.message);
      return [];
    });

    const snapshotTransfer = await depositMethodRepository
      .getPaymentMethod('transfer')
      .catch((err) => {
        toast.error(err.message);
        return [];
      });

    const snapshotEwallet = await depositMethodRepository
      .getPaymentMethod('ewallet')
      .catch((err) => {
        toast.error(err.message);
        return [];
      });

    dispatch(
      paymentMethodStoreSetStateMulti([
        { key: 'cash', value: snapshotCash },
        { key: 'transfer', value: snapshotTransfer },
        { key: 'ewallet', value: snapshotEwallet },
      ])
    );

    setLoading(false);
  };

  const onCloseForm = () => {
    setShowForm(false);
    setSelectedPaymentMethod(null);
  };

  /** @param {PaymentMethod} item */
  const onEdit = (item) => {
    setSelectedPaymentMethod(item);
    setShowForm(true);
  };

  /**
   * @param {PaymentMethod} data
   */
  const handlerSubmit = async (data) => {
    setLoading(true);
    data.id = selectedPaymentMethod?._id ?? null;
    setShowForm(false);
    setSelectedPaymentMethod(null);
    try {
      await depositMethodRepository.upsertPaymentMethod(data);
      await prefetch();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  async function remove(data) {
    try {
      await confirm({
        title: 'Hapus Metode Pembayaran',
        description: `Apakah anda ingin menghapus metode pembayaran ${data.title} ?`,
        confirmationText: 'Hapus',
        cancellationText: 'Batal',
        confirmationButtonProps: { color: 'error', variant: 'text', size: 'small' },
        cancellationButtonProps: { color: 'primary', variant: 'contained', size: 'small' },
      });

      await depositMethodRepository.removePaymentMethod(data._id);

      toast.success('Berhasil menghapus');
      prefetch();
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
    }
  }

  useEffect(() => {
    if (transfer.length <= 0 || cash.length <= 0) prefetch();
  }, []);

  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  return (
    <>
      <div className=" tw-flex tw-flex-col tw-px-5 tw-container tw-w-full tw-mx-auto tw-items-center tw-justify-center">
        {/* Header Page */}
        <div className="tw-flex tw-flex-col lg:tw-flex-row tw-w-full tw-items-center tw-justify-between tw-gap-2">
          <Grid container spacing={2} className="tw-w-full">
            <Grid xs={9}>
              <Typography variant="h5">Daftar Metode Pembayaran</Typography>
            </Grid>
            <Grid xs={3} className="tw-flex tw-items-center tw-justify-end">
              <Button
                onClick={() => setShowForm(true)}
                variant="contained"
                color="success"
                className="tw-self-end"
              >
                <Icon icon="ic:baseline-plus" fontSize={20} /> {!isMobile && 'Tambah Item'}
              </Button>
            </Grid>
          </Grid>
        </div>
        {/* End Header Page */}
        {/* Content */}
        <div className="tw-mt-4 tw-flex tw-w-full tw-relative tw-flex-col tw-gap-4">
          <Overloading loading={loading} />
          {isMobile ? (
            items.map((item, i) => (
              <PaymentMethodMobileCard
                key={i}
                item={item}
                onEdit={onEdit}
                onRemove={(data) => remove(data)}
              />
            ))
          ) : (
            <PaymentMethodTable items={items} onEdit={onEdit} onRemove={(data) => remove(data)} />
          )}
        </div>
        {/* End Content */}
      </div>
      <PaymentMethodFormDialog
        show={showForm}
        onClose={onCloseForm}
        onSubmit={handlerSubmit}
        selectedData={selectedPaymentMethod}
      />
    </>
  );
}

const mapStateToProps = (state) => state.paymentMethodStore;

export default connect(mapStateToProps)(PaymentMethod);
