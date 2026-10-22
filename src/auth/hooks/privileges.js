import { useMemo } from 'react';

import { useMeStore } from 'src/stores/meStore';

export const usePrivilege = () => {
  /** @type {import('src/stores/meStore').MeStore} */
  const meStore = useMeStore();

  return useMemo(() => {
    const privilegesStorage = localStorage.getItem('privilege');
    const userId = meStore.me?._id ?? localStorage.getItem('userId');

    /** @type {string[]} */
    const privileges =
      meStore.me?.privilege ?? (privilegesStorage ? JSON.parse(privilegesStorage) : []);

    const isDeveloper = privileges.includes('developer');
    const isAdmin = privileges.includes('admin') || isDeveloper;
    const isMarketing = privileges.includes('marketing');
    const isEngineer = privileges.includes('engineer');
    const isNoc = privileges.includes('network_operation_center');
    const isLo = privileges.includes('liaison_officer');

    return { isAdmin, isMarketing, isEngineer, isDeveloper, userId, isNoc, isLo };
  }, [meStore.me]);
};
