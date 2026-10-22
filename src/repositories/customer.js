import axios from 'src/commons/axios';

const APIURL = import.meta.env.VITE_API_URL;
const BASEURL = `${APIURL}/admin/customer`;

/**
 * @typedef {object} PSBChart
 * @property {string} areaTitle
 * @property {number} count
 * @property {string} date
 */

/**
 * @typedef {object} CustomerMigrationPackageLog
 * @property {string} _id - The unique identifier of the migration log.
 * @property {string} fromPackageName - The name of the package the customer is migrating from.
 * @property {string} toPackageName - The name of the package the customer is migrating to.
 * @property {string} createdBy - The ID of the user who created the migration log.
 * @property {string} fromPackage - The ID of the package the customer is migrating from.
 * @property {string} toPackage - The ID of the package the customer is migrating to.
 * @property {string} createdAt - The date and time when the migration log was created (ISO format).
 * @property {string} updatedAt - The date and time when the migration log was last updated (ISO format).
 * @property {number} __v - The version key of the migration log.
 * @property {string} customerFullname - The full name of the customer.
 * @property {string} customerId - The ID of the customer.
 * @property {string} customerPhone - The phone number of the customer.
 * @property {string} customerAddress - The address of the customer.
 * @property {string} createdByFullname - The full name of the user who created the migration log.
 */

/**
 * @typedef {Object} Location
 * @property {number} lat - Latitude coordinate.
 * @property {number} lng - Longitude coordinate.
 */

/**
 * @typedef {Object} ActivePackage
 * @property {string} [package] - The ID of the package (assumed to be an ObjectId).
 * @property {number} price - The price of the active package.
 * @property {Date} start - The start date of the active package.
 */

/**
 * @typedef {object} CustomerDetail
 * @property {object} location - Geographic location of customer
 * @property {number} location.lat - Latitude coordinate
 * @property {number} location.lng - Longitude coordinate
 * @property {object} activePackage - Active package information
 * @property {string} activePackage.start - Package start date
 * @property {string} activePackage.package - Package ID
 * @property {number} activePackage.price - Package price
 * @property {string} dateOfBirth - Customer's date of birth
 * @property {string} phone - Customer's phone number
 * @property {string} address - Customer's address
 * @property {Array<string>} parentArea - Array of parent area IDs
 * @property {Array<string>} parentODPList - Array of parent ODP IDs
 * @property {string} status - Customer status (active, inactive, etc.)
 * @property {Array<string>} engineers - Array of engineer IDs assigned to customer
 * @property {string} routerSerialNumber - Router serial number
 * @property {string} routerSsid - Router SSID/WiFi name
 * @property {string} routerPassword - Router password
 * @property {string} routerMac - Router MAC address
 * @property {boolean} isSpecial - Whether customer is marked as special
 * @property {string} [note] - Additional notes
 * @property {boolean} isSimplePSB - Whether customer uses simple PSB
 * @property {string} [systemNote] - System notes
 * @property {string} [systemNoteBy] - User who added system note
 * @property {string} _id - Unique customer identifier
 * @property {string} fullname - Customer's full name
 * @property {string} ktp - KTP/ID card image filename
 * @property {string} area - Area ID
 * @property {string} customerId - Custom customer ID
 * @property {string} ODP - ODP (Outdoor Distribution Point) ID
 * @property {string} vlan - VLAN identifier
 * @property {string} ipRemote - Remote IP address
 * @property {string} pppoeName - PPPoE username
 * @property {string} pppoePassword - PPPoE password
 * @property {string} engineer - Primary engineer ID
 * @property {string} marketing - Marketing person ID
 * @property {string} requestBy - User who made the request
 * @property {string} approveBy - User who approved
 * @property {string} processAt - When the request was processed
 * @property {string} createdAt - Creation timestamp
 * @property {string} updatedAt - Last update timestamp
 * @property {number} __v - Version key
 * @property {string} finishProcessAt - When the process was finished
 * @property {Array} addons - Additional services/addons
 * @property {boolean} isolated - Whether customer is isolated
 * @property {string} [isolatedAt] - Isolation timestamp
 * @property {string} isolatedCode - Isolation code
 * @property {string} ODPName - ODP name
 * @property {string} areaName - Area name
 * @property {boolean} isPrepaid - Whether customer is prepaid
 * @property {object} packageData - Package details
 * @property {string} packageData._id - Package ID
 * @property {string} packageData.title - Package title
 * @property {number} totalUnpaidBilling - Total unpaid billing amount
 *
 * @example
 * {
 *     "location": {
 *         "lat": 0.9981147,
 *         "lng": 103.4438682
 *     },
 *     "activePackage": {
 *         "start": "2024-12-31T09:10:17.621Z",
 *         "package": "68cd04a7a5551375f7e74eac",
 *         "price": 250000
 *     },
 *     "phone": "6285376611176",
 *     "dateOfBirth": "2024-12-29T05:49:26.271Z",
 *     "address": "Teluk air blakang prb",
 *     "parentArea": [
 *         "60e10b306033e1530cb1acd5",
 *         "60e10bd96033e1530cb1acf4",
 *         "6753bc1b9ea8e18e73289fae"
 *     ],
 *     "parentODPList": [
 *         "670c65172a27aeb0c32e9285"
 *     ],
 *     "status": "active",
 *     "engineers": [
 *         "63ef24658de9ef0366ef5d44",
 *         "63ef24658de9ef0366ef5d44",
 *         "675642d8dd67e10a7e46f691",
 *         "675644badd67e10a7e46f75e"
 *     ],
 *     "routerSerialNumber": "ZTEGCE16B6C8",
 *     "routerSsid": "ONEacses",
 *     "routerPassword": "twotwo22",
 *     "routerMac": "",
 *     "isSpecial": false,
 *     "note": null,
 *     "isSimplePSB": false,
 *     "systemNote": null,
 *     "systemNoteBy": null,
 *     "_id": "677396b470c89f2e3fa36a13",
 *     "fullname": "A.ALISYADIKIN",
 *     "ktp": "ktp-6772b91f70c89f2e3fa3546f-1735571743978.png",
 *     "area": "62edb1649eab782af8a953e5",
 *     "customerId": "SDM-HG1-15714",
 *     "ODP": "670c65172a27aeb0c32e9285",
 *     "vlan": "VLAN 1001",
 *     "ipRemote": "25.1.1.5",
 *     "pppoeName": "SDM-HG1-15714",
 *     "pppoePassword": "085376611176",
 *     "engineer": "63ef24658de9ef0366ef5d44",
 *     "marketing": "63ef24658de9ef0366ef5d44",
 *     "requestBy": "63ef24658de9ef0366ef5d44",
 *     "approveBy": "6756405add67e10a7e46f528",
 *     "processAt": "2024-12-31T07:01:08.098Z",
 *     "createdAt": "2024-12-31T07:01:08.104Z",
 *     "updatedAt": "2026-02-19T14:58:43.923Z",
 *     "__v": 2,
 *     "finishProcessAt": "2025-01-02T01:54:09.448Z",
 *     "addons": [],
 *     "isolated": false,
 *     "isolatedAt": null,
 *     "isolatedCode": "",
 *     "ODPName": "ODP B SD 011 TLK AIR TBK",
 *     "areaName": "POP SIDOMULYO | HG-G16P",
 *     "isPrepaid": true,
 *     "packageData": {
 *         "_id": "68cd04a7a5551375f7e74eac",
 *         "title": "Home 50 Mbps Seru"
 *     },
 *     "totalUnpaidBilling": 250000
 * }
 */

/**
 * @typedef {Object} Customer
 * @property {string} _id
 * @property {string} phone - Customer's phone number.
 * @property {string} fullname - Customer's full name.
 * @property {Date} dateOfBirth - Customer's date of birth.
 * @property {string} address - Customer's address.
 * @property {Location} [location] - Customer's geographic location.
 * @property {ActivePackage} [activePackage] - Details about the customer's active package.
 * @property {boolean} [isolated] - Whether the customer is isolated or not.
 * @property {string} [pppoeName] - PPPoE name for customer access.
 * @property {string} [pppoePassword] - PPPoE password for customer access.
 * @property {string} [vlan] - VLAN identifier.
 * @property {string} [ipRemote] - IP remote access for the customer.
 * @property {Array<string>} parentArea - Array of parent area IDs (assumed to be ObjectIds).
 * @property {string} area - Customer's area ID (assumed to be an ObjectId).
 * @property {Array<string>} parentODPList - List of parent ODP IDs (assumed to be ObjectIds).
 * @property {string} ODP - ODP ID (assumed to be an ObjectId).
 * @property {string} [ktp] - Customer's KTP identifier.
 * @property {string} engineer - Engineer ID assigned to the customer (assumed to be an ObjectId).
 * @property {string} marketing - Marketing ID assigned to the customer (assumed to be an ObjectId).
 * @property {string} status - The status of the customer (assumed to be a CustomerStatus enum value).
 * @property {string} createdAt - The status of the customer (assumed to be a CustomerStatus enum value).
 * @property {string} [customerId] - The status of the customer (assumed to be a CustomerStatus enum value).
 * @property {import('./area').Odp} [ODPDetail] - The status of the customer (assumed to be a CustomerStatus enum value).
 * @property {string} [odpName]
 * @property {string} [areaName]
 * @property {string[]} [engineers]
 * @property {string} [routerSsid]
 * @property {string} [routerPassword]
 * @property {string} [routerSerialNumber]
 * @property {Array<{_id: string; fullname: string}>} [engineersData] -- IN Endpoint InstallationQueue
 * @property {string} [engineerName] -- IN Endpoint InstallationQueue
 * @property {string} [boolean] -- status
 * @property {string} [note]
 * @property {Boolean} [isSimplePSB]
 * @property {string[]} [additionalPhoneNumber]
 */

export const getCustomerList = async () => {};

/**
 * @param {{page: number, limit: number, find: string; status: string}} params
 * @returns {Promise<{customerList: Customer[]; total: number>}}
 */
export const getCustomerQueue = async ({ page, limit, find, status, order, orderBy }) => {
  const { data } = await axios.get(`${BASEURL}/queue`, {
    params: { page, limit, find, status, order, orderBy },
  });
  return data.message;
};

/**
 * @param {{page: number, limit: number, find: string; order: string; orderBy: string; start: string; until: string}} params
 * @returns {Promise<{customerList: Customer[]; total: number>}}
 */
export const getCustomerFinish = async ({
  page,
  limit,
  find,
  status,
  order,
  orderBy,
  start,
  until,
  area,
} = {}) => {
  const { data } = await axios.get(`${BASEURL}/finish`, {
    params: { page, limit, find, status, order, orderBy, start, until, area },
  });
  return data.message;
};

/**
 * @typedef {object} ICustomerForm
 * @property {string} [id]
 * @property {string} fullname
 * @property {string} phone
 * @property {string} birth
 * @property {string} address
 * @property {number} lat
 * @property {number} long
 * @property {string} [serverAreaId]
 * @property {string} [packetPlanId]
 * @property {number} price
 * @property {string} start
 * @property {string} [vlanId]
 * @property {string} [serverOdpId]
 * @property {string} PPPoEName
 * @property {string} PPPoEPassword
 * @property {string} ipRemote
 * @property {string} status
 * @property {string} [routerSsid]
 * @property {string} [routerPassword]
 * @property {string} [routerSerialNumber]
 * @property {File} [ktpImage]
 */

/**
 * @typedef {Object} PPPActive
 * @property {string} flags - Status flags (e.g., "R - radius")
 * @property {string} name - PPP connection name/identifier
 * @property {string} service - Service type (e.g., "pppoe")
 * @property {string} id - Unique identifier in hexadecimal format
 * @property {string} address - IP address assigned to the connection
 * @property {string} uptime - Connection uptime in format "XdXhXmXs"
 * @property {string} encoding - Encoding type (can be empty string)
 * @property {string} in - Incoming data/packets count
 * @property {string} out -

/**
 * @param {string} id
 */
export async function removeCustomer(id) {
  await axios.delete(`${BASEURL}/queue`, {
    data: {
      customer: id,
    },
  });
}

/**
 * @param {string} id
 */
export async function cancelCustomerQueue(id) {
  await axios.patch(`${BASEURL}/queue/cancel/${id}`);
}

/**
 * @param {*} param0
 * @returns {Promise<Blob>}
 */
export async function exportCustomer({ area } = {}) {
  const { data } = await axios.get(`${BASEURL}/export`, { params: { area }, responseType: 'blob' });
  return data;
}

/**
 * @param {string} id
 */
export async function rollbackCustomerQueue(id) {
  await axios.patch(`${BASEURL}/queue/rollback/${id}`);
}

/**
 * @param {string} id
 * @returns {Promise<CustomerDetail>}
 */
export async function getCustomer(id) {
  const { data } = await axios.get(`${BASEURL}/${id}`);
  return data.message;
}

/**
 * Submits Network Status to the server
 *
 * @param {ICustomerForm} customerForm
 * @throws Will throw an error if submission fails
 */
export async function submitCustomer(customerForm) {
  const {
    id,
    fullname,
    phone,
    birth,
    address,
    lat,
    long,
    serverAreaId,
    packetPlanId,
    price,
    start,
    vlanId,
    serverOdpId,
    PPPoEName,
    PPPoEPassword,
    ipRemote,
    status: customerStatus,
    ktp,
    customerId,
    routerPassword,
    routerSerialNumber,
    routerSsid,
    isSpecial,
    routerMac,
    additionalPhoneNumber
  } = customerForm;

  const form = new FormData();

  if (id) {
    form.append('id', id);
  }

  form.append('fullname', fullname.trim());
  form.append('customerId', customerId.trim());
  form.append('phone', phone.trim());
  form.append('additionalPhoneNumber', JSON.stringify(additionalPhoneNumber || []));
  if (birth) form.append('dateOfBirth', birth.trim());
  form.append('address', address.trim());
  form.append('lat', lat.toString().trim());
  form.append('lng', long.toString().trim());

  if (routerSsid) form.append('routerSsid', routerSsid.trim());
  if (routerSerialNumber) form.append('routerSerialNumber', routerSerialNumber.trim());
  if (routerPassword) form.append('routerPassword', routerPassword.trim());
  if (typeof routerMac === 'string') form.append('routerMac', routerMac.trim());
  if (typeof isSpecial === 'boolean') form.append('isSpecial', isSpecial ? 'true' : 'false');

  if (serverAreaId) {
    form.append('area', serverAreaId.trim());
  }

  if (packetPlanId) {
    form.append('activePackage', packetPlanId.trim());
  }

  form.append('packagePrice', price.toString().trim());
  form.append('packageStart', start.trim());

  if (!!vlanId) {
    form.append('vlan', vlanId.trim());
  }

  if (!!serverOdpId) {
    // console.log(serverOdpId);
    form.append('ODP', serverOdpId.trim());
  }

  form.append('PPPoEName', PPPoEName.trim());
  form.append('PPPoEPassword', PPPoEPassword.trim());
  form.append('IPRemote', ipRemote.trim());
  form.append('status', customerStatus.trim());

  if (ktp) {
    form.append('ktp', ktp);
  }

  const { data, status } = await axios.post(BASEURL, form);

  if (status !== 200 || !data.success) {
    throw new Error('Failed to submit customer');
  }
}

/**
 * @typedef {Object} SendMessageBody
 * @property {string} [templateId]
 * @property {string} customerId
 * @property {string} message
 * @property {string[]} status
 * @property {boolean} sendInvoice
 */

/**
 * @param {SendMessageBody} body
 */
export async function sendMessage(body, year, month) {
  const { data } = await axios.post(`${BASEURL}/message`, body, {
    params: { year, month },
  });

  if (!data.success) {
    throw new Error('Failed to send message');
  }
}

/**
 *
 * @param {string} areaId
 * @returns {Promise<void>}
 */
export async function FillCustomerId(areaId) {
  const { data } = await axios.patch(`${BASEURL}/fill-id/${areaId}`);
  return data.message;
}

/**
 * @typedef {object} CustomerTicket
 * @property {string} _id
 * @property {string} ticketType
 * @property {string} createdAt
 * @property {object} customer
 * @property {string} customer._id
 * @property {string} customer.fullname
 * @property {string} customer.customerId
 * @property {string} customer.pppoeName
 * @property {string} customer.ipRemote
 * @property {object[]} engineers
 * @property {string} engineers._id
 * @property {string} engineers.fullname
 * @property {string} engineers.phone
 */

/**
 * Get History Ticket by customer
 * @param {string} customerId
 * @returns {Promise<CustomerTicket[]>}
 */
export async function getCustomerTicketHistory(customerId) {
  const { data } = await axios.get(`${BASEURL}/${customerId}/ticket`);
  return data.message;
}

/**
 * @typedef {object} CustomerTicketLog
 * @property {string} _id
 * @property {string} description
 * @property {string} subtitle
 * @property {string[]} photos
 * @property {string[]} [itemDescription]
 * @property {string} createdAt
 * @property {object} createdBy
 * @property {string} createdBy._id
 * @property {string} createdBy.fullname
 * @property {string} createdBy.phone
 */

/**
 * @param {string} customerId
 * @param {string} ticketId
 * @returns {Promise<CustomerTicketLog[]>}
 */
export async function getCustomerTicketLog(customerId, ticketId) {
  const { data } = await axios.get(`${BASEURL}/${customerId}/ticket/${ticketId}`);
  return data.message;
}

/**
 * @returns {Promise<Customer[]>}
 */
export async function getCustomerWithCorrectLocation() {
  const { data } = await axios.get(`${BASEURL}/correct-location`);
  return data.message;
}

/**
 * @param {string} customerId
 * @returns {Promise<string>}
 */
export async function notiFinishInstallation(customerId) {
  const { data } = await axios.get(`${BASEURL}/notif-finished/${customerId}`);
  return data.message;
}

/**
 * @typedef {object} CustomerListFromEngineer
 * @property {string} _id
 * @property {object} location
 * @property {number} location.lat
 * @property {number} location.lng
 * @property {object} activePackage
 * @property {string} activePackage.package
 * @property {number} activePackage.price
 * @property {string} activePackage.start
 * @property {string} dateOfBirth
 * @property {string[]} parentArea
 * @property {} parentODPList
 * @property {string} status
 * @property {string} fullname
 * @property {string} ktp
 * @property {string} phone
 * @property {string} address
 * @property {string} area
 * @property {string} ipRemote
 * @property {string} pppoeName
 * @property {string} pppoePassword
 * @property {string} engineer
 * @property {string} marketing
 * @property {string} createdAt
 * @property {string} updatedAt
 * @property {number} __v
 * @property {string} customerId
 * @property {object} areaData
 * @property {string} areaData._id
 * @property {string[]} areaData.parentCategoryList
 * @property {string} areaData.title
 * @property {object} areaData.routerConfig
 * @property {string} areaData.routerConfig._id
 * @property {string} areaData.routerConfig.address
 * @property {string} areaData.routerConfig.port
 * @property {string} areaData.routerConfig.username
 * @property {string} areaData.routerConfig.password
 * @property {string} areaData.routerConfig.lastIP
 * @property {string} areaData.category
 * @property {number} areaData.__v
 * @property {number} areaData.autoIsolirDate
 * @property {number} areaData.duoDate
 * @property {string} areaData.prefixCustomer
 * @property {boolean} areaData.isPrePaid
 * @property {number} areaData.installationCharge
 * @property {number} areaData.lat
 * @property {number} areaData.lng
 * @property {string} areaData.defaultVlan
 * @property {object} billingData
 * @property {string} billingData._id
 * @property {string[]} billingData.services
 * @property {number} billingData.paid
 * @property {string} billingData.status
 * @property {string} billingData.customer
 * @property {number} billingData.month
 * @property {number} billingData.year
 * @property {number} billingData.amount
 * @property {number} billingData.__v
 */

/**
 * @typedef {Object} CustomerListFromEngineerParam
 * @property {string} search
 * @property {string} areaCategory
 * @property {string} area
 * @property {string} packet
 * @property {string} page
 * @property {string} limit
 */

/**
 * @typedef {Object} CustomerONUInfo
 * @property {string} SerialNumber - ONU serial number
 * @property {string} State - ONU state
 * @property {string} RunningState - ONU running state
 * @property {string} ConfigState - ONU configuration state
 * @property {string} DeviceType - Device type
 * @property {string} LastUpTime - Last time the ONU went up
 * @property {string} DeviceModel - Device model
 * @property {string} DeviceVendor - Device vendor
 * @property {string} Distance - Distance in meters
 * @property {string} Uptime - Uptime duration
 * @property {string} WorkVoltage - Work voltage
 * @property {string} WorkTemperature - Work temperature
 * @property {string} TransmittedOpticalPower - Transmitted optical power
 * @property {string} ReceivedOpticalPower - Received optical power
 * @property {string} LastDownReason - Reason for last down event
 */

/**
 * @typedef {Object} CustomerOnuHistoryData
 * @property {string} FormattedDate - Formatted date string
 * @property {number} ReceivedOpticalPower - Received optical power value
 * @property {string} FormattedReceivedOpticalPower - Formatted received optical power
 */

/**
 * @param {CustomerListFromEngineerParam} params
 * @returns {Promise<{customers: CustomerListFromEngineer[]; total: number}>}
 */
export async function findCustomerFromEnginner(params) {
  const { data } = await axios.get(`${APIURL}/admin/customer/search`, { params });
  return data.message;
}

/**
 * @param {string} start
 * @param {string} end
 * @returns {Promise<{process: PSBChart[]; finish: PSBChart[]; finishMonthly: PSBChart[]; processMonthly: PSBChart[]}>}
 */
export async function getChartPSB(start, end, area) {
  const { data } = await axios.get(`${APIURL}/admin/customer/chart`, {
    params: { start, end, area },
  });
  return data.message;
}

/**
 * Upsert Customer Note
 * @param {string} customerId
 * @param {string} note
 * @returns {Promise<void>}
 */
export async function updateNote(customerId, note) {
  const { data } = await axios.patch(`${APIURL}/admin/customer/note/${customerId}`, { note });
  return data.message;
}

/**
 * Clear customer note
 * @param {string} customerId
 * @returns {Promise<void>}
 */
export async function clearNote(customerId) {
  const { data } = await axios.delete(`${APIURL}/admin/customer/note/${customerId}`);
  return data.message;
}

/**
 *
 * @param {{
 * limit: number;
 * page: number;
 * search: string;
 * fromPackageId: string;
 * toPackageId: string;
 * }} param0
 * @returns {Promise<{total: number; data: CustomerMigrationPackageLog[]}>}
 */
export async function getMigrationLog({
  limit = 10,
  page = 0,
  search = '',
  fromPackageId = '',
  toPackageId = '',
} = {}) {
  const url = `${APIURL}/admin/customer/migration-package-log`;
  const { data } = await axios.get(url, {
    params: {
      limit,
      page,
      search,
      fromPackageId,
      toPackageId,
    },
  });

  return data.message;
}

/**
 * Get PPP Active List
 * @param {Array<string>} customerIds
 * @returns {Promise<Object<string, PPPActive>>}
 */
export async function getPPPActiveList(customerIds, signal) {
  const url = `${APIURL}/admin/customer/ppp-active`;
  const { data } = await axios.post(url, { customerIds }, { signal });
  return data.message;
}

/**
 * Get Customer ONU Info
 * @param {string[]} customerIds
 * @returns {Promise<Record<string, CustomerONUInfo>>}
 */
export async function getCustomerOnuInfo(customerIds, signal) {
  const url = `${APIURL}/admin/customer/onu-info`;
  const { data } = await axios.post(url, { customerIds }, { signal });
  return data.message;
}

/**
 * Broadcast message to customers
 * @param {{
 * whatsappNodes: string[];
 * billingStatus: string[];
 * area: string;
 * message: string;
 * template: string | null;
 * special: boolean;
 * chunkSize: number;
 * intervalEachMessage: number;
 * intervalEachChunk: number;
 * month: number;
 * year: number;
 * invoice: boolean;
 * }} body
 */
export async function broadcast(body) {
  const {
    area,
    billingStatus,
    chunkSize,
    intervalEachMessage,
    intervalEachChunk,
    message,
    special,
    template,
    whatsappNodes,
    month,
    year,
    invoice,
  } = body;

  const url = `${APIURL}/admin/customer/broadcast-roundrobin`;
  const { data } = await axios.post(url, {
    area,
    billingStatus,
    chunkSize,
    intervalEachMessage,
    intervalEachChunk,
    message,
    special,
    template,
    whatsappNodes,
    month,
    year,
    invoice,
  });

  return data.message;
}

/**
 * Get Customer ONU History Data
 * @param {string} customerId
 * @param {string} start
 * @param {string} until
 * @returns {Promise<CustomerOnuHistoryData[]>}
 */
export async function getCustomerOnuHistoryData(customerId, start, until) {
  const url = `${APIURL}/admin/customer/onu-data/${customerId}`;
  const { data } = await axios.get(url, {
    params: {
      start,
      until,
    },
  });
  return data.message;
}

/**
 * @typedef {object} HistoryLastdown
 * @property {string} SerialNumber
 * @property {string} Timestamp
 * @property {string} LastDownReason
 */

/**
 * Get History Lastdown Reason
 * @param {string} customerId
 * @param {string} start
 * @param {string} until
 * @returns
 */
export async function getHistoryLastdown(customerId, start, until) {
  const url = `${APIURL}/admin/customer/lastdown-reason/${customerId}`;
  const { data } = await axios.get(url, {
    params: {
      start,
      until,
    },
  });
  return data.message;
}

/**
 * Check Mikrotik Isolir Exists
 * @param {string[]} customerIds
 * @returns {Promise<Record<string, boolean>>}
 */
export async function checkMikrotikIsolirExists(customerIds, signal) {
  const url = `${APIURL}/admin/customer/isolir-mikrotik-exists`;
  const { data } = await axios.post(url, { customerId: customerIds }, { signal });
  return data.message;
}

/**
 * Partial Update Customer
 * @param {string} customerId
 * @param {{
 *  serialNumber: string;
 * }} body
 * @returns
 */
export async function partialUpdate(customerId, body) {
  const url = `${APIURL}/admin/customer/partial-update/${customerId}`;
  const { data } = await axios.patch(url, body);
  return data.message;
}

/**
 * @typedef {object} PartialCustomerUpdateLog
 * @property {string} _id
 * @property {string} customer
 * @property {string} user
 * @property {object} serialNumber
 * @property {string} serialNumber.from
 * @property {string} serialNumber.to
 * @property {string} createdAt
 * @property {string} userFullname
 * @property {string} userEmail
 */

/**
 * Get Partial Customer Update Log
 * @param {string} customerId
 * @param {{
 *  existSerialNumber: string
 * }} matchFilter
 */
export async function getPartialCustomerUpdateLog(customerId, matchFilter) {
  const url = `${APIURL}/admin/customer/partial-update`;
  const { data } = await axios.get(url, {
    params: {
      customer_id: customerId,
      ...matchFilter,
    },
  });

  return data.message;
}

export async function getPrtgChartData(customer_id, trafficMode) {
  const { data } = await axios.get(`${APIURL}/admin/customer/prtg/chart/${customer_id}`, {
    responseType: 'blob',
    params: {
      graphId: trafficMode,
    },
  });

  // if data is json then return string data.message
  const contentType = data.type;
  if (contentType === 'application/json') {
    const text = await data.text();
    const jsonData = JSON.parse(text);
    throw new Error(jsonData.message || 'Failed to get PRTG chart data');
  }

  return data;
}

/**
 * Reboot ONU for customer
 * @param {string} customerId
 * @returns
 */
export async function rebootOnu(customerId){
  const { data } = await axios.patch(`${APIURL}/admin/customer/reboot-onu/${customerId}`);
  return data.message;
}
