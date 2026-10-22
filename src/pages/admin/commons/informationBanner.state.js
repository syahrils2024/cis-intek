/**
 * @typedef {import("src/repositories/bannerInformation").BannerInformation} BannerInformation
 */

import { toast } from 'sonner';
import { useRef, useState } from 'react';
import { useBoolean } from '@hooks/use-boolean';
import { useConfirm } from 'material-ui-confirm';

import { bannerInformationRepository } from 'src/repositories';

export function useInformationBannerState() {
  /** @type {[BannerInformation[], Function]} */
  const [data, setData] = useState([]);
  const loading = useBoolean(false);
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [findArea, setFindArea] = useState({ id: '', name: 'Semua' });
  const confirm = useConfirm();

  /** Ref */
  const formRef = useRef();

  async function load() {
    loading.onTrue();
    try {
      const snapshot = await bannerInformationRepository.findAll({
        search,
        area: findArea.id,
        limit,
        page,
      });

      setData(snapshot.data);
      setTotal(snapshot.total);
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
    } finally {
      loading.onFalse();
    }
  }

  /** @param {BannerInformation} */
  async function remove(item) {
    try {
      await confirm({
        title: 'Hapus',
        content: `Apakah anda ingin menghapus ${item.title}`,
        confirmationText: 'Hapus',
        cancellationText: 'Batal',
        confirmationButtonProps: { color: 'error', variant: 'contained' },
      });

      const promises = bannerInformationRepository.remove(item._id);
      toast.promise(promises, {
        loading: 'Menghapus...',
        success: () => {
          load();
          return 'Berhasil menghapus';
        },
        error: (err) => err.message || 'Gagal menghapus',
      });
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
    }
  }

  return {
    data,
    loading,
    limit,
    setLimit,
    page,
    setPage,
    total,
    search,
    setSearch,
    findArea,
    setFindArea,
    formRef,
    load,
    remove,
  };
}
