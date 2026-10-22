/**
 * @typedef {import('src/repositories/networkMonitoringNotificationTemplate').NetworkMonitoringNotificationTemplate} NetworkMonitoringNotificationTemplate
 */

/**
 * Table header configuration for notification template
 */
export const TEMPLATE_HEADERS = [
  { label: 'Nama Template', id: 'templateName', sortable: true },
  { label: 'Template', id: 'template', sortable: false },
  { label: 'Dibuat', id: 'createdAt', sortable: true },
  { label: 'Diperbarui', id: 'updatedAt', sortable: true },
  { label: 'Actions', id: '_', sortable: false },
];

/**
 * Sorts and filters the notification template list
 * @param {NetworkMonitoringNotificationTemplate[]} data
 * @param {string} search
 * @param {string} orderBy
 * @param {'asc'|'desc'} order
 * @returns {NetworkMonitoringNotificationTemplate[]}
 */
export function filterAndSortTemplates(data, search, orderBy, order) {
  const list = [...data];

  list.sort((a, b) => {
    const aVal = a[orderBy] ?? '';
    const bVal = b[orderBy] ?? '';
    const cmp = String(aVal).localeCompare(String(bVal));
    return order === 'asc' ? cmp : -cmp;
  });

  if (!search) return list;

  const s = search.toLowerCase();
  return list.filter(
    (d) =>
      d.templateName.toLowerCase().includes(s) ||
      d.template.toLowerCase().includes(s)
  );
}
