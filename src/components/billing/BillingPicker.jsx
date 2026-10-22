import { toast } from 'sonner';
import { useBoolean } from '@hooks/use-boolean';
import Overloading from '@components/overloading';
import { useExpansionToggle } from '@hooks/use-expansion-toggle';
import { useRef, useMemo, useState, forwardRef, useImperativeHandle } from 'react';

import {
  Grid,
  Chip,
  Stack,
  Button,
  Dialog,
  useTheme,
  Checkbox,
  DialogTitle,
  DialogActions,
  DialogContent,
  useMediaQuery,
} from '@mui/material';

import 'src/extension/string';
import 'src/extension/number';
import { customerRepository, subscriptionRepository } from 'src/repositories';

/**
 * @typedef {import('src/repositories/subscription').Billing} Billing
 * @typedef {import('src/repositories/customer').Customer} Customer
 */

const BillingPicker = forwardRef((props, ref) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  /** @type {[Customer, void]} */
  const [customer, setCustomer] = useState(null);

  /** @type {[Billing[], void]} */
  const [billing, setBilling] = useState([]);

  const selectedBilling = useExpansionToggle();
  const resolver = useRef();

  const show = useBoolean();
  const loading = useBoolean();

  const customerHeader = useMemo(() => [
    {
      title: 'ID',
      value: customer?.customerId ?? '-',
    },
    {
      title: 'Pelanggan',
      value: customer?.fullname ?? '-',
    },
    {
      title: 'Whatsapp',
      value: customer?.phone ?? '-',
    },
    {
      title: 'POP / Area',
      value: customer?.areaName ?? '-',
    },
    {
      title: 'ODP',
      value: customer?.ODPName ?? '-',
    },
  ]);

  function reset() {
    setCustomer(null);
    setBilling([]);
    selectedBilling.reset();
  }

  async function prefetch(customerId) {
    loading.onTrue();
    try {
      const snapshotCustomer = await customerRepository.getCustomer(customerId);
      const snapshotBillling = await subscriptionRepository.getBillingList(customerId);
      setCustomer(snapshotCustomer);
      setBilling(snapshotBillling.billings);
    } catch (error) {
      toast.error(error.message);
    } finally {
      loading.onFalse();
    }
  }

  /**
   *
   * @param {string} customerId
   * @param {string[]} [selectedBillingId]
   * @returns
   */
  function open(customerId, selectedBillingId) {
    reset();
    prefetch(customerId);

    if (selectedBillingId) {
      selectedBillingId.forEach((id) => {
        selectedBilling.add(id);
      });
    }

    show.onTrue();
    return new Promise((resolve) => {
      resolver.current = resolve;
    });
  }

  function submit() {
    const ids = selectedBilling.data;
    if (ids.length <= 0) {
      toast.error('Pilih minimal satu billing');
      return;
    }
    const selected = billing.filter((item) => ids.includes(item._id));
    show.onFalse();
    resolver.current?.(selected);
  }

  function close() {
    show.onFalse();
    reset();
    resolver.current?.();
  }

  useImperativeHandle(ref, () => ({
    open,
    close,
  }));

  /**
   * @param {string} status
   * @returns
   */
  function getChipStatus(status) {
    // Switch case color
    const chipColor =
      {
        unpaid: 'warning',
        paid: 'success',
        canceled: 'error',
        partially_paid: 'warning',
      }[status] ?? 'warning';

    return <Chip color={chipColor} variant="soft" size="small" label={status} />;
  }

  return (
    <Dialog open={show.value} fullWidth maxWidth="sm" fullScreen={isMobile} scroll="paper">
      <DialogTitle>Pilih Billing</DialogTitle>
      <DialogContent>
        <Stack spacing={2} className="tw-relative tw-py-2">
          <Overloading loading={loading.value} />
          {/* Headers */}
          <Grid container spacing={2}>
            {customerHeader.map((header, index) => (
              <Grid item xs={12} sm={6} key={index}>
                <Stack spacing={0.1}>
                  <span className="tw-text-xs tw-text-gray-500">{header.title}</span>
                  <span className="tw-text-xs tw-font-semibold">{header.value}</span>
                </Stack>
              </Grid>
            ))}
          </Grid>
          {/* End Headers */}
          {/* Billing Items */}
          <Stack spacing={1.5} className="tw-mt-2">
            {billing.map((item) => (
              <Stack
                key={item.billingId}
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                className={`tw-p-3 tw-rounded-lg tw-cursor-pointer tw-ring-1 ${
                  ['unpaid', 'partially_paid'].includes(item.status) ? '' : 'tw-bg-gray-200'
                }`}
                onClick={() => {
                  const allowToggle = ['unpaid', 'partially_paid'].includes(item.status);
                  if (!allowToggle) {
                    return;
                  }
                  selectedBilling.toggle(item._id);
                }}
              >
                <Stack direction="row" justifyItems="center" alignItems="center" spacing={0.4}>
                  <Checkbox
                    disabled={!['unpaid', 'partially_paid'].includes(item.status)}
                    checked={selectedBilling.isIncludes(item._id)}
                  />
                  <Stack>
                    <span className="tw-text-xs">{item.services.join(', ')}</span>
                    <span className="tw-text-xs">{item.summaryPeriode}</span>
                  </Stack>
                </Stack>
                <Stack spacing={0.5} justifyItems="end" justifyContent="end" alignItems="end">
                  <span className="tw-text-xs">{getChipStatus(item.status)}</span>
                  <span className="tw-text-xs">
                    Rp. {item.amount?.toString().toNumber().formatCurrency()}
                  </span>
                </Stack>
              </Stack>
            ))}
          </Stack>
          {/* End Billing Items */}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button variant="text" color="error" onClick={() => close()}>
          Tutup
        </Button>
        <Button
          disabled={selectedBilling.length <= 0}
          variant="contained"
          color="primary"
          onClick={() => submit()}
        >
          Pilih
        </Button>
      </DialogActions>
    </Dialog>
  );
});

export default BillingPicker;
