import dayjs from 'dayjs';
import ReactECharts from 'echarts-for-react';
import Overloading from '@components/overloading';
import { useMemo, forwardRef, useImperativeHandle } from 'react';

import { DatePicker } from '@mui/x-date-pickers';
import {
  Grid,
  Stack,
  Dialog,
  Button,
  Select,
  MenuItem,
  InputLabel,
  DialogTitle,
  FormControl,
  DialogContent,
  DialogActions,
} from '@mui/material';

import 'src/extension/number';

import SlaChip from './SlaChip';
import { useSlaDialogState } from './slaDialog.state';

const SLA_CHART_COLORS = {
  up: '#22c55e',
  down: '#ef4444',
};

const SlaDialog = forwardRef((_props, ref) => {
  const { state, handlers } = useSlaDialogState();
  const { open, loading, device, stateChanges, start, end, ipAddress } = state;

  useImperativeHandle(ref, () => ({
    open: (options) => handlers.openDialog(options.device),
  }));

  /** Unique IP options for filter: primary + secondary */
  const ipOptions = useMemo(() => {
    if (!device) return [];
    const options = [{ value: device.ip_address, label: device.ip_address }];
    if (device.primary_ip_status && device.primary_ip_status.ip_address !== device.ip_address) {
      options.push({
        value: device.primary_ip_status.ip_address,
        label: device.primary_ip_status.ip_address,
      });
    }
    (device.secondary_ip_addresses ?? []).forEach((s) => {
      if (!options.some((o) => o.value === s.ip_address)) {
        options.push({ value: s.ip_address, label: s.ip_address });
      }
    });
    return options;
  }, [device]);

  /** ECharts option for SLA timeline built from contiguous state-change periods.
   * Uses a custom series with renderItem so each bar can span its own [from, to] range
   * along the time axis (ECharts bar series does not natively support Gantt-style ranges on time x-axis). */
  const chartOption = useMemo(() => {
    if (!stateChanges || stateChanges.length === 0) return null;

    return {
      tooltip: {
        trigger: 'item',
        axisPointer: { type: 'shadow' },
        formatter: (params) => {
          const p = params && params.dataIndex != null ? params : params?.[0];
          if (!p || p.dataIndex == null) return '';
          const sc = stateChanges[p.dataIndex];
          if (!sc) return '';
          const isUp = sc.status === 'connected';
          const statusLabel = isUp ? 'UP' : 'DOWN';
          const color = isUp ? SLA_CHART_COLORS.up : SLA_CHART_COLORS.down;
          return `<div>
            <strong>${dayjs(sc.from).format('DD-MM-YYYY HH:mm:ss')}</strong>
            &rarr;
            <strong>${dayjs(sc.to).format('DD-MM-YYYY HH:mm:ss')}</strong><br/>
            <span style="color:${color};font-weight:600">${statusLabel}</span><br/>
            Duration: ${sc.durationMs.summarySLAFormat()}
          </div>`;
        },
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '15%',
        top: '10%',
        containLabel: true,
      },
      graphic: [
        {
          type: 'text',
          left: 10,
          top: 8,
          style: {
            text: 'Status',
            fill: '#6b7280',
            font: '600 11px sans-serif',
          },
        },
      ],
      xAxis: {
        type: 'time',
      },
      yAxis: {
        type: 'value',
        min: 0,
        max: 1.1,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { show: false },
        splitLine: { show: false },
      },
      dataZoom: [
        {
          type: 'inside',
          start: 0,
          end: 100,
        },
        {
          type: 'slider',
          start: 0,
          end: 100,
          height: 50,
          bottom: 0,
        },
      ],
      series: [
        {
          type: 'custom',
          renderItem: (params, api) => {
            const startVal = api.value(0);
            const endVal = api.value(1);
            const heightVal = api.value(2);
            const topPt = api.coord([startVal, heightVal]);
            const endPt = api.coord([endVal, heightVal]);
            const basePt = api.coord([startVal, 0]);
            return {
              type: 'rect',
              shape: {
                x: topPt[0],
                y: topPt[1],
                width: Math.max(endPt[0] - topPt[0], 1),
                height: basePt[1] - topPt[1],
              },
              style: api.style(),
            };
          },
          encode: {
            x: [0, 1],
            y: [2],
          },
          data: stateChanges
            .filter((sc) => new Date(sc.to).getTime() > new Date(sc.from).getTime())
            .map((sc) => {
              const isUp = sc.status === 'connected';
              return {
                value: [
                  new Date(sc.from).getTime(),
                  new Date(sc.to).getTime(),
                  isUp ? 1 : 0.5,
                ],
                itemStyle: {
                  color: isUp ? SLA_CHART_COLORS.up : SLA_CHART_COLORS.down,
                },
              };
            }),
        },
      ],
    };
  }, [stateChanges]);

  return (
    <Dialog
      fullWidth
      maxWidth="md"
      open={open.value}
      onClose={handlers.closeDialog}
      fullScreen={false}
    >
      <DialogTitle>SLA Report{device ? ` — ${device.alias ?? device.ip_address}` : ''}</DialogTitle>
      <DialogContent>
        <Stack className="tw-relative" spacing={3} sx={{ mt: 1 }}>
          <Overloading loading={loading.value} />

          {/* Filter Section */}
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4}>
              <DatePicker
                label="Mulai"
                value={start ? dayjs(start) : null}
                onChange={(e) => {
                  if (e) handlers.setStart(e.toDate());
                }}
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <DatePicker
                label="Sampai"
                value={end ? dayjs(end) : null}
                onChange={(e) => {
                  if (e) handlers.setEnd(e.toDate());
                }}
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl size="small" fullWidth>
                <InputLabel id="sla-ip-filter-label">IP Address</InputLabel>
                <Select
                  labelId="sla-ip-filter-label"
                  label="IP Address"
                  value={ipAddress}
                  onChange={(e) => handlers.setIpAddress(e.target.value)}
                >
                  {ipOptions.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Stack direction="row" justifyContent="flex-end">
                <Button
                  variant="contained"
                  size="small"
                  onClick={handlers.applyFilter}
                  disabled={loading.value}
                >
                  Terapkan
                </Button>
              </Stack>
            </Grid>
          </Grid>
          {/* End Filter */}

          {/* Summary Section */}
          {stateChanges.length > 0 ? (
            <Stack direction="row" spacing={2}>
              <SlaChip
                variant="UP"
                percentage={state.percentageSla.upPercentage}
                duration={state.summarySla.UP}
              />
              <SlaChip
                variant="DOWN"
                percentage={state.percentageSla.downPercentage}
                duration={state.summarySla.DOWN}
              />
            </Stack>
          ) : null}

          {/* Chart */}
          {stateChanges.length > 0 && chartOption ? (
            <ReactECharts
              option={chartOption}
              style={{ height: 400, width: '100%' }}
              notMerge
              lazyUpdate
            />
          ) : !loading.value ? (
            <Stack alignItems="center" sx={{ py: 8 }}>
              <span className="tw-text-gray-400 tw-text-sm">Tidak ada data SLA</span>
            </Stack>
          ) : null}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button color="error" variant="text" onClick={handlers.closeDialog}>
          Tutup
        </Button>
      </DialogActions>
    </Dialog>
  );
});

export default SlaDialog;
