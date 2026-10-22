import { Field } from '@components/hook-form';

import { Stack, MenuItem } from '@mui/material';

import 'src/extension/number';

import CustomerFormAddonsItems from './AddonsItems';

/**
 * @param {{
 *   methods: any;
 *   packageList: any[];
 *   pickPrice: (packetId: string) => void;
 *   serverAreaId: string;
 *   statusMode: string;
 *   readonlyPackage: boolean;
 *   addons: any[];
 *   setAddons: (addons: any[]) => void;
 *   addonsList: any[];
 *   loadingAddons: { value: boolean };
 *   addonsRef: React.RefObject<any>;
 * }} props
 */
export default function PaketOnuTab({
  methods,
  packageList,
  pickPrice,
  serverAreaId,
  statusMode,
  readonlyPackage,
  addons,
  setAddons,
  addonsList,
  loadingAddons,
  addonsRef,
}) {
  return (
    <Stack spacing={2}>
      <Field.Select
        size="small"
        name="packetPlanId"
        label="Paket"
        inputProps={{ readOnly: readonlyPackage }}
        onChange={(e) => pickPrice(e.target.value)}
      >
        {packageList.map((p, i) => (
          <MenuItem
            key={i}
            value={p._id}
          >
            <div className="tw-pl-2">
              {p.title} - {p?.price?.toString().toNumber().formatCurrency()}
            </div>
          </MenuItem>
        ))}
      </Field.Select>
      <Field.Text
        size="small"
        name="price"
        label="Harga"
        inputProps={{ readOnly: readonlyPackage }}
        InputLabelProps={{ shrink: true }}
        onChange={(e) =>
          methods.setValue('price', e.target.value.toString().toNumber().formatCurrency())
        }
      />
      {['active', 'inactive', 'banned'].includes(statusMode) && (
        <Field.DatePicker
          name="start"
          label="Mulai"
          slotProps={{ textField: { size: 'small' } }}
        />
      )}
      <Field.Text
        type="string"
        fullWidth
        size="small"
        name="routerMac"
        label="ONU MAC"
        InputLabelProps={{ shrink: true }}
      />
      {/* <Field.Text
        type="string"
        fullWidth
        size="small"
        name="gponMac"
        label="GPON Mac"
      /> */}
      <Field.Text
        type="string"
        fullWidth
        size="small"
        name="routerSerialNumber"
        label="GPON SN"
        InputLabelProps={{ shrink: true }}
      />
      <Field.Text
        type="string"
        fullWidth
        size="small"
        name="routerSsid"
        label="SSID"
        InputLabelProps={{ shrink: true }}
      />
      <Field.Text
        type="string"
        fullWidth
        size="small"
        name="routerPassword"
        label="Password (minimal 8 karakter)"
        InputLabelProps={{ shrink: true }}
      />
      <CustomerFormAddonsItems
        ref={addonsRef}
        addons={addons}
        setAddons={setAddons}
        loading={loadingAddons.value}
        addonsList={addonsList}
        disabled={['active', 'inactive', 'banned'].includes(statusMode)}
      />
    </Stack>
  );
}
