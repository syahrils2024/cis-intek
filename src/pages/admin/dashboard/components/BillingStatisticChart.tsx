// @ts-nocheck

import { DonutChart } from 'src/components/chart/donut-chart';

export default function BillingStatisticChart({ series }) {
  return <DonutChart title="Statistik Billing" chart={{ series }} />;
}
