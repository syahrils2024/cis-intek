/**
 * @typedef {import("src/stores/odpStore").OdpStore} OdpStore
 * @typedef {import('src/stores/odpStore').FilteredOdpsSelector} FilteredOdpsSelector
 * @typedef {import('../AreaPicker').AreaConfigurationStore} AreaConfigurationStore
 * @typedef {import('src/repositories/area').Odp} Odp
 */
import { toast } from 'sonner';
import { useRef, useState } from 'react';
import { changeSorter } from '@utils/sort';
import { useBoolean } from '@hooks/use-boolean';
import { useConfirm } from 'material-ui-confirm';
import { useDispatch, useSelector } from 'react-redux';

import { useTheme , useMediaQuery } from '@mui/material';

import { setOdpStore, filteredOdps } from 'src/stores/odpStore';
import { areaRepository, broadcastTemplateRepository } from 'src/repositories';

/**
 * @typedef {Object} OdpListState
 * @property {Odp[]} items
 * @property {number} totalItems
 * @property {Odp|null} selectedOdp
 * @property {string} action
 * @property {boolean} open
 * @property {HTMLElement|null} anchorEl
 * @property {object} showOdpForm
 * @property {object} showCustomerDialog
 * @property {object} showBroadcastForm
 * @property {boolean} isMobile
 */

/**
 * @typedef {Object} OdpListHandlers
 * @property {(e: Event, n: number) => void} setPage
 * @property {(e: Event) => void} setLimit
 * @property {(key: string) => void} sort
 * @property {(item: Odp) => void} showCustomer
 * @property {(item: Odp) => void} onEditOdp
 * @property {(item: Odp) => Promise<void>} onRemoveOdp
 * @property {(data: object) => Promise<void>} onSubmitODP
 * @property {(e: Event, item: Odp) => void} openMenu
 * @property {() => void} closeMenu
 * @property {() => void} closeOdpForm
 * @property {() => void} closeCustomerDialog
 * @property {() => void} closeBroadcastForm
 * @property {(data: object) => Promise<void>} onBroadcast
 * @property {(data: {id: string; name: string}) => void} showBroadcastDialog
 * @property {() => Promise<void>} reload
 */

/**
 * @typedef {Object} OdpListRefs
 * @property {React.RefObject} broadcastFormRef
 */

/**
 * Custom hook for the ODP list state and logic.
 * @param {Object} props
 * @param {number} props.currentPage
 * @param {number} props.limit
 * @param {string} props.orderBy
 * @param {'asc'|'desc'} props.order
 * @param {boolean} props.readOnly
 * @returns {{ state: OdpListState, handlers: OdpListHandlers, refs: OdpListRefs }}
 */
export function useOdpListState({ currentPage, limit, orderBy, order, readOnly }) {
  const dispatch = useDispatch();
  const confirm = useConfirm();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  /** @type {FilteredOdpsSelector} */
  const { items, totalItems } = useSelector((state) => filteredOdps(state.odpStore));

  /** @type {AreaConfigurationStore} */
  const { currentArea } = useSelector((state) => state.areaConfigurationStore);

  /** @type {[Odp, void]} */
  const [selectedOdp, setSelectedOdp] = useState(null);

  /** @type {[string, void]} */
  const [action, setAction] = useState('');
  const showOdpForm = useBoolean(false);
  const showCustomerDialog = useBoolean(false);
  const showBroadcastForm = useBoolean(false);
  const broadcastFormRef = useRef(null);

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const setPage = (e, n) => {
    dispatch(setOdpStore({ key: 'currentPage', value: n }));
  };

  const setLimit = (e) => {
    dispatch(setOdpStore({ key: 'limit', value: e.target.value }));
    dispatch(setOdpStore({ key: 'currentPage', value: 0 }));
  };

  const openMenu = (event, item) => {
    setAnchorEl(event.currentTarget);
    setSelectedOdp(item);
  };

  const closeMenu = () => {
    setAnchorEl(null);
    setSelectedOdp(null);
  };

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

  const onEditOdp = (item) => {
    setSelectedOdp(item);
    setAction('edit');
    showOdpForm.onTrue();
  };

  const onRemoveOdp = async (item) => {
    try {
      await confirm({
        title: 'Hapus',
        content: `Apakah anda ingin menghapus ${item.name}`,
        confirmationText: 'Hapus',
        cancellationText: 'Batal',
        confirmationButtonProps: { color: 'error', variant: 'contained' },
      });

      closeMenu();
      await areaRepository.removeODP(item.id ?? item._id);
      toast.success('Berhasil menghapus');
      reload();
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
    }
  };

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

  function sort(key) {
    const sortBy = changeSorter(order);
    if (key !== orderBy) {
      dispatch(setOdpStore({ key: 'orderBy', value: key }));
    }
    dispatch(setOdpStore({ key: 'order', value: sortBy }));
  }

  const onBroadcast = async (data) => {
    try {
      showBroadcastForm.onFalse();
      data.odp = selectedOdp._id;
      await confirm({
        title: 'Konfirmasi',
        content: 'Apakah anda ingin melanjutkan broadcast pesan',
        confirmationText: 'Ya',
        cancellationText: 'Tidak',
      });

      await broadcastTemplateRepository.broadcastMessage(data);
      toast.info('Sukses melakukan broadcast');
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
    } finally {
      closeMenu();
    }
  };

  const showBroadcastDialog = ({ id, name }) => {
    broadcastFormRef.current?.open({ id, name });
  };

  const closeOdpForm = () => showOdpForm.onFalse();

  const closeCustomerDialog = () => {
    showCustomerDialog.onFalse();
    dispatch(setOdpStore({ key: 'selectedOdp', value: null }));
  };

  const closeBroadcastForm = () => {
    showBroadcastForm.onFalse();
    closeMenu();
  };

  return {
    state: {
      items,
      totalItems,
      selectedOdp,
      action,
      open,
      anchorEl,
      showOdpForm,
      showCustomerDialog,
      showBroadcastForm,
      isMobile,
    },
    handlers: {
      setPage,
      setLimit,
      sort,
      showCustomer,
      onEditOdp,
      onRemoveOdp,
      onSubmitODP,
      openMenu,
      closeMenu,
      closeOdpForm,
      closeCustomerDialog,
      closeBroadcastForm,
      onBroadcast,
      showBroadcastDialog,
      reload,
    },
    refs: {
      broadcastFormRef,
    },
  };
}
