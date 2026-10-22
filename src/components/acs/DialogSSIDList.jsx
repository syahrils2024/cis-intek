import { Iconify } from '@components/iconify';
import { useExpansionToggle } from '@hooks/use-expansion-toggle';

import Grid from '@mui/material/Unstable_Grid2';
import {
  Stack,
  Button,
  useTheme,
  TextField,
  Accordion,
  useMediaQuery,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';

import { ConnectedDeviceData } from './ConnectedDeviceData';

/**
 * @typedef {import("@/repositories/acs").AcsSSID} AcsSSID
 * @typedef {import('@/repositories/acs').ACSSecurity} ACSSecurity
 * /


/**
 * @callback ChangeValueCB
 * @param {number} index
 * @param {{key: 'password' | 'active' | 'ssid'; value: any}}
*/

/**
 * @callback SaveSSID
 * @param {number} index
 */

/**
 *
 * @param {{ssidList: AcsSSID[]; changeValue: ChangeValueCB; save: SaveSSID; securityList: ACSSecurity[]}} param0
 */

export default function AcsDialogSSIDList({ ssidList, changeValue, save, securityList = [] }) {
  const expansion = useExpansionToggle();
  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Grid container gap={2}>
      {ssidList.map((ssid, i) => (
        <Grid xs={12} key={i}>
          <div className="tw-p-3 tw-ring-1 tw-ring-gray-400 tw-rounded-lg">
            <Grid container spacing={2}>
              <Grid xs={12} item>
                <span className="tw-font-semibold tw-text-xs">SSID {i + 1}</span>
              </Grid>
              {/* <Grid xs={12} md={1.5}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={ssid.active}
                      onChange={() => changeValue(i, { key: 'active', value: !ssid.active })}
                    />
                  }
                  label={ssid.active ? 'Active' : 'Inactive'}
                  className="tw-my-auto"
                />
              </Grid> */}
              <Grid xs={12} md={5} item>
                <div className="tw-flex tw-flex-col">
                  <TextField
                    value={ssid.ssid}
                    label="Nama Wifi"
                    variant="filled"
                    fullWidth
                    size="compact"
                    onChange={(e) => changeValue(i, { key: 'ssid', value: e.target.value })}
                  />
                </div>
              </Grid>
              <Grid xs={12} md={5} item>
                <div className="tw-flex tw-flex-col">
                  <TextField
                    value={ssid.password}
                    label="Password"
                    variant="filled"
                    fullWidth
                    size="compact"
                    onChange={(e) => changeValue(i, { key: 'password', value: e.target.value })}
                  />
                </div>
              </Grid>
              {/* <Grid xs={12} md={2}>
                <div className="tw-flex tw-flex-col">
                  <TextField
                    select
                    label="Security"
                    placeholder="Security"
                    value={ssid.security}
                    onChange={(e) => changeValue(i, { key: 'security', value: e.target.value })}
                    variant="filled"
                    fullWidth
                  >
                    {securityList?.map((security) => (
                      <MenuItem key={security.value} value={security.value}>
                        {security.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </div>
              </Grid> */}
              <Grid xs={12} md={2} item>
                {/* <div className="tw-flex tw-flex-row tw-gap-2 tw-items-center tw-justify-end"> */}
                <Button
                  variant="outlined"
                  size="small"
                  color="primary"
                  className="tw-gap-1"
                  onClick={() => save(i)}
                >
                  <Iconify icon="ic:outline-save" />
                  SIMPAN
                </Button>
                {/* </div> */}
              </Grid>
            </Grid>
            {(ssid.devices?.length ?? 0) > 0 && (
              <div className="tw-ring-1 tw-ring-gray-300 tw-rounded-lg tw-uppercase tw-w-full tw-mt-2">
                <Accordion
                  expanded={expansion.isIncludes(i)}
                  onChange={() => expansion.toggle(i)}
                  className="tw-w-full"
                >
                  <AccordionSummary>
                    <div className="flex tw-flex-row tw-gap-2 tw-items-center">
                      <Iconify
                        icon="ic:outline-arrow-right"
                        className={[
                          'tw-duration-300',
                          expansion.isIncludes(i) ? 'tw-rotate-90' : 'tw-rotate-0',
                        ].join(' ')}
                      />
                      <span className="tw-text-xs">Connected Device</span>
                    </div>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Stack spacing={1.5}>
                      {mobile ? (
                        <ConnectedDeviceData.Mobile items={ssid.devices || []} />
                      ) : (
                        <ConnectedDeviceData.Table items={ssid.devices || []} />
                      )}
                    </Stack>

                    {/* {ssid.devices.map((item, index) => (
                      <Alert key={index} severity="info" className="tw-mt-2">
                        <div className="tw-w-full tw-flex tw-flex-row tw-items-center tw-gap-2">
                          <span className="tw-text-xs tw-w-full">
                            {item.ipAddress} | {item.macAddress}
                          </span>
                        </div>
                      </Alert>
                    ))} */}
                  </AccordionDetails>
                </Accordion>
              </div>
            )}
          </div>
        </Grid>
      ))}
    </Grid>
  );
}
