/**
 * @typedef {import("src/repositories/area").Area} Area
 * @typedef {import("src/repositories/package").PackageArea} PackageArea
 * @typedef {import('src/stores/meStore').MeStore} MeStore
 */

import { toast } from 'sonner';
import { useMemo, useState } from 'react';
import { useBoolean } from '@hooks/use-boolean';

import { useMeStore } from 'src/stores/meStore';
import { areaRepository, packagePlanRepository, subscriptionRepository } from 'src/repositories';

export function useMigrationPackageBatchState() {
  /** @type {MeStore} */
  const meStore = useMeStore();

  /** @type {[Area, void]} */
  const [area, setArea] = useState(null);

  /** @type {[PackageArea[], void]} */
  const [packageList, setPackageList] = useState([]);

  const [fromPackageId, setFromPackageId] = useState('');
  const [toPackageId, setToPackageId] = useState('');

  const loading = useBoolean(false);
  const show = useBoolean(false);
  const checkedUser = useBoolean(false);
  const disabledSubmit = useBoolean(false);
  const checkboxUserLabel = useMemo(() => `${meStore.me?.fullname} Menyetujui migrasi pelanggan`);
  const [totalCustomers, setTotalCustomers] = useState(0);

  const filteredPackageList = useMemo(() => packageList.filter((p) => p._id !== fromPackageId));

  async function open(areaId) {
    loading.onTrue();
    try {
      const snapshotArea = await areaRepository.getAreaDetail(areaId);
      setArea(snapshotArea);

      const availablePackage = await packagePlanRepository.getAvailablePackageArea(areaId);
      setPackageList(availablePackage);
    } catch (error) {
      toast.error(error.message);
    } finally {
      loading.onFalse();
    }
  }

  async function validate() {
    if (fromPackageId === '') throw new Error('Paket sebelumnya belum diisi');
    if (toPackageId === '') throw new Error('Paket sesudahnya belum diisi');
    if (toPackageId === fromPackageId) throw new Error('Paket sesudahnya tidak boleh sama');
  }

  async function submit() {
    try {
      await validate();
      loading.onTrue();
      await areaRepository.migrationPackage({
        areaId: area._id,
        fromPackageId,
        toPackageId,
      });
      disabledSubmit.onTrue();
      toast.success('Memproses Migrasi Paket Internet Masal');
    } catch (error) {
      toast.error(error.message);
    } finally {
      loading.onFalse();
    }
  }

  async function countTotalCustomers() {
    if (!area) return;
    try {
      const snapshot = await subscriptionRepository.getListSubscription({
        areaId: area._id,
        packageId: fromPackageId,
        status: 'active',
      });
      setTotalCustomers(snapshot.total ?? 0);
    } catch (error) {
      toast.error(error.message);
    }
  }

  function clear() {
    loading.onFalse();
    setArea(null);
    setPackageList([]);
    setFromPackageId('');
    setToPackageId('');
    checkedUser.onFalse();
    disabledSubmit.onFalse();
    setTotalCustomers(0);
  }

  return {
    area,
    packageList,
    fromPackageId,
    toPackageId,
    show,
    filteredPackageList,
    disabledSubmit,
    checkboxUserLabel,
    checkedUser,
    loading,
    totalCustomers,
    open,
    clear,
    setToPackageId,
    setFromPackageId,
    submit,
    countTotalCustomers,
  };
}
