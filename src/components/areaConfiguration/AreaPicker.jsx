/**
 * @typedef {import("@/stores/areaConfiguration").AreaConfigurationStore} AreaConfigurationStore
 * @typedef {import("@/repositories/area").AreaCategory} AreaCategory
 * @typedef {import("@/repositories/area").Area} Area
 * @typedef {import("@/repositories/customer").Customer} Customer
 * @typedef {import("@/repositories/area").Odp} Odp
 * @typedef {import('@/repositories/area').SubmitODP} SubmitODP
 * @typedef {import('./broadcastMessage').OnsubmitBroadcast} OnsubmitBroadcast
 */

import { toast } from 'sonner';
import { Iconify } from '@components/iconify';
import { useBoolean } from '@hooks/use-boolean';
import { NavUl } from '@components/nav-section';
import { useConfirm } from 'material-ui-confirm';
import { createSelector } from '@reduxjs/toolkit';
import { useRef, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import RewritePPPoEDialog from '@components/areaConfiguration2/RewritePPPoE';

import { Menu, Stack, Button, useTheme, MenuItem, useMediaQuery } from '@mui/material';

import {
  setNestedArea,
  setSelectedOdp,
  setSelectedArea,
  setNestedAreaStore,
} from 'src/stores/areaConfiguration';
import {
  areaRepository,
  customerRepository,
  subscriptionRepository,
  broadcastTemplateRepository,
} from 'src/repositories';

import AreaTree from './AreaTree';
import AddAreaDialog from './AddAreaDialog';
import ServerFormDialog from './ServerFormDialog';
import DeviceFormDialog from './DeviceFormDialog';
import { BroadcastMessageDialog } from './broadcastMessage';

/**
 * @typedef {import('src/repositories/area').AreaSubmit} AreaSubmit
 */

/**
 * @typedef {Object} ItemContext
 * @property {number} index0
 * @property {number} index1
 * @property {number} index2
 * @property {number} index3
 * @property {number} index4
 * @property {number} index5
 * @property {string} key0
 * @property {string} key1
 * @property {string} key2
 * @property {string} key3
 * @property {string} key4
 * @property {string} key5
 * @property {string} [parentId]
 * @property {AreaCategory | Odp} item
 */

/**
 * @callback CallbackContext
 * @param {Event} e
 * @param {ItemContext} data
 */

/**
 * @callback CallbackPickareaContext
 * @param {ItemContext} data
 */

/**
 *
 * @param {{
 * show: boolean,
 * onClose: void
 * }} props
 */
export default function AreaConfigurationSidePicker({ onClose }) {
  const dispatch = useDispatch();
  const theme = useTheme();
  const loading = useBoolean(false);
  const showFormCategory = useBoolean(false);
  const showFormArea = useBoolean(false);
  const showOdpForm = useBoolean(false);
  const showBroadcastForm = useBoolean(false);
  const confirm = useConfirm();
  const rewritePPPoEDialogRef = useRef();

  /** @type {[AreaCategory, void]} */
  const [selectedItem, setSelectedItem] = useState(null);

  /** @type {[ItemContext, void]} */
  const [tempItemContext, setTempItemContext] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const open = Boolean(anchorEl);

  const [action, setAction] = useState('');

  /** @type {CallbackPickareaContext} */
  const onPickarea = (itemData) => {
    const { item } = itemData;
    // console.log(itemData);
    // If Is Area

    if (item?.type?.includes('area')) {
      dispatch(setSelectedArea(item));
      dispatch(setSelectedOdp(null));
    } else {
      dispatch(setSelectedOdp(item));
    }
  };

  const prefetchItemContextParent = async () => {
    const {
      index0,
      index1,
      index2,
      index3,
      index4,
      index5,
      item: areaCategory,
      key0,
      key1,
      key2,
      key3,
      key4,
      key5,
      parentId,
    } = tempItemContext;

    // console.log(tempItemContext);

    try {
      let parentOfParent;
      let parentOfParentIndex;
      if (typeof index5 !== 'undefined') {
        parentOfParent = nestedArea[index0][key1][index1][key2][index2][key3][index3][key4][index4];
        parentOfParentIndex = 5;
      } else if (typeof index4 !== 'undefined') {
        parentOfParent = nestedArea[index0][key1][index1][key2][index2][key3][index3];
        parentOfParentIndex = 4;
      } else if (typeof index3 !== 'undefined') {
        parentOfParent = nestedArea[index0][key1][index1][key2][index2];
        parentOfParentIndex = 3;
      } else if (typeof index2 !== 'undefined') {
        parentOfParent = nestedArea[index0][key1][index1];
        parentOfParentIndex = 2;
      } else if (typeof index1 !== 'undefined') {
        parentOfParent = nestedArea[index0];
        parentOfParentIndex = 1;
      }

      // console.log({ parentOfParent, parentOfParentIndex });

      const snapshotArea = await areaRepository.getAreaById(parentId);
      let snapshotOdp2 = [];
      if (parentId) {
        snapshotOdp2 = await areaRepository.getOdpListLevel2(
          parentOfParent._id ?? parentOfParent.id,
          parentId
        );
      }
      const snapshotOther = await areaRepository.getOdpList(parentId);

      const odp = [...snapshotOther, ...snapshotOdp2].filter((o) =>
        o.name.toLowerCase().includes('odp')
      );

      const odc = [...snapshotOther, ...snapshotOdp2].filter((o) =>
        o.name.toLowerCase().includes('odc')
      );

      const pon = [...snapshotOther, ...snapshotOdp2].filter((o) =>
        o.name.toLowerCase().includes('pon')
      );

      const categoryArea = snapshotArea;

      // console.log({
      //   index0: parentOfParentIndex > 0 ? index0 : undefined,
      //   index1: parentOfParentIndex > 1 ? index1 : undefined,
      //   index2: parentOfParentIndex > 2 ? index2 : undefined,
      //   index3: parentOfParentIndex > 3 ? index3 : undefined,
      //   index4: parentOfParentIndex > 4 ? index4 : undefined,
      //   index5: parentOfParentIndex > 5 ? index5 : undefined,
      // });

      dispatch(
        setNestedAreaStore({
          index0: parentOfParentIndex > 0 ? index0 : undefined,
          index1: parentOfParentIndex > 1 ? index1 : undefined,
          index2: parentOfParentIndex > 2 ? index2 : undefined,
          index3: parentOfParentIndex > 3 ? index3 : undefined,
          index4: parentOfParentIndex > 4 ? index4 : undefined,
          index5: parentOfParentIndex > 5 ? index5 : undefined,
          key0,
          key1,
          key2,
          key3,
          key4,
          key5,
          odc: odc ?? [],
          odp: odp ?? [],
          pon: pon ?? [],
          category: categoryArea ?? [],
        })
      );
    } catch (err) {
      console.error(err);
      if (err instanceof Error) toast.error(err.message);
    }
  };

  const prefetchItemContext = async () => {
    const {
      index0,
      index1,
      index2,
      index3,
      index4,
      index5,
      item: areaCategory,
      key0,
      key1,
      key2,
      key3,
      key4,
      key5,
      parentId,
    } = tempItemContext;

    try {
      const currentArea = selectedItem;

      // console.log({ parentId, selectedItem });

      const snapshotArea = await areaRepository.getAreaById(currentArea._id ?? currentArea.id);
      let snapshotOdp2 = [];
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

      const odc = [...snapshotOther, ...snapshotOdp2].filter((o) =>
        o.name.toLowerCase().includes('odc')
      );

      const pon = [...snapshotOther, ...snapshotOdp2].filter((o) =>
        o.name.toLowerCase().includes('pon')
      );

      const categoryArea = snapshotArea;
      dispatch(
        setNestedAreaStore({
          index0,
          index1,
          index2,
          index3,
          index4,
          index5,
          key0,
          key1,
          key2,
          key3,
          key4,
          key5,
          odc: odc ?? [],
          odp: odp ?? [],
          pon: pon ?? [],
          category: categoryArea ?? [],
        })
      );
    } catch (err) {
      console.error(err);
      if (err instanceof Error) toast.error(err.message);
    }
  };

  /**
   * @param {Event} event
   * @param {ItemContext} itemData
   */
  const handleClick = (event, itemData) => {
    setTempItemContext(itemData);
    const { item } = itemData;
    setAnchorEl(event.currentTarget);
    setSelectedItem(item);
    if (typeof itemData.index5 !== 'undefined') {
      setSelectedCategory('PON');
    } else if (typeof itemData.index4 !== 'undefined') {
      setSelectedCategory('ODC');
    } else if (typeof itemData.index3 !== 'undefined') {
      setSelectedCategory('ODP');
    } else if (typeof itemData.index2 !== 'undefined') {
      setSelectedCategory('SERVER');
    } else if (typeof itemData.index1 !== 'undefined') {
      setSelectedCategory('WILAYAH');
    } else if (typeof itemData.index0 !== 'undefined') {
      setSelectedCategory('PROVINSI');
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
    setSelectedItem(null);
    setTempItemContext(null);
    setSelectedCategory(null);
  };

  const onRemove = async () => {
    try {
      await confirm({
        title: 'Hapus',
        content: `Apakah anda ingin menghapus ${selectedItem.title}`,
        confirmationText: 'Hapus',
        cancellationText: 'Batal',
        confirmationButtonProps: { color: 'error', variant: 'contained' },
      });

      if (selectedItem.type === 'area') {
        await areaRepository.removeAreaServer(selectedItem.id ?? selectedItem._id);
      } else {
        await areaRepository.removeAreaCategory(selectedItem.id ?? selectedItem._id);
      }
      toast.success('Berhasil menghapus');
      // prefetch();
      prefetchItemContextParent();
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
    }
  };

  const onRemoveOdp = async () => {
    try {
      await confirm({
        title: 'Hapus',
        content: `Apakah anda ingin menghapus ${selectedItem.name}`,
        confirmationText: 'Hapus',
        cancellationText: 'Batal',
        confirmationButtonProps: { color: 'error', variant: 'contained' },
      });

      await areaRepository.removeODP(selectedItem.id ?? selectedItem._id);
      toast.success('Berhasil menghapus');
      // prefetch();
      prefetchItemContextParent();
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
    }
  };

  const filterSelector = createSelector(
    [(state) => state.areaConfigurationStore],
    (areaConfigurationStore) => {
      /** @type {AreaConfigurationStore} */
      const { currentArea, currentOdp, customers, nestedArea, limit, page } =
        areaConfigurationStore;
      return { currentArea, currentOdp, customers, nestedArea, limit, page };
    }
  );

  /**
   * @type {AreaConfigurationStore}
   */
  const { nestedArea, currentArea, currentOdp } = useSelector(filterSelector);

  const prefetch = async () => {
    dispatch(setSelectedArea(null));
    dispatch(setSelectedOdp(null));
    const snapshot = await areaRepository.getAreaById();
    const subArea = await Promise.all(
      snapshot.map(async (s) => {
        const childrenArea = await areaRepository.getAreaById(s.id);
        const subAreaChildren = await Promise.all(
          childrenArea.map(async (a) => areaRepository.getAreaById(a.id))
        );

        s.areaCategoryChildren = subAreaChildren.reduce((a, b) => [...a, ...b], []);
        return s;
      })
    );
    dispatch(setNestedArea(subArea));
  };

  /**
   * @param {{title: string; description: string, lat: string, lng: string}} param0
   */
  const onSubmitCategory = async ({ title, description, lat, lng, notifications }) => {
    try {
      showFormCategory.onFalse();
      const result = await areaRepository.submitAreaCategory({
        title,
        description,
        id: action === 'edit' ? selectedItem?.id ?? selectedItem._id : undefined,
        parent: action === 'add-sub' ? selectedItem?.id ?? selectedItem._id : undefined,
        lat,
        lng,
        notifications,
      });

      prefetchItemContext();
      // prefetch();
      toast.info('Berhasil menyimpan');
    } catch (error) {
      toast.error(error.message);
    }
  };

  /**
   * @param {AreaSubmit} data
   */
  const onSubmitArea = async (data) => {
    try {
      showFormArea.onFalse();
      data.id = action === 'edit' ? selectedItem.id ?? selectedItem._id : undefined;
      data.category = action === 'add-sub' ? selectedItem.id ?? selectedItem._id : undefined;
      data.autoIsolirDate =
        data.autoIsolirDate == null || data.autoIsolirDate === 0 ? null : data.autoIsolirDate;
      const result = await areaRepository.submitArea(data);
      if (data.companyLogo) {
        await areaRepository.submitLogoArea(result._id, data.companyLogo);
      }
      toast.info('Berhasil menyimpan');

      if (action === 'edit') {
        prefetchItemContextParent();
      } else {
        prefetchItemContext();
      }
      // prefetch();
    } catch (error) {
      toast.error(error.message);
    }
  };

  /**
   * @param {SubmitODP} data
   */
  const onSubmitODP = async (data) => {
    try {
      showOdpForm.onFalse();
      data.id = action === 'edit' ? selectedItem.id ?? selectedItem._id : undefined;
      if (selectedItem.type?.includes('area')) {
        data.parentArea =
          action === 'edit'
            ? selectedItem.parentArea
            : action === 'add-sub'
              ? selectedItem.id ?? selectedItem._id
              : undefined;
      } else {
        data.parentArea =
          action === 'edit'
            ? tempItemContext.parentId
            : action === 'add-sub'
              ? tempItemContext.parentId
              : undefined;

        data.parentODP =
          action === 'edit'
            ? selectedItem.parentODP
            : action === 'add-sub'
              ? selectedItem.id ?? selectedItem._id
              : undefined;
      }

      await areaRepository.submitODP(data);
      toast.info('Berhasil menyimpan');
      if (action === 'edit') {
        prefetchItemContextParent();
      } else {
        prefetchItemContext();
      }
      // prefetch();
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (nestedArea.length >= 1) return;
    prefetch();
  }, []);

  // const prefetch = async () => {};

  const toggleAdd = () => {
    showFormCategory.onTrue();
    setAction('add');
    setSelectedItem(null);
    setTempItemContext(null);
  };

  /** @type {OnsubmitBroadcast} */
  const onHandlerBroadcast = async (data) => {
    data.area = selectedItem.id ?? selectedItem._id;
    try {
      showBroadcastForm.onFalse();
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
    }
  };

  const onIsolate = async () => {
    try {
      await confirm({
        title: 'Isolate Area',
        content: 'Apakah anda ingin melanjutkan Isolate area secara massal',
        confirmationText: 'Ya',
        cancellationText: 'Tidak',
      });

      await subscriptionRepository.isolateNetworkArea(selectedItem.id ?? selectedItem._id);
      toast.info('Sukses melakukan isolate area');
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
    } finally {
      handleClose();
    }
  };

  const onBatchRewritePPPoE = async () => {
    try {
      await confirm({
        title: 'Tulis Ulang PPPoE',
        content: 'Apakah anda ingin melanjutkan menulis ulang PPPoE seluruh pelanggan ke mikrotik',
        confirmationText: 'Ya',
        cancellationText: 'Tidak',
      });

      await areaRepository.batchRewritePPPoE(selectedItem.id ?? selectedItem._id);
      toast.info('Memproses ke Mikrotik');
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
    } finally {
      handleClose();
    }
  };

  function rewritePPPoE() {
    rewritePPPoEDialogRef.current.open(selectedItem);
    handleClose();
  }

  const onGenerateIdCustomer = async () => {
    try {
      await confirm({
        title: 'Generate Customer ID',
        content: `apakah anda melakukan generate ID Customer otomatis untuk area ${selectedItem?.title}`,
        confirmationText: 'Ya',
        cancellationText: 'Batal',
      });

      const result = await customerRepository.FillCustomerId(selectedItem.id ?? selectedItem._id);

      toast.success(result);
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
    }
  };

  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  return (
    <>
      <Stack>
        <NavUl>
          <div className="tw-px-2">
            {nestedArea.map((a, i) => (
              <AreaTree
                selectedAreaId={currentArea?._id ?? currentArea?.id}
                selectedDeviceId={currentOdp?._id ?? currentOdp?.id}
                onContext={handleClick}
                index0={i}
                areaCategory={a}
                key={i}
                parent={nestedArea}
                key0="areaCategoryChildren"
                onPickarea={onPickarea}
                icon={<Iconify icon="flat-color-icons:globe" />}
              />
            ))}
          </div>
        </NavUl>
        <Button color="primary" onClick={toggleAdd}>
          <Iconify icon="mdi:add" />
          Provinsi
        </Button>
      </Stack>
      {/* On menu */}
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
      >
        <MenuItem
          onClick={() => {
            setAction('edit');
            if (selectedItem.type === 'area_category') {
              showFormCategory.onTrue();
            } else if (selectedItem.type === 'area') {
              showFormArea.onTrue();
            } else {
              showOdpForm.onTrue();
            }
          }}
        >
          Edit
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (selectedItem.type === 'area_category') {
              onRemove();
            } else if (selectedItem.type === 'area') {
              onRemove();
            } else {
              onRemoveOdp();
            }
          }}
        >
          Hapus
        </MenuItem>
        {['PROVINSI'].includes(selectedCategory) && (
          <MenuItem
            onClick={() => {
              setAction('add-sub');
              showFormCategory.onTrue();
            }}
          >
            Tambah Wilayah
          </MenuItem>
        )}

        {['WILAYAH'].includes(selectedCategory) && (
          <MenuItem
            onClick={() => {
              setAction('add-sub');
              showFormArea.onTrue();
            }}
          >
            Tambah Server / Area
          </MenuItem>
        )}

        {['SERVER'].includes(selectedCategory) && (
          <MenuItem onClick={onGenerateIdCustomer}>Buat ID Customer Otomatis</MenuItem>
        )}

        {['SERVER', 'ODP', 'ODC'].includes(selectedCategory) && (
          <MenuItem
            onClick={() => {
              setAction('add-sub');
              showOdpForm.onTrue();
            }}
          >
            Tambah Perangkat
          </MenuItem>
        )}

        <MenuItem onClick={() => showBroadcastForm.onTrue()}>Broadcast Pesan</MenuItem>
        <MenuItem onClick={onIsolate}>Isolate Tagihan</MenuItem>
        <MenuItem onClick={() => rewritePPPoE()}>Tulis PPPoE</MenuItem>
      </Menu>
      {/* Dialog */}
      <AddAreaDialog
        show={showFormCategory.value}
        onClose={() => showFormCategory.onFalse()}
        selectedArea={action === 'edit' ? selectedItem : undefined}
        onSubmit={onSubmitCategory}
      />
      <ServerFormDialog
        show={showFormArea.value}
        onClose={() => showFormArea.onFalse()}
        selectedItem={action === 'edit' ? selectedItem : undefined}
        onSubmit={onSubmitArea}
      />
      <DeviceFormDialog
        show={showOdpForm.value}
        onClose={() => showOdpForm.onFalse()}
        selectedItem={action === 'edit' ? selectedItem : undefined}
        onSubmit={onSubmitODP}
      />
      <BroadcastMessageDialog
        show={showBroadcastForm.value}
        onClose={() => showBroadcastForm.onFalse()}
        onSubmit={onHandlerBroadcast}
      />
      <RewritePPPoEDialog ref={rewritePPPoEDialogRef} />
    </>
  );
}
