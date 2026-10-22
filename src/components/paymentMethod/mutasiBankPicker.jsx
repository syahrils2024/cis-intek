import { toast } from 'sonner';
import { Iconify } from '@components/iconify';
import { useBoolean } from '@hooks/use-boolean';
import { getBankImagePath } from '@utils/getBankImage';
import { useRef, useState, forwardRef, useImperativeHandle } from 'react';

import { LoadingButton } from '@mui/lab';
import {
  Stack,
  Dialog,
  useTheme,
  IconButton,
  DialogTitle,
  DialogActions,
  useMediaQuery,
  DialogContent,
} from '@mui/material';

import { useMutasiBankAccount } from 'src/stores/mutasiBankAccount';

/**
 * @typedef {import('src/stores/mutasiBankAccount').MutasiBankStore} MutasiBankStore
 * @typedef {import('src/repositories/mutasiBank').IMutasiBankAccount} MutasiBankAccount
 */

/**
 *
 * @param {{account: MutasiBankAccount; onPick: (account: MutasiBankAccount) => void; onRemove: () => void}} account
 */
export function MutasiBankCard({ account, onPick, onRemove }) {
  return (
    <button type="button" onClick={() => onPick(account)}>
      <div className="tw-ring-1 tw-ring-gray-400 tw-rounded tw-p-3 hover:tw-ring-0 hover:tw-shadow-lg tw-duration-200 tw-flex tw-flex-row tw-items-center tw-justify-between tw-gap-2">
        <div className="tw-flex tw-flex-row tw-gap-2 tw-text-left">
          <img
            src={`/assets/bank/${getBankImagePath(account.bank)}`}
            alt={account.bank}
            className="tw-h-8"
          />
          <Stack>
            <span className="tw-text-xs">{account.account_no}</span>
            <span className="tw-text-xs">{account.account_name}</span>
          </Stack>
        </div>
        {onRemove && (
          <IconButton color="error" onClick={onRemove}>
            <Iconify icon="mdi:close" />
          </IconButton>
        )}
      </div>
    </button>
  );
}

const MutasiBankPicker = forwardRef((props, ref) => {
  /** @type {MutasiBankStore} */
  const mutasiBankAccount = useMutasiBankAccount();
  const resolver = useRef();
  const [currentId, setCurrentId] = useState(null);
  const showDialog = useBoolean(false);
  const isLoading = useBoolean(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  function close(data) {
    resolver.current(data);
    setCurrentId(null);
    showDialog.onFalse();
  }

  async function prefetch() {
    isLoading.onTrue();
    try {
      if (mutasiBankAccount.accounts.length <= 0) {
        await mutasiBankAccount.prefetch();
      }
    } catch (error) {
      console.error(error);
      toast.error(error);
    } finally {
      isLoading.onFalse();
    }
  }

  function open(existId) {
    showDialog.onTrue();
    if (existId) setCurrentId(existId);
    prefetch();
    return new Promise((resolve) => {
      resolver.current = resolve;
    });
  }

  useImperativeHandle(ref, () => ({ open }));

  return (
    <Dialog open={showDialog.value} fullWidth maxWidth="sm" fullScreen={isMobile}>
      <DialogTitle>Pilih Akun Bank</DialogTitle>
      <DialogContent>
        <div className="tw-flex tw-flex-col tw-gap-2 tw-py-2">
          {mutasiBankAccount.accounts.map((account, i) => (
            <MutasiBankCard account={account} key={i} onPick={(a) => close(a)} />
          ))}
        </div>
      </DialogContent>
      <DialogActions>
        <LoadingButton color="error" loading={isLoading.value} onClick={() => close()}>
          Batal
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
});

export default MutasiBankPicker;
