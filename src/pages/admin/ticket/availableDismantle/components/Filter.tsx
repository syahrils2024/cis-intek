// @ts-nocheck

import { Stack, useTheme, TextField, useMediaQuery, InputAdornment } from '@mui/material';

import 'src/extension/string';
import 'src/extension/number';

/**
 *
 * @param {{
 * areaTitle: string,
 * onPickArea: () => void,
 * search: string,
 * onChangeSearch: (value: string) => void,
 * packages: import('src/repositories/subscription').Package[],
 * onChangePackage: (packageId: string|null) => void,
 * minimumAmount: number,
 * setMinimumAmount: (value: number) => void,
 * }} param0
 */
export default function AvailableDismantleFilter({
  areaTitle,
  onPickArea,
  search,
  onChangeSearch,
  packages,
  onChangePackage,
  minimumAmount,
  setMinimumAmount,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Stack
      direction={isMobile ? 'column' : 'row'}
      spacing={1}
      justifyContent="end"
      className="tw-w-full"
    >
      <div className="tw-w-full xl:tw-max-w-48">
        <TextField
          fullWidth
          size="small"
          label="Minimal"
          value={minimumAmount.toString().toNumber()}
          onChange={(e) => setMinimumAmount(e.target.value.toString().toNumber())}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <span className="tw-text-xs">Tagihan</span>
              </InputAdornment>
            ),
          }}
        />
      </div>
      <div className="tw-w-full xl:tw-max-w-48">
        <TextField
          fullWidth
          size="small"
          label="Cari"
          value={search}
          onClick={(e) => onChangeSearch(e.target.value)}
        />
      </div>
      <div className="tw-w-full xl:tw-max-w-48">
        <TextField fullWidth size="small" label="Area" value={areaTitle} onClick={onPickArea} />
      </div>
    </Stack>
  );
}
