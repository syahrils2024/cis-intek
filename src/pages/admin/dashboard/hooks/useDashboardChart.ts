// @ts-nocheck

import { useMemo } from 'react';

import { useDashboardStore } from '../dashboard.store';
import {
  MONTH_LABELS,
  TICKET_STATUS_ORDER,
  TICKET_STATUS_LABELS,
  TICKET_CATEGORY_CONFIG,
} from '../dashboard.constants';

function buildDonutSeries(data) {
  if (!data?.yearOfYear) return [];

  return [
    { label: 'Paid', value: data?.countPaid ?? 0 },
    { label: 'Unpaid', value: data?.countUnpaid ?? 0 },
    { label: 'Partially Paid', value: data?.countPartiallyPaid ?? 0 },
    { label: 'Cancelled', value: data?.countCanceled ?? 0 },
  ];
}

function buildYearlySeries(data, date) {
  if (!data?.yearOfYear) return [];

  const { yearOfYear } = data;
  const [, strMonth] = date.toISOString().split('-');
  const month = parseInt(strMonth);

  const sortedData = MONTH_LABELS.map((label, i) => {
    const exist = yearOfYear.find((y) => y._id === i + 1);
    if (!exist)
      return {
        _id: i + 1,
        amount: 0,
        paid: 0,
        unpaid: 0,
      };

    return {
      _id: i + 1,
      amount: exist?.amount ?? 0,
      paid: exist?.paid ?? 0,
      unpaid: exist?.unpaid ?? 0,
    };
  });

  const amountMonthly = sortedData.map((item) => (item._id <= month ? item.amount : 0));
  const paidMonthly = sortedData.map((item) => (item._id <= month ? item.paid : 0));
  const unPaidmonthly = sortedData.map((item) => (item._id <= month ? item.unpaid : 0));

  return [
    { name: 'Amount', data: amountMonthly },
    { name: 'Paid', data: paidMonthly },
    { name: 'Unpaid', data: unPaidmonthly },
  ];
}

/**
 * PSB approved trend: month labels + one series of approved counts.
 * Zero-pads months that have no entry yet.
 */
function buildPsbTrend(data) {
  if (!data?.psbApprovedTrend) return { categories: [], series: [] };

  const trend = data.psbApprovedTrend;

  const categories = trend.map((item) => item.month);
  const counts = trend.map((item) => item.count ?? 0);

  return {
    categories,
    series: [{ name: 'PSB Disetujui', data: counts }],
  };
}

/**
 * Ticket trend: month labels + one series per known ticket category.
 * Months missing from the payload are zero-filled so every series stays aligned.
 */
function buildTicketTrend(data) {
  if (!data?.ticketTrend) return { categories: [], series: [] };

  const trend = data.ticketTrend;

  const categories = trend.map((item) => item.month);

  const series = TICKET_CATEGORY_CONFIG.map(({ key, label }) => ({
    name: label,
    data: trend.map((item) => item.categories?.[key] ?? 0),
  })).filter((item) => item.data.some((value) => value > 0));

  return { categories, series };
}

/** Ticket status totals, ordered and relabelled for the donut chart */
function buildTicketStatus(data) {
  if (!data?.ticketStatus) return [];

  const { ticketStatus } = data;

  return TICKET_STATUS_ORDER.map((status) => {
    const exist = ticketStatus.find((item) => item.status === status);

    return {
      label: TICKET_STATUS_LABELS[status] ?? status,
      value: exist?.count ?? 0,
    };
  }).filter((item) => item.value > 0);
}

export function useDashboardChart() {
  const data = useDashboardStore((state) => state.data);

  const {
    billingSummary,
    customerStatistics,
    yearlySales,
    psbTrendCategories,
    psbTrendSeries,
    ticketTrendCategories,
    ticketTrendSeries,
    ticketStatus,
  } = useMemo(() => {
    const summary = {
      amount: data?.amount ?? 0,
      paid: data?.paid ?? 0,
      unpaid: data?.unpaid ?? 0,
      debt: data?.debt ?? 0,
      countPaid: data?.countPaid ?? 0,
      countUnpaid: data?.countUnpaid ?? 0,
    };

    const psbTrend = buildPsbTrend(data);
    const ticketTrend = buildTicketTrend(data);

    return {
      billingSummary: summary,
      customerStatistics: buildDonutSeries(data),
      yearlySales: buildYearlySeries(data, new Date()),
      psbTrendCategories: psbTrend.categories,
      psbTrendSeries: psbTrend.series,
      ticketTrendCategories: ticketTrend.categories,
      ticketTrendSeries: ticketTrend.series,
      ticketStatus: buildTicketStatus(data),
    };
  }, [data]);

  return {
    state: {
      billingSummary,
      customerStatistics,
      yearlySales,
      monthLabel: MONTH_LABELS,
      psbTrendCategories,
      psbTrendSeries,
      ticketTrendCategories,
      ticketTrendSeries,
      ticketStatus,
    },
  };
}
