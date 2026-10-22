import { Menu, MenuItem } from '@mui/material';

/**
 * Context menu shown when clicking a customer row.
 *
 * @param {object} props
 * @param {HTMLElement | null} props.anchorEl
 * @param {boolean} props.open
 * @param {() => void} props.onClose
 * @param {boolean} props.allowModify
 * @param {object | null} props.selectedCustomer
 * @param {() => void} props.onOpenTicket
 * @param {() => void} props.onDeactivate
 * @param {() => void} props.onHistoryLogMikrotik
 */
export default function NetworkStatusMenu({
  anchorEl,
  open,
  onClose,
  allowModify,
  selectedCustomer,
  onOpenTicket,
  onDeactivate,
  onHistoryLogMikrotik,
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
      {allowModify && (
        <MenuItem
          onClick={() => {
            onOpenTicket();
            onClose();
          }}
        >
          Buat Ticket
        </MenuItem>
      )}

      <MenuItem
        onClick={() => {
          onDeactivate();
          onClose();
        }}
      >
        Dismantle / Nonaktifkan
      </MenuItem>
      <MenuItem
        onClick={() => {
          onHistoryLogMikrotik();
          onClose();
        }}
      >
        History Log Mikrotik
      </MenuItem>
    </Menu>
  );
}
