import axios from 'src/commons/axios';

/**
 * @typedef {Object} AddonsCategory
 * @property {string} _id
 * @property {string} category
 */

/**
 * @typedef {Object} AddonsCategoryRequest
 * @property {string} category
 */

/**
 * @typedef {Object} AddonsRequest
 * @property {string} category
 * @property {string} variantName
 * @property {Object} areas
 * @property {string} areas.area
 * @property {number} areas.price
 */

/**
 * @typedef {Object} Addons
 * @property {string} _id - The unique identifier of the variant.
 * @property {string} variantName - The name of the variant.
 * @property {string} category - The category of the product.
 * @property {string} categoryId - The unique identifier of the category.
 */

/**
 * Represents a service variant with pricing details across different areas.
 * @typedef {Object} AddonsDetail
 * @property {string} _id - The unique identifier for the variant.
 * @property {string} variantName - The name of the variant.
 * @property {string} categoryId - The ID of the associated category.
 * @property {string} category - The category name.
 * @property {Array<{
 *   areaId: string,
 *   areaTitle: string,
 *   price: number
 * }>} areas - The list of areas where the variant is available.
 */

/**
 * @typedef {object} AvailableAddonsForCustomer
 * @property {string} _id
 * @property {string} variantName
 * @property {string} category
 * @property {string} categoryId
 * @property {number} price
 */

/**
 * @typedef {object} AddonsArea
 * @property {string} _id - The unique identifier of the addon.
 * @property {string} variantName - The name of the addon variant.
 * @property {string} categoryId - The unique identifier of the category.
 * @property {string} category - The name of the category.
 * @property {number} price - The price of the addon.
 * @property {string} areaId - The unique identifier of the area.
 */

const BASEURL = import.meta.env.VITE_API_URL;
const ADDONS_CATEGORY_URL = `${BASEURL}/admin/addons-category`;
const ADDONS_URL = `${BASEURL}/admin/addons`;

/**
 * Get Addons Category
 * @returns {Promise<AddonsCategory[]>}
 */
export async function getAddonsCategoryList() {
  const url = ADDONS_CATEGORY_URL;
  const { data } = await axios.get(url);
  return data.message;
}

/**
 * create addons category
 * @param {AddonsCategoryRequest} body
 * @returns {Promise<void>}
 */
export async function createAddonsCategory(body) {
  const url = ADDONS_CATEGORY_URL;
  const { data } = await axios.post(url, body);
  return data.message;
}

/**
 * create addons category
 * @param {AddonsCategoryRequest} body
 * @returns {Promise<void>}
 */
export async function updateAddonsCategory(id, body) {
  const url = `${ADDONS_CATEGORY_URL}/${id}`;
  const { data } = await axios.put(url, body);
  return data.message;
}

/**
 * create addons category
 * @param {string} id
 * @returns {Promise<void>}
 */
export async function removeAddonsCategory(id) {
  const url = `${ADDONS_CATEGORY_URL}/${id}`;
  const { data } = await axios.delete(url);
  return data.message;
}

/**
 *
 * @param {*} param0
 * @returns {Promise<Addons[]>}
 */
export async function getAddons({ page, limit, search }, signal) {
  const url = ADDONS_URL;
  const { data } = await axios.get(url, { signal });
  return data.message;
}

/**
 * @param {AddonsRequest} body
 * @returns {Promise<void>}
 */
export async function createAddons(body) {
  const url = `${ADDONS_URL}`;
  const { data } = await axios.post(url, body);
  return data.message;
}

/**
 * @param {string} id
 * @param {AddonsRequest} body
 * @returns {Promise<void>}
 */
export async function updateAddons(id, body) {
  const url = `${ADDONS_URL}/${id}`;
  const { data } = await axios.put(url, body);
  return data.message;
}

/**
 * @param {string} id
 * @returns {Promise<void>}
 */
export async function removeAddons(id) {
  const url = `${ADDONS_URL}/${id}`;
  const { data } = await axios.delete(url);
  return data.message;
}

/**
 * @param {string} id
 * @returns {Promise<AddonsDetail>}
 */
export async function detailAddons(id) {
  const url = `${ADDONS_URL}/${id}`;
  const { data } = await axios.get(url);
  return data.message;
}

/**
 * Get Available Addons For Customer
 * @param {string} customerId
 * @returns {Promise<AvailableAddonsForCustomer[]>}
 */
export async function getAvailableAddonsCustomer(customerId) {
  const url = `${ADDONS_URL}/customer`;
  const { data } = await axios.get(url, { params: { customerId } });
  return data.message;
}

/**
 * Get Addons Area by areaId
 * @param {string} areaId
 * @returns {Promise<AddonsArea[]>}
 */
export async function getAddonsArea(areaId) {
  const url = `${ADDONS_URL}/area/${areaId}`;
  const { data } = await axios.get(url);
  return data.message;
}
