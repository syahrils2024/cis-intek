import { toast } from 'sonner';
import { useBoolean } from '@hooks/use-boolean';
import { endOfMonth, startOfMonth } from 'date-fns';
import { useAppPicker } from '@hooks/use-app-picker';
import { useRef, useMemo, useState, useEffect } from 'react';

import { useTheme, useMediaQuery } from '@mui/material';

import 'src/extension/date';
import 'src/extension/number';
import { userWalletRepository } from 'src/repositories';

/**
 * @typedef {import("src/repositories/userWallet").UserWallet} UserWallet
 * @typedef {import("src/repositories/userWallet").UserWalletLog} UserWalletLog
 */

export function useUserWalletLogDialogState() {
  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down('md'));
  const loading = useBoolean(false);
  const show = useBoolean(false);
  const [start, setStart] = useState(startOfMonth(new Date()));
  const [until, setUntil] = useState(endOfMonth(new Date()));
  const appPicker = useAppPicker();

  const [anchorEl, setAnchorEl] = useState(null);
  /** @type {[UserWalletLog, Function]} */
  const [selectedWalletLog, setSelectedWalletLog] = useState(null);

  const withdrawConfirmRef = useRef();

  /** @type {[UserWallet, Function]} */
  const [wallet, setWallet] = useState(null);

  /** @type {[UserWalletLog[], Function]} */
  const [logs, setLogs] = useState([]);

  const headerData = useMemo(() => {
    const items = {
      User: wallet?.fullname ?? '-',
      'Kas Kolektor': wallet?.balance?.formatCurrency() ?? '-',
    };

    return Object.entries(items).map(([key, value]) => ({ label: key, value }));
  }, [wallet]);

  async function load(userId) {
    loading.onTrue();
    try {
      const startFormat = start.format('yyyy-MM-dd');
      const untilFormat = until.format('yyyy-MM-dd');
      const snapshot = await userWalletRepository.getUserWalletLog({
        userId,
        start: startFormat,
        until: untilFormat,
      });

      const mapSnapshot = snapshot.data.map((item, i) => {
        Object.assign(item, { id: i });
        return item;
      });

      setLogs(mapSnapshot);
    } catch (err) {
      if (err instanceof Error) toast.error(err.message);
    } finally {
      loading.onFalse();
    }
  }

  /** @param {UserWallet} item */
  function open(item) {
    setWallet(item);
    load(item._id);
    show.onTrue();
  }

  function close() {
    show.onFalse();
    setWallet(null);
    setLogs([]);
  }

  /**
   * Handle view evidence
   * @param {React.MouseEvent} e
   * @param {UserWalletLog} evidences
   */
  function viewEvidence(e, evidences) {
    setAnchorEl(e.currentTarget);
    setSelectedWalletLog(evidences);
  }

  function closeEvidence() {
    setAnchorEl(null);
    setSelectedWalletLog(null);
  }

  function previewImage(url) {
    appPicker.imageViewerDialog.open([url], 'Preview');
  }

  async function withdraw() {
    const result = await withdrawConfirmRef.current?.open(wallet);
    if (result) load(wallet._id);
  }

  useEffect(() => {
    if (!wallet) return;
    load(wallet._id);
  }, [start, until]);

  return {
    state: {
      start,
      until,
      wallet,
      logs,
      loading,
      show,
      mobile,
      headerData,
      anchorEl,
      selectedWalletLog,
    },
    ref: {
      withdrawConfirmRef,
    },
    handlers: {
      setStart,
      setUntil,
      open,
      close,
      load,
      withdraw,
      viewEvidence,
      closeEvidence,
      previewImage,
    },
  };
}
