/**
 * @typedef {import('src/repositories/customer').PSBChart} PSBChart
 */

import dayjs from 'dayjs';
import { toast } from 'sonner';
import { DonutChart } from '@components/chart/donut-chart';
import { format, endOfMonth, startOfMonth } from 'date-fns';
import { useRef, useMemo, useState, useEffect } from 'react';
import AreaPickerFilter from '@components/billing/areaPickerFilter';
import { BarChartWithoutCurrency } from '@components/chart/bar-chart-without-currency';

import { DatePicker } from '@mui/x-date-pickers';
import { MenuItem, TextField } from '@mui/material';

import { customerRepository } from 'src/repositories';

export default function PSBChart() {
  const now = new Date();

  const categoryList = [
    { label: 'Proses', value: 'process' },
    { label: 'Selesai', value: 'finish' },
  ];

  const [chartCategory, setChartCategory] = useState('process');

  const [areaTitle, setAreaTitle] = useState('');
  const [areaId, setAreaId] = useState('');
  const areaPickerFilterRef = useRef();

  /** @type {[Date, (d: Date) => void]} */
  const [start, setStart] = useState(startOfMonth(now));

  /** @type {[Date, (d: Date) => void]} */
  const [until, setUntil] = useState(endOfMonth(now));

  /** @type {[PSBChart[], (d: PSBChart[]) => void]} */
  const [processData, setProcessData] = useState([]);

  /** @type {[PSBChart[], (d: PSBChart[]) => void]} */
  const [finishData, setFinishData] = useState([]);

  /** @type {[PSBChart[], (d: PSBChart[]) => void]} */
  const [finishDataMonthly, setFinishDataMonthly] = useState([]);

  /** @type {[PSBChart[], (d: PSBChart[]) => void]} */
  const [processDataMonthly, setProcessDataMonthly] = useState([]);

  const [monthLabel] = useState([
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'Mei',
    'Jun',
    'Jun',
    'Agu',
    'Sep',
    'Okt',
    'Nov',
    'Des',
  ]);

  async function prefetch() {
    try {
      const snapshot = await customerRepository.getChartPSB(
        format(start, 'yyyy-MM-dd'),
        format(until, 'yyyy-MM-dd'),
        !!areaId ? areaId : null
      );

      setProcessData(snapshot.process);
      setFinishData(snapshot.finish);
      setFinishDataMonthly(snapshot.finishMonthly);
      setProcessDataMonthly(snapshot.processMonthly);
    } catch (error) {
      toast.error(error.message);
    }
  }

  useEffect(() => {
    prefetch();
  }, [start, until, areaId]);

  const chartProcessData = useMemo(() => {
    const categories = [
      ...new Set(
        processData.map((d) => d.date).sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
      ),
    ];

    const areaList = [
      ...new Set(processData.map((d) => d.areaTitle).sort((a, b) => a.localeCompare(b))),
    ];

    const series = areaList.map((area) => {
      const data = categories.map((c) => {
        const exist = processData.find((pd) => pd.areaTitle === area && pd.date === c);
        return exist?.count ?? 0;
      });

      return { name: area, data };
    });

    return {
      categories: categories.map((c) => format(new Date(c), 'dd MMM yyyy')),
      series,
    };
  });

  const chartFinishData = useMemo(() => {
    const categories = [
      ...new Set(
        finishData.map((d) => d.date).sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
      ),
    ];

    const areaList = [
      ...new Set(finishData.map((d) => d.areaTitle).sort((a, b) => a.localeCompare(b))),
    ];

    const series = areaList.map((area) => {
      const data = categories.map((c) => {
        const exist = finishData.find((pd) => pd.areaTitle === area && pd.date === c);
        return exist?.count ?? 0;
      });

      return { name: area, data };
    });

    return {
      categories: categories.map((c) => format(new Date(c), 'dd MMM yyyy')),
      series,
    };
  });

  const donutChartProcess = useMemo(() => {
    const areaList = [
      ...new Set(processData.map((d) => d.areaTitle).sort((a, b) => a.localeCompare(b))),
    ];

    return areaList.map((a) => {
      const value = processData
        .filter((pd) => pd.areaTitle === a)
        .reduce((prev, current) => prev + current.count, 0);
      return {
        label: a,
        value,
      };
    });
  });

  const donutChartFinish = useMemo(() => {
    const areaList = [
      ...new Set(finishData.map((d) => d.areaTitle).sort((a, b) => a.localeCompare(b))),
    ];

    return areaList.map((a) => {
      const value = processData
        .filter((pd) => pd.areaTitle === a)
        .reduce((prev, current) => prev + current.count, 0);
      return {
        label: a,
        value,
      };
    });
  });

  const selectedChart = useMemo(() =>
    chartCategory === 'process' ? chartProcessData : chartFinishData
  );

  const selectedDonutChart = useMemo(() =>
    chartCategory === 'process' ? donutChartProcess : donutChartFinish
  );

  const yearlyChart = useMemo(() => {
    const year = format(start, 'yyyy');

    const processSeries = monthLabel.map((month, i) => {
      const currentMonth = new Date(year, i);
      const exist = processDataMonthly.find(
        (pd) => pd.date === `${year}-${format(currentMonth, 'MM')}`
      );
      return exist?.count ?? 0;
    });

    const finishSeries = monthLabel.map((month, i) => {
      const currentMonth = new Date(year, i);
      const exist = finishDataMonthly.find(
        (pd) => pd.date === `${year}-${format(currentMonth, 'MM')}`
      );
      return exist?.count ?? 0;
    });

    return {
      categories: monthLabel,
      series: [
        {
          name: 'Process',
          data: processSeries,
        },
        {
          name: 'Finish',
          data: finishSeries,
        },
      ],
    };
  });

  async function pickArea() {
    const result = await areaPickerFilterRef.current.open(areaId);
    if (!result) return;
    setAreaId(result._id);
    setAreaTitle(result.name);
  }

  return (
    <div className="tw-flex tw-flex-col tw-px-5 tw-w-full">
      {/* HEADER */}
      <div className="tw-flex tw-flex-col md:tw-flex-row tw-items-center tw-justify-end tw-w-full tw-gap-3">
        <div className="md:tw-w-48 tw-w-full">
          <TextField
            size="small"
            label="Area"
            fullWidth
            value={areaTitle}
            inputProps={{ readOnly: true }}
            onClick={() => pickArea()}
          />
        </div>
        <DatePicker
          size="small"
          label="Mulai"
          fullWidth
          value={dayjs(start)}
          slotProps={{ textField: { size: 'small' } }}
          onChange={(e) => setStart(e.toDate())}
          className="md:tw-w-48 tw-w-full"
        />
        <DatePicker
          size="small"
          label="Sampai"
          fullWidth
          value={dayjs(until)}
          slotProps={{ textField: { size: 'small' } }}
          onChange={(e) => setUntil(e.toDate())}
          className="md:tw-w-48 tw-w-full"
        />
        <TextField
          select
          size="small"
          label="Kategori"
          value={chartCategory}
          onChange={(e) => setChartCategory(e.target.value)}
          className="md:tw-w-48 tw-w-full"
        >
          {categoryList.map((c, i) => (
            <MenuItem key={i} value={c.value}>
              {c.label}
            </MenuItem>
          ))}
        </TextField>
      </div>
      {/* Chart Data */}
      <div className="tw-w-full tw-grid tw-grid-cols-12 tw-gap-5">
        <div className="tw-col-span-12 md:tw-col-span-4">
          <DonutChart title="Statistik Keseluruhan" chart={{ series: selectedDonutChart }} />
        </div>
        <div className="tw-col-span-12 md:tw-col-span-8">
          <BarChartWithoutCurrency
            title="Statistik Harian"
            chart={{
              categories: selectedChart.categories,
              series: selectedChart.series,
            }}
          />
        </div>
        <div className="tw-col-span-12">
          <BarChartWithoutCurrency
            title="Statistik Bulanan"
            chart={{
              categories: yearlyChart.categories,
              series: yearlyChart.series,
            }}
          />
        </div>
      </div>
      <AreaPickerFilter ref={areaPickerFilterRef} />
    </div>
  );
}
