import axios from '@commons/axios';

const APIURL = import.meta.env.VITE_API_URL;
const BASEURL = `${APIURL}/admin/customer/installation-request`;

/**
 * @typedef {Object} InstallationApproveBody
 * @property {string} id
 * @property {string[]} engineers
 */

/**
 * @typedef {Object} InstallationRequestInsert
 * @property {string} id - The unique ID of the request.
 * @property {string} phone - The phone number.
 * @property {string} fullname - The full name of the customer.
 * @property {Date} dateOfBirth - The date of birth.
 * @property {string} address - The address of the customer.
 * @property {number} lat - Latitude of the location.
 * @property {number} lng - Longitude of the location.
 * @property {string} area - The ID of the area.
 * @property {string} subscriptionPlan - The ID of the subscription plan.
 * @property {number} subscriptionPrice - The price of the subscription.
 * @property {string} IPRemote - The remote IP address.
 * @property {string} PPPoEName - The PPPoE username.
 * @property {string} PPPoEPassword - The PPPoE password.
 * @property {string} ODP - The ID of the ODP.
 * @property {string} vlan - The VLAN ID.
 * @property {File} ktp - photo ktp
 * @property {boolean} [selfInstallation]
 * @property {string[]} [engineers]
 * @property {string} [routerSsid]
 * @property {string} [routerPassword]
 * @property {string} [routerSerialNumber]
 * @property {Object} [addons]
 */

/**
 * @typedef {object} InstallationRequestList
 * @property {string} _id
 * @property {object} location
 * @property {number} location.lat
 * @property {number} location.lng
 * @property {string} phone
 * @property {string} fullname
 * @property {string} dateOfBirth
 * @property {string} address
 * @property {string} status
 * @property {object} package
 * @property {string} package._id
 * @property {string} package.title
 * @property {object} areaDetail
 * @property {string} areaDetail._id
 * @property {string} areaDetail.title
 * @property {object} odpDetail
 * @property {string} odpDetail._id
 * @property {string} odpDetail.name
 * @property {string} requestedBy
 * @property {string} requestedById
 * @property {string} createdAt
 * @property {string} [routerSerialNumber]
 * @property {string} [routerSsid]
 * @property {string} [routerPassword]
 */

/**
 * @typedef {Object} InstallationRequest
 * @property {string} phone - The phone number.
 * @property {string} fullname - The full name of the customer.
 * @property {Date} dateOfBirth - The date of birth.
 * @property {string} address - The address of the customer.
 * @property {Object} location - The geographic location.
 * @property {number} location.lat - Latitude of the location.
 * @property {number} location.lng - Longitude of the location.
 * @property {string[]} parentArea - Array of strings representing the parent area IDs.
 * @property {string} area - The ID of the area.
 * @property {string} subscriptionPlan - The ID of the subscription plan.
 * @property {number} subscriptionPrice - The price of the subscription.
 * @property {string} [ktp] - The KTP (Indonesian identity card) number (optional).
 * @property {string} [pppoeName] - The PPPoE username (optional).
 * @property {string} [pppoePassword] - The PPPoE password (optional).
 * @property {string} [vlan] - The VLAN (optional).
 * @property {string} [ipRemote] - The remote IP address (optional).
 * @property {string[]} [parentODPList] - Array of strings for the parent ODP list (optional).
 * @property {string} [ODP] - The ID of the ODP (optional).
 * @property {string} requestedBy - The ID of the person who requested the installation.
 * @property {string} [approvedBy] - The ID of the person who approved the request (optional).
 * @property {string} [rejectedBy] - The ID of the person who rejected the request (optional).
 * @property {InstallationRequestStatus} status - The status of the installation request.
 * @property {Date} createdAt - The date when the request was created.
 * @property {Date} updatedAt - The date when the request was last updated.
 * @property {boolean} [selfInstallation]
 * @property {string[]} [engineers]
 * @property {string} [routerSsid]
 * @property {string} [routerPassword]
 * @property {string} [routerSerialNumber]
 */

/**
 * @param {{area: string | null | undefined}} param0
 * @returns {Promise<InstallationRequestList[]>}
 */
export const getInstallationRequestList = async ({ area }) => {
  const { data } = await axios.get(BASEURL, { params: { area } });
  return data.message;
};

/**
 * @param {{area: string | null | undefined}} param0
 * @returns {Promise<InstallationRequest[]>}
 */
export const getInstallationRequest = async ({ area }) => {
  const { data } = await axios.get(BASEURL, { params: { area } });
  return data.message;
};

/**
 * @param {string} id
 * @returns {Promise<InstallationRequest>}
 */
export const getSomeInstallationRequest = async (id) => {
  const { data } = await axios.get(`${BASEURL}/${id}`);
  return data.message;
};

/**
 * @param {InstallationRequestInsert} body
 */
export const insertInstallationRequest = async (body) => {
  const fd = new FormData();
  if (body.id) fd.append('id', body.id);
  fd.append('phone', body.phone);
  fd.append('fullname', body.fullname);
  if (body.dateOfBirth) fd.append('dateOfBirth', body.dateOfBirth);
  fd.append('address', body.address);
  fd.append('lat', body.lat);
  fd.append('lng', body.lng);
  fd.append('area', body.area);
  fd.append('subscriptionPlan', body.subscriptionPlan);
  fd.append('subscriptionPrice', body.subscriptionPrice);
  fd.append('IPRemote', body.IPRemote);
  fd.append('PPPoEName', body.PPPoEName);
  fd.append('PPPoEPassword', body.PPPoEPassword);
  if (body.addons) fd.append('addons', JSON.stringify(body.addons));

  if (body.routerSsid) fd.append('routerSsid', body.routerSsid);
  if (body.routerSerialNumber) fd.append('routerSerialNumber', body.routerSerialNumber);
  if (body.routerPassword) fd.append('routerPassword', body.routerPassword);
  if (body.customerId) fd.append('customerId', body.customerId);
  if (body.routerMac) fd.append('routerMac', body.routerMac);

  if (body.ODP) fd.append('ODP', body.ODP);
  if (body.vlan) fd.append('vlan', body.vlan);
  if (body.ktp) fd.append('ktp', body.ktp);
  if (body.engineers) {
    body.engineers.forEach((e, i) => {
      fd.append(`engineers[${i}]`, e);
    });
  }

  if (body.selfInstallation) {
    fd.append('selfInstallation', body.selfInstallation);
  }

  const { data } = await axios.post(BASEURL, fd, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return data.message;
};

/**
 * @param {InstallationApproveBody} body
 * @returns {Promise<void>}
 */
export const approve = async (body) => {
  const { data } = await axios.post(`${BASEURL}/approve`, body);
  return data.message;
};

/**
 * @param {InstallationApproveBody} body
 * @returns {Promise<void>}
 */
export const approveAndFinish = async (body) => {
  const { data } = await axios.post(`${BASEURL}/approve-and-finish`, body);
  return data.message;
};

/**
 * @returns {Promise<void>}
 */
export const reject = async (id) => {
  const { data } = await axios.post(`${BASEURL}/reject`, { id });
  return data.message;
};

/**
 * @returns {Promise<void>}
 */
export const remove = async (id) => {
  const { data } = await axios.delete(`${BASEURL}/${id}`);
  return data.message;
};

/**
 * @returns {Promise<void>}
 */
export const notifRequest = async (id, { modemHasSet } = { modemHasSet }) => {
  const { data } = await axios.patch(`${BASEURL}/${id}/notification`, { modemHasSet });
  return data.message;
};
