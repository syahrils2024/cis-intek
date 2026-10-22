import { useTheme } from '@mui/material/styles';

import { Chart, useChart } from 'src/components/chart';

// ----------------------------------------------------------------------

export function ChartTraffic({ chart, positionLabel = 'top' }) {
  const theme = useTheme();

  const chartColors = chart.colors ?? [theme.palette.primary.main, theme.palette.error.main];

  const chartOptions = useChart({
    colors: chartColors,
    legend: { show: true, position: positionLabel },
    yaxis: {
      labels: {
        formatter: (value) => `${value.toFixed(0)} Mbps`,
        maxWidth: 50,
      },
    },

    xaxis: {
      // show: false,
      labels: {
        show: false,
        rotate: -90,
        maxWidth: 50,
      },
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      // type: 'datetime',
      categories: chart.categories,
    },
    // tooltip: { x: { format: 'dd/MM/yy HH:mm' } },
  });

  return <Chart type="area" series={chart.series} options={chartOptions} height={320} />;
}
