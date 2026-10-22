/**
 * @typedef {import("src/repositories/customerTransaction").ICustomerTransaction} CustomerTransaction
 */

import { useState, useEffect } from 'react';
import { copyText } from '@utils/clipboard';
import { intervalToDuration } from 'date-fns';
import { Iconify } from '@components/iconify';
import { getBankImagePath } from '@utils/getBankImage';

import { Stack, Button, Divider, IconButton } from '@mui/material';

import 'src/extension/number';
import 'src/extension/string';

/**
 * @param {{customerTransaction: CustomerTransaction}}
 */
export default function CustomerTransactionPaymentPlaceholder({ customerTransaction }) {
  let interval;
  const [timeout, setTimoutData] = useState('- Jam - Menit - Detik');

  const transferSteps = [
    'Transfer dapat melalui eBanking, atm, dll.',
    'Masukan tujuan rekening diatas.',
    'Masukan jumlah transfer beserta 3 digit dibelakang.',
    'Simpan bukti transfer dan upload.',
    'Tunggu sekitar 10 menit, pembayaran akan diverifikasi otomatis.',
  ];

  function refreshTimeout() {
    if (!customerTransaction?.expiredAt) return;
    const now = new Date();
    const { hours, minutes, seconds } = intervalToDuration({
      start: now,
      end: new Date(customerTransaction.expiredAt),
    });
    if (!hours && !minutes && !seconds) {
      window.location.reload();
    }
    setTimoutData(`${hours ?? 0} Jam ${minutes ?? 0} Menit ${seconds ?? 0} Detik`);
  }

  useEffect(() => {
    interval = setInterval(refreshTimeout, 1000);
  });

  if (customerTransaction.status === 'verify')
    return (
      <div className="tw-w-full tw-bg-warning/20 tw-ring-1 tw-ring-warning tw-text-xs tw-text-center tw-p-3 tw-mt-3 tw-rounded-lg tw-mb-5">
        <span className="tw-text-lg tw-font-semibold tw-uppercase tw-text-orange-600">
          Dalam Verifikasi
        </span>
        <p className="tw-mt-3">
          Pembayaran anda sedang dalam tahap verifikasi kami, harap menunggu anda akan mendapatkan
          notifikasi pembayaran apabila telah berhasil.
        </p>
      </div>
    );

  return (
    <div className="tw-flex tw-flex-col tw-p-4 tw-ring-gray-200 tw-rounded-lg">
      {/* Timeout */}
      <div className="tw-ring-red-500 tw-ring-1 tw-rounded-md tw-p-3 tw-bg-red-100 tw-flex tw-flex-col tw-items-center tw-justify-center">
        <span className="tw-text-xs">Batas waktu pembayaran :</span>
        <span className="tw-text-xs tw-font-semibold tw-text-red-500 tw-mt-1">{timeout}</span>
      </div>
      {/* Amount */}
      <div className="tw-flex tw-flex-col tw-items-center tw-justify-center tw-mt-5">
        <span className="tw-text-xs">Jumlah Tagihan :</span>
        <span className="tw-text-xl tw-font-semibold tw-mt-1">
          Rp.{' '}
          {(() => {
            const formattedAmount = customerTransaction?.totalAmount
              .toString()
              .toNumber()
              .formatCurrency();
            const mainPart = formattedAmount.slice(0, -3);
            const lastThree = formattedAmount.slice(-3);
            return (
              <>
                {mainPart}
                <span className="tw-text-primary">{lastThree}</span>
              </>
            );
          })()}
        </span>
      </div>
      {/* Warn */}
      <div className="tw-w-full tw-bg-warning/20 tw-ring-1 tw-ring-warning tw-text-xs tw-text-center tw-p-3 tw-mt-3 tw-rounded-lg tw-mb-5">
        Transfer sesuai jumlah tagihan hingga 3 digit terakhir agar proses verifikasi lancar
      </div>
      <div className="tw-w-48 tw-mx-auto tw-mb-4">
        <Button
          variant="outlined"
          color="primary"
          size="small"
          fullWidth
          onClick={() => {
            copyText(customerTransaction?.totalAmount, 'Jumlah tagihan disalin');
          }}
        >
          Salin Jumlah Tagihan
        </Button>
      </div>
      <Divider />
      {/* Rekening */}
      <div className="tw-flex tw-flex-col tw-items-center tw-justify-center tw-mt-4">
        <span className="tw-text-xs">
          Silahkan Transfer Melalui Nomor Rekening / E-Wallet Berikut :
        </span>
        <div className="tw-flex tw-flex-col sm:tw-flex-row tw-p-4 tw-items-center tw-ring-1 tw-rounded-lg tw-ring-gray-300 tw-w-full tw-mt-3 tw-gap-2">
          <img
            src={`/assets/bank/${getBankImagePath(customerTransaction?.accountBank ?? '')}`}
            alt={customerTransaction?.bank}
            className="tw-h-10 tw-aspect-video tw-object-contain"
          />
          <div className="tw-w-full tw-items-center tw-justify-between tw-flex tw-flex-row">
            <Stack>
              <span className="tw-text-xs">{customerTransaction.accountName}</span>
              <span className="tw-text-xs">{customerTransaction.accountNumber}</span>
            </Stack>
            <Stack>
              <IconButton
                color="primary"
                onClick={() => {
                  copyText(customerTransaction.accountNumber, 'No. Rekening disalin');
                }}
              >
                <Iconify icon="ri:file-copy-2-fill" />
              </IconButton>
              <span className="tw-text-xs">Salin</span>
            </Stack>
          </div>
        </div>
      </div>
      <Divider />
      {/* Petunjuk Transper */}
      <div className="tw-flex tw-flex-col tw-items-center tw-justify-center tw-mt-4">
        <span className="tw-text-xs">Petunjuk Transfer :</span>
        <ul className="tw-list-decimal tw-text-xs tw-mt-4 tw-space-y-1">
          {transferSteps.map((t, i) => (
            <li key={i}>
              <span className="tw-text-xs">{t}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
