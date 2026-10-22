import { Iconify } from '@components/iconify';
import Overloading from '@components/overloading';
import { forwardRef, useImperativeHandle } from 'react';

import { Stack, Button, MenuItem, TextField, IconButton } from '@mui/material';

import 'src/extension/number';
import 'src/extension/string';

/**
 * @typedef {import('src/repositories/addons').AddonsArea} AddonsArea
 */

const CustomerFormAddonsItems = forwardRef(
  ({ addons = [], setAddons, addonsList = [], loading, disabled = false }, ref) => {
    /**
     * Set Addons Items
     * @param {AddonsArea[]} items
     */
    function setAddonsItems(items) {
      setAddons(items);
    }

    function onChangeAddonsItems(index, _id) {
      const newAddons = [...addons];
      const currentAddonsItem = addonsList.find((item) => item._id === _id);
      if (!currentAddonsItem) {
        return;
      }
      newAddons[index] = { addons: currentAddonsItem._id, price: currentAddonsItem.price };
      setAddons(newAddons);
    }

    function removeAddonsItem(index) {
      const newAddons = [...addons];
      newAddons.splice(index, 1);
      setAddons(newAddons);
    }

    function addAddonsItem() {
      const newAddons = [...addons];
      newAddons.push({ _id: '', price: 0 });
      setAddons(newAddons);
    }

    useImperativeHandle(ref, () => ({
      setAddonsItems,
      onChangeAddonsItems,
      removeAddonsItem,
      addAddonsItem,
    }));

    return (
      <div className="tw-p-4 tw-flex tw-flex-col tw-gap-3 tw-ring-1 tw-ring-gray-400 tw-rounded tw-w-full tw-relative">
        <Overloading loading={loading} />
        <Stack spacing={2}>
          <div className="tw-text-xs tw-font-semibold">Addons</div>
          {addons.map((item, index) => (
            <div key={index} className="tw-flex tw-flex-row tw-items-center tw-gap-2">
              <TextField
                value={item.addons}
                onChange={(e) => onChangeAddonsItems(index, e.target.value)}
                select
                fullWidth
                inputProps={{ readOnly: disabled }}
                size="small"
              >
                <MenuItem value="">Pilih Addon</MenuItem>
                {addonsList.map((addon) => (
                  <MenuItem key={addon._id} value={addon._id}>
                    {addon.category} - {addon.variantName} (Rp.{' '}
                    {addon.price.toString().toNumber().formatCurrency()})
                  </MenuItem>
                ))}
              </TextField>
              {!disabled ? (
                <IconButton size="small" variant="outlined" onClick={() => removeAddonsItem(index)}>
                  <Iconify icon="mdi:trash-can-outline" />
                </IconButton>
              ) : null}
            </div>
          ))}
        </Stack>
        {!disabled ? (
          <div className="tw-flex tw-flex-row tw-items-center tw-justify-end">
            <Button size="small" variant="outlined" onClick={() => addAddonsItem()}>
              + Addons
            </Button>
          </div>
        ) : null}
      </div>
    );
  }
);

export default CustomerFormAddonsItems;
