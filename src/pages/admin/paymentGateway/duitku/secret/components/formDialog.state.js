import { toast } from 'sonner';
import { useRef, useState } from 'react';
import { useBoolean } from '@hooks/use-boolean';

import { useTheme, useMediaQuery } from '@mui/material';

import { duitkuSecretRepository } from 'src/repositories';
/**
 * @typedef {import('src/repositories/duitkuSecret').DuitkuSecret} DuitkuSecret
 */
/**
 * @type {Object} AreaData
 * @property {string} _id
 * @property {string} title
 */

export function useDuitkuSecretFormDialogState() {
  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down('sm'));

  /** @type {[DuitkuSecret, Function]} */
  const [currentSecret, setCurrentSecret] = useState(null);
  const loadingFetch = useBoolean(false);

  const loading = useBoolean(false);
  const show = useBoolean(false);
  const [secretName, setSecretName] = useState('');
  const [merchantCode, setMerchantCode] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const areaPickerRef = useRef();

  const resolver = useRef();

  /** @type {[AreaData[], Function]} */
  const [area, setArea] = useState([]);

  function validation() {
    if (secretName.trim() === '') {
      throw new Error('Secret Name harus diisi');
    }

    if (merchantCode.trim() === '') {
      throw new Error('Merchant Code harus diisi');
    }

    if (secretKey.trim() === '') {
      throw new Error('API Key harus diisi');
    }

    if (area.length === 0) {
      throw new Error('Minimal harus memilih satu Area');
    }
  }

  function reset() {
    setCurrentSecret(null);
    setSecretName('');
    setMerchantCode('');
    setSecretKey('');
    setArea([]);
  }

  function removeArea(index) {
    setArea((current) => current.filter((_, i) => i !== index));
  }

  async function load(_id) {
    loadingFetch.onTrue();
    try {
      const snapshot = await duitkuSecretRepository.detail(_id);
      setCurrentSecret(snapshot);
      setSecretName(snapshot.secretName);
      setMerchantCode(snapshot.merchantCode);
      setSecretKey(snapshot.merchantKey);
      setArea(snapshot.areas);
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
    } finally {
      loadingFetch.onFalse();
    }
  }

  function open(id) {
    reset();
    show.onTrue();
    if (id) load(id);
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

  async function addArea() {
    const result = await areaPickerRef.current?.open(null, false);
    if (!result) return;
    setArea((current) => {
      const exists = current.find((a) => a._id === result._id);
      if (exists) return current;
      return [...current, result];
    });
  }

  async function submit() {
    loading.onTrue();
    try {
      validation();
      const areaIds = area.map((a) => a._id);
      const req = {
        secretName,
        merchantCode,
        merchantKey: secretKey,
        areaIds,
      };

      if (currentSecret) {
        await duitkuSecretRepository.update(currentSecret._id, req);
      } else {
        await duitkuSecretRepository.create(req);
      }
      toast.success('Berhasil menyimpan');
      close();
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
    } finally {
      loading.onFalse();
    }
  }

  return {
    mobile,
    loading,
    show,
    secretName,
    setSecretName,
    merchantCode,
    setMerchantCode,
    secretKey,
    setSecretKey,
    areaPickerRef,
    area,
    setArea,
    removeArea,
    open,
    addArea,
    reset,
    resolver,
    close,
    submit,
  };
}
