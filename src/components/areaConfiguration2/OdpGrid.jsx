/**
 * @typedef {import("src/stores/odpStore").OdpStore} OdpStore
 * @typedef {import('src/stores/odpStore').FilteredOdpsSelector} FilteredOdpsSelector
 * @typedef {import('./AreaPicker').AreaConfigurationStore} AreaConfigurationStore
 */

import { toast } from 'sonner';
import { useState } from 'react';
import { Iconify } from '@components/iconify';
import { useBoolean } from '@hooks/use-boolean';
import { useConfirm } from 'material-ui-confirm';
import { connect, useDispatch, useSelector } from 'react-redux';
import DeviceFormDialog from '@components/areaConfiguration/DeviceFormDialog';

import { Menu, Divider, MenuItem, IconButton, TablePagination } from '@mui/material';

import { areaRepository } from 'src/repositories';
import { setOdpStore, filteredOdps } from 'src/stores/odpStore';

import AreaConfigurationV2CustomerDialog from './CustomerDialog';

/**
 * @param {OdpStore} props
 */
function AreaConfigurationOdpGrid({ currentPage, limit, readOnly = false }) {
  const dispatch = useDispatch();
  const confirm = useConfirm();

  /** @type {[Odp, void]} */
  const [selectedOdp, setSelectedOdp] = useState(null);

  /** @type {FilteredOdpsSelector} */
  const { items, totalItems } = useSelector((state) => filteredOdps(state.odpStore));

  /** @type {AreaConfigurationStore} */
  const { currentArea } = useSelector((state) => state.areaConfigurationStore);

  /** @type {[string, void]} */
  const [action, setAction] = useState('');
  const showOdpForm = useBoolean(false);

  const showCustomerDialog = useBoolean(false);

  /**
   * @param {Event} e
   * @param {number} n
   */
  const handlerSetPage = (e, n) => {
    dispatch(setOdpStore({ key: 'currentPage', value: n }));
  };

  /**
   * @param {Event} e
   */
  const handlerSetLimit = (e) => {
    dispatch(setOdpStore({ key: 'limit', value: e.target.value }));
    dispatch(setOdpStore({ key: 'currentPage', value: 0 }));
  };

  const [anchorEl, setAnchorEl] = useState(null);

  const open = Boolean(anchorEl);
  const handleClick = (event, item) => {
    setAnchorEl(event.currentTarget);
    setSelectedOdp(item);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setSelectedOdp(null);
  };

  /**
   * @param {Odp} item
   */
  const showCustomer = (item) => {
    setSelectedOdp(item);
    dispatch(setOdpStore({ key: 'selectedOdp', value: item }));
    showCustomerDialog.onTrue();
  };

  const reload = async () => {
    try {
      let snapshotOdp2 = [];
      const parentId = currentArea?._id ?? currentArea.id;
      if (parentId) {
        snapshotOdp2 = await areaRepository.getOdpListLevel2(
          parentId,
          currentArea._id ?? currentArea.id
        );
      }
      const snapshotOther = await areaRepository.getOdpList(currentArea._id ?? currentArea.id);

      const odp = [...snapshotOther, ...snapshotOdp2].filter((o) =>
        o.name.toLowerCase().includes('odp')
      );

      dispatch(setOdpStore({ key: 'odps', value: odp }));
    } catch (error) {
      toast.error(error.message);
    }
  };

  /**
   * @param {Odp} item
   */
  const onEditOdp = (item) => {
    setSelectedOdp(item);
    showOdpForm.onTrue();
    setAction('edit');
  };

  /**
   * @param {Odp} item
   */
  const onRemoveOdp = async (item) => {
    try {
      await confirm({
        title: 'Hapus',
        content: `Apakah anda ingin menghapus ${item.name}`,
        confirmationText: 'Hapus',
        cancellationText: 'Batal',
        confirmationButtonProps: { color: 'error', variant: 'contained' },
      });

      handleClose();
      await areaRepository.removeODP(item.id ?? item._id);
      toast.success('Berhasil menghapus');
      reload();
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
    }
  };

  /**
   * @param {SubmitODP} data
   */
  const onSubmitODP = async (data) => {
    try {
      const areaId = currentArea?._id ?? currentArea.id;
      showOdpForm.onFalse();
      data.id = action === 'edit' ? selectedOdp.id ?? selectedOdp._id : undefined;
      if (selectedOdp.type?.includes('area')) {
        data.parentArea =
          action === 'edit'
            ? selectedOdp.parentArea
            : action === 'add-sub'
              ? selectedOdp.id ?? selectedOdp._id
              : undefined;
      } else {
        data.parentArea = action === 'edit' ? areaId : action === 'add-sub' ? areaId : undefined;

        data.parentODP =
          action === 'edit'
            ? selectedOdp.parentODP
            : action === 'add-sub'
              ? selectedOdp.id ?? selectedOdp._id
              : undefined;
      }

      await areaRepository.submitODP(data);
      toast.info('Berhasil menyimpan');
      reload();
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
  };

  return (
    <div className="tw-flex tw-flex-col">
      <div className="tw-w-full tw-gap-4 tw-grid tw-grid-cols-1 md:tw-grid-cols-3">
        {items.map((o, i) => (
          <div
            key={i}
            className="tw-flex tw-flex-col tw-p-3 tw-h-min tw-ring-1 tw-ring-gray-200 hover:tw-ring-primary tw-rounded-lg tw-w-full tw-duration-300 tw-group"
          >
            <div className="tw-flex tw-flex-row tw-items-center tw-justify-between tw-gap-2">
              <div className="tw-flex tw-flex-row tw-items-center tw-gap-1.5">
                <Iconify icon="la:dot-circle" style={{ color: '#01A3EA' }} />
                <span className="tw-text-xs tw-font-medium group-hover:tw-text-primary tw-text-gray-500">
                  {o?.title ?? o?.name ?? '-'}
                </span>
              </div>
              <IconButton onClick={(e) => handleClick(e, o)}>
                <Iconify icon="mdi:menu-down" />
              </IconButton>
            </div>
            <div className="tw-h-min tw-max-h-0 group-hover:tw-max-h-96 tw-overflow-hidden tw-duration-500">
              <Divider />
              <p className="tw-text-xs tw-text-gray-500 tw-mt-2">{o.port ?? 0} PORT</p>
              <p className="tw-text-xs tw-text-gray-500 tw-mt-2">{o.description}</p>
            </div>
          </div>
        ))}
      </div>
      <TablePagination
        component="div"
        count={totalItems}
        page={currentPage}
        onPageChange={handlerSetPage}
        rowsPerPage={limit}
        onRowsPerPageChange={handlerSetLimit}
      />
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
      >
        <MenuItem>
          <IconButton onClick={(e) => showCustomer(selectedOdp)}>
            <Iconify icon="mdi:account-outline" />
          </IconButton>
        </MenuItem>
        {!readOnly && (
          <>
            <MenuItem>
              <IconButton onClick={() => onEditOdp(selectedOdp)}>
                <Iconify icon="mdi:pencil-outline" />
              </IconButton>
            </MenuItem>
            <MenuItem>
              <IconButton onClick={() => onRemoveOdp(selectedOdp)}>
                <Iconify icon="mdi:delete-forever-outline" />
              </IconButton>
            </MenuItem>
          </>
        )}
      </Menu>
      <DeviceFormDialog
        show={showOdpForm.value}
        onClose={() => showOdpForm.onFalse()}
        selectedItem={action === 'edit' ? selectedOdp : undefined}
        onSubmit={onSubmitODP}
      />
      <AreaConfigurationV2CustomerDialog
        show={showCustomerDialog.value}
        onClose={() => {
          showCustomerDialog.onFalse();
          dispatch(setOdpStore({ key: 'selectedOdp', value: null }));
        }}
      />
    </div>
  );
}

const mapStateToProps = (state) => state.odpStore;

export default connect(mapStateToProps)(AreaConfigurationOdpGrid);
