// @ts-nocheck

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Skeleton from '@mui/material/Skeleton';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import { alpha as hexAlpha } from '@mui/material/styles';
import LinearProgress from '@mui/material/LinearProgress';

import { fNumber } from 'src/utils/format-number';

import { Chart, useChart } from 'src/components/chart';

import { PSB_CARD_CONFIG } from '../dashboard.constants';

// ----------------------------------------------------------------------

/** Color of the PSB approved trend bar */
const PSB_TREND_COLOR = '#2065D1';

/**
 * PSB statistics merged into a single card: the stat summaries act as the
 * card header, followed by the "Trend PSB" bar chart.
 */
export default function PsbStatistics({
  waitingRegistration = 0,
  processing = 0,
  categories = [],
  series = [],
  loading,
}) {
  const total = waitingRegistration + processing;

  const values = {
    psbWaitingRegistration: waitingRegistration,
    psbProcessing: processing,
  };

  const chartOptions = useChart({
    colors: [hexAlpha(PSB_TREND_COLOR, 0.8)],
    stroke: { width: 2, colors: ['transparent'] },
    xaxis: { categories },
    yaxis: { labels: { formatter: (value) => value, maxWidth: 100 } },
    legend: { show: true },
    tooltip: { y: { formatter: (value) => value } },
  });

  return (
    <Card>
      <CardHeader title="PSB" className='tw-mb-2' subheader="Ringkasan dan trend PSB disetujui" />
      <Divider />
      <Stack
      className='tw-mt-2'
        spacing={3}
        direction={{ xs: 'column', md: 'row' }}
        sx={{ px: 3, pb: 3 }}
        divider={
          <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', md: 'block' } }} />
        }
      >
        {PSB_CARD_CONFIG.map(({ key, label, color }) => {
          const value = values[key] ?? 0;
          const percent = total > 0 ? Math.min(Math.round((value / total) * 100), 100) : 0;

          return (
            <Box key={key} sx={{ flex: 1, minWidth: 180 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1.5 }}>
                {label}
              </Typography>

              {loading ? (
                <Skeleton variant="text" width={140} height={40} />
              ) : (
                <Typography variant="h5" sx={{ fontFamily: 'monospace', letterSpacing: -0.5 }}>
                  {fNumber(value)}
                </Typography>
              )}

              <Typography
                variant="caption"
                sx={{ color: `${color}.main`, display: 'block', mt: 1 }}
              >
                {percent}% dari total PSB
              </Typography>

              <Box sx={{ mt: 2 }}>
                <LinearProgress
                  variant="determinate"
                  value={percent}
                  color={color}
                  sx={{ height: 6, borderRadius: 10 }}
                />
              </Box>
            </Box>
          );
        })}
      </Stack>

      <Divider sx={{ borderStyle: 'dashed' }} />

      {loading ? (
        <Box sx={{ px: 3, py: 2.5 }}>
          <Skeleton variant="rectangular" height={280} sx={{ borderRadius: 1 }} />
        </Box>
      ) : (
        <Chart
          type="bar"
          series={series}
          options={chartOptions}
          height={364}
          sx={{ py: 2.5, pl: 1, pr: 2.5 }}
        />
      )}
    </Card>
  );
}
