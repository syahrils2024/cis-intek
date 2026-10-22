import Grid from '@mui/material/Unstable_Grid2';

export default function AcsDialogCustomerHeader({ customerId, fullname, phone, address, serialNumber }) {
  return (
    <Grid container gap={1}>
      <Grid xs={12} md={6}>
        <div className="tw-flex tw-flex-col">
          <span className="tw-text-xs tw-text-gray-500">ID</span>
          <span className="tw-text-xs tw-font-semibold">{customerId ?? '-'}</span>
        </div>
      </Grid>
      <Grid xs={12} md={5}>
        <div className="tw-flex tw-flex-col">
          <span className="tw-text-xs tw-text-gray-500">Pelanggan</span>
          <span className="tw-text-xs tw-font-semibold">{fullname ?? '-'}</span>
        </div>
      </Grid>
      <Grid xs={12} md={6}>
        <div className="tw-flex tw-flex-col">
          <span className="tw-text-xs tw-text-gray-500">Whatsapp</span>
          <span className="tw-text-xs tw-font-semibold">{phone ?? '-'}</span>
        </div>
      </Grid>
      <Grid xs={12} md={5}>
        <div className="tw-flex tw-flex-col">
          <span className="tw-text-xs tw-text-gray-500">Alamat</span>
          <span className="tw-text-xs tw-font-semibold">{address ?? '-'}</span>
        </div>
      </Grid>
      <Grid xs={12} md={5}>
        <div className="tw-flex tw-flex-col">
          <span className="tw-text-xs tw-text-gray-500">Serial Number</span>
          <span className="tw-text-xs tw-font-semibold">{serialNumber ?? '-'}</span>
        </div>
      </Grid>
    </Grid>
  );
}
