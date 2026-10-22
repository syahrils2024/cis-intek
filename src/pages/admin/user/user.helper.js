/**
 * @typedef {import('src/repositories/user').User} User
 */

/**
 * Table header configuration
 */
export const USER_HEADERS = [
  { label: 'Nama Lengkap', id: 'fullname', sortable: true },
  { label: 'Profile', id: 'profile', sortable: true },
  { label: 'Parent User', id: 'parentUser', sortable: false },
  { label: 'Status', id: 'status', sortable: true },
  { label: 'Privilege', id: 'privilege', sortable: false },
  { label: 'Actions', id: '_', sortable: false },
];

/**
 * Tab labels
 */
export const USER_TABS = ['Admin', 'NOC', 'Engineer', 'Marketing', 'LO'];

/**
 * Determines which tabs are available based on current user's privilege.
 * @param {string[]} [privileges]
 * @returns {string[]}
 */
export function getAvailableTabs(privileges) {
  if (privileges?.includes('liaison_officer')) return USER_TABS.slice(0, 4);
  return USER_TABS;
}

/**
 * Formats a privilege string for display.
 * @param {string} privilege
 * @returns {string}
 */
export function formatPrivilege(privilege) {
  return privilege.replace('network_operation_center', 'NOC');
}

/**
 * Sorts and filters the user list based on current tab, search, and sort options.
 * @param {User[]} admin
 * @param {User[]} noc
 * @param {User[]} engineer
 * @param {User[]} marketing
 * @param {User[]} lo
 * @param {number} selectedTab
 * @param {string} search
 * @param {string} orderBy
 * @param {'asc'|'desc'} order
 * @returns {User[]}
 */
export function filterAndSortUsers(
  admin,
  noc,
  engineer,
  marketing,
  lo,
  selectedTab,
  search,
  orderBy,
  order
) {
  let data;
  if (selectedTab === 4) {
    data = [...lo];
  } else if (selectedTab === 3) {
    data = [...marketing];
  } else if (selectedTab === 2) {
    data = [...engineer];
  } else if (selectedTab === 1) {
    data = [...noc];
  } else {
    data = [...admin];
  }

  data.sort((a, b) => {
    if (orderBy === 'status') {
      return order === 'asc'
        ? a.status.localeCompare(b.status)
        : b.status.localeCompare(a.status);
    }
    return order === 'asc'
      ? a.fullname.localeCompare(b.fullname)
      : b.fullname.localeCompare(a.fullname);
  });

  if (!search) return data;

  const s = search.toLowerCase();
  return data.filter(
    (d) =>
      d.fullname.toLowerCase().includes(s) ||
      d.address?.toLowerCase().includes(s) ||
      d.areasTitle?.some((a) => a.toLowerCase().includes(s)) ||
      d.phone.toLowerCase().includes(s) ||
      d.email.toLowerCase().includes(s)
  );
}

/**
 * Builds a user privilege array from form booleans.
 * @param {import('src/repositories/user').UserRequest} user
 * @returns {string[]}
 */
export function buildPrivileges(user) {
  const privilege = [];
  if (user.isAdmin) privilege.push('admin');
  if (user.isMarketing) privilege.push('marketing');
  if (user.isEngineer) privilege.push('engineer');
  if (user.isNetworkOperationCenter) privilege.push('network_operation_center');
  if (user.isLo) privilege.push('liaison_officer');
  return privilege;
}
