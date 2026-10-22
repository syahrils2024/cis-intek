import { Stack, Checkbox, FormHelperText } from '@mui/material';

import 'src/extension/string';
import 'src/extension/number';

/**
 *
 * @param {object} param0
 * @param {boolean} param0.checkedValue - Apakah fitur Open Isolir Invoice Temp aktif atau tidak
 * @param {number} param0.duration - Durasi dalam jam untuk Open Isolir Invoice Temp
 * @param {function} param0.onDurationChange - Fungsi untuk menangani perubahan durasi
 * @param {function} param0.onCheckedChange - Fungsi untuk menangani perubahan status aktif fitur
 * @returns {JSX.Element}
 * @description Komponen ini digunakan untuk mengatur fitur Open Isolir Invoice Temp yang memungkinkan teknisi untuk membuka isolir sementara selama proses pembayaran. Fitur ini sangat berguna untuk memastikan pelanggan tetap mendapatkan layanan meskipun sedang dalam proses pembayaran.
 * Fitur ini dapat diaktifkan atau dinonaktifkan, dan durasi isolir sementara dapat disesuaikan sesuai kebutuhan. Ketika fitur ini aktif, teknisi dapat memberikan akses sementara kepada pelanggan selama durasi yang telah ditentukan, sehingga pelanggan tetap dapat menggunakan layanan meskipun sedang dalam proses pembayaran.
 * Fitur ini dirancang untuk meningkatkan fleksibilitas dan kenyamanan bagi pelanggan selama proses pembayaran, serta memberikan solusi sementara yang efektif untuk mengatasi masalah isolir yang mungkin terjadi.
 *
 * Contoh penggunaan:
 * <OpenIsolirPaymentRequestField
 *   checkedValue={openIsolirInvoiceTemp.value}
 *   duration={openIsolirInvoiceTempDuration}
 *   onDurationChange={(newDuration) => setOpenIsolirInvoiceTempDuration(newDuration)}
 *   onCheckedChange={(newCheckedValue) => openIsolirInvoiceTemp.setValue(newCheckedValue)}
 * />
 *
 * Catatan: Pastikan untuk menyesuaikan fungsi onDurationChange dan onCheckedChange sesuai dengan state management yang digunakan dalam aplikasi Anda, seperti useState atau useBoolean.
 *
 * Fitur ini sangat penting untuk meningkatkan pengalaman pelanggan dan memberikan solusi sementara yang efektif selama proses pembayaran, sehingga pelanggan tetap dapat menggunakan layanan tanpa gangguan.
 */
export const OpenIsolirPaymentRequestField = ({
  checkedValue = false,
  duration = 1,
  onDurationChange,
  onCheckedChange,
  label = 'Open Isolir Customer Payment Request',
  subtitle = 'Buka isolir sementara saat pelanggan mengajukan pembayaran via chat AI. Jika disetujui, isolir dihapus permanen. Jika ditolak isolir aktif kembali.',
}) => {
  const readOnlyDuration = !checkedValue;

  return (
    <Stack direction="row" alignItems="start" spacing={2} className="-tw-ml-3">
      <Checkbox
        checked={checkedValue}
        onChange={(e) => onCheckedChange(e.target.checked)}
        size="small"
      />
      <Stack className="tw-w-full tw-pt-2">
        <span className="tw-text-sm ">{label}</span>
        {/* <TextField
          size="small"
          label={label}
          value={duration}
          onChange={(e) => onDurationChange(e.target.value.toString().toNumber())}
          disabled={readOnlyDuration}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <span className="tw-text-gray-500 tw-text-xs">Hari</span>
              </InputAdornment>
            ),
          }}
          fullWidth
        /> */}
        <FormHelperText>{subtitle}</FormHelperText>
      </Stack>
    </Stack>
  );
};
