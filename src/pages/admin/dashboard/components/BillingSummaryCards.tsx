// @ts-nocheck

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';

import { fCurrency } from 'src/utils/format-number';

import MaskedValue from './MaskedValue';
import { BILLING_CARD_CONFIG } from '../dashboard.constants';

// ----------------------------------------------------------------------

export default function BillingSummaryCards({ summary = {}, loading, showFinanceData = true }) {
  const total = summary?.amount ?? 0;

  return (
    <Stack spacing={3} direction={{ xs: 'column', md: 'row' }}>
      {BILLING_CARD_CONFIG.map(({ key, label, color }) => {
        const value = summary?.[key] ?? 0;
        const percent = total > 0 ? Math.min(Math.round((value / total) * 100), 100) : 0;

        return (
          <Card key={key} sx={{ p: 3, flex: 1 }}>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1.5 }}>
              {label}
            </Typography>

            {loading ? (
              <Skeleton variant="text" width={140} height={40} />
            ) : (
              <MaskedValue
                show={showFinanceData}
                typographyProps={{ variant: 'h5', sx: { fontFamily: 'monospace', letterSpacing: -0.5 } }}
              >
                {fCurrency(value)}
              </MaskedValue>
            )}

            <Typography variant="caption" sx={{ color: `${color}.main`, display: 'block', mt: 1 }}>
              {percent}% dari total billing
            </Typography>

            <Box sx={{ mt: 2 }}>
              <LinearProgress
                variant="determinate"
                value={percent}
                color={color}
                sx={{ height: 6, borderRadius: 10 }}
              />
            </Box>
          </Card>
        );
      })}
    </Stack>
  );
}
