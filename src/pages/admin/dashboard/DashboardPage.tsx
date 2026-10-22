// @ts-nocheck

import { useMemo } from 'react';
import { usePrivilege } from '@auth/hooks/privileges';
import { usePermission } from '@auth/hooks/permission';

import Grid from '@mui/material/Unstable_Grid2';

import { DashboardContent } from 'src/layouts/dashboard';

import EngineerHome from './components/EngineerHome';
import PsbStatistics from './components/PsbStatistics';
import DashboardFilter from './components/DashboardFilter';
import { useDashboardData } from './hooks/useDashboardData';
import TicketStatistics from './components/TicketStatistics';
import { useDashboardChart } from './hooks/useDashboardChart';
import MonthlySalesChart from './components/MonthlySalesChart';
import UserStatisticsGrid from './components/UserStatisticsGrid';
import BillingSummaryCards from './components/BillingSummaryCards';

export default function DashboardPage() {
  const { isEngineer, isAdmin } = usePrivilege();
  const { showFinanceData } = usePermission();
  const isEngineerOnly = useMemo(() => isEngineer && !isAdmin, [isEngineer, isAdmin]);

  const { state: dataState, handler: dataHandler } = useDashboardData();
  const { state: chartState } = useDashboardChart();

  if (isEngineerOnly) return <EngineerHome />;

  return (
    <DashboardContent maxWidth="xl">
      <Grid container spacing={3}>
        <Grid xs={12}>
          <DashboardFilter value={dataState.date} onChange={dataHandler.setDate} />
        </Grid>
        <Grid xs={12}>
          <BillingSummaryCards
            summary={chartState.billingSummary}
            loading={dataState.loading}
            showFinanceData={showFinanceData}
          />
        </Grid>
        <Grid xs={12}>
          <UserStatisticsGrid
            data={dataState.data}
            loading={dataState.loading}
            showFinanceData={showFinanceData}
          />
        </Grid>
        <Grid xs={12}>
          <MonthlySalesChart
            title="Trend Billing"
            categories={chartState.monthLabel}
            series={chartState.yearlySales}
            showFinanceData={showFinanceData}
          />
        </Grid>
        <Grid xs={12}>
          <PsbStatistics
            waitingRegistration={dataState.data?.psbWaitingRegistration}
            processing={dataState.data?.psbProcessing}
            categories={chartState.psbTrendCategories}
            series={chartState.psbTrendSeries}
            loading={dataState.loading}
          />
        </Grid>
        <Grid xs={12}>
          <TicketStatistics
            categories={chartState.ticketTrendCategories}
            series={chartState.ticketTrendSeries}
            status={chartState.ticketStatus}
            loading={dataState.loading}
          />
        </Grid>
      </Grid>
    </DashboardContent>
  );
}
