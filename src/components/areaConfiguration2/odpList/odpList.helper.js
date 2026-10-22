/**
 * @typedef {import('src/repositories/area').Odp} Odp
 */

/**
 * Table header configuration for the ODP list.
 */
export const ODP_HEADERS = [
  {
    label: 'ODP',
    id: 'odp',
    sortable: true,
  },
  {
    label: 'Port',
    id: 'port',
    sortable: true,
  },
  {
    label: 'Used',
    id: 'totalCustomers',
    sortable: true,
  },
  {
    label: 'Status',
    id: 'pppActiveCount',
    sortable: true,
  },
  {
    label: 'Actions',
    id: '_',
    sortable: false,
  },
];

/**
 * Returns a Tailwind text-color class based on how filled a port is.
 * @param {Odp} item
 * @returns {string}
 */
export function coloringPort(item) {
  const usagePort = item.totalCustomers ?? 0;
  const totalPort = item.port ?? 0;

  const percentage = (usagePort / totalPort) * 100;
  if (percentage <= 30) {
    return 'tw-text-green-700';
  }
  if (percentage >= 31 && percentage <= 70) {
    return 'tw-text-yellow-600';
  }
  return 'tw-text-red-600';
}
