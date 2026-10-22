import { Iconify } from '@components/iconify';
import { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';

import { LoadingButton } from '@mui/lab';
import {
  Stack,
  Alert,
  Dialog,
  Button,
  useTheme,
  MenuItem,
  Checkbox,
  TextField,
  DialogTitle,
  useMediaQuery,
  DialogContent,
  DialogActions,
  FormControlLabel,
} from '@mui/material';

import 'src/extension/string';
import 'src/extension/number';

import { useMigrationPackageBatchState } from './MigrationPackageBatch.state';

const MigrationPackageBatch = forwardRef((props, ref) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const {
    area,
    clear,
    fromPackageId,
    open: prefetch,
    packageList,
    show,
    toPackageId,
    disabledSubmit,
    setFromPackageId,
    setToPackageId,
    filteredPackageList,
    submit,
    checkboxUserLabel,
    checkedUser,
    loading,
    countTotalCustomers,
    totalCustomers,
  } = useMigrationPackageBatchState();

  const resolver = useRef();

  function close() {
    show.onFalse();
    resolver.current();
    clear();
  }

  function open(areaId) {
    show.onTrue();
    prefetch(areaId);
    return new Promise((resolve) => {
      resolver.current = resolve;
    });
  }

  useImperativeHandle(ref, () => ({ open, close }));

  useEffect(() => {
    if (fromPackageId === '') return;
    countTotalCustomers();
  }, [fromPackageId]);
  return (
    <Dialog open={show.value} fullWidth maxWidth="sm" fullScreen={isMobile}>
      <DialogTitle>Migrasi Paket Internet</DialogTitle>
      <DialogContent>
        <Stack gap={2} className="tw-py-2">
          <Stack direction="row" gap={2} alignItems="center">
            <TextField
              fullWidth
              value={fromPackageId}
              label="Paket Sebelumnya"
              size="small"
              select
              onChange={(e) => setFromPackageId(e.target.value)}
            >
              {packageList.map((p) => (
                <MenuItem key={p._id} value={p._id}>
                  {p.title} (Rp. {p.price.toString().toNumber().formatCurrency()})
                </MenuItem>
              ))}
            </TextField>
            <Iconify icon="mingcute:arrow-right-line" />
            <TextField
              fullWidth
              value={toPackageId}
              label="Paket Sesudahnya"
              size="small"
              select
              onChange={(e) => setToPackageId(e.target.value)}
            >
              {filteredPackageList.map((p) => (
                <MenuItem key={p._id} value={p._id}>
                  {p.title} (Rp. {p.price.toString().toNumber().formatCurrency()})
                </MenuItem>
              ))}
            </TextField>
          </Stack>
          {totalCustomers !== 0 ? (
            <Alert severity="warning">
              <span className="tw-text-xs">
                {totalCustomers} Pelanggan aktif akan dimigrasi paket internetnya.
              </span>
            </Alert>
          ) : null}

          <Alert severity="warning">
            <span className="tw-text-xs">
              Pastikan hanya bandwith yang berubah, fitur ini digunakan untuk memindahkan paket
              bandwith pelanggan secara massal (tanpa tagihan / billing)
            </span>
          </Alert>
          <FormControlLabel
            label={checkboxUserLabel}
            control={
              <Checkbox
                value={checkedUser.value}
                onChange={(e) => checkedUser.setValue(e.target.checked)}
              />
            }
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button color="error" variant="text" onClick={() => close()}>
          Tutup
        </Button>
        <LoadingButton
          loading={loading.value}
          disabled={disabledSubmit.value || !checkedUser.value}
          color="primary"
          variant="contained"
          onClick={() => submit()}
        >
          Migrasi Masal
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
});

export default MigrationPackageBatch;
