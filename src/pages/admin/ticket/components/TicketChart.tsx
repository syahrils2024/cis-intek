// @ts-nocheck

import { DonutChart } from '@components/chart/donut-chart';

const STATUS_LABELS = {
  finish: 'Finished',
  pending: 'Pending',
  processed: 'Processed',
  waiting_finishing: 'Waiting finish',
};

/**
 * @param {{ byStatus?: Record<string, number> }} props
 */
export default function TicketChart({ byStatus = {} }) {
  const series = Object.entries(byStatus).map(([key, value]) => ({
    label: STATUS_LABELS[key] ?? key,
    value,
  }));

  return <DonutChart title="Statistik Status Ticket" chart={{ series }} />;
}
