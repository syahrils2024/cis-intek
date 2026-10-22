import { Chip } from '@mui/material';

export default function WhatsappNodeStatusChip({ status }) {
  const getStatusColor = (s) => {
    switch (s) {
      case 'active':
        return 'success';
      case 'pending':
        return 'warning';
      default:
        return 'error';
    }
  };

  return (
    <Chip
      size="small"
      color={getStatusColor(status)}
      variant="soft"
      label={status?.toUpperCase() || 'UNKNOWN'}
    />
  );
}
