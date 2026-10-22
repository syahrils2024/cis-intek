import { useState } from 'react';
import { Iconify } from '@components/iconify';

import { Menu, Button, MenuItem } from '@mui/material';

/**
 * Action menu untuk tab pelanggan (Export & Tambah Pelanggan).
 * @param {Object} props
 * @param {boolean} props.isMobile
 * @param {boolean} props.loadingExport
 * @param {() => void} props.onExport
 * @param {() => void} props.onAdd
 */
export default function CustomerTab2FilterAction({
  isMobile,
  loadingExport = false,
  onExport,
  onAdd,
}) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Button
        color="primary"
        size="small"
        className="tw-gap-2"
        variant="contained"
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={(e) => setAnchorEl(e.currentTarget)}
      >
        <Iconify icon="mdi:dots-horizontal" /> {isMobile ? '' : 'Aksi'}
      </Button>
      <Menu
        id="customer-tab2-filter-action-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'customer-tab2-filter-action-button',
        }}
      >
        <MenuItem disabled={loadingExport} onClick={() => { handleClose(); onExport(); }}>
          <Iconify icon="mdi:file-excel" /> Export
        </MenuItem>
        <MenuItem onClick={() => { handleClose(); onAdd(); }}>
          <Iconify icon="mdi:plus" /> {isMobile ? '' : 'Pelanggan'}
        </MenuItem>
      </Menu>
    </>
  );
}
