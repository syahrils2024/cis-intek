import { useSelector } from 'react-redux';
import { DonutChart } from '@components/chart/donut-chart';

import { Grid } from '@mui/material';

export default function PackageStatistics() {
  /**
   * @type {PackageStoreReducer}
   */
  const packageStore = useSelector((state) => state.packageStore);
  const { order, orderBy, packagePlans } = packageStore;

  const chartItems = packageStore.packagePlans.map((item) => ({
    label: item.title,
    value: item.customer,
  }));

  return (
    <Grid xs={12} md={4} className='tw-px-8'>
      <DonutChart title="Customer Statistic" chart={{ series: chartItems }} />
    </Grid>
  );
}
