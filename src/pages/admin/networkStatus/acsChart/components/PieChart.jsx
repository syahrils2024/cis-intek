/** @typedef {import("src/repositories/acs").AcsAreaOnlineStatus} AcsAreaOnlineStatus */

import { useMemo } from 'react';
import { Chart } from '@components/chart';

import { Chip, Stack } from '@mui/material';

/**
 * @param {object} param0
 * @param {AcsAreaOnlineStatus} param0.data
 * @param {string|number} [param0.height]
 */
export default function AcsPieChart({ data, height = '350px' }) {
  const errorMessages = useMemo(() => {
    const messages = data.error ?? [];
    const isEmptyData = Object.entries(data.statusSummary || {}).length <= 0;
    if (isEmptyData) return [...messages, 'No data available'];
    return messages;
  });

  /** @type {Record<keyof AcsAreaOnlineStatus['statusSummary'], string>} */
  const replaceLabel = {
    off1Hour: 'Off 1 Hour',
    off24Hours: 'Off 24 Hours',
    off3Days: 'Off 3 Days',
    off30Minutes: 'Off 30 Minutes',
    off7Days: 'Off 7 Days',
    off1Months: 'Off 1 Month',
    off3Months: 'Off 3 Months',
    online: 'Online',
  };

  /** @type {Record<keyof AcsAreaOnlineStatus['statusSummary'], string>} */
  const colors = {
    off1Hour: '#ff1100',
    off30Minutes: '#ff2400',
    off24Hours: '#a82d2d',
    off3Days: '#823333',
    off7Days: '#5c3333',
    off1Months: '#3b2727',
    off3Months: '#1e1e1e',
    online: '#00c853',
  };

  /** @type {Record<keyof AcsAreaOnlineStatus['statusSummary'], string>} */
  const sortLabel = {
    online: 1,
    off30Minutes: 2,
    off1Hour: 3,
    off24Hours: 4,
    off3Days: 5,
    off7Days: 6,
    off1Months: 7,
    off3Months: 8,
  };

  const total = data.statusSummary?.total ?? 0;
  const countPercent = (value) => ((value / total) * 100).toFixed(2);

  const chartData = useMemo(() => {
    const { total: _, ...summaries } = data.statusSummary || {};
    const labels = Object.entries(summaries)
      .sort((a, b) => sortLabel[a[0]] - sortLabel[b[0]])
      .map(([key, value]) => {
        const label = replaceLabel[key] || key;
        return `${label}: ${value} (${countPercent(value)}%)`;
      });

    const series = Object.entries(summaries)
      .sort((a, b) => sortLabel[a[0]] - sortLabel[b[0]])
      // eslint-disable-next-line no-shadow
      .map(([_, value]) => value);

    const colorOfStatus = Object.entries(summaries)
      .sort((a, b) => sortLabel[a[0]] - sortLabel[b[0]])
      .map(([key]) => colors[key] ?? '#000000');

    return {
      labels,
      series,
      colors: colorOfStatus,
    };
  });

  return (
    <Stack className="tw-relative tw-w-full">
      <span className="tw-font-semibold">{data.title}</span>
      <Stack className="tw-relative">
        {/* Pie Chart */}
        <Chart
          type="pie"
          series={chartData.series}
          options={{
            chart: {
              type: 'pie',
            },
            labels: chartData.labels,
            series: chartData.series,
            colors: chartData.colors,
          }}
          height={height}
        />
        {/* End Pie Chart */}
        {/* Overlay Error Message */}
        {errorMessages.length === 0 ? null : (
          <div className="tw-absolute tw-inset-0 tw-flex tw-flex-wrap tw-items-center tw-justify-center tw-backdrop-blur tw-gap-2">
            {errorMessages.map((err, i) => (
              <Chip key={i} label={err} color="error" />
            ))}
          </div>
        )}
        {/* End Overlay Error Message */}
      </Stack>
    </Stack>
  );
}
