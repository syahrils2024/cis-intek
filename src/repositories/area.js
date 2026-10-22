import axios from 'src/commons/axios';

const BASEURL = import.meta.env.VITE_API_URL;
const BASEURL_V3 = `${BASEURL}/v3/area`;
/**
 * @typedef {import('src/repositories/customer').Customer} Customer
 */

/**
 * @typedef {object} GetAllAreaWithCategory
 * @property {string} _id
 * @property {string[]} parentCategoryList
 * @property {string} title
 * @property {string} defaultVlan
 * @property {number} lat
 * @property {number} lng
 * @property {string} whatsappId
 * @property {string} prefixCustomer
 * @property {number} duoDate
 * @property {boolean} isPrePaid
 * @property {object} routerConfig
 * @property {string} routerConfig._id
 * @property {string} routerConfig.address
 * @property {string} routerConfig.port
 * @property {string} routerConfig.username
 * @property {string} routerConfig.password
 * @property {string} routerConfig.lastIP
 * @property {string} category
 * @property {number} __v
 * @property {string} whatsappIdBilling
 * @property {object[]} parentCategoryData
 * @property {string} parentCategoryData._id
 * @property {string} parentCategoryData.name
 * @property {string} categoryName
 * @property {object[]} whatsappHooks
 * @property {string} whatsappHooks.url
 * @property {'cs' | 'psb' | 'billing' | string} whatsappHooks.types
 * @property {Boolean} requiredInstallationReport
 * @property {string} broadcastWhatsappGroup
 * @property {number} [pppActiveCount]
 */

/**
 * @typedef {object} Odp
 * @property {} parentODPList
 * @property {string[]} parentAreaList
 * @property {string} _id
 * @property {string} name
 * @property {string} address
 * @property {string} parentArea
 * @property {string} [description]
 * @property {number} [totalCustomers]
 * @property {number} [availablePort]
 * @property {number} [lat]
 * @property {number} [lng]
 * @property {number} __v
 * @property {number} [port]
 */

/** @typedef {object} AreaShort
 * @property {string} id
 * @property {string} title
 * @property {string} type
 * @property {Odp[]} odpChildren -- For nested object, this is not return when fetch API (only use view application)
 */

/**
 * @typedef {object} AutoNotificationDate
 * @property {string[]} billingStatus
 * @property {string} _id
 * @property {number} date
 * @property {string} template
 * @property {boolean} sendInvoice
 */

/**
 * @typedef {object} WhatsappHooks
 * @property {string} url
 * @property {string | 'psb' | 'billing' | 'cs'} types
 */

/**
 * @typedef {object} Area
 * @property {string} _id
 * @property {string} title
 * @property {string} [prefixCustomer]
 * @property {number} [duoDate]
 * @property {number} [autoIsolirDate]
 * @property {number} [lat]
 * @property {number} [lng]
 * @property {number} [installationCharge]
 * @property {boolean} [isPrePaid]
 * @property {object[]} serverAreaId
 * @property {string} serverAreaId._id
 * @property {string[]} serverAreaId.parentCategoryList
 * @property {string} serverAreaId.category
 * @property {string} serverAreaId.title
 * @property {number} serverAreaId.__v
 * @property {object} serverAreaId.routerConfig
 * @property {string} area.routerConfig._id
 * @property {string} area.routerConfig.address
 * @property {string} area.routerConfig.port
 * @property {string} area.routerConfig.username
 * @property {string} area.routerConfig.password
 * @property {string} area.routerConfig.lastIP
 * @property {string} [defaultVlan]
 * @property {string} [generatedIP]
 * @property {string} [whatsappId]
 * @property {string} [whatsappIdBilling]
 * @property {boolean} [allowBroadcast]
 * @property {string} [templateAutoSendBilling]
 * @property {AutoNotificationDate} [autoNotificationDate]
 * @property {WhatsappHooks} [whatsappHooks]
 * @property {object} additional
 * @property {boolean} additional.billingRequireProofOfPayment
 * @property {string} [acsUrl]
 * @property {Boolean} requiredInstallationReport
 * @property {Boolean} autoIncrementStatus
 * @property {Number} autoIncrementLastNumber
 * @property {Number} autoIncrementMaxDigits
 * @property {Boolean} [isRandomPppoePassword]
 * @property {Boolean} [randomPppoePasswordMaxDigits]
 * @property {Boolean} [dynamicIP]
 * @property {Boolean} [writeStaticInterfacePSB]
 * @property {Boolean} [allowRemote] -- Remote to Mikrotik when PSB
 * @property {Boolean} [dynamicCustomerId] -- digunakan untuk customer id otomatis
 * @property {number} [broadcastChunksize]
 * @property {number} [broadcastInterval]
 * @property {number} [broadcastDelay]
 * @property {number} [maxDateMonth] -- maksimal tanggal bulanan apabila lebih akan digenapkan jadi bulan berikutnya
 * @property {string} broadcastWhatsappGroup
 *
 * @param {Object} params
 * @returns {Promise<Area[]>}
 */
export const getAllArea = async (params) => {
  const url = `${BASEURL}/admin/area/all`;
  const { data } = await axios.get(url, { params });
  return data.message;
};

/**
 * @param {*} params
 * @returns {Promise<GetAllAreaWithCategory[]>}
 */
export const getAllAreaWithCategory = async (params) => {
  const url = `${BASEURL}/admin/area/all-with-category`;
  const { data } = await axios.get(url, { params });
  return data.message;
};

/** @typedef {object} PPPOEItems
 * @property {string} ATTR
 * @property {string} name
 * @property {string} bridge-learning
 * @property {string} use-mpls
 * @property {string} use-compression
 * @property {string} use-encryption
 * @property {string} only-one
 * @property {string} change-tcp-mss
 * @property {string} use-upnp
 * @property {string} address-list
 * @property {string} on-up
 * @property {string} on-down
 * @returns {Promise<PPPOEItems>}
 * @param {string} id
 */
export const getPppoeProfile = async (id) => {
  const url = `${BASEURL}/admin/area/pppoe-profile/${id}`;
  const { data } = await axios.get(url);
  return data.message;
};

/**
 * @typedef {object} AreaCategory
 * @property {string} id
 * @property {string} title
 * @property {string} description
 * @property {string} type
 * @property {string} [whatsappId]
 * @property {number} [lat]
 * @property {number} [lng]
 * @property {AreaCategory[]} [areaCategoryChildren] -- For nested object, this is not return when fetch API (only use view application)
 * @property {AreaSimple[]} [areaSimpleChildren] -- For nested object, this is not return when fetch API (only use view application)
 * @property {Odp[]} [odpChildren] -- For nested object, this is not return when fetch API (only use view application)
 * @property {Odp[]} [odcChildren] -- For nested object, this is not return when fetch API (only use view application)
 * @property {Odp[]} [ponChildren] -- For nested object, this is not return when fetch API (only use view application)
 * @param {string | undefined} id -- area id
 * @returns {Promise<AreaCategory[]>}
 */
export const getAreaById = async (id) => {
  const url = `${BASEURL}/admin/area/${id ?? ''}`;
  const { data } = await axios.get(url);
  return data.message;
};

/**
 * @returns {Promise<GetAllAreaWithCategory[]>}
 */
export const getAreaCategoryAll = async () => {
  const url = `${BASEURL}/admin/area/category/all-with-category`;
  const { data } = await axios.get(url);
  return data.message;
};

/**
 * Export ODP
 * @param {*} area
 * @returns {Promise<Blob>}
 */
export async function exportODP(area) {
  const url = `${BASEURL}/admin/area/odp/export/${area}`;
  const { data } = await axios.get(url, { responseType: 'blob' });
  return data;
}

/**
 *
 * @param {string} areaId -- Area Id
 * @param {{page: number, limit: number, status: string; orderBy: string; order: string; special: boolean}} param1
 * @returns {Promise<{total: number, customers: Customer[]}>}
 */
export const getCustomerArea = async (
  areaId,
  { page, limit, status, find, order, orderBy, special }
) => {
  const url = `${BASEURL_V3}/customer/${areaId}`;
  const { data } = await axios.get(url, {
    params: {
      page,
      limit,
      status,
      find,
      orderBy,
      order,
      special: special === true ? 'true' : 'false',
    },
  });
  return data.message;
};

/**
 *
 * @param {string} areaId -- Area Id
 * @param {string} odpId -- ODP Id
 * @param {{page: number, limit: number, status: string; order: string; orderBy: string}} param1
 * @returns {Promise<{total: number, customer: Customer[]}>}
 */
export const getCustomerAreaWithODP = async (
  areaId,
  odpId,
  { page, limit, status, find, order, orderBy }
) => {
  const url = `${BASEURL}/admin/area/customer/${areaId}/${odpId}`;
  const { data } = await axios.get(url, {
    params: { page, limit, status, find, order, orderBy },
  });
  return data.message;
};

/**
 *
 * @param {string} parentId - ODP parent or Area Parent id
 * @returns {Promise<Odp[]>}
 */
export const getOdpList = async (parentId, params) => {
  const url = `${BASEURL}/admin/area/odp/list/${parentId}`;
  const { data } = await axios.get(url, { params });
  return data.message;
};

/**
 * @param {string} parentId - ODP parent or Area Parent id
 * @returns {Promise<Odp[]>}
 */
export const getOdpListLevel2 = async (parentId, areaId, params) => {
  const url = `${BASEURL}/admin/area/odp/list/${parentId}/${areaId}`;
  const { data } = await axios.get(url, { params });
  return data.message;
};

/**
 *
 * @param {string} parentId
 * @param {object} params
 * @returns {Promise<PPPOEItems[]>}
 */
export const getVlanList = async (parentId, params) => {
  const url = `${BASEURL}/admin/mikrotik/vlan/${parentId}`;
  const { data } = await axios.get(url, { params });
  return data.message;
};

/**
 * @returns {Promise<PPPOEItems{}>}
 */
export const getOlt = async () => {
  const url = `${BASEURL}/admin/area/olt`;
  const { data } = await axios.get(url);
  return data.message;
};

/**
 * @param {string} id
 * @returns {Promise<Area>}
 */
export async function getAreaCategoryData(id) {
  const { data } = await axios.get(`${BASEURL}/admin/area/detail/category/${id}`);

  if (!data.success) {
    throw new Error('Failed to get area category data');
  }

  return data.message;
}

/**
 * @param {string} id
 * @returns {Promise<Area>}
 */
export async function getAreaDetail(id) {
  const { data } = await axios.get(`${BASEURL}/admin/area/detail/${id}`);

  if (!data.success) {
    throw new Error('Failed to get area data');
  }

  return data.message;
}

/**
 * @param {string} id
 * @returns {Promise<AreaCategory>}
 */
export async function removeAreaCategory(id) {
  const { data } = await axios.delete(`${BASEURL}/admin/area/category/${id}`, {
    data: { replacement: id },
  });

  if (!data.success) {
    throw new Error('Failed to get area category data');
  }

  return data.message;
}

/**
 * @param {string} id
 * @returns {Promise<AreaCategory>}
 */
export async function removeAreaServer(id) {
  const { data } = await axios.delete(`${BASEURL}/admin/area/area/${id}`, {
    data: { replacement: id },
  });

  if (!data.success) {
    throw new Error('Failed to get area category data');
  }

  return data.message;
}

/**
 * @typedef {Object} AreaCategoryRequest
 * @property {string} [id]
 * @property {string} [parent]
 * @property {string} title
 * @property {string} description
 *
 * @param {AreaCategoryRequest} props
 * @returns {Promise<void>}
 */
export async function submitAreaCategory(props) {
  const { data } = await axios.post(`${BASEURL}/admin/area/category`, props);
  if (!data.success) {
    throw new Error(data.message);
  }
}

/**
 * Submits area information using Axios.
 *
 * @typedef {Object} AreaSubmit
 * @property {string} [id] - The optional ID of the area.
 * @property {string} [category] - The optional category of the area.
 * @property {string} title - The title of the area.
 * @property {string} defaultVlan - The title of the area.
 * @property {string} address - The address of the area.
 * @property {string} port - The port for the area.
 * @property {string} username - The username for authentication.
 * @property {string} password - The password for authentication.
 * @property {string} lastIP - The last known IP address of the area.
 * @property {string} prefixCustomer - Prefix customer id.
 * @property {number} duoDate - Duo date month.
 * @property {number} autoIsolirDate - Duo date month.
 *
 * @param {AreaSubmit} props - The area properties to submit.
 * @throws {Error} Throws an error if the API response is not successful.
 * @returns {Promise<Area>} A promise that resolves when the operation completes.
 */
export async function submitArea(props) {
  const { data } = await axios.post(`${BASEURL}/admin/area`, props);

  if (!data.success) {
    throw new Error(data.message);
  }

  return data.message;
}

export async function submitLogoArea(id, file) {
  const fd = new FormData();
  fd.append('logo', file);
  const { data } = await axios.post(`${BASEURL}/admin/area/logo/${id}`, fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return data.message;
}

/**
 * ODP
 */
/**
 * Submits ODP (Optical Distribution Point) information using Axios.
 *
 * @typedef {Object} SubmitODP - The ODP properties to submit.
 * @property {string} [id] - The optional ID of the ODP.
 * @property {string} name - The name of the ODP.
 * @property {string} address - The address of the ODP.
 * @property {string} [parentODP] - The optional parent ODP.
 * @property {string} parentArea - The parent area of the ODP.
 *
 *
 *
 * @param {SubmitODP} props  {Promise<SubmitODP>}
 * @throws {Error} Throws an error if the API response is not successful.
 * @returns {Promise<void>} A promise that resolves when the operation completes.
 */
export async function submitODP(props) {
  const { data, status } = await axios.post(`${BASEURL}/admin/area/odp`, props);

  if (status !== 200 || !data.success) {
    throw new Error('Failed to submit ODP');
  }
}

/**
 *
 * @param {string} id
 * @returns {Promise<Odp>}
 */
export async function getODPData(id) {
  const { data, status } = await axios.get(`${BASEURL}/admin/area/odp/${id}`);

  if (status !== 200 || !data.success) {
    throw new Error('Failed to fetch ODP data');
  }

  return data.message;
}

/**
 * @param {Object} params
 * @returns {Promise<Odp[]>}
 */
export async function getAllODP(params) {
  const { data, status } = await axios.get(`${BASEURL}/admin/area/odp`, { params });

  if (status !== 200 || !data.success) {
    throw new Error('Failed to fetch ODP data');
  }

  return data.message;
}

/**
 *
 * @param {string} id
 * @returns {Promise<void>}
 */
export async function removeODP(id) {
  const { data, status } = await axios.delete(`${BASEURL}/admin/area/odp/${id}`);

  if (status !== 200 || !data.success) {
    throw new Error('Failed to fetch ODP data');
  }

  return data.message;
}

/**
 * @typedef {Object} TestPingBody
 * @property {string} address
 * @property {string} password
 * @property {string} port
 * @property {string} user
 *
 * @param {TestPingBody} body
 * @return {Promise<string>}
 */
export async function testPing(body) {
  const { data } = await axios.post(`${BASEURL}/admin/mikrotik/test`, body);
  return data.message;
}

/**
 *
 * @param {string} area
 * @returns {Promise<string>}
 */
export async function generateCustomerId(area) {
  const { data } = await axios.get(`${BASEURL}/admin/area/customerId/${area}/generate-id`);
  return data.message;
}

/**
 * @typedef {object} TopologyCustomer
 * @property {string} _id
 * @property {object} location
 * @property {number} location.lat
 * @property {number} location.lng
 * @property {string} customerId
 * @property {string} fullname
 * @property {string} vlan
 * @property {object} odp
 * @property {string} odp.name
 * @property {object[]} odp.parent
 * @property {string} odp.parent._id
 * @property {string} odp.parent.title
 * @property {string} odp.parent.address
 * @property {number} odp.parent.lat
 * @property {number} odp.parent.lng
 * @property {object[]} odp.parent.parentCategory
 * @property {string} odp.parent.parentCategory._id
 * @property {string} odp.parent.parentCategory.title
 * @property {number} odp.parent.parentCategory.lat
 * @property {number} odp.parent.parentCategory.lng
 */

/**
 * @param {string} customerId
 * @returns {Promise<TopologyCustomer>}
 */
export async function getTopologyCustomer(customerId) {
  const { data } = await axios.get(`${BASEURL}/admin/area/customer/${customerId}/topology`);
  return data.message;
}

/**
 * Batch Rewrite PPPoE from server
 * @param {string} area
 * @returns {Promise<string>}
 */
export async function batchRewritePPPoE(area) {
  const { data } = await axios.post(`${BASEURL}/admin/area/batch-rewrite-pppoe/${area}`);
  return data.message;
}

/**
 * Batch Rewrite PPPoE from server
 * @param {string} area
 * @param {object} options
 * @param {boolean} options.writeInterface - Whether to write the PPPoE interface configuration to the Mikrotik router.
 * @param {boolean} options.writeSecret - Whether to write the PPPoE secret configuration to the Mikrotik router.
 * @returns {Promise<ReadableStream>}
 */
export async function batchRewritePPPoEV2(area, { writeInterface, writeSecret }) {
  const { data } = await axios.post(
    `${BASEURL}/admin/area/batch-rewrite-pppoe/v2/${area}`,
    { writeInterface, writeSecret },
    {
      responseType: 'stream',
      adapter: 'fetch',
    }
  );
  return data;
}

/**
 * Batch migrate package customer
 * @param {{
 * areaId: string;
 * fromPackageId: string;
 * toPackageId: string
 * }} body
 * @returns {Promise<string>}
 */
export async function migrationPackage(body) {
  const { data } = await axios.put(`${BASEURL}/admin/area/migrate-package`, body);
  return data.message;
}

/**
 * @typedef {Object} NetworkStatus
 * @property {number} pppActive
 * @property {number} pppInactive
 * @property {number} pppTotal
 * @property {number} isolated
 * @property {number} unisolated
 */

/**
 * Get Network Status
 * @param {{area: string}} param0
 * @returns {Promise<NetworkStatus>}
 */
export async function getNetworkStatus({ area }, signal) {
  const { data } = await axios.get(`${BASEURL}/admin/area/network-status`, {
    params: { area },
    signal,
  });
  return data.message;
}

/**
 * Topologi jaringan (Server -> POP -> OLT/ODP) untuk tab Jaringan.
 * @returns {Promise<{generatedAt: string, nodes: Array<{id: string, parent: string|null, kind: 'server'|'pop'|'olt'|'odp', label: string, sub?: string, status: string, total?: number, active?: number, isolated?: number}>}>}
 */
export async function getNetworkTopology() {
  const { data } = await axios.get(`${BASEURL}/admin/area/network-topology`);
  return data.message;
}
