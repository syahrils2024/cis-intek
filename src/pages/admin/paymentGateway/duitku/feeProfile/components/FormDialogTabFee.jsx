/**
 * @typedef {import("src/repositories/duitku").DuitkuFee} DuitkuFee
 */

import {
  Grid,
  Stack,
  Checkbox,
  useTheme,
  TextField,
  useMediaQuery,
  InputAdornment,
  FormControlLabel,
} from '@mui/material';

/**
 *
 * @param {{
 * fees: DuitkuFee[],
 * onSetFees: (index: number, data: Partial<DuitkuFee>) => void
 * }} param0
 */
export default function FeeProfileFormDialogTabFee({ fees, onSetFees }) {
  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down('sm'));

  return fees.map((item, index) => (
    <div className="tw-ring-1 tw-ring-gray-500 tw-rounded" key={index}>
      <Stack
        direction={mobile ? 'column' : 'row'}
        spacing={2}
        className="tw-px-2 tw-py-4 tw-items-center"
      >
        <img src={item.imageUrl} alt={item.paymentName} className="tw-w-24 tw-object-contain" />
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Jenis Pembayaran"
              value={`${item.paymentName}`}
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Biaya Tetap"
              value={item.fee.toString().toNumber().formatCurrency()}
              onChange={(e) => {
                onSetFees(index, { fee: e.target.value.toString().toNumber() });
              }}
              size="small"
              slotProps={{
                input: {
                  startAdornment: <InputAdornment position="start">Rp. </InputAdornment>,
                },
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Biaya Persentase (%)"
              value={item.feePercentage.toString()}
              onChange={(e) => {
                const { value } = e.target;
                // Allow: empty, digits, one optional dot, no letters
                if (value === '' || /^-?\d*\.?\d*$/.test(value)) {
                  onSetFees(index, { feePercentage: value.toString() });
                }
              }}
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControlLabel
              label="Active"
              control={
                <Checkbox
                  checked={item.active}
                  onChange={() => onSetFees(index, { active: !item.active })}
                />
              }
            />
          </Grid>
        </Grid>
      </Stack>
    </div>
  ));
}
