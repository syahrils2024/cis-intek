/**
 * @typedef {import("src/repositories/subscription").Subscription} Subscription
 */

/**
 * Builds the PPPoE active data for a customer.
 *
 * When a customer has no `lastLoggedOut` value, the PPPoE session is considered
 * active (status = 1) and the raw `_pppActive` data is spread as-is.
 * Otherwise the session is considered inactive (status = 2) with placeholder
 * uptime / address values and the last logout timestamp retained.
 *
 * @param {object} [pppActive]
 * @returns {object}
 */
export function buildPppActiveData(pppActive) {
  if (!pppActive?.lastLoggedOut) {
    return { ...pppActive, status: 1 };
  }
  return {
    status: 2,
    uptime: '-',
    address: '-',
    lastLoggedOut: pppActive.lastLoggedOut,
  };
}

/**
 * Builds a normalized ONU info object with safe default values.
 *
 * @param {object} [onuInfo]
 * @returns {object}
 */
export function buildOnuInfo(onuInfo) {
  return onuInfo ?? { RunningState: -2, State: -2 };
}

/**
 * Maps a raw subscription into a customer row enriched with connection data
 * (PPPoE active status, ONU info and Mikrotik isolir flag).
 *
 * @param {Subscription} subscription
 * @param {Record<string, object>} [activeList]
 * @param {Record<string, object>} [onuInfoList]
 * @param {Record<string, boolean>} [mikrotikIsolirExists]
 * @returns {Subscription & { pppActive: object, onuInfo: object, isIsolirMikrotik: boolean }}
 */
export function buildCustomerWithConnection(
  subscription,
  activeList = {},
  onuInfoList = {},
  mikrotikIsolirExists = {}
) {
  const isIsolirMikrotik = mikrotikIsolirExists[subscription._id];
  const pppActive = buildPppActiveData(activeList[subscription._id]);
  const onuInfo = buildOnuInfo(onuInfoList[subscription._id]);

  return {
    ...subscription,
    pppActive,
    onuInfo,
    isIsolirMikrotik,
  };
}
