import axios from '@commons/axios';

/**
 * @typedef {object} PublicSummaryInstallationReport
 * @property {string} customerFullname
 * @property {string} engineerFullname
 * @property {null} clientHousePhoto
 * @property {string} installedModemPhoto
 * @property {string} modemSerialNumberPhoto
 * @property {string} OPMResultPhoto
 * @property {object[]} resources
 * @property {string} resources.name
 * @property {string} resources.description
 * @property {string} resources.unitType
 * @property {number} resources.amount
 * @property {string} customerRouterSerialNumber
 */

/**
 * @typedef {object} PublicSummaryReportPSB
 * @property {string} fullname
 * @property {string} status
 * @property {string} area
 */

/**
 * @typedef {object} BillingAnonymous
 * @property {object} customer - Customer details.
 * @property {string} customer.customerId - The customer's ID.
 * @property {string} customer.fullname - The customer's full name.
 * @property {string} customer.phone - The customer's phone number.
 * @property {string} customer.areaTitle - The customer's area title.
 * @property {boolean} customer.isPrepaid - Whether the customer is prepaid.
 * @property {boolean} customer.isolir - Whether the customer is isolated.
 * @property {object[]} billings - List of billing details.
 * @property {string} billings._id - The billing ID.
 * @property {object} billings.additionalInformation - Additional information about the billing.
 * @property {string|null} billings.additionalInformation.upgradeToPackage - The package to upgrade to (if any).
 * @property {number|null} billings.additionalInformation.upgradeToPrice - The price of the upgrade (if any).
 * @property {string[]} billings.services - List of services included in the billing.
 * @property {number} billings.paid - The amount paid for the billing.
 * @property {string} billings.status - The status of the billing (e.g., "unpaid").
 * @property {string} billings.billingCategory - The category of the billing (e.g., "activate_customer").
 * @property {number} billings.year - The year of the billing.
 * @property {number} billings.month - The month of the billing.
 * @property {number} billings.amount - The total amount of the billing.
 * @property {string} billings.summaryPeriode - The summary of the billing period.
 * @property {string} billings.duoDate - The due date of the billing in ISO format.
 * @property {string} billings.createdAt - The creation date of the billing in ISO format.
 * @property {string} billings.updatedAt - The last update date of the billing in ISO format.
 * @property {number} billings.__v - The version key of the billing.
 * @property {string} billings.startSubscribe - The subscription start date in ISO format.
 * @property {number} total - The total amount of all billings combined.
 */

const BASEURL = `${import.meta.env.VITE_API_URL}/summary`;

/**
 * @param {string} id
 * @returns {Promise<PublicSummaryInstallationReport>}
 */
export async function getInstallationReport(id) {
  const { data } = await axios.get(`${BASEURL}/installation-report/${id}`);
  return data.message;
}

/**
 * @param {string} id
 * @param {string} date
 * @returns {Promise<PublicSummaryReportPSB[]>}
 */
export async function getReportPsb(id, date) {
  const { data } = await axios.get(`${BASEURL}/report-psb/${id}`, { params: { date } });
  return data.message;
}

/**
 *
 * @param {string} customerId
 * @returns {Promise<BillingAnonymous>}
 */
export async function getBillingAnonymous(customerId) {
  const { data } = await axios.get(`${BASEURL}/billing-list/${customerId}`);
  return data.message;
}
