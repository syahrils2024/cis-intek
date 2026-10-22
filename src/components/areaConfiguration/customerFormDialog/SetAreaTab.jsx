import { Iconify } from '@components/iconify';
import { Field } from '@components/hook-form';

import Grid from '@mui/material/Unstable_Grid2';
import { Stack, MenuItem, IconButton } from '@mui/material';

/**
 * @param {{
 *   methods: any;
 *   areaList: any[];
 *   odpList: any[];
 *   vlanList: any[];
 *   pickArea: (areaId: string, isReplace: boolean) => void;
 *   statusMode: string;
 *   disableEditNetwork: { value: boolean };
 *   allowModify: boolean;
 *   showOdpForm: { onTrue: () => void };
 * }} props
 */
export default function SetAreaTab({
  methods,
  areaList,
  odpList,
  vlanList,
  pickArea,
  statusMode,
  disableEditNetwork,
  allowModify,
  showOdpForm,
}) {
  return (
    <Stack spacing={2}>
      <Field.Select
        size="small"
        name="serverAreaId"
        label="Area Server"
        onChange={(e) => pickArea(e.target.value, true)}
        inputProps={{
          readOnly: statusMode === 'active' ? false : disableEditNetwork.value,
        }}
      >
        {areaList.map((area, i) =>
          typeof area === 'string' ? (
            <MenuItem key={i} disabled>
              {area}
            </MenuItem>
          ) : (
            <MenuItem key={i} value={area._id}>
              <div className="tw-pl-2">{area.title}</div>
            </MenuItem>
          )
        )}
      </Field.Select>
      <Grid container spacing={1}>
        <Grid xs={allowModify ? 11 : 12}>
          <Field.Autocomplete
            size="small"
            name="serverOdpId"
            label="Server ODP"
            options={odpList?.map((odp) => ({ label: odp.name, value: odp._id }))}
            getOptionLabel={(option) => option.label ?? ''}
            isOptionEqualToValue={(option, value) => option.value === value.value}
          />
        </Grid>
        {allowModify && (
          <Grid xs={1}>
            <IconButton
              disabled={disableEditNetwork.value}
              color="primary"
              onClick={() => showOdpForm.onTrue()}
            >
              <Iconify icon="mdi:add" />
            </IconButton>
          </Grid>
        )}
      </Grid>

      <Field.Select size="small" name="vlanId" label="VLAN">
        {vlanList?.map((vlan, i) => (
          <MenuItem key={i} value={vlan.name}>
            <div className="tw-pl-2">{vlan.name}</div>
          </MenuItem>
        ))}
      </Field.Select>
    </Stack>
  );
}
