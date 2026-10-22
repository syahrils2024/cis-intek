import axios from '@commons/axios';

const APIURL = import.meta.env.VITE_API_URL;
const BASEURL = `${APIURL}/admin/customer`;

/**
 * @typedef {object} InstallationRequest
 * @property {string} _id
 * @property {object} location
 * @property {number} location.lat
 * @property {number} location.lng
 * @property {string} fullname
 * @property {string} address
 * @property {string} status
 * @property {string} requestedBy
 * @property {string} [routerSerialNumber]
 * @property {string} [routerSsid]
 * @property {string} [routerPassword]
 */

/**
 * @typedef {object} IInstallationReportForm
 * @property {File} [OPMResultPhoto]
 * @property {File} [installedModemPhoto]
 * @property {File} [modemSerialNumberPhoto]
 * @property {File} [clientHousePhoto]
 * @property {Array<{resource: string; quantity: number}>} usedResources
 * @property {object[]} installationAddons
 * @property {string} [installationAddons.photo] photoFilename -- Nullable
 * @property {string} [installationAddons.addons] addonsId
 * @property {string} [installationAddons.addonName] addonName -- Nullable
 */

/**
 * @typedef {object} InstallationReportData
 * @property {string} _id
 * @property {object[]} usedResources
 * @property {string} usedResources._id
 * @property {string} usedResources.resource
 * @property {number} usedResources.quantity
 * @property {string} createdBy
 * @property {string} customer
 * @property {string} engineer
 * @property {string} createdAt
 * @property {string} updatedAt
 * @property {string} [OPMResultPhoto]
 * @property {string} [installedModemPhoto]
 * @property {string} [modemSerialNumberPhoto]
 * @property {string} [clientHousePhoto]
 * @property {number} __v
 */

/**
 * @typedef {object} InstallationAddonsRequest
 * @property {string} customer - The ID of the customer.
 * @property {object[]} addons
 * @property {string} addons.addons - The ID of the addon.
 * @property {File} addons.photo - The photo file associated with the addon.
 */

/**
 * Submits an installation report for a customer
 *
 * @param {string} customer - Customer ID or name
 * @param {IInstallationReportForm} form - The installation report form data
 * @throws Will throw an error if submission fails
 */
export async function submitInstallationReport(customer, form) {
  const formData = new FormData();

  formData.append('customer', customer);

  if (form.OPMResultPhoto) {
    formData.append('OPMResultPhoto', form.OPMResultPhoto);
  }

  if (form.installedModemPhoto) {
    formData.append('installedModemPhoto', form.installedModemPhoto);
  }

  if (form.modemSerialNumberPhoto) {
    formData.append('modemSerialNumberPhoto', form.modemSerialNumberPhoto);
  }

  if (form.clientHousePhoto) {
    formData.append('clientHousePhoto', form.clientHousePhoto);
  }

  formData.append('usedResources', JSON.stringify(form.usedResources));

  const { data, status } = await axios.post(`${BASEURL}/installation-report`, formData);

  if (status !== 200 || !data.success) {
    throw new Error('Failed to submit installation report');
  }
}

/**
 * @param {string} customer
 * @returns {Promise<void>}
 */
export async function finishReport(customer) {
  const { data } = await axios.post(`${BASEURL}/finish-report`, { customer });
  return data.message;
}

/**
 * @returns {Promise<InstallationRequest[]>}
 */
export async function getInstallationRequest(query) {
  const { data } = await axios.get(`${BASEURL}/installation-request`, { params: query });
  return data.message;
}

/**
 * @param {*} customerId
 * @returns {Promise<InstallationReportData>}
 */
export async function getSomeInstallationRequest(customerId) {
  const { data } = await axios.get(`${BASEURL}/installation-report/${customerId}`);
  return data.message;
}

/**
 *
 * @param {InstallationAddonsRequest} body
 */
export async function submitInstallationAddons(body) {
  const fd = new FormData();
  body.addons.forEach((addon, index) => {
    fd.append(`addons[${index}][addons]`, addon.addons);
    if (addon.photo) {
      fd.append(`addons[${index}][photo]`, addon.photo);
    }
  });
  fd.append('customer', body.customer);

  const { data } = await axios.post(`${BASEURL}/installation-addons`, fd, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return data.message;
}
