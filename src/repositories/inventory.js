import axios from '@commons/axios';

const APIURL = import.meta.env.VITE_API_URL;
const BASEURL = `${APIURL}/admin/inventory`;

/** @typedef {object} InventoryAvailableStock
 * @property {number} available
 * @property {number} stock
 * @property {number} usage
 */

/** @typedef {object} Inventory
 * @property {string} _id
 * @property {string} description
 * @property {string} name
 * @property {string} unitType
 * @property {number} stock
 * @property {number} usage
 * @property {number} available
 */

/** @typedef {object} InventoryRequest
 * @property {string} id
 * @property {string} description
 * @property {string} name
 * @property {string} unitType
 * @property {File} photo
 */

/**
 * Get List Inventory Items
 * @returns {Promise<Inventory[]>}
 */
export const getInventoryItems = async () => {
  const { data } = await axios.get(`${BASEURL}/item`);
  return data.message;
};

/**
 * Get List Detail Inventory Item
 * @returns {Promise<Inventory>}
 */
export const getInventoryItemDetail = async (id) => {
  const { data } = await axios.get(`${BASEURL}/item/${id}`);
  return data.message;
};

/**
 * Remove some inventory item
 * @returns {Promise<void>}
 */
export const removeItem = async (id) => {
  const { data } = await axios.get(`${BASEURL}/item/${id}`);
  return data.message;
};

/**
 * @param {InventoryRequest} body
 * @returns {Promse<void>}
 */
export const upsertItem = async (body) => {
  const fd = new FormData();
  fd.append('photo', body.photo);
  if (body.id) fd.append('id', body.id);
  fd.append('name', body.name);
  fd.append('description', body.description);
  fd.append('unitType', body.unitType);

  const { data } = await axios.post(`${BASEURL}/item`, fd);
  return data.message;
};

/**
 * Submits the inventory stock details to the server.
 *
 * @param {string} item - The item identifier ID.
 * @param {Object} stockForm - The form data for inventory stock.
 * @param {number} stockForm.quantity - The quantity of the item.
 * @param {string} [stockForm.serialNumber] - The serial number of the item (optional).
 * @param {File} [stockForm.photo] - The photo of the item (optional).
 * @param {string} stockForm.area - The area where the item is located.
 * @returns {Promise<void>} - Resolves when the inventory stock is successfully submitted.
 * @throws {Error} - Throws an error if the submission fails.
 */
export const submitInventoryStock = async (item, { quantity, serialNumber, photo, area }) => {
  const form = new FormData();

  form.append('item', item);
  form.append('area', area);
  form.append('quantity', String(quantity));

  if (serialNumber) {
    form.append('serialNumber', serialNumber);
  }

  if (photo) {
    form.append('photo', photo);
  }

  const { data, status } = await axios.post(`${BASEURL}/stock`, form);

  if (status !== 200 || !data.success) {
    throw new Error('Gagal menambah stok');
  }
};

/**
 * Submits the inventory usage details to the server.
 *
 * @param {string} item - The item identifier.
 * @param {Object} usageForm - The form data for inventory usage.
 * @param {number} usageForm.quantity - The quantity of the item.
 * @param {string} usageForm.officer - The officer handling the item.
 * @param {string} [usageForm.serialNumber] - The serial number of the item (optional).
 * @param {File} [usageForm.photo] - The photo of the item (optional).
 * @param {string} usageForm.area - The area where the item is being used.
 * @param {string} usageForm.sourceArea - The source area of the item.
 * @returns {Promise<void>} - Resolves when the inventory usage is successfully submitted.
 * @throws {Error} - Throws an error if the submission fails.
 */
export const submitInventoryUsage = async (
  item,
  { quantity, officer, serialNumber, photo, area, sourceArea }
) => {
  const form = new FormData();

  form.append('item', item);
  form.append('area', area);
  form.append('sourceArea', sourceArea);
  form.append('quantity', String(quantity));
  form.append('officer', officer);

  if (serialNumber) {
    form.append('serialNumber', serialNumber);
  }

  if (photo) {
    form.append('photo', photo);
  }

  const { data, status } = await axios.post(`${BASEURL}/usage`, form);

  if (status !== 200 || !data.success) {
    throw new Error('Failed to store the inventory usage!');
  }
};

/**
 * Fetches the available stock for a specific item and optionally for a specific area.
 *
 * @param {string} item - The identifier for the item whose stock is being checked.
 * @param {string} [area] - An optional area parameter to filter the stock.
 * @returns {Promise<InventoryAvailableStock>} A promise that resolves to an object containing the available stock information.
 * @throws {Error} Throws an error if the request fails or if the response is not successful.
 */
export async function getAvailableStock(item, area) {
  const { data, status } = await axios.get(`${BASEURL}/available/${item}`, {
    params: {
      area,
    },
  });

  if (status !== 200 || !data.success) {
    throw new Error('Failed to fetch the available stock!');
  }

  return data.message;
}
