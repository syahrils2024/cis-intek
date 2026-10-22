import { useState } from 'react';
import { useBoolean } from '@hooks/use-boolean';

import { packagePlanRepository } from 'src/repositories';

/**
 * @typedef {object} AreaItem
 * @property {string} areaId
 * @property {string} areaName
 * @property {string} pppoeName
 */

/**
 * @typedef {object} PriceItem
 * @property {number} price
 * @property {AreaItem[]} areas
 */

export function usePackageFormDialogState() {
  const show = useBoolean(false);
  const loading = useBoolean(false);
  const [title, setTitle] = useState('');
  const packageActive = useBoolean(true);
  const packageFree = useBoolean(false);
  const loadingSubmit = useBoolean(false);
  const [currentPackage, setCurrentPackage] = useState(null);
  const duplicate = useBoolean(false);

  /** @type {[PriceItem[], void]} */
  const [prices, setPrices] = useState([
    {
      price: 0,
      areas: [],
    },
  ]);

  function resetPrices() {
    setPrices([
      {
        price: 0,
        areas: [],
      },
    ]);
  }

  function reset() {
    resetPrices();
    setTitle('');
    packageActive.setValue(true);
    packageFree.setValue(false);
    loadingSubmit.setValue(false);
    setCurrentPackage(null);
  }

  function removePrice(index) {
    setPrices((prev) => {
      const newPrices = [...prev];
      newPrices.splice(index, 1);
      return newPrices;
    });
  }

  function addPrice() {
    setPrices((prev) => [...prev, { price: 0, areas: [] }]);
  }

  /**
   * @param {number} index
   * @param {number} price
   */
  function setPrice(index, price) {
    setPrices((prev) => {
      const newPrices = [...prev];
      if (!newPrices[index]) newPrices[index] = { price: 0, areas: [] };
      newPrices[index].price = price;
      return newPrices;
    });
  }

  /**
   * @param {number} index
   * @param {AreaItem} area
   */
  function addAreaToPrice(index, area) {
    setPrices((prev) => {
      const newPrices = [...prev];
      if (!newPrices[index]) newPrices[index] = { price: 0, areas: [] };
      newPrices[index].areas.push(area);
      return newPrices;
    });
  }

  /**
   * Remove Area Item From Prices
   * @param {number} index
   * @param {number} areaIndex
   */
  function removeAreaFromPrice(index, areaIndex) {
    setPrices((prev) => {
      const newPrices = [...prev];
      if (newPrices[index] && newPrices[index].areas) {
        newPrices[index].areas.splice(areaIndex, 1);
      }
      return newPrices;
    });
  }

  /**
   * @param {number} index
   * @param {number} areaIndex
   * @param {string} pppoeName
   */
  function setPPPoE(index, areaIndex, pppoeName) {
    setPrices((prev) => {
      const newPrices = [...prev];
      if (newPrices[index] && newPrices[index].areas) {
        newPrices[index].areas[areaIndex].pppoeName = pppoeName;
      }
      return newPrices;
    });
  }

  async function submit() {
    if (title.trim() === '') {
      throw new Error('Nama Paket Internet tidak boleh kosong');
    }

    const items = prices
      .map((price, i) => {
        if (!packageFree.value && price.price <= 0) {
          throw new Error(`Harga paket regular tidak boleh kosong`);
        }

        if (price.areas.length === 0) {
          throw new Error(`Area tidak boleh kosong pada item ke-${i + 1}`);
        }
        return price.areas.map((area) => ({
          area: area.areaId,
          pppoeProfile: area.pppoeName,
          price: price.price,
        }));
      })
      .flat();

    const data = {
      title,
      status: packageActive.value ? 'active' : 'inactive',
      isFree: packageFree.value,
      price: items,
    };

    const isUpdate = !duplicate.value && currentPackage

    if (isUpdate) {
      data._id = currentPackage._id;
    }

    await packagePlanRepository.submitPackage(data);
  }

  async function load(id, isDuplicated = false) {
    const result = await packagePlanRepository.getDetail(id);
    setCurrentPackage(result);
    const groupPrice = [...new Set(result.prices.map((p) => p.price))];
    const groupedAreas = groupPrice.map((price) => ({
      price,
      areas: result.prices
        .filter((p) => p.price === price)
        .map((p) => ({
          areaId: p.area,
          areaName: p.areaName,
          pppoeName: p.pppoeProfile,
        })),
    }));

    const snapshotTitle = isDuplicated ? `${result.title} (Duplicate)` : result.title;
    setTitle(snapshotTitle);
    packageActive.setValue(result.status === 'active');
    packageFree.setValue(result.isFree);
    setPrices(groupedAreas);
  }

  return {
    show,
    loading,
    prices,
    setPrices,
    title,
    setTitle,
    packageActive,
    packageFree,
    resetPrices,
    removePrice,
    addPrice,
    setPrice,
    addAreaToPrice,
    removeAreaFromPrice,
    setPPPoE,
    loadingSubmit,
    submit,
    reset,
    load,
    duplicate,
  };
}
