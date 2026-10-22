import { toast } from 'sonner';
import { useRef, useState } from 'react';
import { useBoolean } from '@hooks/use-boolean';

import { useTheme, useMediaQuery } from '@mui/material';

import 'src/extension/number';
import 'src/extension/string';
import { duitkuRepository, duitkuFeeProfileRepository } from 'src/repositories';

/**
 * @typedef {Object} DuitkuFeeProfileArea
 * @property {string} _id
 * @property {string} title
 */

/**
 * @typedef {import('src/repositories/duitkuFeeProfile').DuitkuFee} DuitkuFee
 */

export function useDuitkuFeeProfileFormState() {
  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down('sm'));
  const loading = useBoolean(false);
  const loadingSubmit = useBoolean(false);
  const [profileName, setProfileName] = useState('');
  const show = useBoolean(false);

  const duplicated = useBoolean(false);

  const [currentId, setCurrentId] = useState(null);

  /** @type {[DuitkuFeeProfileArea[], Function]} */
  const [areas, setAreas] = useState([]);

  /** @type {[DuitkuFee[], Function]} */
  const [fees, setFees] = useState([]);

  const [tab, setTab] = useState('form');
  const [tabList] = useState([
    {
      label: 'Form',
      value: 'form',
    },
    {
      label: 'Biaya',
      value: 'fees',
    },
  ]);

  const resolver = useRef();
  const areaPickerRef = useRef();

  function reset() {
    setCurrentId(null);
    setProfileName('');
    setAreas([]);
    setFees([]);
  }

  async function addArea() {
    const result = await areaPickerRef.current?.open(null, false);
    if (!result) return;
    setAreas((current) => {
      const exists = current.find((a) => a._id === result._id);
      if (exists) return current;
      return [...current, result];
    });
  }

  function removeArea(index) {
    setAreas((current) => current.filter((_, i) => i !== index));
  }

  async function loadFees(currentFees = []) {
    loading.onTrue();
    try {
      const snapshot = await duitkuRepository.getFee();
      if (currentFees.length > 0) {
        // merge current fees with snapshot
        const mergedFees = snapshot.map((fee) => {
          const existingFee = currentFees.find((f) => f.code === fee.code);
          return existingFee ? { ...fee, ...existingFee } : fee;
        });
        setFees(mergedFees);
      } else {
        setFees(snapshot);
      }
    } catch (error) {
      if (error instanceof Error) console.error(error.message);
    } finally {
      loading.onFalse();
    }
  }

  async function loadData(id, isDuplicate = false) {
    loading.onTrue();
    try {
      const snapshot = await duitkuFeeProfileRepository.findDetail(id);
      const snapshotProfileName = isDuplicate ? `${snapshot.name} (Duplicate)` : snapshot.name;
      setProfileName(snapshotProfileName);
      setAreas(snapshot.area);
      loadFees(snapshot.fees);
      setCurrentId(id);
    } catch (error) {
      if (error instanceof Error) console.error(error.message);
    } finally {
      loading.onFalse();
    }
  }

  /**
   *
   * @param {string} id
   * @param {boolean} d as duplicated
   * @returns
   */
  function open(id, d = false) {
    reset();
    show.onTrue();

    duplicated.setValue(d);

    if (id) {
      loadData(id, d);
    } else {
      loadFees();
    }
    return new Promise((resolve) => {
      resolver.current = resolve;
    });
  }

  function close() {
    show.onFalse();
    if (resolver.current) {
      resolver.current();
      resolver.current = null;
    }
  }

  /**
   * Handler Change Fee
   */

  /**
   * @param {number} index
   * @param {Partial<DuitkuFee>} data
   */
  function changeFee(index, data) {
    setFees((current) => {
      const updated = [...current];
      updated[index] = { ...updated[index], ...data };
      return updated;
    });
  }

  function validation() {
    if (profileName.trim() === '') {
      throw new Error('Nama Profile tidak boleh kosong');
    }

    if (areas.length === 0) {
      throw new Error('Area harus dipilih minimal satu');
    }
  }

  async function submit() {
    loadingSubmit.onTrue();
    try {
      validation();
      const areaIds = areas.map((a) => a._id);

      const mapFees = fees.map((f) => ({
        ...f,
        fee: f.fee.toString().toNumber(),
        feePercentage: parseFloat(f.feePercentage.toString()),
      }));

      const body = {
        profileName,
        areaIds,
        fees: mapFees,
      };

      const isUpdate = currentId && !duplicated.value;

      if (isUpdate) {
        await duitkuFeeProfileRepository.update(currentId, body);
      } else {
        await duitkuFeeProfileRepository.create(body);
      }
      toast.success('Berhasil menyimpan Profile Biaya');
      close();
    } catch (e) {
      if (e instanceof Error) toast.error(e.message);
    } finally {
      loadingSubmit.onFalse();
    }
  }

  return {
    profileName,
    setProfileName,
    areas,
    setAreas,
    fees,
    loading,
    show,
    areaPickerRef,
    mobile,
    tab,
    loadingSubmit,
    setTab,
    tabList,
    addArea,
    removeArea,
    open,
    close,
    changeFee,
    submit,
  };
}
