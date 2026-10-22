import dayjs from 'dayjs';
import { toast } from 'sonner';
import { Iconify } from '@components/iconify';
import { useBoolean } from '@hooks/use-boolean';
import { useState, useEffect, forwardRef } from 'react';

import { DatePicker } from '@mui/x-date-pickers';
import {
  Stack,
  Button,
  useTheme,
  MenuItem,
  TextField,
  IconButton,
  useMediaQuery,
} from '@mui/material';

import 'src/extension/number';
import 'src/extension/string';
import { addonsRepository } from 'src/repositories';
import { useChangePlanAddonsFormStore } from 'src/stores/changePlanAddonsForm';

/**
 * @typedef {import('src/repositories/addons').AvailableAddonsForCustomer} AvailableAddonsForCustomer
 * @typedef {import('src/stores/changePlanAddonsForm').ChangePlanAddonsFormStore} ChangePlanAddonsFormStore
 */

/**
 * @typedef {Object} AddonsForm
 * @property {string} variantId
 * @property {string} price
 * @property {Dayjs} start
 */

/**
 * @param {{customerId: string; addons: any}} param0
 */

const ChangePlanDialogAddons = forwardRef(({ customerId, addons }, ref) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const loading = useBoolean(false);
  /** @type {[AvailableAddonsForCustomer[], void]} */
  const [addonsAvailable, setAddonsAvailable] = useState([]);
  /** @type {ChangePlanAddonsFormStore} */
  const { customerAddons, setCustomerAddons } = useChangePlanAddonsFormStore();

  function addAddons() {
    const copy = [...customerAddons];
    copy.push({
      variantId: '',
      price: '0',
      start: dayjs(new Date()),
    });
    setCustomerAddons(copy);
  }

  function setAddons(index, { price, variantId, start }) {
    const copy = [...customerAddons];
    if (price) {
      copy[index].price = price.toString().toNumber().formatCurrency();
    }
    if (variantId) {
      const item = addonsAvailable.find((a) => a._id === variantId);
      copy[index].variantId = variantId;
      copy[index].price = item.price?.formatCurrency() ?? '0';
    }
    if (start) {
      copy[index].start = start;
    }
    setCustomerAddons(copy);
  }

  function removeAddons(index) {
    const copy = [...customerAddons];
    copy.splice(index, 1);
    setCustomerAddons(copy);
  }

  async function prefetch() {
    if (!customerId) return;
    loading.onTrue();
    try {
      const snapshot = await addonsRepository.getAvailableAddonsCustomer(customerId);
      setAddonsAvailable(snapshot);
    } catch (error) {
      toast.error(error.message);
    } finally {
      loading.onFalse();
    }
  }

  useEffect(() => {
    prefetch();
  }, []);

  return (
    <Stack spacing={2}>
      {customerAddons.map((item, i) => (
        <div
          className="tw-ring-1 tw-ring-gray-400 tw-gap-2 tw-p-5 tw-flex tw-flex-col tw-rounded-lg tw-items-end"
          key={i}
        >
          <div className="tw-flex tw-flex-row tw-items-center tw-justify-between tw-w-full">
            <span className="tw-text-xs tw-font-semibold">Addons {i + 1}</span>
            <IconButton color="error" onClick={() => removeAddons(i)}>
              <Iconify icon="mdi:minus" />
            </IconButton>
          </div>

          <Stack className="tw-w-full" spacing={0.5}>
            <span className="tw-text-xs">Variant</span>
            <TextField
              size="small"
              fullWidth
              value={item.variantId}
              select
              onChange={(e) => setAddons(i, { variantId: e.target.value })}
            >
              {addonsAvailable.map((a, j) => (
                <MenuItem key={j} value={a._id}>
                  <span className="tw-text-xs">
                    {a.category} - {a.variantName} (Rp. {a.price.formatCurrency()})
                  </span>
                </MenuItem>
              ))}
            </TextField>
          </Stack>
          <div className="tw-flex tw-flex-col md:tw-flex-row tw-gap-4 tw-w-full">
            <Stack className="tw-w-full" spacing={0.5}>
              <span className="tw-text-xs">Mulai</span>
              <DatePicker
                value={item.start}
                slotProps={{ textField: { size: 'small' } }}
                onChange={(value) => setAddons(i, { start: dayjs(value.toDate()) })}
              />
            </Stack>
            <Stack className="tw-w-full" spacing={0.5}>
              <span className="tw-text-xs">Harga</span>
              <TextField
                size="small"
                fullWidth
                value={item.price}
                onChange={(e) => setAddons(i, { price: e.target.value })}
              />
            </Stack>
          </div>
        </div>
      ))}
      <div className="tw-flex tw-flex-row tw-items-center tw-justify-end">
        <Button variant="outlined" color="success" size="small" onClick={() => addAddons()}>
          <Iconify icon="mdi:plus" /> Addons
        </Button>
      </div>
    </Stack>
  );
});

export default ChangePlanDialogAddons;
