import { Stack, useTheme, TextField, useMediaQuery, CircularProgress } from '@mui/material';

/**
 * Acs Chart Filter Component
 * @param {Object} param0
 * @param {string} param0.areaName
 * @param {Function} param0.onPickArea
 * @param {string|null} param0.areaErrorMessage
 * @param {boolean} param0.loading
 */
export default function AcsChartFilter({ areaName, onPickArea, areaErrorMessage, loading = false }) {
  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down('md'));
  return (
    <Stack
      direction={mobile ? 'column' : 'row'}
      spacing={2}
      alignItems="center"
      justifyContent="space-between"
    >
      <div className="tw-flex tw-flex-row tw-items-center tw-gap-4">
        <span className="tw-text-lg tw-font-bold">Dashboard ACS</span>
        {loading ? <CircularProgress size={20} /> : null}
      </div>
      <TextField
        label="Area"
        value={areaName}
        onClick={onPickArea}
        error={Boolean(areaErrorMessage)}
        helperText={areaErrorMessage}
        size="small"
      />
    </Stack>
  );
}
