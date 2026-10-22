import { toast } from 'sonner';
import { connect } from 'react-redux';
import { useState, useEffect } from 'react';
import { Iconify } from '@components/iconify';
import { useBoolean } from '@hooks/use-boolean';
import { useConfirm } from 'material-ui-confirm';
import DuoDateChargeTable from '@components/duoDate/table';
import DuoDateChargeForm from '@components/duoDate/formDialog';
import DuoDateChargeMobileCard from '@components/duoDate/mobileCard';

import Grid from '@mui/material/Unstable_Grid2';
import { Menu, Button, useTheme, MenuItem, Typography, useMediaQuery } from '@mui/material';

import { setData } from 'src/stores/duoDateChargeStore';
import { duoDateChargeRepository } from 'src/repositories';

/**
 * @typedef {import('src/stores/duoDateChargeStore').DuoDateCharge} DuoDateCharge
 */

/**
 * @param {{data: DuoDateCharge[], setDuoDateData: (data) => void}} param0
 * @returns
 */
function DuoDateChargePage({ data, setDuoDateData }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const showForm = useBoolean(false);
  const loading = useBoolean(false);
  const confirm = useConfirm();

  /** @type {[DuoDateCharge, void]} */
  const [selectedData, setSelectedData] = useState(null);

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  /**
   * @param {Event} event
   * @param {DuoDateCharge} item
   */
  const handleClick = (event, item) => {
    setAnchorEl(event.currentTarget);
    setSelectedData(item);
  };
  const handleClose = () => {
    setAnchorEl(null);
    setSelectedData(null);
  };

  const prefetch = async () => {
    loading.onTrue();
    try {
      const snapshot = await duoDateChargeRepository.findAll();
      setDuoDateData(snapshot);
    } catch (error) {
      toast.error(error.message);
    } finally {
      loading.onFalse();
    }
  };

  useEffect(() => {
    if (data.length >= 1) return;
    prefetch();
  }, []);

  const onRemove = async () => {
    try {
      await confirm({
        title: 'Hapus Template Denda',
        content: `apakah anda ingin menghapus ${selectedData.name}?`,
        confirmationText: 'Hapus',
        confirmationButtonProps: { color: 'error', variant: 'contained' },
        cancellationText: 'Batal',
      });

      await duoDateChargeRepository.remove(selectedData._id);
      handleClose();
      prefetch();
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
    }
  };

  /**
   * @param {boolean} isPrefetch
   */
  const closeForm = (isPrefetch) => {
    if (isPrefetch) prefetch();
    showForm.onFalse();
    handleClose();
  };

  return (
    <>
      <Grid container className="tw-p-5">
        <Grid xs={10} md={11}>
          <Typography variant="h5">Daftar Template Denda</Typography>
        </Grid>
        <Grid xs={2} md={1}>
          <Button onClick={() => showForm.onTrue()} fullWidth color="primary" variant="contained">
            <Iconify icon="mdi:plus" />
            {!isMobile && 'Denda'}
          </Button>
        </Grid>
        <Grid xs={12}>
          {isMobile ? (
            <DuoDateChargeMobileCard data={data} onMenu={handleClick} />
          ) : (
            <DuoDateChargeTable data={data} onMenu={handleClick} />
          )}
        </Grid>
      </Grid>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
      >
        <MenuItem onClick={() => showForm.onTrue()}>Edit</MenuItem>
        <MenuItem onClick={() => onRemove()}>Hapus</MenuItem>
      </Menu>
      <DuoDateChargeForm show={showForm.value} onClose={closeForm} selectedData={selectedData} />
    </>
  );
}

const mapsStateToProps = (state) => state.duoDateChargeStore;
const mapDispatchToProps = (dispatch) => ({
  setDuoDateData: (duoDateData) => dispatch(setData(duoDateData)),
});
export default connect(mapsStateToProps, mapDispatchToProps)(DuoDateChargePage);
