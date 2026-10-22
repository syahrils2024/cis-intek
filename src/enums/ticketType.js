export const TICKET_TYPE = {
  INSTALLATION_REQUEST: 'installation_request',
  MAINTENANCE: 'maintenance',
  PROBLEM: 'problem',
  INTERNET_TROUBLE: 'internet_trouble',
  OTHER: 'other',
  UPGRADE_REQUEST: 'upgrade_request',
  DISMAINTENANCE: 'dismaintenance', // Pencabutan alat
  DISMAINTENANCE_NO_TICKET: 'dismaintenance_no_ticket', // Pencabutan alat tanpa ticket
  ADDONS_REQUEST: 'addons_request',
};

export const TICKET_TYPE_LABELS = {
  installation_request: 'Installation Request',
  maintenance: 'Perbaikan',
  problem: 'Kendala Lain',
  internet_trouble: 'Gangguan Internet',
  other: 'Lainnya',
  upgrade_request: 'Permintaan Upgrade',
  dismaintenance: 'Dismaintenance',
  dismaintenance_no_ticket: 'Dismaintenance Tanpa Ticket',
  addons_request: 'Addons Request',
};

export const TICKET_TYPE_LABELS_LIST = Object.entries(TICKET_TYPE_LABELS).map(([key, value]) => ({
  value: key,
  label: value,
}));
