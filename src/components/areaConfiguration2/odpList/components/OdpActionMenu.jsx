/**
 * @typedef {import('src/repositories/area').Odp} Odp
 */
import { Iconify } from '@components/iconify';

import { Menu, MenuItem, IconButton } from '@mui/material';

/**
 * Dropdown action menu shown from the desktop table / list.
 * @param {Object} props
 * @param {boolean} props.open
 * @param {HTMLElement|null} props.anchorEl
 * @param {() => void} props.onClose
 * @param {boolean} props.readOnly
 * @param {Odp|null} props.selectedOdp
 * @param {(item: Odp) => void} props.onShowCustomer
 * @param {(item: Odp) => void} props.onEdit
 * @param {(item: Odp) => void} props.onRemove
 */
export default function OdpActionMenu({
  open,
  anchorEl,
  onClose,
  readOnly = false,
  selectedOdp,
  onShowCustomer,
  onEdit,
  onRemove,
}) {
  return (
    <Menu
      id="basic-menu"
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      MenuListProps={{
        'aria-labelledby': 'basic-button',
      }}
    >
      <MenuItem>
        <IconButton onClick={() => onShowCustomer(selectedOdp)}>
          <Iconify icon="mdi:account-outline" />
        </IconButton>
      </MenuItem>
      {!readOnly && (
        <>
          <MenuItem>
            <IconButton onClick={() => onEdit(selectedOdp)}>
              <Iconify icon="mdi:pencil-outline" />
            </IconButton>
          </MenuItem>
          <MenuItem>
            <IconButton onClick={() => onRemove(selectedOdp)}>
              <Iconify icon="mdi:delete-forever-outline" />
            </IconButton>
          </MenuItem>
        </>
      )}
    </Menu>
  );
}
