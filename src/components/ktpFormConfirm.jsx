/**
 * @typedef {import("@/repositories/ktp").KtpOcrResult} KtpOcrResult
 */

import { parserPlaceDob } from '@utils/ktp';
import { useBoolean } from '@hooks/use-boolean';
import { useRef, useState, forwardRef, useImperativeHandle } from 'react';

import {
  Dialog,
  Button,
  useTheme,
  DialogTitle,
  DialogContent,
  useMediaQuery,
  DialogActions,
} from '@mui/material';

const KtpFormConfirm = forwardRef((props, ref) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  /**
   * @type {[KtpOcrResult, (data: KtpOcrResult) => void]}
   */
  const [ktpData, setKtpData] = useState(null);
  const showDialog = useBoolean(false);

  const resolver = useRef();

  /**
   * @param {KtpOcrResult} data
   */
  function confirm(data) {
    setKtpData(data);
    showDialog.onTrue();
    return new Promise((resolve) => {
      resolver.current = resolve;
    });
  }

  async function close(isConfirm) {
    if (isConfirm) {
      const data = ktpData;
      const parser = await parserPlaceDob(data.place_dob ?? '').catch((_) => null);
      data.placeDob = parser?.placeDob;
      data.dateOfBirth = parser?.dateOfBirth;
      resolver.current(data);
    } else {
      resolver.current(undefined);
    }
    showDialog.onFalse();
    setKtpData(null);
  }

  useImperativeHandle(ref, () => ({ confirm }));

  return (
    <Dialog open={showDialog.value} fullWidth maxWidth="sm" fullScreen={isMobile}>
      <DialogTitle>KTP</DialogTitle>
      <DialogContent>
        <div className="tw-flex tw-flex-col tw-gap-2">
          <p className="tw-text-xs tw-font-medium">
            Apakah anda ingin menggunakan data KTP berikut?
          </p>
          <div className="tw-flex tw-flex-col">
            <span className="tw-text-xs tw-text-gray-500">Nama Lengkap</span>
            <span className="tw-text-xs tw-font-medium">{ktpData?.name}</span>
          </div>
          <div className="tw-flex tw-flex-col">
            <span className="tw-text-xs tw-text-gray-500">Tempat, Tanggal Lahir</span>
            <span className="tw-text-xs tw-font-medium">{ktpData?.place_dob}</span>
          </div>
          <div className="tw-flex tw-flex-col">
            <span className="tw-text-xs tw-text-gray-500">Alamat Lengkap</span>
            <span className="tw-text-xs tw-font-medium">
              {ktpData?.address_1}, {ktpData?.address_2} {ktpData?.address_3} {ktpData?.address_4},{' '}
              {ktpData?.district}, {ktpData?.province}
            </span>
          </div>
        </div>
      </DialogContent>
      <DialogActions>
        <Button color="error" onClick={() => close(false)}>
          Batal
        </Button>
        <Button color="success" variant="contained" onClick={() => close(true)}>
          Gunakan
        </Button>
      </DialogActions>
    </Dialog>
  );
});

export default KtpFormConfirm;
