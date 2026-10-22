/**
 * @typedef {import("@/stores/broadcastStore").BroadcastStore} BroadcastStore
 * @typedef {import("@/repositories/broadcastTemplate").BroadcastTemplate} BroadcastTemplate
 * @typedef {import('@components/broadcast/formDialog').BroadcastFormCallback} BroadcastFormCallback
 */

import { toast } from 'sonner';
import { Icon } from '@iconify/react';
import { useState, useEffect } from 'react';
import { Iconify } from '@components/iconify';
import { useBoolean } from '@hooks/use-boolean';
import { useConfirm } from 'material-ui-confirm';
import Overloading from '@components/overloading';
import { usePrivilege } from '@auth/hooks/privileges';
import { useDispatch, useSelector } from 'react-redux';
import BroadcastFormDialog from '@components/broadcast/formDialog';

import Grid from '@mui/material/Unstable_Grid2';
import { Menu, Button, useTheme, MenuItem, Typography, useMediaQuery } from '@mui/material';

import { setData } from 'src/stores/broadcastStore';
import { broadcastTemplateRepository } from 'src/repositories';

import { BroadcastData } from './data.component';

export default function Broadcast() {
  const dispatch = useDispatch();
  const theme = useTheme();
  const loading = useBoolean(false);
  const confirm = useConfirm();
  const { isAdmin } = usePrivilege();

  /**
   * @type {BroadcastStore}
   */
  const broadcast = useSelector((state) => state.broadcastStore);

  // const [paginationModel] = useState({ page: 0, pageSize: 15 });
  const [anchorEl, setAnchorEl] = useState(null);
  const [showForm, setShowForm] = useState(false);
  /** @type {[BroadcastTemplate, void]} */
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const openMenu = Boolean(anchorEl);

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setSelectedTemplate(null);
  };

  const prefetch = async () => {
    loading.onTrue();
    try {
      const snapshot = await broadcastTemplateRepository.getBroadcastTemplate();
      dispatch(setData(snapshot));
    } catch (error) {
      toast.error(error.message);
    } finally {
      loading.onFalse();
    }
  };

  /**
   * @type {BroadcastFormCallback}
   */
  const onSubmitForm = async (data) => {
    setShowForm(false);
    if (selectedTemplate) {
      Object.assign(data, {
        _id: selectedTemplate._id,
      });
    }
    const promiseSubmit = broadcastTemplateRepository.insertBroadcastTemplate(data);
    toast.promise(promiseSubmit, {
      loading: 'Menyimpan template...',
      success: () => {
        prefetch();
        return 'Berhasil';
      },
      error: (error) => {
        if (error instanceof Error) {
          return error.message ?? '-';
        }
        return 'Gagal menyimpan template';
      },
    });
  };

  /**
   * @param {boolean | undefined} isPrefetch
   */
  const handlerClose = (isPrefetch) => {
    // if (isPrefetch) prefetch();
    setShowForm(false);
    handleCloseMenu();
    setSelectedTemplate(null);
  };

  /**
   *
   * @param {BroadcastTemplate} item
   */
  const handlerDelete = async (item) => {
    try {
      const result = await confirm({
        title: (
          <span className="tw-text-red-400">
            Hapus template <Iconify icon="mdi:warning" />
          </span>
        ),
        content: `apakah anda ingin menghapus template ${item.title} ?`,
        confirmationText: 'Hapus',
        confirmationButtonProps: { color: 'error' },
      });

      const promiseRemove = broadcastTemplateRepository.removeTemplate(item._id);
      toast.promise(promiseRemove, {
        loading: 'Menghapus template...',
        success: () => {
          prefetch();
          return 'Berhasil terhapus';
        },
        error: (error) => {
          if (error instanceof Error) {
            return error.message ?? '-';
          }
          return 'Gagal menghapus template';
        },
      });
      // await broadcastTemplateRepository.removeTemplate(item._id);
      // const snapshot = await broadcastTemplateRepository.getBroadcastTemplate();
      // dispatch(setData(snapshot));
    } catch (err) {
      if (err instanceof Error) toast.error(err.message);
    }
  };

  /**
   *
   * @param {BroadcastTemplate} item
   */
  const handlerEdit = async (item) => {
    setSelectedTemplate(item);
    setShowForm(true);
  };

  useEffect(() => {
    if (broadcast.data.length >= 1) return;
    prefetch();
  }, []);

  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  return (
    <>
      <Grid container spacing={2} className="tw-p-3 tw-px-5">
        <Grid columns={12} className="tw-w-full">
          <div className="tw-flex tw-flex-row tw-w-full tw-items-center tw-justify-between">
            <Typography variant="h5">Broadcast Template</Typography>
            {isAdmin && (
              <Button color="primary" variant="contained" onClick={() => setShowForm(true)}>
                <Icon icon="ic:baseline-add" fontSize={24} />{' '}
                {!isMobile && <span className="tw-ml-2">Tambah Template</span>}
              </Button>
            )}
          </div>
        </Grid>
        {/* Mobile Layout */}
        <Grid
          columns={12}
          spacing={2}
          className="tw-w-full tw-flex tw-flex-col tw-gap-2 tw-relative"
        >
          <Overloading loading={loading.value} />
          {isMobile ? (
            <BroadcastData.Mobile
              data={broadcast.data}
              onRemove={(item) => handlerDelete(item)}
              onEdit={(item) => handlerEdit(item)}
            />
          ) : (
            <BroadcastData.Table
              data={broadcast.data}
              onRemove={(item) => handlerDelete(item)}
              onEdit={(item) => handlerEdit(item)}
            />
          )}
        </Grid>
      </Grid>
      {/* Menu */}
      <Menu
        anchorEl={anchorEl}
        open={openMenu}
        onClose={handleCloseMenu}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
      >
        <MenuItem onClick={handlerDelete} color="red">
          Hapus
        </MenuItem>
        <MenuItem onClick={() => setShowForm(true)} color="primary">
          Edit
        </MenuItem>
      </Menu>
      {/* End Menu */}
      <BroadcastFormDialog
        show={showForm}
        onClose={handlerClose}
        onSubmit={(data) => onSubmitForm(data)}
        selectedItem={selectedTemplate}
      />
    </>
  );
}
