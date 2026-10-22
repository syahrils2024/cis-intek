import axios from '@commons/axios';

const APIURL = import.meta.env.VITE_API_URL;
const BASEURL = `${APIURL}/admin/payment-order`;
const BASEURL_DUITKU = `${APIURL}/admin/duitku`;

/**
 * @typedef {Object} PaymentGatewayOrderItem
 * @property {string} billingId - The billing ID associated with this item
 * @property {string} name - The name/description of the item
 * @property {number} amount - The amount for this item
 */

/**
 * @typedef {Object} PaymentGatewayOrder
 * @property {string|null} qrString - The QR code string for payment (nullable)
 * @property {string|null} vaNumber - The virtual account number for payment (nullable)
 * @property {string} _id - The unique identifier for the payment order
 * @property {string} customerId - The customer's unique identifier
 * @property {string} customer_id - The customer's unique identifier
 * @property {string} customerFullname - The full name of the customer
 * @property {number} amount - The total payment amount
 * @property {number} fee - The payment processing fee
 * @property {string} gateway - The payment gateway used (e.g., "duitku")
 * @property {string} referenceOrderId - The reference order ID from the payment gateway
 * @property {string} paymentUrl - The URL for completing the payment
 * @property {string} productDetails - Description of the product/service being paid for
 * @property {PaymentGatewayOrderItem[]} items - Array of items included in this payment order
 * @property {string} status - The current status of the payment order (e.g., "success")
 * @property {string} expiredAt - The expiration timestamp for the payment order
 * @property {string} payAt - The timestamp when the payment was completed
 * @property {string} paymentCode - The payment method code (e.g., "DA" for DANA)
 * @property {string} paymentName - The display name of the payment method
 * @property {string} paymentImageUrl - The URL of the payment method's image
 * @property {string|null} paymentCategory - The category of the payment method (nullable)
 * @property {string} createdAt - The timestamp when the order was created
 * @property {number} __v - The version key (MongoDB versioning field)
 */

/**
 * @typedef {Object} PaymentGatewaySummaryPayment
 * @property {string} _id - The payment method identifier/name
 * @property {number} totalAmount - The total amount for this payment method
 * @property {number} totalFee - The total fee for this payment method
 */

/**
 * @typedef {Object} PaymentGatewaySummaryArea
 * @property {string} _id - The unique identifier for the area
 * @property {string} title - The title/name of the area
 * @property {PaymentGatewaySummaryPayment[]} payments - Array of payment method summaries for this area
 * @property {number} totalAmount - The total amount across all payment methods in this area
 * @property {number} totalFee - The total fee across all payment methods in this area
 */

/**
 * @typedef {Object} PaymentGatewayOrderQuery
 * @property {number} page - The current page number for pagination
 * @property {number} limit - The number of items per page
 * @property {string} [search] - The search query string (optional)
 * @property {string} [status] - The status filter for orders (optional)
 * @property {string} [paymentCode] - The payment method code filter (optional)
 * @property {string} [start] - The start date for filtering orders (optional)
 * @property {string} [until] - The end date for filtering orders (optional)
 * @property {string} [areaId] - The area ID filter for orders (optional)
 */

/**
 * Get Payment Orders with Pagination and Filters
 * @param {PaymentGatewayOrderQuery} params
 * @returns {Promise<{total: number; data: PaymentGatewayOrder[]}>}
 */
export async function getOrders(params) {
  const { data } = await axios.get(BASEURL, { params });
  return data.data;
}

/**
 * Get Payment Order Detail
 * @param {*} id
 * @returns {Promise<PaymentGatewayOrder>}
 */
export async function getOrderDetail(id) {
  const { data } = await axios.get(`${BASEURL}/detail/${id}`);
  return data.data;
}

/**
 * Get Payment Order Detail
 * @param {*} id
 * @returns {Promise<PaymentGatewayOrder>}
 */
export async function recheckOrder(id) {
  const { data } = await axios.patch(`${BASEURL}/check-status`, {
    merchantOrderId: id,
  });
  return data.data;
}

/**
 * Get Summary of Payment Orders by Area
 * @returns {Promise<PaymentGatewaySummaryArea[]>}
 */
export async function getSummaryArea({ start, until }) {
  const { data } = await axios.get(`${BASEURL}/summary`, {
    params: { start, until },
  });
  return data.data;
}
