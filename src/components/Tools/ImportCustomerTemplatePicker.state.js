/**
 * @typedef {import("src/repositories/area").Area} Area
 * @typedef {import("src/repositories/area").Odp} ODP
 * @typedef {import("src/repositories/package").PackageArea} PackageArea
 * @typedef {import('src/repositories/package').ResultPackageList} PackageList
 * @typedef {import('src/repositories/xlsx').DownloadCustomerTemplateParam} DownloadCustomerTemplateParam
 */

import { toast } from 'sonner';
import { useMemo, useState } from 'react';
import { useBoolean } from '@hooks/use-boolean';

import { areaRepository, packagePlanRepository } from 'src/repositories';

/**
 * @typedef {Object} TemplateData
 * @property {string} areaId
 * @property {string} areaName
 * @property {string} packageId
 * @property {string} odpId
 * @property {number} amount
 */

export function useImportCustomerTemplatePickerState() {
  const show = useBoolean(false);
  const loadingSubmit = useBoolean(false);

  /** @type {[ODP[], void]} */
  const [odps, setOdps] = useState([]);

  /** @type {[PackageList[], void]} */
  const [packages, setPackages] = useState([]);

  /** @type {[TemplateData[], void]} */
  const [data, setData] = useState([
    {
      areaId: '',
      areaName: '',
      packageId: '',
      odpId: '',
      amount: 0,
    },
  ]);

  function addData() {
    setData((state) => [
      ...state,
      {
        areaId: '',
        areaName: '',
        packageId: '',
        odpId: '',
        amount: 0,
      },
    ]);
  }

  function removeData(index) {
    const copy = [...data];
    copy.splice(index, 1);
    setData(copy);
  }

  const listItems = useMemo(() =>
    data.map((d) => {
      const area = d.areaId;
      const odpList = odps.filter((o) => o.parentArea === area);
      const packageAreaList = packages.filter((p) => p.prices.some((pp) => pp.area === area));
      const packageList = packageAreaList
        .map((pa) => {
          const price = pa.prices.find(
            (priceArea) =>
              priceArea.area === area &&
              priceArea.price &&
              (priceArea.pppoeProfile.length > 0 || priceArea.pppoeProfile.includes('default'))
          );
          if (!price) return null;
          return {
            _id: pa._id,
            title: pa.title,
            price: price.price,
          };
        })
        .filter((pa) => !!pa);

      return {
        odpList,
        packageList,
      };
    })
  );

  function reset() {
    setOdps([]);
    setPackages([]);
    setData([
      {
        areaId: '',
        areaName: '',
        packageId: '',
        odpId: '',
        amount: 0,
      },
    ]);
  }

  async function prefetch() {
    try {
      const snapshotOdp = await areaRepository.getAllODP();
      const snapshotPackage = await packagePlanRepository.getPackageList();
      setOdps(snapshotOdp);
      setPackages(snapshotPackage);
    } catch (error) {
      toast.error(error.message);
    }
  }

  /**
   *
   * @param {number} index
   * @param {{areaId: string; areaName: string; packageId: string; odpId: string; amount: number}} propsData
   */
  function setTemplateData(index, { areaId, areaName, packageId, odpId, amount } = {}) {
    /** @type {TemplateData[]} */
    const copy = [...data];
    if (packageId) {
      copy[index].packageId = packageId;
    }

    if (odpId) {
      copy[index].odpId = odpId;
    }

    if (areaId) {
      copy[index].areaId = areaId;
    }

    if (areaName) {
      copy[index].areaName = areaName;
    }

    if (typeof amount === 'number') {
      copy[index].amount = amount;
    }

    setData(copy);
  }

  /**
   * Transform data to request
   * @returns {DownloadCustomerTemplateParam[]}
   */
  function transformToRequest() {
    return data.map((d, i) => {
      if (d.areaId === '') throw new Error(`Pilih Area / POP pada nomor ${i + 1}`);
      if (d.packageId === '') throw new Error(`Pilih Paket pada nomor ${i + 1}`);
      if (d.amount <= 0) throw new Error(`Isi minimal 1 pelanggan / data pada nomor ${i + 1}`);
      return {
        areaId: d.areaId,
        packageId: d.packageId,
        amount: d.amount,
        odpId: d.odpId,
      };
    });
  }

  return {
    show,
    data,
    setData,
    reset,
    listItems,
    prefetch,
    setTemplateData,
    addData,
    removeData,
    transformToRequest,
    loadingSubmit,
  };
}
