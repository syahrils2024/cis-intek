/**
 * @typedef {import('src/repositories/xlsx').DownloadBillingTemplateParam} DownloadBillingTemplateParam
 */

import { useState } from 'react';
import { useBoolean } from '@hooks/use-boolean';

/**
 * @typedef {Object} TemplateData
 * @property {string} areaId
 * @property {string} areaName
 * @property {number} month
 * @property {number} year
 * @property {number} amount
 */

export function useImportBillingTemplatePickerState() {
  const now = new Date();

  const show = useBoolean(false);
  const loadingSubmit = useBoolean(false);

  /** @type {[TemplateData[], void]} */
  const [data, setData] = useState([
    {
      areaId: '',
      areaName: '',
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      depositMethodId: undefined,
      amount: 1,
    },
  ]);

  function addData() {
    setData((state) => [
      ...state,
      {
        areaId: '',
        areaName: '',
        year: now.getFullYear(),
        depositMethodId: undefined,
        month: now.getMonth() + 1,
        amount: 1,
      },
    ]);
  }

  function removeData(index) {
    const copy = [...data];
    copy.splice(index, 1);
    setData(copy);
  }

  function reset() {
    setData([
      {
        areaId: '',
        areaName: '',
        year: now.getFullYear(),
        depositMethodId: undefined,
        month: now.getMonth() + 1,
        amount: 1,
      },
    ]);
  }

  /**
   *
   * @param {number} index
   * @param {{areaId: string; areaName: string; month: number; year: number;}} propsData
   */
  function setTemplateData(index, { areaId, areaName, amount, month, year, depositMethodId } = {}) {
    /** @type {TemplateData[]} */
    const copy = [...data];
    if (typeof month === 'number') {
      copy[index].month = month;
    }

    if (typeof year === 'number') {
      copy[index].year = year;
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

    if (depositMethodId) {
      copy[index].depositMethodId = depositMethodId;
    }

    setData(copy);
  }

  /**
   * Transform data to request
   * @returns {DownloadBillingTemplateParam[]}
   */
  function transformToRequest() {
    return data.map((d, i) => {
      if (d.areaId === '') throw new Error(`Pilih Area / POP pada nomor ${i + 1}`);
      if (d.amount <= 0) throw new Error(`Isi minimal 1 pelanggan / data pada nomor ${i + 1}`);
      console.log(d);
      return {
        areaId: d.areaId,
        amount: d.amount,
        month: d.month,
        year: d.year,
        depositMethodId: d.depositMethodId,
      };
    });
  }

  return {
    show,
    data,
    setData,
    reset,
    setTemplateData,
    addData,
    removeData,
    transformToRequest,
    loadingSubmit,
  };
}
