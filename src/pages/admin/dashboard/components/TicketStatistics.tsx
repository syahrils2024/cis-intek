// @ts-nocheck

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Skeleton from '@mui/material/Skeleton';
import { useTheme } from '@mui/material/styles';

import { DonutChart } from 'src/components/chart/donut-chart';
import { BarChartWithoutCurrency } from 'src/components/chart/bar-chart-without-currency';

// ----------------------------------------------------------------------

function ChartSkeleton({ height = 280 }) {
  return (
    <Card sx={{ p: 3, height: '100%' }}>
      <Skeleton variant="text" width={180} height={28} />
      <Skeleton variant="rectangular" height={height} sx={{ mt: 2, borderRadius: 1 }} />
    </Card>
  );
}

export default function TicketStatistics({ categories, series, status = [], loading }) {
  const theme = useTheme();

  const colors = [
    theme.palette.warning.main,
    theme.palette.primary.main,
    theme.palette.info.main,
    theme.palette.success.main,
  ];

  if (loading) {
    return (
      <Box
        rowGap={3}
        columnGap={3}
        display="grid"
        gridTemplateColumns={{ xs: 'repeat(1, 1fr)', md: 'repeat(2, 1fr)' }}
      >
        <ChartSkeleton />
        <ChartSkeleton height={240} />
      </Box>
    );
  }

  return (
    <Box
      rowGap={3}
      columnGap={3}
      display="grid"
      gridTemplateColumns={{ xs: 'repeat(1, 1fr)', md: 'repeat(2, 1fr)' }}
    >
      <BarChartWithoutCurrency
        title="Trend Ticket"
        chart={{
          categories,
          series,
        }}
      />

      <DonutChart
        title="Status Ticket"
        chart={{
          series: status,
          colors,
        }}
      />
    </Box>
  );
}
