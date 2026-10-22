import { Iconify } from '@components/iconify';
import { useState, type MouseEvent } from 'react';

import { LoadingButton } from '@mui/lab';
import { Menu, Alert, MenuItem } from '@mui/material';

import type { GatewayStatusButtonProps } from '../openclaw.types';

export default function GatewayStatusButton({
  running = false,
  loading = false,
  error = null,
  onRestart = () => {},
  onStop = () => {},
}: GatewayStatusButtonProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);

  const handleClick = (event: MouseEvent<HTMLElement>) => {
    if (running) {
      setAnchorEl(event.currentTarget);
      return;
    }

    onRestart();
  };

  const handleClose = () => setAnchorEl(null);

  const handleRestart = () => {
    handleClose();
    onRestart();
  };

  const handleStop = () => {
    handleClose();
    onStop();
  };

  return (
    <div>
      <LoadingButton
        aria-controls={menuOpen ? 'gateway-status-menu' : undefined}
        aria-expanded={menuOpen ? 'true' : undefined}
        aria-haspopup={running ? 'menu' : undefined}
        color={running ? 'primary' : 'error'}
        loading={loading}
        onClick={handleClick}
        variant="soft"
      >
        <Iconify
          icon={running ? 'material-symbols-light:play-arrow' : 'material-symbols-light:stop'}
        />
        <span className="tw-ml-1">Gateway {running ? 'Running' : 'Stopped'}</span>
      </LoadingButton>

      <Menu
        anchorEl={anchorEl}
        id="gateway-status-menu"
        onClose={handleClose}
        open={menuOpen}
      >
        <MenuItem onClick={handleRestart}>Restart</MenuItem>
        {/* <MenuItem onClick={handleStop}>Stop</MenuItem> */}
      </Menu>

      {error && (
        <Alert severity="error" sx={{ mt: 1 }}>
          {error}
        </Alert>
      )}
    </div>
  );
}
