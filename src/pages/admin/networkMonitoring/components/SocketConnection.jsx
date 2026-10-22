import { Box, Chip } from '@mui/material';

export default function SocketConnection({ status = 'unknown' }) {
  const label = {
    connected: 'Connected',
    disconnected: 'Terputus',
    connecting: 'Menghubungkan...',
    unknown: 'Status Tidak Diketahui',
  };

  const color = {
    connected: 'success',
    disconnected: 'error',
    connecting: 'warning',
    unknown: 'default',
  };

  return (
    <Chip
      label={label[status]}
      color={color[status]}
      variant="soft"
      size="small"
      icon={
        <Box
          style={{ marginLeft: 10 }}
          width={10}
          height={10}
          borderRadius="100%"
          bgcolor={`${color[status]}.main`}
        />
      }
    />
  );
}
