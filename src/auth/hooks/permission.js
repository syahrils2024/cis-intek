import { useMemo } from 'react';

import { useMeStore } from 'src/stores/meStore';

/**
 * @typedef {import('src/stores/meStore').MeStore} MeStore
 */

export function usePermission() {
  /** @type {MeStore} */
  const { me } = useMeStore();

  const showFinanceData = useMemo(() => me?.permission?.allowShowFinanceData ?? false, [me]);
  const editProfile = useMemo(() => me?.permission?.allowEditProfile ?? false, [me]);
  const allowAccessWhatsappPanel = useMemo(() => me?.permission?.allowAccessWhatsappPanel ?? false, [me]);
  const allowAccessNetworkMonitoring = useMemo(() => me?.permission?.allowAccessNetworkMonitoring ?? false, [me]);
  const allowEditNetworkMonitoring = useMemo(() => me?.permission?.allowEditNetworkMonitoring ?? false, [me]);

  return {
    showFinanceData,
    editProfile,
    allowAccessWhatsappPanel,
    allowAccessNetworkMonitoring,
    allowEditNetworkMonitoring,
  };
}
