import { toast } from 'sonner';
import { useRef, useEffect } from 'react';
import { useBoolean } from '@hooks/use-boolean';
import { useConfirm } from 'material-ui-confirm';
import Overloading from '@components/overloading';
import AddonsCategoryTable from '@components/addons/categoryTable';
import AddonsCategoryMobile from '@components/addons/categoryMobile';
import AddonsCategoryFormDialog from '@components/addons/categoryFormDialog';

import { Button, useTheme, useMediaQuery } from '@mui/material';

import { addonsRepository } from 'src/repositories';
import { useAddonsCategory } from 'src/stores/addonsCategory';

/**
 * @typedef {import("src/stores/addonsCategory").AddonsCategoryStore} AddonsCategoryStore
 * @typedef {import("src/repositories/addons").AddonsCategory} AddonsCategory
 */

export default function AddonsCategory() {
  const isLoading = useBoolean(false);
  /** @type {AddonsCategoryStore} */
  const { data, setData } = useAddonsCategory();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const confirm = useConfirm();

  const categoryFormDialogRef = useRef();

  async function prefetch() {
    isLoading.onTrue();
    try {
      const snapshot = await addonsRepository.getAddonsCategoryList();
      setData(snapshot);
    } catch (error) {
      toast.error(error.message);
    } finally {
      isLoading.onFalse();
    }
  }

  async function openForm(d) {
    await categoryFormDialogRef.current.open(d);
    prefetch();
  }

  /**
   *
   * @param {AddonsCategory} d
   */
  async function remove(d) {
    try {
      await confirm({
        title: 'Konfirmasi',
        description: `Apakah anda ingin menghapus kategori addons ${d.category} ?`,
        cancellationText: 'Batal',
        cancellationButtonProps: { variant: 'text', color: 'error' },
        confirmationText: 'Hapus',
        confirmationButtonProps: { variant: 'contained', color: 'primary' },
      });
      isLoading.onTrue();
      await addonsRepository.removeAddonsCategory(d._id);
      prefetch();
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
    } finally {
      isLoading.onFalse();
    }
  }

  useEffect(() => {
    if (data.length <= 0) prefetch();
  }, []);

  return (
    <>
      <div className="tw-flex tw-flex-col tw-px-5 tw-w-full tw-mx-auto tw-items-center tw-justify-center">
        {/* Header Page */}
        <div className="tw-flex tw-flex-col lg:tw-flex-row tw-w-full tw-items-center tw-justify-between tw-gap-2 tw-mb-10">
          <div className="tw-flex tw-flex-row tw-w-full tw-items-center tw-justify-end tw-gap-2">
            <Button variant="contained" color="primary" onClick={() => openForm()}>
              + {isMobile ? '' : 'Kategori'}
            </Button>
          </div>
        </div>
        {/* Content */}
        <div className="tw-relative tw-flex tw-flex-col tw-w-full">
          <Overloading loading={isLoading.value} />
          {isMobile ? (
            <AddonsCategoryMobile
              data={data}
              onEdit={(d) => openForm(d)}
              onRemove={(d) => remove(d)}
            />
          ) : (
            <AddonsCategoryTable
              data={data}
              onEdit={(d) => openForm(d)}
              onRemove={(d) => remove(d)}
            />
          )}
        </div>
      </div>
      <AddonsCategoryFormDialog ref={categoryFormDialogRef} />
    </>
  );
}
