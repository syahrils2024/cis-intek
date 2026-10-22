import { toast } from 'sonner';
import { useState } from 'react';
import { useBoolean } from '@hooks/use-boolean';
import { useConfirm } from 'material-ui-confirm';

import { faqRepository } from 'src/repositories';

/**
 * @typedef {import("src/repositories/faq").Faq} Faq
 */

export function useFaqState() {
  /** @type {[Faq[], Function]} */
  const [data, setData] = useState([]);
  const confirm = useConfirm();

  const loading = useBoolean(false);

  async function prefetch() {
    loading.onTrue();
    try {
      const response = await faqRepository.findAll();
      setData(response);
    } catch (error) {
      console.error('Failed to fetch FAQs:', error);
    } finally {
      loading.onFalse();
    }
  }

  function upsert(faq) {
    setData((prevData) => {
      const index = prevData.findIndex((item) => item._id === faq._id);
      if (index !== -1) {
        // Update existing FAQ
        const newData = [...prevData];
        newData[index] = faq;
        return newData;
      }
      // Add new FAQ
      return [...prevData, faq];
    });
  }

  function remove(id) {
    setData((prevData) => prevData.filter((item) => item._id !== id));
  }

  /**
   * @param {Faq} item
   */
  async function deleteFaq(item) {
    try {
      await confirm({
        title: 'Hapus FAQ',
        description: `Apakah Anda yakin ingin menghapus FAQ ${item.question} ?`,
        confirmationText: 'Hapus',
        confirmationButtonProps: { color: 'error' },
        cancellationText: 'Batal',
      });

      const promises = faqRepository.remove(item._id);
      toast.promise(promises, {
        loading: 'Menghapus...',
        success: () => {
          prefetch();
          return 'FAQ berhasil dihapus';
        },
        error: (error) => 'Gagal menghapus FAQ',
      });
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
    }
  }

  return {
    data,
    setData,
    loading,
    prefetch,
    upsert,
    remove,
    deleteFaq,
  };
}
