import { Iconify } from '@components/iconify';
import { Field } from '@components/hook-form';

import { Stack, TextField, IconButton, CircularProgress } from '@mui/material';

/**
 * @param {{
 *   methods: any;
 *   statusMode: string;
 *   usingDynamicIP: { value: boolean };
 *   usingDynamicCustomerId: { value: boolean };
 *   isRandomPppoePassword: { value: boolean };
 *   disableEditNetwork: { value: boolean };
 *   loadingGenerate: { value: boolean };
 *   generateId: () => void;
 * }} props
 */
export default function PPPoENetworkTab({
  methods,
  statusMode,
  usingDynamicIP,
  usingDynamicCustomerId,
  isRandomPppoePassword,
  disableEditNetwork,
  loadingGenerate,
  generateId,
}) {
  return (
    <Stack spacing={2}>
      {['active'].includes(statusMode) || !usingDynamicIP.value ? (
        <Field.Text
          size="small"
          name="ipRemote"
          label="IP Remote"
          // inputProps={{ readOnly: true }}
        />
      ) : null}
      {/* Todo: Fix statusMode */}
      {statusMode?.includes('pending') && usingDynamicCustomerId.value ? (
        <>
          <div className="tw-flex tw-flex-row tw-items-center tw-justify-between tw-w-full tw-gap-2">
            <TextField
              fullWidth
              size="small"
              name="customerId"
              label="Customer ID"
              value="Otomatis"
              inputProps={{
                readOnly: true,
              }}
            />
          </div>
          <TextField
            fullWidth
            size="small"
            name="PPPoEName"
            label="PPPoE Name"
            value="Otomatis"
            inputProps={{ readOnly: true }}
          />
        </>
      ) : (
        <>
          <div className="tw-flex tw-flex-row tw-items-center tw-justify-between tw-w-full tw-gap-2">
            <Field.Text fullWidth size="small" name="customerId" label="Customer ID" />
            {loadingGenerate.value ? (
              <CircularProgress size={22} className="tw-my-auto" />
            ) : (
              <IconButton
                disabled={disableEditNetwork.value}
                color="primary"
                onClick={generateId}
              >
                <Iconify icon="mdi:refresh" />
              </IconButton>
            )}
          </div>
          <Field.Text fullWidth size="small" name="PPPoEName" label="PPPoE Name" />
        </>
      )}
      {/* If is not saved customer, then save make PPPoE Password automatically when isRandomPPPoEPassword is true */}
      {/* Todo: Fix nullableStatusMode */}
      {isRandomPppoePassword.value && statusMode?.includes('pending') ? (
        <TextField
          size="small"
          name="PPPoEPassword"
          label="PPPoE Password"
          value={
            isRandomPppoePassword.value && statusMode?.includes('pending')
              ? 'Otomatis'
              : null
          }
          inputProps={{
            readOnly: true,
          }}
        />
      ) : (
        <Field.Text size="small" name="PPPoEPassword" label="PPPoE Password" />
      )}
    </Stack>
  );
}
