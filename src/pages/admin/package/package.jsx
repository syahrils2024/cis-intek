import { toast } from 'sonner';
import { Icon } from '@iconify/react';
import { useSelector } from 'react-redux';
import { useConfirm } from 'material-ui-confirm';
import { useRef, useState, useEffect } from 'react';
import { usePrivilege } from '@auth/hooks/privileges';

import Grid from '@mui/material/Unstable_Grid2';
import { Stack, Button, useTheme, TextField, Typography, useMediaQuery } from '@mui/material';

import { DashboardContent } from 'src/layouts/dashboard';
import { packagePlanRepository } from 'src/repositories';

// import { DonutChart } from 'src/components/chart/donut-chart';
import PackageFormDialog from 'src/components/package/formDialog';

import { usePackageState } from './package.state';
import { PackageData } from './components/packageData';
import PackageFormDialogV2 from './components/packageFormDialog';

/**
 * @typedef {import('src/stores/packageStore').PackageStoreReducer} PackageStoreReducer
 * @typedef {import('@/repositories/package').ResultPackageList} ResultPackageList
 */

export default function Package() {
  const confirm = useConfirm();
  const [showForm, setShowForm] = useState(false);
  /** @type {[ResultPackageList, void]} */
  const [selectedPackage, setSelectedPackage] = useState(null);
  const theme = useTheme();
  const { isAdmin } = usePrivilege();
  const { loadingFetch, packagePlans, refresh, pickArea, areaTitle, filteredPackagePlans } =
    usePackageState();
  const packageFormRef = useRef();

  /**
   * @type {PackageStoreReducer}
   */
  const packageStore = useSelector((state) => state.packageStore);

  /**
   * @param {boolean | undefined} isPrefetch
   */
  const handlerCloseForm = async (isPrefetch) => {
    setShowForm(false);
    if (isPrefetch) await refresh();
  };

  /** @param {ResultPackageList} item */
  const onEdit = async (item) => {
    const isPrefetch = await packageFormRef.current.open(item._id);
    if (!isPrefetch) return;
    refresh();
  };

  const onDuplicate = async (item) => {
    const isPrefetch = await packageFormRef.current.open(item._id, true);
    if (!isPrefetch) return;
    refresh();
  };

  /** @param {ResultPackageList} item */
  const onDelete = async (item) => {
    try {
      await confirm({
        content: `Apakah anda ingin menghapus paket ${item.title}`,
        confirmationButtonProps: { color: 'error' },
        confirmationText: 'Hapus',
        cancellationText: 'Batal',
      });

      await packagePlanRepository.removeSomePackage(item?._id ?? item?.id);
      toast.success(`Paket ${item.title} berhasil dihapus`);
      await refresh();
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
    }
  };

  async function addPackage() {
    const isPrefetch = await packageFormRef.current.open();
    if (!isPrefetch) return;
    refresh();
  }

  useEffect(() => {
    refresh();
  }, []);

  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  return (
    <DashboardContent maxWidth="xl">
      <Grid container gap={2}>
        <Grid xs={12}>
          <div className="tw-flex tw-flex-col md:tw-flex-row tw-items-center tw-justify-between tw-gap-2 tw-p-3">
            <Typography variant="h5">Service List</Typography>
            <Stack direction="row" spacing={1} className='tw-w-full md:tw-w-auto'>
              <div className="tw-w-full md:tw-max-w-48">
                <TextField
                  label="Area"
                  size="small"
                  value={areaTitle}
                  InputProps={{ readOnly: true }}
                  onClick={() => pickArea()}
                  fullWidth
                />
              </div>

              {isAdmin && (
                <Button
                  variant="contained"
                  color="primary"
                  className="tw-mt-4 tw-whitespace-nowrap"
                  onClick={() => addPackage()}
                >
                  <Icon icon="ic:baseline-add" className="tw-mx-1" /> {!isMobile && 'Add Package'}
                </Button>
              )}
            </Stack>
          </div>
        </Grid>

        <Grid container xs={12} className="tw-w-full">
          <div className="tw-flex tw-flex-col tw-w-full tw-relative tw-gap-2">
            {isMobile ? (
              <PackageData.Mobile
                data={filteredPackagePlans}
                onEdit={(item) => onEdit(item)}
                onDelete={(item) => onDelete(item)}
                onDuplicate={(item) => onDuplicate(item)}
              />
            ) : (
              <PackageData.Table
                data={filteredPackagePlans}
                onEdit={(item) => onEdit(item)}
                onDelete={(item) => onDelete(item)}
                onDuplicate={(item) => onDuplicate(item)}
              />
            )}
          </div>
        </Grid>
      </Grid>
      <PackageFormDialog
        open={showForm}
        onClose={handlerCloseForm}
        selectedItem={selectedPackage}
      />
      <PackageFormDialogV2 ref={packageFormRef} />
    </DashboardContent>
  );
}
