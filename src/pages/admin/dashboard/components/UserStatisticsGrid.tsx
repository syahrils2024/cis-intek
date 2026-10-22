// @ts-nocheck

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';

import { fNumber } from 'src/utils/format-number';

import { USER_CARD_CONFIG } from '../dashboard.constants';

// ----------------------------------------------------------------------

export default function UserStatisticsGrid({ data = {}, loading, showFinanceData = true }) {
  return (
    <Stack spacing={3} direction={{ xs: 'column', sm: 'row' }} flexWrap="wrap" useFlexGap>
      {USER_CARD_CONFIG.map(({ key, label, color, isFinance }) => {
        const masked = isFinance && !showFinanceData;

        return (
          <Card key={key} sx={{ p: 2.5, flex: 1, minWidth: 180 }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: `${color}.main`,
                }}
              />
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {label}
              </Typography>
            </Stack>

            {loading ? (
              <Skeleton variant="text" width={100} height={38} />
            ) : (
              <Typography variant="h5" sx={{ fontFamily: 'monospace', letterSpacing: -0.5 }}>
                {masked ? 'Rp ***.***' : fNumber(data?.[key] ?? 0)}
              </Typography>
            )}
          </Card>
        );
      })}
    </Stack>
  );
}
