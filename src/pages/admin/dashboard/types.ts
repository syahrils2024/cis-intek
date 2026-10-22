// @ts-nocheck

export interface YearOfYearItem {
  _id: number;
  amount: number;
  paid: number;
  unpaid: number;
}

export interface PsbApprovedTrendItem {
  /** Format `YYYY-MM` */
  month: string;
  count: number;
}

/** Ticket counts keyed by ticket category (e.g. `installation_request`, `maintenance`, `internet_trouble`, `upgrade_request`, `dismaintenance`, `other`) */
export type TicketCategoryCount = Record<string, number>;

export interface TicketTrendItem {
  /** Format `YYYY-MM` */
  month: string;
  categories: TicketCategoryCount;
  total: number;
}

export interface TicketStatusItem {
  status: string;
  count: number;
}

export interface DashboardStatistic {
  amount?: number;
  paid?: number;
  unpaid?: number;
  debt?: number;
  countPaid?: number;
  countUnpaid?: number;
  countPartiallyPaid?: number;
  countCanceled?: number;
  totalActiveUser?: number;
  totalIsolirUser?: number;
  totalUser?: number;
  yearOfYear?: YearOfYearItem[];
  psbApprovedTrend?: PsbApprovedTrendItem[];
  psbWaitingRegistration?: number;
  psbProcessing?: number;
  ticketTrend?: TicketTrendItem[];
  ticketStatus?: TicketStatusItem[];
}

export interface DonutSeriesItem {
  label: string;
  value: number;
}

export interface BarSeriesItem {
  name: string;
  data: number[];
}

export interface DashboardStoreShape {
  data: DashboardStatistic;
  date: Date;
  loading?: boolean;
}

export interface BillingSummary {
  amount: number;
  paid: number;
  unpaid: number;
  debt: number;
  countPaid: number;
  countUnpaid: number;
}

export interface SummaryCardItem {
  key: string;
  label: string;
  color: 'primary' | 'success' | 'warning' | 'error';
  isFinance?: boolean;
}

export interface DashboardFilterProps {
  value: Date;
  onChange: (value: Date) => void;
}

export interface BillingSummaryCardsProps {
  summary?: Partial<BillingSummary>;
  loading?: boolean;
  /** When false, all financial amounts are masked as `Rp ***.***` */
  showFinanceData?: boolean;
}

export interface UserStatisticsGridProps {
  data?: Partial<DashboardStatistic>;
  loading?: boolean;
  /** When false, finance-related counters are masked as `Rp ***.***` */
  showFinanceData?: boolean;
}

export interface BillingStatisticChartProps {
  series: DonutSeriesItem[];
}

export interface BillingTrendChartProps {
  title?: string;
  subheader?: string;
  categories: string[];
  series: BarSeriesItem[];
}

export interface PsbStatisticsProps {
  /** Number of PSB waiting for registration */
  waitingRegistration?: number;
  /** Number of PSB currently being processed */
  processing?: number;
  categories: string[];
  series: BarSeriesItem[];
  loading?: boolean;
}

export interface TicketStatisticsProps {
  categories: string[];
  series: BarSeriesItem[];
  status: DonutSeriesItem[];
  loading?: boolean;
}

export interface MonthlySalesChartProps {
  title?: string;
  categories: string[];
  series: BarSeriesItem[];
  /** When false, the chart is replaced with a masked placeholder */
  showFinanceData?: boolean;
}
