/**
 * @typedef {import("src/stores/inventoryStore").InventoryStore} InventoryStore
 * @typedef {import('src/repositories/inventory').Inventory} Inventory
 * @typedef {import('src/stores/areaStore').AreaStore} AreaStore
 * @typedef {import('src/stores/userStore').UserStore} UserStore
 * @typedef {import('src/repositories/user').User} User
 */

import { toast } from 'sonner';
import { Icon } from '@iconify/react';
import { useConfirm } from 'material-ui-confirm';
import Overloading from '@components/overloading';
import { connect, useDispatch } from 'react-redux';
import { useMemo, useState, useEffect } from 'react';
import { usePrivilege } from '@auth/hooks/privileges';
import InventoryTable from '@components/inventory/table';
import InventoryFormDialog from '@components/inventory/FormDialog';
import { InventoryMobileCard } from '@components/inventory/MobileCard';
import InventoryAddStockFormDialog from '@components/inventory/AddStockForm';
import InventoryAddUsageFormDialog from '@components/inventory/AddUsageForm';

import Grid from '@mui/material/Unstable_Grid2';
import {
  Menu,
  Button,
  useTheme,
  MenuItem,
  TextField,
  Typography,
  useMediaQuery,
} from '@mui/material';

import 'src/extension/string';
import { setArea } from 'src/stores/areaStore';
import { setEngineer } from 'src/stores/userStore';
import { setItems } from 'src/stores/inventoryStore';
import { areaRepository, userRepository, inventoryRepository } from 'src/repositories';
/**
 * @param {{areas: Area[]; items: Inventory[], officers: User[]; order: string; orderBy: string}} props - react props
 */
function Inventory({ items, areas, officers, order, orderBy }) {
  const dispatch = useDispatch();
  const theme = useTheme();
  const confirm = useConfirm();
  const { isAdmin } = usePrivilege();

  const [search, setSearch] = useState('');
  const [showFormAddStock, setShowFormAddStock] = useState(false);
  const [showFormUsage, setShowFormUsage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const open = Boolean(anchorEl);

  const filteredItems = useMemo(() => {
    const s = search.toLowerCase();
    const filtered = items.filter(
      (item) =>
        item.name.toLowerCase().includes(s) ||
        item.description.toLowerCase().includes(s) ||
        item.unitType.toLowerCase().includes(s)
    );

    filtered.sort((a, b) => {
      if (orderBy === 'unit') {
        return order === 'asc'
          ? a.unitType.localeCompare(b.unitType)
          : b.unitType.localeCompare(a.unitType);
      }

      if (orderBy === 'usage') {
        return order === 'asc' ? a.usage - b.usage : b.usage - a.usage;
      }

      if (orderBy === 'stock') {
        return order === 'asc' ? a.stock - b.stock : b.stock - a.stock;
      }

      if (orderBy === 'available') {
        return order === 'asc' ? a.available - b.available : b.available - a.available;
      }

      return order === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
    });

    return filtered;
  });

  /**
   * @param {Event} event
   * @param {Inventory} item
   */
  const openMenu = (event, item) => {
    setSelectedItem(item);
    setAnchorEl(event.currentTarget);
  };

  const closeMenu = () => {
    setSelectedItem(null);
    setAnchorEl(null);
  };

  const prefetch = async () => {
    setLoading(true);
    const snapshot = await inventoryRepository.getInventoryItems();
    dispatch(setItems(snapshot));
    if (areas.length <= 0) {
      const snapshotArea = await areaRepository.getAllArea().catch((err) => {
        toast.error('Gagal mendapatkan data area');
        return [];
      });
      dispatch(setArea(snapshotArea));
    }

    if (officers.length <= 0) {
      const snapshotOfficer = await userRepository.getUserByPrivilege('engineer').catch((err) => {
        toast.error('Gagal mendapatkan data engineer');
        return [];
      });
      dispatch(setEngineer(snapshotOfficer));
    }
    setLoading(false);
  };

  useEffect(() => {
    if (items.length >= 1) return;
    prefetch();
  }, []);

  const closeForm = (isPrefetch) => {
    setShowForm(false);
    setSelectedItem(null);
    setShowFormAddStock(false);
    setShowFormUsage(false);
    if (isPrefetch) prefetch();
    closeMenu();
  };

  /**
   * @param {Inventory} item
   */
  const handlerDelete = async (item) => {
    setLoading(true);
    try {
      const result = await confirm({
        title: 'Hapus Inventory',
        description: `Ingin menghapus inventory ${item.name}`,
        confirmationText: 'Hapus',
        confirmationButtonProps: { color: 'error' },
      });
      await inventoryRepository.removeItem(item._id);
      toast.info('Berhasil menghapus inventory');
    } catch (error) {
      if (error.message) toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  /** @type {Inventory} */
  const onEdit = (item) => {
    setSelectedItem(item);
    setShowForm(true);
  };

  const mapAreas = () => {
    const result = [];
    areas.map((area) => {
      result.push(area.title);
      const currentAreas = area.area;
      result.push(...currentAreas);
      return;
    });
    return result;
  };

  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <>
      <div className=" tw-flex tw-flex-col tw-px-5 tw-container tw-w-full tw-mx-auto tw-items-center tw-justify-center">
        {/* Header Page */}
        <div className="tw-flex tw-flex-col lg:tw-flex-row tw-w-full tw-items-center tw-justify-between tw-gap-2">
          <Grid container spacing={2} className="tw-w-full">
            <Grid xs={9} md={7}>
              <Typography variant="h4">Daftar Stok</Typography>
            </Grid>
            <Grid xs={3} className="tw-flex tw-items-center tw-justify-end">
              {isAdmin && (
                <Button
                  onClick={() => setShowForm(true)}
                  variant="contained"
                  color="success"
                  className="tw-self-end"
                >
                  <Icon icon="ic:baseline-plus" fontSize={20} /> {!isMobile && 'Tambah Item'}
                </Button>
              )}
            </Grid>
            <Grid xs={12} md={2}>
              <TextField
                label="Cari"
                size="small"
                fullWidth
                onChange={(e) => setSearch(e.target.value)}
              />
            </Grid>
          </Grid>
        </div>
        {/* End Header */}
        {/* Content */}
        <div className="tw-flex tw-flex-col tw-gap-2 tw-w-full tw-mt-4 tw-relative">
          <Overloading loading={loading} />
          {isMobile ? (
            <>
              {filteredItems.map((item, i) => (
                <InventoryMobileCard
                  readOnly={!isAdmin}
                  key={i}
                  item={item}
                  onShowMenu={(e) => openMenu(e, item)}
                />
              ))}
            </>
          ) : (
            <InventoryTable
              items={filteredItems}
              readOnly={!isAdmin}
              onShowMenu={(e, item) => openMenu(e, item)}
            />
          )}
          <Menu
            id="basic-menu"
            anchorEl={anchorEl}
            open={open}
            onClose={closeMenu}
            MenuListProps={{
              'aria-labelledby': 'basic-button',
            }}
          >
            <MenuItem onClick={() => setShowFormAddStock(true)}>
              <div className="tw-flex tw-flex-row tw-gap-2 tw-items-center">
                <Icon icon="carbon:package" fontSize={20} /> <span>Tambah Stok</span>
              </div>
            </MenuItem>
            <MenuItem onClick={() => setShowFormUsage(true)}>
              <div className="tw-flex tw-flex-row tw-gap-2 tw-items-center">
                <Icon icon="lucide:package-minus" fontSize={20} /> <span>Tambah Penggunaan</span>
              </div>
            </MenuItem>
            <MenuItem>
              <div className="tw-flex tw-flex-row tw-gap-2 tw-items-center">
                <Icon icon="icon-park-outline:history-query" fontSize={20} /> <span>Riwayat</span>
              </div>
            </MenuItem>
            <MenuItem onClick={() => setShowForm(true)}>
              <div className="tw-flex tw-flex-row tw-gap-2 tw-items-center">
                <Icon icon="material-symbols:edit-outline" fontSize={20} /> <span>Edit</span>
              </div>
            </MenuItem>
            <MenuItem onClick={() => handlerDelete(selectedItem)}>
              <div className="tw-flex tw-flex-row tw-gap-2 tw-items-center">
                <Icon icon="material-symbols:delete-outline" fontSize={20} /> <span>Hapus</span>
              </div>
            </MenuItem>
          </Menu>
        </div>
        {/* End Content */}
      </div>
      <InventoryFormDialog show={showForm} onClose={closeForm} selectedItem={selectedItem} />
      <InventoryAddStockFormDialog
        show={showFormAddStock}
        areas={mapAreas()}
        item={selectedItem}
        onClose={closeForm}
      />
      <InventoryAddUsageFormDialog
        show={showFormUsage}
        areas={mapAreas()}
        item={selectedItem}
        officers={officers}
        onClose={closeForm}
      />
    </>
  );
}

const mapStateToProps = (state) => {
  /** @type {AreaStore} */
  const { areaStore } = state;
  /** @type {UserStore} */
  const { userStore } = state;
  const { engineer } = userStore;
  const areas = areaStore.all;
  return {
    items: state.inventoryStore.items,
    order: state.inventoryStore.order,
    orderBy: state.inventoryStore.orderBy,
    areas,
    officers: engineer,
  };
};

export default connect(mapStateToProps)(Inventory);
