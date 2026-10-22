import { Icon } from '@iconify/react';

import { Grid, Button, Checkbox, TextField, FormControlLabel } from '@mui/material';

import { setCustomerEngineerV2Store } from 'src/stores/customerEngineerStoreV2';

const USER_STATUS_LIST = ['active', 'inactive', 'banned'];

/**
 * Filter bar: user status, isolir status, area picker and search input.
 *
 * @param {object} props
 * @param {boolean} props.isMobile
 * @param {string} props.selectedUserStatus
 * @param {string} props.isolated
 * @param {string} props.selectedAreaName
 * @param {string} props.search
 * @param {boolean} props.differenceNetworkConfiguration
 * @param {(action: any) => void} props.dispatch
 * @param {(text: string) => void} props.onSearchChange
 * @param {() => Promise<void>} props.onFilterArea
 * @param {() => Promise<void>} props.onOpenFilterDialog
 * @param {import('react').MutableRefObject<HTMLInputElement>} props.searchRef
 */
export default function NetworkStatusFilter({
  isMobile,
  selectedUserStatus,
  isolated,
  selectedAreaName,
  search,
  differenceNetworkConfiguration = false,
  dispatch,
  onSearchChange,
  onFilterArea,
  onOpenFilterDialog,
  searchRef,
}) {
  return (
    <div className="tw-mb-8">
      <Grid className="tw-w-full tw-pt-10 tw-space-x-2 tw-justify-end" container spacing={2}>
        {!isMobile && (
          <>
            <Grid xs={12} md={3} lg={1.8} item>
              <FormControlLabel
                checked={differenceNetworkConfiguration}
                control={<Checkbox />}
                label="Data Tidak Sesuai"
                onClick={(e) =>
                  dispatch(
                    setCustomerEngineerV2Store({
                      key: 'differenceNetworkConfiguration',
                      value: e.target.checked,
                    })
                  )
                }
              />
            </Grid>
            <Grid xs={12} md={3} lg={1.5} item>
              <TextField
                select
                fullWidth
                size="small"
                value={selectedUserStatus}
                label="Status User"
                variant="filled"
                SelectProps={{ native: true }}
                onChange={(e) =>
                  dispatch(
                    setCustomerEngineerV2Store({
                      key: 'selectedUserStatus',
                      value: e.target.value,
                    })
                  )
                }
                id="select-user-status"
                InputLabelProps={{ htmlFor: `select-user-status` }}
                inputProps={{ id: `select-user-status` }}
              >
                {USER_STATUS_LIST.map((p, i) => (
                  <option key={i} value={p}>
                    {p}
                  </option>
                ))}
              </TextField>
            </Grid>
            <Grid xs={12} md={3} lg={1.5} item>
              <TextField
                select
                fullWidth
                size="small"
                value={isolated}
                label="Status Isolir"
                variant="filled"
                SelectProps={{ native: true }}
                onChange={(e) =>
                  dispatch(setCustomerEngineerV2Store({ key: 'isolated', value: e.target.value }))
                }
              >
                <option value="all">Semua</option>
                <option value="true">Isolir</option>
                <option value="false">Open</option>
              </TextField>
            </Grid>
            <Grid xs={12} md={3} lg={1.5} item>
              <div className="tw-flex tw-flex-row tw-gap-1">
                <TextField
                  fullWidth
                  size="small"
                  label="Area"
                  variant="filled"
                  placeholder="Cari"
                  value={!!selectedAreaName ? selectedAreaName : 'Cari'}
                  readOnly
                  onClick={() => onFilterArea()}
                />
              </div>
            </Grid>
          </>
        )}

        <Grid xs={12} md={3} lg={2} container item>
          <Grid xs={isMobile ? 10 : 12} item className="tw-pr-2">
            <TextField
              fullWidth
              size="small"
              variant="filled"
              label="Cari Pelanggan"
              defaultValue={search}
              onChange={(e) => onSearchChange(e.target.value)}
              inputRef={searchRef}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          {isMobile && (
            <Grid xs={2} item>
              <Button
                className="tw-h-[45px]"
                fullWidth
                color="primary"
                variant="outlined"
                onClick={() => onOpenFilterDialog()}
              >
                <Icon icon="ic:baseline-menu" fontSize={24} />
              </Button>
            </Grid>
          )}
        </Grid>
      </Grid>
    </div>
  );
}
