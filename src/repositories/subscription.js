import axios from '@commons/axios';
import { BILL_URL } from '@commons/constant';

import 'src/extension/date';

const APIURL = import.meta.env.VITE_API_URL;
const BASEURL = `${APIURL}/admin/subscription`;

/**
 * @typedef {import('./customer').Customer} Customer
 */

/**
 * @typedef {Object} BillingSummary
 * @property {number} amount - The billing amount in currency units.
 * @property {string} summary - A textual summary of the billing period and description.
 * @property {string[]} service - An array of service names included in the billing.
 */

/**
 * @typedef {Object} PaymentHistoryItem
 * @property {string} _id - Unique identifier of the item
 * @property {number} month - The month associated with the item (1-12)
 * @property {number} year - The year associated with the item
 * @property {string} service - Description of the service
 * @property {string} [summaryPeriode] - Optional summary of the service period
 */

/**
 * @typedef {object} PaymentHistory
 * @property {string} _id
 * @property {string} customer
 * @property {string} recipient
 * @property {number} amount
 * @property {string} date
 * @property {string} paymentMethod
 * @property {string} depositMethod
 * @property {string} [note]
 * @property {PaymentHistoryItem[]} items
 */

/**
 * @typedef {Object} BillingActionLog
 * @property {string} _id - Unique identifier (hex string).
 * @property {string} action - Action performed (e.g. "updated").
 * @property {string} description - Human readable description of the action.
 * @property {string} createdAt - ISO timestamp when the action occurred.
 * @property {string} user_id - ID of the user who performed the action.
 * @property {string} userFullname - Full name of the user who performed the action.
 */

/**
 * @typedef {Object} ISimulateChangePackage
 * @property {number} amount - The amount value.
 * @property {number} month - The month value.
 * @property {number} year - The year value.
 * @property {string} duoDate - The due date in string format.
 * @property {number} betweenDays - The number of days between two dates.
 * @property {string} summaryPeriode
 * @property {boolean} [isDelay]
 * @property {string} [delayUntil]
 * @property {number} oldPrice
 * @property {number} oldPricePerDay
 * @property {number} currentBilling
 * @property {number} newPriceMonthly
 * @property {number} newPricePerDay
 */

/**
 * @typedef {object} ChangePlanRequest
 * @property {string} customerId
 * @property {number} price
 * @property {string} packageId
 */

/**
 * @typedef {object} Subscription
 * @property {string} _id
 * @property {string} fullname
 * @property {string} [customerId]
 * @property {string} address
 * @property {string} phone
 * @property {string} area
 * @property {string} areaId
 * @property {string} [odpId]
 * @property {string} [odp]
 * @property {string} [vlan]
 * @property {{lat: number; lng: number}} [location]
 * @property {string} package
 * @property {string} packageId
 * @property {number} price
 * @property {number} billingDebt
 * @property {string} billingId
 * @property {number} billingAmount
 * @property {string} billingStatus
 * @property {string} start
 * @property {string} status
 * @property {boolean} isolated
 * @property {string} [routerSsid]
 * @property {string} [routerPassword]
 * @property {string} [routerSerialNumber]
 * @property {boolean} [isSpecial]
 * @property {string} [lastInvoiceDate]
 * @property {String} [lastInvoiceAmount]
 * @property {String} [isolatedAt]
 * @property {String} [isolatedCode]
 * @property {String} [customerKtp]
 * @property {String} [customerStart]
 * @property {string} [note]
 * @property {string} [systemNote]
 * @property {string} [systemNoteBy]
 * @property {string} [invoiceTemp] -- Invoice Temporary ID
 * @property {string} [acsSerialNumber] -- ACS Serial Number
 *
 * @typedef {object} SubscriptionRequestParams
 * @property {number} packageId
 * @property {number} areaId
 * @property {number} month
 * @property {number} year
 * @property {string} paymentStatus
 * @property {string} status
 * @property {number} page
 * @property {number} limit
 * @property {string} customerNote
 * @property {boolean} availableDebt
 * @property {boolean} differenceNetworkConfiguration
 *
 * @typedef {object} GenerateCustomerBillingRequest
 * @property {string} customer
 * @property {number} month
 * @property {number} year
 *
 * @typedef {object} SubmitPaymentRequest
 * @property {string} customer - Customer ID
 * @property {number} amount - Amount of payment
 * @property {string} date - ISO date without time
 * @property {string} time - ISO date but time only
 * @property {string} paymentMethod - Payment Method
 * @property {string} depositMethod - Deposit Method
 * @property {number} duoDateCharge - Deposit Method
 * @property {File[]} paymentEvidence - Proof of payment image
 * @property {string[]} billingList - Billing list id
 * @property {number[]} amountList
 *
 * @typedef {object} BillingData
 * @property {number} billTotal
 * @property {Customer} customer
 *
 */

/**
 * @typedef {object} Billing
 * @property {string} _id
 * @property {string[]} services
 * @property {number} paid
 * @property {string} status
 * @property {number} month
 * @property {number} year
 * @property {number} amount
 * @property {number} __v
 * @property {string} startSubscribe
 * @property {string} duoDate
 * @property {string} [summaryPeriode]
 * @property {boolean} [editable]
 * @property {string} createdBy
 * @property {string} createdAt
 */

/**
 * @typedef {object} UpdateSomeBilling
 * @property {string} summaryPeriode
 * @property {number} amount
 * @property {string[]} services
 */

/**
 * @typedef {object} InvoiceHistory
 * @property {string} _id
 * @property {string[]} paymentEvidences
 * @property {string} date
 * @property {string} paymentMethod
 * @property {string} depositMethod
 * @property {string} customer
 * @property {number} amount
 * @property {number} duoDateCharge
 * @property {number} __v
 * @property {string} customerId
 * @property {string} customer_id
 * @property {string} customerFullname
 * @property {string} customerAddress
 * @property {string} customerPackage
 * @property {number} customerPackagePrice
 * @property {string} customerVlan
 * @property {string} customerRouterSerialNumber
 * @property {string} customerRouterPassword
 * @property {string} customerRouterSsid
 * @property {string} customerIpremote
 * @property {object} customerLocation
 * @property {number} customerLocation.lat
 * @property {number} customerLocation.lng
 * @property {string} recipientName
 * @property {string} areaTitle
 * @property {string} odpName
 * @property {number} odpLat
 * @property {number} odpLng
 * @property {object[]} billings
 * @property {string[]} billings.services
 * @property {number} billings.amount
 * @property {number} billings.paid
 * @property {string} [note]
 */

/** @typedef {object} PaymentHistorySummary
 * @property {string} _id
 * @property {string} fullname
 * @property {string} email
 * @property {string} phone
 * @property {string} address
 * @property {number} amount
 * @property {object[]} details
 * @property {number} details.amount
 * @property {number} details.depositMethod
 * @property {number} details.paymentMethod
 */

/**
 * @typedef {object} PaymentHistorySummaryByAreaCategory
 * @property {string} _id
 * @property {string} areaCategory
 * @property {object[]} items
 * @property {string} items._id
 * @property {string} items.areaTitle
 * @property {number} items.total
 * @property {number} total
 */

/**
 * @typedef {Object} AddonsRequestItem
 * @property {string} variantId
 * @property {number} price
 * @property {string} start
 */

/**
 * @typedef {object} ISimulateActivateBilling
 * @property {number} amount - The amount value.
 * @property {string} summaryPeriode - The summary of the billing period.
 * @property {string[]} services - An array of service names included in the billing.
 * @property {string} billingCategory - The category of the billing.
 */

/**
 * @typedef {Object} ArchiveInvoice
 * @property {object} createdUser - The user who created the archive
 * @property {string} createdUser._id - Unique identifier of the user
 * @property {string} createdUser.fullname - Full name of the user
 * @property {string} _id - Unique identifier of the archive
 * @property {number} billingYear - The billing year (e.g., 2025)
 * @property {number} billingMonth - The billing month (1-12)
 * @property {string} archiveFilename - The filename of the archived invoice
 * @property {number} totalFiles - Total number of files in the archive
 * @property {number} archivedFiles - Number of files that have been archived
 * @property {string} [finishedAt] - ISO timestamp when the archiving process finished
 * @property {string[]} logMessage
 */

/**
 * @typedef {Object} ArchiveInvoiceParam
 * @property {number} month
 * @property {number} year
 * @property {string} area
 */

/**
 * @typedef {Object} AvailableDismantleFilter
 * @property {string} [search] - Text to search within subscription records.
 * @property {string} [area] - Area ID to filter subscriptions by geographic area.
 * @property {string} [packages] - Package ID to filter subscriptions by internet package.
 * @property {number} [limit] - Maximum number of records to return.
 * @property {number} [page] - Page number for paginated results.
 */

/**
 * @typedef {Object} AvailableDismantleSubscription
 * @property {string} _id - The unique identifier of the subscription.
 * @property {'active' | 'inactive' | string} status - Current status of the subscription.
 * @property {string} fullname - Full name of the subscriber.
 * @property {string} ktp - Filename or path to the subscriber's KTP (Indonesian identity card) document.
 * @property {string} phone - Subscriber's phone number, typically in E.164 format (e.g., "6281917486826").
 * @property {string} address - Physical address of the subscriber.
 * @property {string} routerSerialNumber - Serial number of the installed router.
 * @property {string} ipRemote - Remote IP address assigned to the subscriber's connection.
 * @property {string} pppoeName - PPPoE username used for authentication.
 * @property {string} pppoePassword - PPPoE password used for authentication.
 * @property {string} createdAt - ISO 8601 timestamp indicating when the subscription was created.
 * @property {string} updatedAt - ISO 8601 timestamp indicating when the subscription was last updated.
 * @property {string} customerId - Unique customer identifier, often matching the PPPoE name.
 * @property {string} routerPassword - Admin password for the subscriber's router.
 * @property {string} routerSsid - SSID (network name) broadcasted by the subscriber's Wi-Fi router.
 * @property {string} areaTitle - Human-readable title of the service area (e.g., "INTEK PULAU BULUH | HSGQG08").
 * @property {string} area_id - Unique identifier of the associated service area.
 * @property {string} odpTitle - Title or label of the Optical Distribution Point (ODP).
 * @property {string} odp_id - Unique identifier of the associated ODP.
 * @property {string} packageTitle - Name of the subscribed internet package (e.g., "Home 10 Mbps").
 * @property {string} package_id - Unique identifier of the subscribed package.
 * @property {string} packageStart - ISO 8601 timestamp indicating when the current package started.
 * @property {number} packagePrice - Monthly price of the subscribed package in IDR (e.g., 155000).
 * @property {number} unpaidBillingCount - Number of unpaid billing cycles.
 * @property {number} unpaidBillingAmount - Total amount of unpaid bills in IDR (e.g., 620000).
 */

/**
 *
 * @param {SubscriptionRequestParams} params
 * @returns {Promise<{customerList: Subscription[]; total: number}>}
 */
export const getListSubscription = async (params, signal) => {
  const { data } = await axios.get(BASEURL, { params, signal });
  return data.message;
};

/**
 * @param {GenerateCustomerBillingRequest} body
 */
export const generateCustomerBilling = async (body) => {
  await axios.post(`${BASEURL}/billing/customer-generate`, body);
};

/**
 * @param {string} billing - Kode Billing
 */
export const restoreBilling = async (billing, reason) => {
  await axios.post(`${BASEURL}/billing/restore`, { billing, reason });
};

/**
 * @param {string} billing - Kode Billing
 */
export const cancelBilling = async (billing, reason) => {
  await axios.post(`${BASEURL}/billing/cancel`, { billing, reason });
};

/**
 * @param {SubmitPaymentRequest} body
 */
export const submitPayment = async (body) => {
  const f = new FormData();
  if (body.paymentEvidence) f.append('evidence', body.paymentEvidence);
  f.append('customer', body.customer);
  f.append('amount', body.amount);
  f.append('date', body.date);
  f.append('time', body.time);
  f.append('paymentMethod', body.paymentMethod);
  f.append('depositMethod', body.depositMethod);
  f.append('duoDateCharge', body.duoDateCharge);
  body.billingList.forEach((b, i) => {
    const key = `billingList[${i}]`;
    const value = b;
    f.append(key, value);
  });

  body.paymentEvidence.forEach((p, i) => {
    f.append(`paymentEvidence`, p);
  });

  if (body.amountList) {
    body.amountList.forEach((amount, i) => {
      f.append(`amountList[${i}]`, amount);
    });
  }

  if (!!body.note) f.append('note', body.note);

  await axios.post(`${BASEURL}/payment`, f, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

/**
 * @param {string} customer - customer id
 * @returns {Promise<BillingData>}
 */
export const getBillingData = async (customer) => {
  const { data } = await axios.get(`${BASEURL}/billing-list/${customer}`);
  return data.message;
};

/**
 * @param {string} customer
 * @param {{
 * billingMonth: number;
 * billingYear: number;
 * billingIds: string[];
 * delayUntil?: Date;
 * delayUntilNote: string
 * } | null;} options
 */
export async function isolateNetwork(
  customer,
  { billingMonth, billingYear, billingIds, delayUntil, delayUntilNote } = {
    delayUntil: null,
    billingMonth: null,
    billingYear: null,
    billingIds: null,
    delayUntilNote: null,
  }
) {
  const { data } = await axios.post(`${APIURL}/admin/mikrotik/isolate`, {
    customer,
    ...(delayUntil != null
      ? {
          delayUntil: delayUntil.toISOString(),
          billingMonth,
          billingYear,
          billingIds,
          delayUntilNote,
        }
      : null),
  });

  if (!data.success) {
    throw new Error(data.message);
  }
}

/**
 * @param {area} customer
 * @param {{month: number; year: number}}
 */
export async function isolateNetworkArea(area, { month, year } = {}) {
  const { data } = await axios.post(`${APIURL}/admin/mikrotik/mass-isolate`, {
    area,
    month,
    year,
  });

  if (!data.success) {
    throw new Error(data.message);
  }
}

/**
 * @param {string} customer
 * @param {{scheduled: boolean}} [options]
 */
export async function unisolateNetwork(customer, { scheduled } = { scheduled: false }) {
  const { data } = await axios.delete(`${APIURL}/admin/mikrotik/unisolate`, {
    data: {
      customer,
      scheduled, // apakah hapus isolir bersamaan dengan schedule isolir
    },
  });

  if (!data.success) {
    throw new Error(data.message);
  }
}

/**
 * @param {string} customer
 * @param {{
 * engineers: string[];
 * ticketType: string
 * isUsingTicket: boolean
 * description: string
 * withoutEngineer: boolean
 * }} [options]
 */
export async function turnOffCustomer(
  customer,
  { engineers, ticketType, isUsingTicket, description, withoutEngineer } = {
    engineers: [],
    ticketType: 'dismaintenance',
    isUsingTicket: true,
    description: null,
    withoutEngineer: false,
  }
) {
  const { data } = await axios.post(`${APIURL}/admin/customer/turn-off`, {
    id: customer,
    engineers,
    ticketType,
    isUsingTicket,
    description,
    withoutEngineer,
  });

  if (!data.success) {
    throw new Error(data.message);
  }
}

/**
 * @param {{
 * id: string;
 * fee: {name: string; amount: number}[];
 * isUsingInstallationCharge: boolean
 * }} body
 * @returns {Promise<void>}
 */
export async function activateCustomer(body) {
  const { data } = await axios.post(`${APIURL}/admin/customer/activate`, body);
  if (!data.success) {
    throw new Error(data.message);
  }
}

/**
 * @param {string} customer
 * @returns {Promise<{billings: Billing; total: number}>}
 */
export async function getBillingList(customer) {
  const { data } = await axios.get(`${APIURL}/admin/subscription/billing-list/${customer}`);
  return data.message;
}

/**
 * @param {string} customer
 * @returns {Promise<PaymentHistory[]>}
 */
export async function getPaymentHistory(customer) {
  const { data } = await axios.get(`${APIURL}/admin/customer/payment/${customer}`);
  return data.message;
}

/**
 * @param {string} billingId
 * @param {UpdateSomeBilling} body
 */
export async function updateSomeBilling(billingId, body) {
  const { data } = await axios.patch(`${APIURL}/admin/subscription/billing/${billingId}`, body);
  return data.message;
}

export async function removeSomeInvoice(invoiceId) {
  await axios.delete(`${APIURL}/admin/subscription/invoice/${invoiceId}`);
}

/**
 * Get Invoice / Payment Histories
 * @param {{order: string; orderBy: string; limit: number; page: number; find: string; start: string; until: string; area: string}} param0
 * @returns {Promise<{data: InvoiceHistory[]; total: number}>}
 */
export async function getInvoiceHistory({
  order,
  orderBy,
  limit = 25,
  page = 0,
  find,
  start,
  until,
  depositMethod,
  area,
} = {}) {
  const { data } = await axios.get(`${APIURL}/admin/subscription/payment-histories`, {
    params: {
      order,
      orderBy,
      limit,
      page,
      find,
      start,
      until,
      depositMethod,
      area,
    },
  });

  return data.message;
}

/**
 *
 * @param {{start: string | Date; until: string | Date; area: string}} param0
 * @returns {Promise<PaymentHistorySummary[]>}
 */
export async function getHistoryPaymentSummary({ start = new Date(), until = new Date(), area }) {
  const { data } = await axios.get(`${APIURL}/admin/subscription/payment-histories/summary`, {
    params: {
      start: new Date(start).format('yyyy-MM-dd'),
      until: new Date(until).format('yyyy-MM-dd'),
      area,
    },
  });

  return data.message;
}

/**
 *
 * @param {{start: Date; until: Date}} param0
 * @returns {Promise<PaymentHistorySummaryByAreaCategory[]>}
 */
export async function getHistoryPaymentSummaryByArea({ start = new Date(), until = new Date() }) {
  const url = `${APIURL}/admin/subscription/payment-histories/summary-area`;
  const { data } = await axios.get(url, {
    params: {
      start: new Date(start).format('yyyy-MM-dd'),
      end: new Date(until).format('yyyy-MM-dd'),
    },
  });
  return data.message;
}

/**
 * @param {ChangePlanRequest} body
 * @returns {Promise<string>}
 */
export async function changePackageSubscription(body) {
  const url = `${APIURL}/admin/subscription/change-package`;
  const { data } = await axios.patch(url, body);
  return data.message;
}

/**
 *
 * @param {ChangePlanRequest} body
 * @returns {Promise<{newBillingSummary: BillingSummary; latestBillingSummary: BillingSummary}>}
 */
export async function simulateChangePackageSubscription(body) {
  const url = `${APIURL}/admin/subscription/simulate-change-package`;
  const { data } = await axios.post(url, body);
  return data.message;
}

/**
 *
 * @param {string} customerId
 * @param {AddonsRequestItem[]} items
 */
export async function updateSubscriptionAddons(customerId, items) {
  const url = `${APIURL}/admin/subscription/change-addons/${customerId}`;
  const { data } = await axios.patch(url, { items });
  return data.message;
}

/**
 * @param {{
 * id: string;
 * fee: {name: string; amount: number}[];
 * isUsingInstallationCharge: boolean
 * }} body
 * @returns {Promise<ISimulateActivateBilling[]>}
 */
export async function simulateActivationBilling(body) {
  const url = `${APIURL}/admin/customer/simulate-activation`;
  const { data } = await axios.post(url, body);
  return data.message;
}

/**
 *
 * @param {{
 * customerId: string;
 * limit?: number;
 * page?: number;
 * }} param0
 * @returns {Promise<{data: BillingActionLog[]; total: number}>}
 */
export async function getBillingActionLogs({ customerId, limit = 10, page = 0 }) {
  const url = `${APIURL}/admin/subscription/billing/action-log`;
  const { data } = await axios.get(url, {
    params: {
      customerId,
      limit,
      page,
    },
  });
  return data.message;
}

/**
 * Remove Billing
 * @param {{billings: string[], reason: string}} param0
 * @returns
 */
export async function removeBilling({ billings, reason }) {
  const url = `${APIURL}/admin/subscription/billing/remove`;
  const { data } = await axios.patch(url, { billings, reason });
  return data.message;
}

/**
 * Get Archive Invoices
 * @param {ArchiveInvoiceParam} param0
 * @returns {Promise<ArchiveInvoice[]>}
 */
export async function getArchiveInvoices() {
  const url = `${APIURL}/admin/subscription/archive`;
  const { data } = await axios.get(url);
  return data.message;
}

/**
 * Get Archive Invoice Detail
 * @param {string} id
 * @returns {Promise<ArchiveInvoice>}
 */
export async function getArchiveInvoiceDetail(id) {
  const url = `${APIURL}/admin/subscription/archive/${id}`;
  const { data } = await axios.get(url);
  return data.message;
}

/**
 * Archive Invoices
 * @param {ArchiveInvoiceParam} param0
 * @returns {Promise<ArchiveInvoice>}
 */
export async function archiveInvoices({ month, year, area }) {
  const url = `${APIURL}/admin/subscription/archive`;
  const { data } = await axios.patch(url, { month, year, area });
  return data.message;
}

/**
 * Download Archive Invoices
 */
export async function archiveInvoicedownload(id) {
  const url = `${BILL_URL}/api/download-archive-invoice/${id}`;
  window.open(url, '_blank');
}

/**
 * Remove Archive Invoice
 * @param {string} id
 * @returns
 */
export async function archiveInvoiceRemove(id) {
  const url = `${APIURL}/admin/subscription/archive/${id}`;
  const { data } = await axios.delete(url);
  return data.message;
}

/**
 * Get Available Dismantle Subscriptions
 * @param {AvailableDismantleFilter} filters
 * @returns {Promise<{data: AvailableDismantleSubscription[]; total: number; minimumAmont: number}>}
 */
export async function getAvailableDismantleSubscriptions(filters = {}) {
  const url = `${APIURL}/admin/subscription/available-dismantle`;
  const { data } = await axios.get(url, {
    params: filters,
  });
  return data.message;
}

/**
 * Generate Mass Billing
 * @param {Object} body
 * @param {string} body.area -- Area ID
 * @param {number} body.month -- Month (1-12)
 * @param {number} body.year -- Year (e.g., 2025)
 * @returns {Promise<string>}
 */
export async function generateMassBilling(body) {
  const url = `${APIURL}/admin/subscription/billing/mass-generate`;
  const { data } = await axios.post(url, body);
  return data.message;
}
