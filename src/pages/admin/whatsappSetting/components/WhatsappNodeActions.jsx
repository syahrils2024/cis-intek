import { Icon } from '@iconify/react';

import { Tooltip, IconButton } from '@mui/material';

export default function WhatsappNodeActions({
  item,
  onEdit,
  onDelete,
  onLogout,
  onScan,
  onRestart,
  onUpdate,
  onConsole,
  onClone
}) {
  return (
    <>
      {item.status !== 'pending' && (
        <Tooltip title="Logout">
          <IconButton variant="soft" color="error" onClick={onLogout}>
            <Icon icon="material-symbols:logout" />
          </IconButton>
        </Tooltip>
      )}
      {/* <Tooltip title="Hapus Node">
        <IconButton
          disabled={item.isMaster === true}
          variant="soft"
          color="error"
          onClick={onDelete}
        >
          <Icon icon="mdi:trash-outline" />
        </IconButton>
      </Tooltip> */}

      {item.status !== 'active' && (
        <Tooltip title="Scan">
          <IconButton variant="soft" color="warning" onClick={onScan}>
            <Icon icon="bx:qr" />
          </IconButton>
        </Tooltip>
      )}
      <Tooltip title="Edit">
        <IconButton variant="soft" color="warning" onClick={onEdit}>
          <Icon icon="material-symbols:edit-outline" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Console">
        <IconButton variant="soft" onClick={onConsole}>
          <Icon icon="mdi-light:console" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Update">
        <IconButton
          disabled={item.isMaster === true}
          variant="soft"
          color="success"
          onClick={onUpdate}
        >
          <Icon icon="material-symbols-light:system-update-outline-rounded" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Restart Node">
        <IconButton variant="soft" color="info" onClick={onRestart}>
          <Icon icon="ic:baseline-restart-alt" />
        </IconButton>
      </Tooltip>
       <Tooltip title="Clone Node">
        <IconButton variant="soft" color="primary" onClick={onClone}>
          <Icon icon="ic:content-copy" width={20} />
        </IconButton>
      </Tooltip>
    </>
  );
}
