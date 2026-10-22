import { Iconify } from '@components/iconify';

import { Stack } from '@mui/material';

const PaymentEvidence = ({
  data,
  evidences,
  selectedImageIndex,
  setSelectedImageIndex,
  evidencePickerRef,
  pickEvidence,
  updateEvidence,
  allowUpdate = true,
}) => (
  <Stack spacing={1}>
    <span className="tw-text-xs">Bukti Pembayaran</span>
    <input
      ref={evidencePickerRef}
      type="file"
      accept="image/*"
      className="tw-hidden"
      onChange={(event) => {
        const [file] = event.target.files ?? [];
        const { mode } = event.target.dataset;
        event.target.value = '';
        updateEvidence(mode, file);
      }}
    />
    {/* {data?.status !== 'paid' && (
      <Stack direction="row" spacing={1}>
        <Button size="small" variant="outlined" onClick={() => pickEvidence('replace')}>Ganti gambar</Button>
        <Button size="small" variant="outlined" onClick={() => pickEvidence('append')}>Tambah gambar</Button>
      </Stack>
    )} */}
    {evidences.length >= 1 ? (
      <div className="tw-grid tw-grid-cols-4 md:tw-grid-cols-8 tw-gap-2">
        {evidences.map((evidence, i) => (
          <button key={i} type="button" onClick={() => setSelectedImageIndex(i)}>
            <img
              src={evidence}
              alt={`Bukti pembayaran ${i + 1}`}
              className={`tw-w-full tw-aspect-square tw-rounded-lg tw-object-cover ${selectedImageIndex === i ? 'tw-ring-2 tw-ring-primary' : ''}`}
            />
          </button>
        ))}
        {allowUpdate ? (
          <button type="button" onClick={() => pickEvidence('append')}>
            <div className="tw-w-full tw-aspect-square tw-rounded-lg tw-ring-1 tw-ring-gray-300 tw-flex tw-items-center tw-justify-center">
              <Iconify icon="eva:plus-fill" width={24} height={24} />
            </div>
          </button>
        ) : null}
      </div>
    ) : (
      <div className="tw-bg-warning/10 tw-ring-warning tw-ring-1 tw-p-3 tw-rounded-md tw-text-center">
        <span className="tw-text-xs">Tidak Ada Bukti Pembayaran</span>
      </div>
    )}
  </Stack>
);

export default PaymentEvidence;
