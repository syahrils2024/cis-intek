// @ts-nocheck

import { toast } from 'sonner';
import { useAppPicker } from '@hooks/use-app-picker';
import { usePrivilege } from '@auth/hooks/privileges';

import { Menu, MenuItem } from '@mui/material';

/**
 * @typedef {import('src/repositories/ticket').Ticket} Ticket
 */

const DataTabMenu = ({
  anchorEl,
  open,
  onClose,
  allowModify,
  selectedTicket,
  allowProcessEngineer,
  onNavigateToCustomerData,
  onProcess,
  onFinishing,
  onChangeEngineer,
  onRemove,
  onProcessed,
  onSendNotif,
  onOpenAcsDialog,
  ticketLogFormRef,
}) => {
  const { isEngineer } = usePrivilege();
  const appPicker = useAppPicker();

  const handleChangeEngineer = async (ticket) => {
    const snapshot = await appPicker.engineer.open(true, {
      currentEngineerId: ticket.engineers.map((e) => e._id),
      areaId: ticket.area_id,
    });
    if (!snapshot) return;
    const engineers = snapshot.map((e) => e._id);
    const promise = onChangeEngineer(ticket, engineers);
    toast.promise(promise, {
      loading: 'Memperbarui data teknisi...',
      success: 'Berhasil memperbarui data teknisi',
      error: 'Gagal memperbarui data teknisi',
    });
  };

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
      <MenuItem onClick={onNavigateToCustomerData}>Network Status</MenuItem>
      <MenuItem onClick={onOpenAcsDialog}>ACS & Cek Koneksi</MenuItem>

      {allowModify && ['waiting_finishing', 'pending'].includes(selectedTicket?.status) ? (
        <>
          <MenuItem onClick={onProcess}>Proses</MenuItem>
          <MenuItem onClick={onFinishing}>Selesaikan</MenuItem>
        </>
      ) : null}

      {allowModify && ['processed', 'pending'].includes(selectedTicket?.status) ? (
        <MenuItem onClick={() => handleChangeEngineer(selectedTicket)}>Set PIC</MenuItem>
      ) : null}

      {allowModify && <MenuItem onClick={onRemove}>Hapus</MenuItem>}

      {/* Engineer Action */}
      {isEngineer && allowProcessEngineer?.value && selectedTicket?.status === 'pending' ? (
        <MenuItem onClick={onProcessed}>Proses</MenuItem>
      ) : null}

      {isEngineer && allowProcessEngineer?.value && selectedTicket?.status === 'processed' ? (
        <MenuItem onClick={onSendNotif}>Ajukan Penyelesaian</MenuItem>
      ) : null}

      <MenuItem
        onClick={() => {
          ticketLogFormRef.current.open(selectedTicket, selectedTicket.customer_id);
          onClose();
        }}
      >
        Log
      </MenuItem>

      {isEngineer && !allowProcessEngineer?.value && <MenuItem>Forbiden</MenuItem>}
    </Menu>
  );
};

export default DataTabMenu;
