import axios from 'src/commons/axios';

const BASEURL = `${import.meta.env.VITE_API_URL}/admin/xlsx`;

/**
 * @typedef {object} DownloadCustomerTemplateParam
 * @property {string} areaId - The ID of the area.
 * @property {string} [odpId] - The optional ID of the ODP (Optical Distribution Point).
 * @property {string} packageId - The ID of the package.
 * @property {number} amount - The amount associated with the item.
 */

/**
 * @typedef {object} DownloadBillingTemplateParam
 * @property {string} areaId - The ID of the area.
 * @property {number} amount - The amount associated with the item.
 * @property {number} month
 * @property {number} year
 */

/**
 * @typedef {object} CustomerTemplateValidation
 * @property {string} customerId - The unique identifier of the customer.
 * @property {string} customerFullname - The full name of the customer.
 * @property {string} customerPhone - The phone number of the customer.
 * @property {string} customerAddress - The address of the customer.
 * @property {string} customerActiveStart - The start date of the customer's activity (ISO format or Date).
 * @property {string} package - The name of the package.
 * @property {string} packageId - The unique identifier of the package.
 * @property {number} packagePrice - The price of the package.
 * @property {string} areaTitle - The title of the area.
 * @property {string} areaId - The unique identifier of the area.
 * @property {string} odpTitle - The title of the ODP (Optical Distribution Point).
 * @property {string} odpId - The unique identifier of the ODP.
 * @property {string} vlan - The VLAN associated with the customer.
 * @property {string} pppoeName - The PPPoE name for the customer.
 * @property {string} pppoePassword - The PPPoE password for the customer.
 * @property {string} ipRemote - The remote IP address for the customer.
 * @property {string} routerSsid - The SSID of the customer's router.
 * @property {string} routerSerialNumber - The serial number of the customer's router.
 * @property {string} routerPassword - The password for the customer's router.
 */

/**
 * @typedef {object} BillingTemplateValidation
 * @property {string} [customer_id] - The optional legacy customer ID.
 * @property {string} [customerId] - The optional customer ID.
 * @property {string} [customerFullname] - The optional full name of the customer.
 * @property {string} [customerPhone] - The optional phone number of the customer.
 * @property {string} [customerAddress] - The optional address of the customer.
 * @property {string} [areaTitle] - The optional title of the area.
 * @property {string} areaId - The unique identifier of the area.
 * @property {number} month - The month of the billing.
 * @property {number} year - The year of the billing.
 * @property {string} duoDate - The due date of the billing in ISO format.
 * @property {string} summaryPeriode - The summary of the billing period.
 * @property {number} amount - The total amount of the billing.
 * @property {number} pay - The amount paid for the billing.
 * @property {string} payAt - The date and time of payment in ISO format.
 * @property {string} services - The services included in the billing.
 */

/**
 * @typedef {Object} ODPTemplateValidation
 * @property {string} odpName - Name of the ODP
 * @property {string} areaTitle - Title of the area
 * @property {string} areaId - The unique identifier of the area
 * @property {boolean} exists - Whether the ODP exists
 * @property {number} lat - Latitude coordinate
 * @property {number} lng - Longitude coordinate
 * @property {number} port - Port number
 * @property {string|null} description - Description of the ODP
 * @property {string|null} error - Error message if any
 */

/**
 * @typedef {Object} OdpEntry
 * @property {string[]} parentODPList - List of parent ODP IDs
 * @property {string[]} parentAreaList - List of parent area IDs
 * @property {string} _id - MongoDB ID of the ODP
 * @property {string} name - Name of the ODP
 * @property {string} parentArea - Parent area ID
 * @property {number} port - Port number of the ODP
 * @property {number} lat - Latitude coordinate
 * @property {number} lng - Longitude coordinate
 */

/**
 * @typedef {Object} AddonEntry
 * @property {string} _id - MongoDB ID of the addon
 * @property {string} variantName - Name of the addon
 */

/**
 * @typedef {Object} CustomerData
 * @property {string} customerId - Customer ID
 * @property {string} customerFullname - Customer full name
 * @property {string} customerKtp - Customer KTP number
 * @property {string} customerPhone - Customer phone number
 * @property {string} customerAddress - Customer address
 * @property {string} customerActiveStart - Customer activation date (ISO 8601)
 * @property {string} package - Package name
 * @property {string} packagePrice - Package price
 * @property {string} areaTitle - Area title
 * @property {string} odpTitle - ODP title
 * @property {string} vlan - VLAN identifier
 * @property {string} pppoeName - PPPoE username
 * @property {string} pppoePassword - PPPoE password
 * @property {string} ipRemote - Remote IP address
 * @property {string} routerSsid - Router SSID
 * @property {string} routerSerialNumber - Router serial number
 * @property {string} routerPassword - Router password
 * @property {string} routerMac - Router MAC address
 * @property {boolean} areaExist - Whether area exists
 * @property {string} areaId - Area ID
 * @property {boolean} packageExist - Whether package exists
 * @property {string} packageId - Package ID
 * @property {boolean} odpCreateNew - Whether ODP is newly created
 * @property {boolean} odpExist - Whether ODP exists
 * @property {string} odpId - ODP ID
 * @property {boolean} addonsExist - Whether addons exist
 * @property {string|null} addonsId - Addon ID
 * @property {string|null} addonsName - Addon Name
 * @property {number} addonsPrice - Addon Price
 * @property {boolean} addonsCreateNew - Whether addon is newly created
 * @property {string} [odpKey] - Optional ODP key identifier
 */

/**
 * @typedef {Object} CustomerTemplateValidationV2
 * @property {number} totalData - Total number of data records
 * @property {number} totalNewODP - Total number of new ODPs
 * @property {number} totalNewAddons - Total number of new addons
 * @property {Object.<string, OdpEntry>} newOdp - Map of new ODP entries by key
 * @property {Object.<string, AddonEntry>} newAddons - Map of new addons
 * @property {CustomerData[]} data - Array of customer data
 * @property {CustomerData[]} hasRegisterData - Array of registered data
 */

/**
 * @typedef {Object} BillingTemplateValidationV2
 * @property {string} customerId - The unique identifier of the customer
 * @property {string} month - The month of the payment (as string)
 * @property {string} year - The year of the payment (as string)
 * @property {string} summaryPeriode - The billing period summary description
 * @property {string} amount - The total amount to be paid (as string)
 * @property {string} pay - The amount actually paid (as string)
 * @property {string} payAt - The payment date and time (GMT+0700 format)
 * @property {string} depositMethodTitle - The title/name of the deposit method
 * @property {string} customerAddress - The address of the customer
 * @property {string} customerFullname - The full name of the customer
 * @property {string} customerPhone - The phone number of the customer
 * @property {string} areaId - The unique identifier of the area
 * @property {string} areaTitle - The title/name of the area
 * @property {string} depositMethodId - The unique identifier of the deposit method
 * @property {string | null} [error] - errors
 * @property {boolean} [hasExported]
 * @property {string} billingCategory
 */

/**
 * [DEPRECATED] Download Template Import For Import Customer
 * @param {DownloadCustomerTemplateParam[]} items
 */
export async function downloadCustomerTemplate(items) {
  const url = `${BASEURL}/customer`;
  const { data } = await axios.post(url, { items }, { responseType: 'blob' });
  return data;
}

/**
 * Download Template Import For Import Customer
 * @param {DownloadCustomerTemplateParam[]} items
 */
export async function downloadCustomerTemplateV2() {
  const url = `${BASEURL}/customer/v2`;
  const { data } = await axios.post(url, {}, { responseType: 'blob' });
  return data;
}

/**
 * [DEPRECATED] Validate
 * @param {File} file
 * @returns {Promise<CustomerTemplateValidation[]>}
 */
export async function validateCustomerTemplate(file) {
  if (!file.name.includes('xls')) throw new Error('File harus berformat xls');
  const fd = new FormData();
  fd.append('file', file);

  const url = `${BASEURL}/customer/validate`;
  const { data } = await axios.post(url, fd);

  return data.message;
}

/**
 * Validate
 * @param {File} file
 * @returns {Promise<CustomerTemplateValidation[]>}
 */
export async function validateCustomerTemplateV2(file) {
  if (!file.name.includes('xls')) throw new Error('File harus berformat xls');
  const fd = new FormData();
  fd.append('file', file);

  const url = `${BASEURL}/customer/validate/v2`;
  const { data } = await axios.post(url, fd);

  return data.message;
}

/**
 * [DEPRECATED] Confirm Upload After Validate
 * @param {CustomerTemplateValidation[]} items
 * @returns {Promise<string>}
 */
export async function importCustomer(items) {
  const url = `${BASEURL}/customer/import`;
  const { data } = await axios.post(url, { items });
  return data.message;
}

/**
 * Confirm Upload After Validate
 * @param {CustomerTemplateValidationV2} body
 * @returns {Promise<string>}
 */
export async function importCustomerV2(body) {
  const url = `${BASEURL}/customer/import/v2`;
  const { data } = await axios.post(url, { ...body });
  return data.message;
}

/**
 * [DEPRECATED] Create import billing template
 * @param {DownloadBillingTemplateParam[]} items
 * @returns {Promise<Blob>}
 */
export async function downloadBillingTemplate(items) {
  const url = `${BASEURL}/billing`;
  const { data } = await axios.post(
    url,
    { items },
    {
      responseType: 'blob',
    }
  );
  return data;
}

/**
 * Create import billing template V2
 * @returns {Promise<Blob>}
 */
export async function downloadBillingTemplateV2() {
  const url = `${BASEURL}/billing/v2`;
  const { data } = await axios.post(
    url,
    {},
    {
      responseType: 'blob',
    }
  );
  return data;
}

/**
 * Confirm Upload After Validate
 * @param {BillingTemplateValidation[]} items
 * @returns {Promise<string>}
 */
export async function importBilling(items) {
  const url = `${BASEURL}/billing/import`;
  const { data } = await axios.post(url, { items });
  return data.message;
}

/**
 * Confirm Upload After Validate
 * @param {BillingTemplateValidationV2[]} items
 * @returns {Promise<string>}
 */
export async function importBillingV2(items) {
  const url = `${BASEURL}/billing/import/v2`;
  const { data } = await axios.post(url, { items });
  return data.message;
}

/**
 * Validate
 * @param {File} file
 * @returns {Promise<BillingTemplateValidation[]>}
 */
export async function validateBillingTemplate(file) {
  if (!file.name.includes('xls')) throw new Error('File harus berformat xls');
  const fd = new FormData();
  fd.append('file', file);

  const url = `${BASEURL}/billing/validate`;
  const { data } = await axios.post(url, fd);

  return data.message;
}

/**
 * Validate
 * @param {File} file
 * @returns {Promise<BillingTemplateValidationV2>}
 */
export async function validateBillingTemplateV2(file) {
  if (!file.name.includes('xls')) throw new Error('File harus berformat xls');
  const fd = new FormData();
  fd.append('file', file);

  const url = `${BASEURL}/billing/validate/v2`;
  const { data } = await axios.post(url, fd);

  return data.message;
}

/**
 * @param {File} file
 * @returns {Promise<ODPTemplateValidation[]>}
 */
export async function validateOdpTemplate(file) {
  if (!file.name.includes('xls')) throw new Error('File harus berformat xls');
  const fd = new FormData();
  fd.append('file', file);

  const url = `${BASEURL}/odp/validate`;
  const { data } = await axios.post(url, fd);

  return data.message;
}

/**
 * Download ODP Template
 * @returns {Promise<Blob>}
 */
export async function downloadOdpTemplate() {
  const url = `${BASEURL}/odp`;
  const { data } = await axios.post(
    url,
    {},
    {
      responseType: 'blob',
    }
  );
  return data;
}

/**
 * Confirm Upload After Validate
 * @param {ODPTemplateValidation[]} items
 * @returns {Promise<string>}
 */
export async function importOdp(items) {
  const url = `${BASEURL}/odp/import`;
  const { data } = await axios.post(url, items);
  return data.message;
}
