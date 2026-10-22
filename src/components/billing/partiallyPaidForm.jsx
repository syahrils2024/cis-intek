import { useBoolean } from '@hooks/use-boolean';
import { useRef, useState, forwardRef, useImperativeHandle } from 'react';

import {
  Dialog,
  Button,
  useTheme,
  TextField,
  DialogTitle,
  DialogContent,
  DialogActions,
  useMediaQuery,
} from '@mui/material';
/**
 * @typedef {import('src/repositories/subscription').Billing} Billing
 */

import { toast } from 'sonner';
import { useConfirm } from 'material-ui-confirm';

import 'src/extension/number';
import 'src/extension/string';

const PartiallyPaidForm = forwardRef((props, ref) => {
  const confirm = useConfirm();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  /**
   * @type {[Billing[], (data: Billing[]) => void]}
   */
  const [billingList, setBillingList] = useState([]);
  const [amounts, setAmounts] = useState([]);

  /**
   * @type {{current: (data: {billing: string; amount: number}[] => void)}}
   */
  const resolver = useRef();

  const showDialog = useBoolean(false);

  function reset() {
    setAmounts([]);
    setBillingList([]);
  }

  function validate() {
    const result = billingList.map((billing, i) => {
      const paidAmount = amounts[i].toString().toNumber();
      if (paidAmount > billing.amount)
        throw new Error(`Jumlah Pembayaran ${billing.services[0]} melebihi tagihan`);

      return paidAmount;
    });

    if (result.filter((r) => r === 0).length === billingList.length)
      throw new Error('pembayaran tidak boleh kosong');
  }

  async function submit() {
    try {
      validate();
      await confirm({
        title: 'Konfirmasi',
        description: 'Apakah anda ingin melanjutkan pembayaran partially',
        confirmationText: 'Ya',
        cancellationText: 'Tidak',
      });
      const snapshotData = billingList.map((e, i) => ({
        billing: e._id,
        amount: amounts[i].toString().toNumber(),
      }));

      resolver.current(snapshotData);
      showDialog.onFalse();
      reset();
    } catch (error) {
      toast.error(error.message);
    }
  }

  function close() {
    resolver.current();
    showDialog.onFalse();
    reset();
  }

  /**
   * @param {Billing[]} billingListData
   */
  function open(billingListData) {
    setBillingList(billingListData);

    const snapshotAmount = billingListData.map((e) => '0');
    setAmounts(snapshotAmount);

    showDialog.onTrue();

    return new Promise((resolve) => {
      resolver.current = resolve;
    });
  }

  /**
   * @param {Event} e event
   * @param {number} i index
   */
  function setPayAmount(e, i) {
    const formatNumber = e.target.value.toString().toNumber().formatCurrency();
    const copy = { ...amounts };
    copy[i] = formatNumber;
    setAmounts(copy);
  }

  useImperativeHandle(ref, () => ({ open }));

  return (
    <Dialog open={showDialog.value} fullWidth maxWidth="md" fullScreen={isMobile}>
      <DialogTitle>Input Jumlah Pembayaran Sebagian (Partially)</DialogTitle>
      <DialogContent>
        <div className="tw-flex tw-flex-col tw-gap-4 tw-p-5">
          {billingList.map((billing, i) => (
            <div
              className="tw-flex tw-flex-col md:tw-flex-row tw-ring-1 tw-ring-gray-400 tw-p-4 tw-gap-4 tw-w-full tw-rounded-lg "
              key={i}
            >
              <TextField
                fullWidth
                value={billing.amount.toString().toNumber().formatCurrency()}
                label={`Total Tagihan ${billing.services[0]}`}
                size="small"
                color="primary"
                readOnly
              />
              <div className="md:tw-w-0.5 md:tw-h-10 tw-w-full tw-h-0.5 tw-bg-gray-400" />
              <TextField
                fullWidth
                value={amounts[i]}
                label="Jumlah yang dibayar"
                size="small"
                color="primary"
                onChange={(e) => setPayAmount(e, i)}
              />
            </div>
          ))}
        </div>
      </DialogContent>
      <DialogActions>
        <Button color="error" variant="text" onClick={() => close()}>
          Tutup
        </Button>
        <Button color="success" variant="contained" onClick={() => submit()}>
          Bayar Partially
        </Button>
      </DialogActions>
    </Dialog>
  );
});

export default PartiallyPaidForm;
