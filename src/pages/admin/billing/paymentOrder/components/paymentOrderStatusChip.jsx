import { Chip } from '@mui/material';

export default function PaymentOrderStatusChip({ status }) {
  const defaultColor = 'default';
  const defaultStatus = status;

  const color =
    {
      pending: 'warning',
      success: 'success',
      failed: 'error',
      expired: 'error',
    }[status] || defaultColor;

  const displayStatus =
    {
      pending: 'Menunggu Pembayaran',
      success: 'Berhasil',
      failed: 'Gagal',
      expired: 'Expired',
    }[status] || defaultStatus;

  return <Chip label={displayStatus} color={color} size="small" variant="soft" />;
}
