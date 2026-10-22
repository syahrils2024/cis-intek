import { toast } from 'sonner';
import { useMemo, useState } from 'react';
import { useBoolean } from '@hooks/use-boolean';
import { useAppPicker } from '@hooks/use-app-picker';

import { usePackageStore } from 'src/stores/packageStore';

/**
 * @typedef {import("src/stores/packageStore").PackageStore} PackageStore
 */

export function usePackageState() {
  /** @type {PackageStore} */
  const { packagePlans, fetchPackagePlans } = usePackageStore();
  const [areaTitle, setAreaTitle] = useState('Semua');
  const [areaId, setAreaId] = useState(null);
  const loadingFetch = useBoolean(false);
  const appPicker = useAppPicker();

  const filteredPackagePlans = useMemo(() => {
    if (!areaId) return packagePlans;
    return packagePlans
      .map((packagePlan) => {
        const areaList = packagePlan.areaStats.filter(
          (area) => area.areaId === areaId || area.areaCategoryId === areaId
        );
        return {
          ...packagePlan,
          areaStats: areaList,
        };
      })
      .filter((packagePlan) => packagePlan.areaStats.length > 0);
  }, [areaId, packagePlans]);

  async function pickArea() {
    const result = await appPicker.area.open(areaId, true);
    if (!result) return;
    setAreaTitle(result.title);
    setAreaId(result._id);
  }

  async function refresh() {
    loadingFetch.onTrue();
    try {
      await fetchPackagePlans();
    } catch (e) {
      toast.error(e.message);
    } finally {
      loadingFetch.onFalse();
    }
  }

  return {
    packagePlans,
    loadingFetch,
    refresh,
    areaTitle,
    setAreaTitle,
    areaId,
    setAreaId,
    pickArea,
    filteredPackagePlans,
  };
}
