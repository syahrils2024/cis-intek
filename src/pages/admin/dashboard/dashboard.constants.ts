// @ts-nocheck

export const MONTH_LABELS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'Mei',
  'Jun',
  'Jul',
  'Agu',
  'Sep',
  'Okt',
  'Nov',
  'Des',
];

/**
 * @typedef {Object} StatisticCardConfig
 * @property {string} label
 * @property {keyof DashboardStatistic} key
 */

/** @type {StatisticCardConfig[]} */
export const DONUT_STATISTIC_CONFIG = [
  { label: 'Paid', key: 'countPaid' },
  { label: 'Unpaid', key: 'countUnpaid' },
  { label: 'Partially Paid', key: 'countPartiallyPaid' },
  { label: 'Cancelled', key: 'countCanceled' },
];

/**
 * @typedef {Object} BarSeriesConfig
 * @property {string} name
 * @property {keyof import('./types').YearOfYearItem} key
 */

/** @type {BarSeriesConfig[]} */
export const BAR_SERIES_META = [
  { name: 'Amount', key: 'amount' },
  { name: 'Paid', key: 'paid' },
  { name: 'Unpaid', key: 'unpaid' },
];

/**
 * @typedef {Object} SummaryCardConfig
 * @property {string} key
 * @property {string} label
 * @property {'primary'|'success'|'warning'|'error'} color
 * @property {boolean} [isFinance] - Whether the value is finance-related and must be masked
 */

/** @type {SummaryCardConfig[]} */
export const BILLING_CARD_CONFIG = [
  { key: 'amount', label: 'Total Billing', color: 'primary' },
  { key: 'paid', label: 'Telah Dibayar', color: 'success' },
  { key: 'unpaid', label: 'Belum Dibayar', color: 'warning' },
];

/** @type {SummaryCardConfig[]} */
export const USER_CARD_CONFIG = [
  { key: 'totalUser', label: 'Total Pengguna', color: 'primary' },
  { key: 'totalActiveUser', label: 'Pengguna Aktif', color: 'success' },
  { key: 'totalIsolirUser', label: 'Terisolir', color: 'warning' },
  { key: 'countUnpaid', label: 'Belum Bayar', color: 'error', isFinance: true },
];

/** @type {SummaryCardConfig[]} */
export const PSB_CARD_CONFIG = [
  { key: 'psbWaitingRegistration', label: 'Menunggu Registrasi', color: 'warning' },
  { key: 'psbProcessing', label: 'Sedang Diproses', color: 'primary' },
];

/**
 * Ticket categories returned by the V3 statistic endpoint.
 * @typedef {Object} TicketCategoryConfig
 * @property {string} key - Category key as returned by the API
 * @property {string} label
 */

/** @type {TicketCategoryConfig[]} */
export const TICKET_CATEGORY_CONFIG = [
  { key: 'installation_request', label: 'Pemasangan' },
  { key: 'maintenance', label: 'Maintenance' },
  { key: 'internet_trouble', label: 'Gangguan Internet' },
  { key: 'upgrade_request', label: 'Upgrade' },
  { key: 'dismaintenance', label: 'Dismaintenance' },
  { key: 'other', label: 'Lainnya' },
];

/** Order used when rendering ticket status donut/legend */
export const TICKET_STATUS_ORDER = ['pending', 'processed', 'waiting_finishing', 'finish'];

/** Human readable label for a ticket status value */
export const TICKET_STATUS_LABELS = {
  pending: 'Pending',
  processed: 'Diproses',
  waiting_finishing: 'Menunggu Penyelesaian',
  finish: 'Selesai',
};
