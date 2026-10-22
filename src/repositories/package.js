import axios from 'src/commons/axios';

const BASEURL = import.meta.env.VITE_API_URL;

/**
 * @typedef {object} PackageArea
 * @property {string} _id - The unique identifier of the package.
 * @property {string} title - The title or name of the package.
 * @property {number} price - The price of the package.
 * @property {string} profile - The PPPoE profile associated with the package.
 */

/**
 * @typedef {Object} AvailableChangePlan
 * @property {string} _id - The unique identifier of the plan.
 * @property {number} price - The price of the plan in IDR (Indonesian Rupiah).
 * @property {string} area - The unique identifier of the area associated with the plan.
 * @property {string} title - The title or name of the plan.
 */

/**
 * Get Package Plan pricing and totalCustomer
 * @typedef {object} ResultPackageList
 * @property {string} _id
 * @property {string} status
 * @property {string} title
 * @property {number?} price
 * @property {object[]} prices
 * @property {string} prices.pppoeProfile
 * @property {string} prices._id
 * @property {string} prices.area
 * @property {number} prices.price
 * @property {number} __v
 * @property {string} ppoeProfile
 * @property {number} customer
 * @returns {Promise<ResultPackageList[]>}
 */
export const getPackageList = async () => {
  const url = `${BASEURL}/admin/package?lean=false`;
  const { data } = await axios.get(url);
  return data.message;
};

/** @typedef {object} ResultPackageSummary
 * @property {string} _id
 * @property {string} title
 * @returns {Promise<ResultPackageSummary[]>}
 */
export const getPackageListSummary = async () => {
  const url = `${BASEURL}/admin/package?lean=true`;
  const { data } = await axios.get(url);
  return data.message;
};

/**
 * @typedef {Object} RequestPackage
 * @property {string} _id
 * @property {string} title
 * @property {string} status
 * @property {Array<{ area: string; price: number; pppoeProfile: string }>} price
 * /


/**
 * @param {RequestPackage} body
 */
export const submitPackage = async (body) => {
  const url = `${BASEURL}/admin/package`;
  const formData = new URLSearchParams();

  // Add your form data fields here
  if (body._id) formData.append('id', body._id);
  formData.append('title', body.title);
  formData.append('status', body.status);
  body.price.forEach((p, i) => {
    const keyArea = `price[${i}][area]`;
    const keyPrice = `price[${i}][price]`;
    const keyProfile = `price[${i}][pppoeProfile]`;

    formData.append(keyArea, p.area);
    formData.append(keyPrice, p.price.toString());
    formData.append(keyProfile, p.pppoeProfile);
  });
  // ... add other form data fields as needed

  const { data } = await axios.post(url, formData, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
  const result = data.message; // Assuming the response contains the result in the 'message' property
  return result;
};

/**
 * @param {string} id
 * @returns {Promise<ResultPackageList>}
 */
export const getSomePackage = async (id) => {
  const url = `${BASEURL}/admin/package/${id}`;
  const { data } = await axios.get(url);
  return data.message;
};

/**
 * @param {string} id
 * @returns {Promise<void>}
 */
export const removeSomePackage = async (id) => {
  const url = `${BASEURL}/admin/package/${id}`;
  const { data } = await axios.delete(url);
  return data.message;
};

/**
 * @param {string} customerId
 * @returns {Promise<AvailableChangePlan[]>}
 */
export async function availableChangePlanList(customerId) {
  const url = `${BASEURL}/admin/package/available-change/${customerId}`;
  const { data } = await axios.get(url);
  return data.message;
}

/**
 * Get Available Package By Area
 * @param {string} areaId
 * @returns {Promise<PackageArea[]>}
 */
export async function getAvailablePackageArea(areaId) {
  const url = `${BASEURL}/admin/package/area/${areaId}`;
  const { data } = await axios.get(url);
  return data.message;
}

/**
 * @typedef {Object} IPackageFindAreaStats
 * @property {string} areaId - The unique identifier of the area.
 * @property {string} areaName - The name of the area.
 * @property {number} totalCustomers - The total number of customers in the area.
 * @property {number} totalCustomerActive - The total number of active customers in the area.
 * @property {number} totalCustomerInactive - The total number of inactive customers in the area
 * @property {number} totalCustomerBanned - The total number of pending customers in the area.
 * @property {number} price
 * @property {string | null} [areaCategoryId] - The optional unique identifier of the area category.
 * @property {string | null} [areaCategoryName] - The optional name of the area category.
 */

/**
 * @typedef {Object} IPackageFindResult
 * @property {string} _id - The unique identifier of the package.
 * @property {boolean} isFree - Indicates whether the package is free.
 * @property {number} totalCustomers - The total number of customers using this package.
 * @property {number} totalCustomerActive - The total number of active customers in the area.
 * @property {number} totalCustomerInactive - The total number of inactive customers in the area
 * @property {number} totalCustomerBanned - The total number of pending customers in the area.
 * @property {string} status - The status of the package.
 * @property {string} title - The title or name of the package.
 * @property {IPackageFindAreaStats[]} areaStats - Array of area statistics for this package.
 */

/**
 *
 * @returns {Promise<IPackageFindResult[]>}
 */
export async function getPackageListV2() {
  const url = `${BASEURL}/admin/package/list`;
  const { data } = await axios.get(url);
  return data.message;
}

/**
 * @typedef {Object} PackageDetailPrice
 * @property {string} pppoeProfile - The PPPoE profile associated with the package.
 * @property {string} area - The unique identifier of the area.
 * @property {string} areaName - The name of the area.
 * @property {number} price - The price of the package in this area.
 */

/**
 * @typedef {Object} PackageDetail
 * @property {string} _id - The unique identifier of the package.
 * @property {string} title - The title or name of the package.
 * @property {string} status - The status of the package (e.g., "active", "inactive").
 * @property {boolean} isFree - Indicates whether the package is free.
 * @property {PackageDetailPrice[]} prices - Array of pricing information for different areas.
 */

/**
 *
 * @param {string} id
 * @returns {Promise<PackageDetail>}
 */
export async function getDetail(id) {
  const url = `${BASEURL}/admin/package/${id}`;
  const { data } = await axios.get(url);
  return data.message;
}
