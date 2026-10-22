/**
 * @typedef {Object} Tab
 * @property {string} value
 * @property {string} label
 */

/**
 * @typedef {Object} WhatsappSettingState
 * @property {import("@/repositories/whatsappGroup").WhatsappGroup[]}
 * @property {import("@/repositories/whatsappNode").WhatsappNode[]} whatsappNodes
 * @property {import("@/repositories/whatsappLog").WhatsappLog[]} whatsappLog
 * @property {() => void} fetchWhatsappGroups
 * @property {() => void} fetchWhatsappNodes
 * @property {(node: import("@/repositories/whatsappNode").WhatsappNode, status: string) => void} changeStatusWhatsappNode
 * @property {Tab[]} tabs
 * @property {Tab} selectedTab
 * @property {(tabs: Tab) => void} setTabs
 * @property {() => void} dispose
 * @property {boolean} loading
 * @property {(data: import("@/repositories/whatsappGroup").WhatsappGroup) => void} deleteWhatsappGroup
 */

export const defaultState = {
  loading: false,
  whatsappGroups: [],
  whatsappNodes: [],
  whatsappLog: [],
};
