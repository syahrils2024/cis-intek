import axios from 'src/commons/axios';

const BASEURL = import.meta.env.VITE_API_URL;
const BASEURLV3 = `${import.meta.env.VITE_API_URL}/v3/dashboard`;

/**
 * Get Dashboard Statistic
 * @param {number} year
 * @param {number} month
 *
 * /** @typedef {object} responseGetStatistic
 * @property {number} amount
 * @property {number} paid
 * @property {number} unpaid
 * @property {number} debt
 * @property {number} countPaid
 * @property {number} countUnpaid
 * @property {number} countPartiallyPaid
 * @property {number} countCanceled
 * @property {object[]} yearOfYear
 * @property {number} yearOfYear._id
 * @property {number} yearOfYear.paid
 * @property {number} yearOfYear.amount
 * @property {number} yearOfYear.unpaid
 * @property {number} totalActiveUser
 * @property {number} totalIsolirUser
 * @property {number} totalUser
 * @returns {Promise<responseGetStatistic>}
 */
export async function getStatistic({ year, month, areaId, packageId }) {
  const { data } = await axios.get(`${BASEURL}/admin/statistics`, {
    params: { year, month, areaId, packageId },
  });
  return data.message;
}



/**
 * Get Dashboard Statistic (V3)
 * @param {number} year
 * @param {number} month
 * @param {string} [areaId]
 * @param {string} [packageId]
 *
 * /** @typedef {object} responseGetDashboardStatistics
 * @property {number} amount
 * @property {number} paid
 * @property {number} unpaid
 * @property {number} debt
 * @property {number} countPaid
 * @property {number} countUnpaid
 * @property {number} countPartiallyPaid
 * @property {number} countCanceled
 * @property {object[]} yearOfYear
 * @property {number} yearOfYear._id - month number (1-12)
 * @property {number} yearOfYear.paid
 * @property {number} yearOfYear.amount
 * @property {number} yearOfYear.unpaid
 * @property {number} totalActiveUser
 * @property {number} totalIsolirUser
 * @property {number} totalUser
 * @property {object[]} psbApprovedTrend
 * @property {string} psbApprovedTrend.month - format `YYYY-MM`
 * @property {number} psbApprovedTrend.count
 * @property {number} psbWaitingRegistration
 * @property {number} psbProcessing
 * @property {object[]} ticketTrend
 * @property {string} ticketTrend.month - format `YYYY-MM`
 * @property {Record<string, number>} ticketTrend.categories - keyed by category (e.g. `installation_request`, `maintenance`, `internet_trouble`, `upgrade_request`, `dismaintenance`, `other`)
 * @property {number} ticketTrend.total
 * @property {object[]} ticketStatus
 * @property {string} ticketStatus.status
 * @property {number} ticketStatus.count
 * @returns {Promise<responseGetDashboardStatistics>}
 */
export async function getDashboardStatistics({ year, month, areaId, packageId }) {
  const { data } = await axios.get(`${BASEURLV3}/statistics`, {
    params: { year, month, areaId, packageId },
  });
  return data.message;
}
