import { toast } from 'sonner';
import { useRef, useEffect } from 'react';
import { useBoolean } from '@hooks/use-boolean';
import { useConfirm } from 'material-ui-confirm';
import Overloading from '@components/overloading';
import AddonsTable from '@components/addons/Table';
import AddonsMobile from '@components/addons/Mobile';
import AddonsPackageFormDialog from '@components/addons/packageFormDialog';

import { Button, useTheme, useMediaQuery } from '@mui/material';

import { useAddonsStore } from 'src/stores/addons';
import { addonsRepository } from 'src/repositories';

/**
 * @typedef {import('src/stores/addons').AddonsStore} AddonsStore
 * @typedef {import('src/repositories/addons').Addons} Addons
 */

export default function AddonsPackage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const formDialogRef = useRef();
  const isLoading = useBoolean(false);
  const confirm = useConfirm();

  /** @type {AddonsStore} */
  const { data, page, limit, search, setAddonsStore } = useAddonsStore();

  async function prefetch() {
    isLoading.onTrue();
    try {
      const snapshot = await addonsRepository.getAddons({ page, limit, search });
      setAddonsStore({ data: snapshot });
    } catch (error) {
      toast.error(error.message);
    } finally {
      isLoading.onFalse();
    }
  }

  async function openForm() {
    await formDialogRef.current.open();
    prefetch();
  }

  /**
   * @param {Addons} addons
   */
  async function remove(addons) {
    try {
      await confirm({
        title: 'Hapus Addons',
        description: `Apakah anda ingin menghapus addons ${addons.variantName} ?`,
        confirmationText: 'Hapus',
        cancellationText: 'Batal',
        confirmationButtonProps: { color: 'primary', size: 'small', variant: 'contained' },
        cancellationButtonProps: { color: 'error', size: 'small' },
      });
      await addonsRepository.removeAddons(addons._id);
      prefetch();
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
    }
  }

  /**
   * @param {Addons} addons
   */
  async function edit(addons) {
    await formDialogRef.current.open(addons._id);
    prefetch();
  }

    /**
   * @param {Addons} addons
   */
  async function duplicate(addons) {
    await formDialogRef.current.open(addons._id, true);
    prefetch();
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
              + {isMobile ? '' : 'Addons'}
            </Button>
          </div>
        </div>
        <div className="tw-flex tw-flex-col tw-relative tw-gap-3 tw-w-full">
          <Overloading loading={isLoading.value} />
          {isMobile ? (
            <AddonsMobile data={data} onRemove={(a) => remove(a)} onEdit={(a) => edit(a)} onDuplicate={(a) => duplicate(a)} />
          ) : (
            <AddonsTable data={data} onRemove={(a) => remove(a)} onEdit={(a) => edit(a)} onDuplicate={(a) => duplicate(a)} />
          )}
        </div>
      </div>
      <AddonsPackageFormDialog ref={formDialogRef} />
    </>
  );
}
