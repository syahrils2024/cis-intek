/**
 * @typedef {import("./area").Odp} ODP
 * @typedef {import("./customer").Customer} Customer
 * @typedef {import("./area").Area} Area
 * @typedef {import('./area').AreaCategory} AreaCategory
 */

import axios from 'src/commons/axios';

const BASEURL = import.meta.env.VITE_API_URL;

/**
 *
 * @param {string} searchType
 * @param {string} s search
 * @returns {Promise<{odps: ODP[]; customers: Customer[]; areas: Area[]; areaCategories: AreaCategory[]}>}
 */
export const search = async (searchType, s) => {
  const url = `${BASEURL}/admin/geo/search`;
  const { data } = await axios.get(url, { params: { searchType, search: s } });
  return data.message;
};

/**
 *
 * @param {string} ODPID
 * @returns {Promise<Customer[]>}
 */
export const searchCustomerByODP = async (odp) => {
  const url = `${BASEURL}/admin/geo/customer/${odp}`;
  const { data } = await axios.get(url);
  return data.message;
};

/**
 *
 * @param {string} areaCategoryId
 * @returns {Promise<ODP[]>}
 */
export const searchODPByAreaCategory = async (areaCategoryId) => {
  const url = `${BASEURL}/admin/geo/odp/${areaCategoryId}`;
  const { data } = await axios.get(url);
  return data.message;
};
