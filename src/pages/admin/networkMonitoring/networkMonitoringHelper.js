/**
 * @typedef {import("src/repositories/networkMonitoring").NetworkMonitoringDevice} NetworkMonitoringDevice
 * @typedef {import('src/repositories/networkMonitoring').NetworkMonitoringDevicePingRecords} NetworkMonitoringDevicePingRecords
 */

/**
 * @typedef {Object} NetworkMonitoringTreeNode
 * @property {string} name
 * @property {string} id
 * @property {string} ip_address
 * @property {string} last_status
 * @property {number|null} last_response_time_ms
 * @property {string|null} last_pinged_at
 * @property {string} [description]
 * @property {string} [category]
 * @property {string} [icon]
 * @property {import('src/repositories/networkMonitoring').NetworkMonitoringDevicePrimaryIpStatus} [primary_ip_status]
 * @property {import('src/repositories/networkMonitoring').NetworkMonitoringDeviceSecondaryIpStatus[]} [secondary_ip_addresses]
 * @property {NetworkMonitoringTreeNode[]} children
 * @property {boolean} [hasMoreChildren]
 */

/**
 * @typedef {Object} SecondaryIpFormItem
 * @property {string} [id]
 * @property {string} ip_address
 * @property {string} [label]
 */

// ============================================================
// Tree building (from networkMonitoring.state.js)
// ============================================================

/**
 * Transforms a flat list of devices into a recursive tree structure.
 * Trims branches beyond `maxDepth` unless a node's ID is in `expandedNodeIds`.
 * @param {NetworkMonitoringDevice[]} devices
 * @param {{ maxDepth?: number, expandedNodeIds?: Set<string> }} [options]
 * @returns {NetworkMonitoringTreeNode[]}
 */
export function buildNetworkMonitoringTree(
  devices,
  { maxDepth = 3, expandedNodeIds = new Set() } = {}
) {
  const rootDevice = devices.find((d) => d.parent_id === null);
  const rootId = rootDevice?.id;

  /** @type {Map<string, NetworkMonitoringTreeNode>} */
  const map = devices.reduce((acc, device) => {
    acc.set(device.id, {
      name: device.alias.trim(),
      id: device.id,
      ip_address: device.ip_address,
      last_status: device.last_status,
      last_response_time_ms: device.last_response_time_ms,
      last_pinged_at: device.last_pinged_at ?? null,
      category: device.category,
      primary_ip_status: device.primary_ip_status,
      secondary_ip_addresses: device.secondary_ip_addresses,
      icon: device.icon ?? '',
      description: device.description ?? '',
      children: [],
    });
    return acc;
  }, new Map());

  devices.forEach((device) => {
    if (device.id === rootId) return;
    const node = map.get(device.id);
    const parentId =
      device.parent_id === null || !map.has(device.parent_id) ? rootId : device.parent_id;
    map.get(parentId)?.children.push(node);
  });

  if (!rootId) return [];

  /**
   * Trim tree depth: children beyond maxDepth are hidden unless node is expanded.
   */
  function trimNode(node, depth) {
    const showChildren = depth < maxDepth || expandedNodeIds.has(node.id);

    if (!showChildren && node.children.length > 0) {
      node.hasMoreChildren = true;
      node.children = [];
      return;
    }

    node.children.forEach((child) => trimNode(child, depth + 1));
  }

  const root = map.get(rootId);
  trimNode(root, 0);

  function sortChildren(nodes) {
    nodes.sort((a, b) => a.name.localeCompare(b.name));
    nodes.forEach((n) => {
      if (n.children.length > 0) sortChildren(n.children);
    });
  }

  sortChildren([root]);
  return [root];
}

/**
 * Recursively collects all descendant IDs for a given parent.
 * @param {NetworkMonitoringDevice[]} devices
 * @param {string} parentId
 * @returns {string[]}
 */
export function getNetworkMonitoringDescendantIds(devices, parentId) {
  const children = devices.filter((d) => d.parent_id === parentId);
  const result = children.map((c) => c.id);
  children.forEach((c) => {
    result.push(...getNetworkMonitoringDescendantIds(devices, c.id));
  });
  return result;
}

/**
 * Get category label for delete confirmation.
 * @param {string} category
 * @returns {string}
 */
export function getNetworkMonitoringCategoryLabel(category) {
  const labels = {
    ODP: 'ODP',
    regency: 'Provinsi',
    district: 'Kota',
    device: 'Device',
  };
  return labels[category] ?? 'Item';
}

// ============================================================
// Secondary IP helpers (from formDialog.state.js)
// ============================================================

/**
 * Sanitizes secondary IP addresses for submit (removes empty entries, formats properly).
 * @param {SecondaryIpFormItem[]} items
 * @returns {Array}
 */
export function sanitizeSecondaryIpAddresses(items) {
  return items
    .filter((s) => s.ip_address?.trim())
    .map((s) => ({
      ...(s.id ? { id: s.id } : {}),
      ip_address: s.ip_address,
      ...(s.label?.trim() ? { label: s.label } : {}),
    }));
}

/**
 * Creates an empty secondary IP form item.
 * @returns {SecondaryIpFormItem}
 */
export function createEmptySecondaryIpAddress() {
  return { ip_address: '', label: '' };
}

/**
 * Creates an empty child device for the form.
 * @returns {Partial<NetworkMonitoringDevice>}
 */
export function createEmptyNetworkMonitoringChild() {
  return {
    alias: '',
    ip_address: '',
    category: 'device',
    secondary_ip_addresses: [],
  };
}

/**
 * Builds a device payload for create/update API.
 * Sanitizes secondary IPs internally.
 * @param {Object} params
 * @param {string} params.alias
 * @param {string} params.ipAddress
 * @param {string} params.description
 * @param {string} params.category
 * @param {string|null} params.parentId
 * @param {string} params.groupId
 * @param {string} params.iconName
 * @param {SecondaryIpFormItem[]} params.secondaryIpAddresses
 * @returns {Object}
 */
export function createNetworkMonitoringDevicePayload({
  alias,
  ipAddress,
  description,
  category,
  parentId,
  groupId,
  iconName,
  secondaryIpAddresses,
}) {
  return {
    alias,
    ip_address: ipAddress,
    description,
    category,
    parent_id: parentId,
    group_id: groupId,
    icon: iconName || undefined,
    secondary_ip_addresses: sanitizeSecondaryIpAddresses(secondaryIpAddresses),
  };
}

/**
 * Builds a child device payload for create/update API.
 * @param {Object} child
 * @param {string} parentId
 * @param {string} groupId
 * @returns {Object}
 */
export function createNetworkMonitoringChildPayload(child, parentId, groupId) {
  return {
    parent_id: parentId,
    alias: child.alias,
    ip_address: child.category !== 'device' ? '' : child.ip_address,
    ...(child.description ? { description: child.description } : {}),
    category: child.category,
    group_id: groupId,
    icon: child.icon || undefined,
    secondary_ip_addresses: child.secondary_ip_addresses ?? [],
  };
}

/**
 * Maps secondary IP statuses from API response to form format.
 * @param {Array} statuses
 * @returns {SecondaryIpFormItem[]}
 */
export function mapSecondaryIpStatusesToRequest(statuses) {
  return (statuses ?? []).map((s) => ({
    id: s.id,
    ip_address: s.ip_address,
    label: s.label ?? '',
  }));
}

// ============================================================
// TreeView constants & formatters (from TreeView.jsx)
// ============================================================

const API_ICONS_URL = `${import.meta.env.VITE_API_NETWORK_MONITORING_URL}/icons`;
const now = Date.now();

export const NETMON_STATUS_COLOR = {
  connected: '#22c55e',
  disconnected: '#ef4444',
  semiconnected: '#ff9100',
};

export const NETMON_STATUS_LABEL = {
  connected: 'UP',
  disconnected: 'DOWN',
  semiconnected: 'PARTIAL DOWN',
};

export const NETMON_CATEGORY_ICON = {
  // device: 'https://api.iconify.design/cbi/mikrotik.svg',
  device: 'roundRect',
  regency: 'https://api.iconify.design/fluent/folder-globe-20-regular.svg',
  district: 'https://api.iconify.design/gis/search-globe.svg',
  ODP: 'https://api.iconify.design/mdi/ethernet.svg',
};

export const NETMON_NODE_LABEL_RICH = Object.fromEntries(
  Object.entries(NETMON_CATEGORY_ICON).map(([key, url]) => [
    key,
    { width: 16, height: 16, backgroundColor: { image: url } },
  ])
);

/**
 * Formats the node label for ECharts tree.
 * @param {Object} params
 * @returns {string}
 */
export function formatNetworkMonitoringNodeLabel(params) {
  const name = params.data?.name ?? '';
  const category = params.data?.category;
  const icon = NETMON_CATEGORY_ICON[category] ? `{${category}|} ` : '';

  return `${name}`;
}

/**
 * Recursively maps tree nodes to ECharts-compatible format with styling.
 * @param {NetworkMonitoringTreeNode} node
 * @param {string|null} [highlightedNodeId]
 * @returns {Object}
 */
export function mapNetworkMonitoringTreeNodeToEChartsNode(node, highlightedNodeId = null) {
  const color = NETMON_STATUS_COLOR[node.last_status] ?? '#94a3b8';
  const iconUrl = NETMON_CATEGORY_ICON[node.category];

  // Use device icon if available, otherwise fall back to category icon
  let symbol;
  if (node.icon === 'circle-outline') {
    symbol = undefined; // Use default symbol for circle-outline
  } else if (node.icon) {
    symbol = `image://${API_ICONS_URL}/${node.icon}?state=${node.last_status}&t=${now}`;
  } else if (typeof iconUrl === 'string' && iconUrl.startsWith('http')) {
    symbol = `image://${iconUrl}`;
  } else {
    symbol = 'circle';
  }

  return {
    name: node.name,
    id: node.id,
    value: node.last_response_time_ms,
    ip_address: node.ip_address,
    last_status: node.last_status,
    last_pinged_at: node.last_pinged_at,
    category: node.category,
    icon: node.icon,
    description: node.description ?? '',
    primary_ip_status: node.primary_ip_status,
    secondary_ip_addresses: node.secondary_ip_addresses,
    hasMoreChildren: node.hasMoreChildren ?? false,
    symbolSize: node.icon && symbol ? 30 : 10,
    symbol,
    itemStyle: { color },
    label: highlightedNodeId && node.id === highlightedNodeId
      ? {
          color: '#1e293b',
          borderColor: '#6366f1',
          borderWidth: 2,
          borderRadius: 4,
          padding: [2, 6],
        }
      : {
          color: '#1e293b',
        },
    children: node.children.map((child) => mapNetworkMonitoringTreeNodeToEChartsNode(child, highlightedNodeId)),
  };
}

/**
 * Builds action buttons HTML for ECharts tooltip.
 * @param {Object} params
 * @param {string} params.id
 * @param {string} params.alias
 * @param {string} params.ip
 * @param {string} params.statusLabel
 * @param {string} params.lastPingedAt
 * @param {boolean} params.canEdit
 * @returns {string}
 */
function buildActionButtons({ id, alias, ip, statusLabel, lastPingedAt, canEdit }) {
  if (!id) return '';

  // SLA button - visible for all non-root nodes regardless of canEdit
  const slaBtn =
    id !== 'root'
      ? `<button
      onclick="window.__nmSla('${id}')"
      style="padding:4px 12px;background:#0ea5e9;color:#fff;border:none;border-radius:4px;cursor:pointer;font-size:12px">
      SLA
    </button>`
      : '';

  // Edit and Delete buttons - only when user has edit permission
  const editBtn = canEdit
    ? `<button
      onclick="window.__nmEdit('${id}','${alias}','${ip}','${statusLabel}','${lastPingedAt}')"
      style="padding:4px 12px;background:#6366f1;color:#fff;border:none;border-radius:4px;cursor:pointer;font-size:12px">
      Edit
    </button>`
    : '';

  const deleteBtn =
    canEdit && id !== 'root'
      ? `<button
      onclick="window.__nmDelete('${id}')"
      style="padding:4px 12px;background:#ef4444;color:#fff;border:none;border-radius:4px;cursor:pointer;font-size:12px">
      Delete
    </button>`
      : '';

  return `<div style="margin-top:8px;display:flex;gap:8px">${slaBtn}${editBtn}${deleteBtn}</div>`;
}

/**
 * Builds tooltip HTML for ECharts tree nodes.
 * @param {Object} data
 * @param {boolean} canEdit
 * @returns {string}
 */
/**
 * Builds an HTML line for an IP status item.
 * @param {string} ipAddress
 * @param {string} [status]
 * @param {string|number} [lastPingedAt]
 * @returns {string}
 */
function buildIpStatusLine(ipAddress, status, lastPingedAt) {
  const dotColor = NETMON_STATUS_COLOR[status] ?? '#94a3b8';
  const statusLabel = NETMON_STATUS_LABEL[status] ?? '-';
  const pingedStr = lastPingedAt
    ? ` <span style="color:#94a3b8;font-size:11px">${new Date(lastPingedAt).format('dd-MM-yyyy HH:mm:ss')}</span>`
    : '';
  return `<div style="display:flex;align-items:center;gap:6px">
    <span style="width:8px;height:8px;border-radius:50%;background:${dotColor};display:inline-block;flex-shrink:0"></span>
    <span>${ipAddress}</span>
    <span style="color:${dotColor};font-weight:600;font-size:11px">${statusLabel}</span>${pingedStr}
  </div>`;
}

/**
 * Builds tooltip HTML for ECharts tree nodes.
 * @param {Object} data
 * @param {boolean} canEdit
 * @returns {string}
 */
export function buildNetworkMonitoringTooltip(data, canEdit) {
  if (!data) return '';

  const alias = data.name?.split('\n')[0] ?? '-';
  const ip = data.ip_address ?? '-';
  const category = data.category ?? null;
  const statusColor = NETMON_STATUS_COLOR[data.last_status] ?? '#94a3b8';
  const statusLabel = NETMON_STATUS_LABEL[data.last_status] ?? '-';
  const pingedAt = data.last_pinged_at
    ? new Date(data.last_pinged_at).format('dd-MM-yyyy HH:mm:ss')
    : '-';
  const actionBtns = buildActionButtons({
    id: data.id ?? '',
    alias,
    ip,
    statusLabel,
    lastPingedAt: data.last_pinged_at,
    canEdit,
  });
  const descriptionLine = data.description
    ? `<br/><span style="font-size:11px;color:#94a3b8">${data.description.trim()}</span>`
    : '';

  if (data.id === 'root' || category !== 'device') {
    return `<strong>${alias}</strong>${descriptionLine}<br/>${actionBtns}`;
  }

  // Primary IP with its own status from primary_ip_status
  const primaryIpStatus = data.primary_ip_status;
  const primaryIpLine = buildIpStatusLine(ip, data.last_status, data.last_pinged_at);

  // Secondary IPs with individual statuses
  const secondaryLines = (data.secondary_ip_addresses ?? []).map((s) =>
    buildIpStatusLine(s.ip_address, s.last_status ?? s.status, s.last_pinged_at)
  );

  const ipSection = [primaryIpLine, ...secondaryLines].join('');

  let aliasTag = `<strong>${alias}</strong>`;
  if (data.last_status === 'semiconnected') {
    aliasTag += ` <span style="color:${statusColor};font-weight:600;font-size:11px">${statusLabel}</span>`;
  }

  return [
    aliasTag,
    `<div style="margin-top:4px">${ipSection}</div>`,
    // `Last ping: ${pingedAt}`,
    actionBtns,
    descriptionLine,
  ].join('<br/>');
}
