import { Iconify } from '@components/iconify';
import Overloading from '@components/overloading';
import { useRef, forwardRef, useImperativeHandle } from 'react';

import Grid2 from '@mui/material/Unstable_Grid2';
import {
  Stack,
  Alert,
  Table,
  Dialog,
  Button,
  Divider,
  useTheme,
  Checkbox,
  TableRow,
  TextField,
  TableHead,
  TableCell,
  TableBody,
  IconButton,
  DialogTitle,
  useMediaQuery,
  DialogContent,
  DialogActions,
  FormControlLabel,
} from '@mui/material';

import 'src/extension/string';
import 'src/extension/number';

/** @typedef {import('src/stores/meStore').MeStore} MeStore */

import { LoadingButton } from '@mui/lab';

import { useMeStore } from 'src/stores/meStore';
import { labelHelper } from 'src/helpers/label.helper';

import { useCustomerActivateDialogState } from './ActivateDialog.state';

const CustomerActivateDialog = forwardRef((props, ref) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  /** @type {MeStore} */
  const { me } = useMeStore();

  const {
    prefetch,
    showDialog,
    loading,
    clear,
    customerInformations,
    allowSubmit,
    checkedUser,
    steps,
    loadingSubmit,
    deactivateError,
    mikrotikError,
    submit,
    addFee,
    removeFee,
    setFeeItems,
    fee,
    isUsingFee,
    usingInstallationFee,
    simulateBilling,
    getSimulateBillingDebounce,
    isSimulateBillingLoading,
    simulateBody,
    simulateHeaders,
  } = useCustomerActivateDialogState();

  const resolver = useRef();

  function open(customerId) {
    showDialog.onTrue();
    prefetch(customerId);

    return new Promise((resolve) => {
      resolver.current = resolve;
    });
  }

  function close() {
    showDialog.onFalse();
    clear();
    resolver.current();
  }

  useImperativeHandle(ref, () => ({ open, close }));

  return (
    <Dialog open={showDialog.value} fullWidth maxWidth="sm" fullScreen={isMobile}>
      <DialogTitle>Aktivasi Ulang Pelanggan</DialogTitle>
      <DialogContent>
        <Stack className="tw-py-2 tw-relative" gap={2}>
          <Overloading loading={loading.value || isSimulateBillingLoading.value} />
          <Grid2 container gap={1}>
            {customerInformations.map((info, index) => (
              <Grid2 xs={5.5} key={index}>
                <Stack spacing={0.2}>
                  <span className="tw-text-xs tw-text-gray-500">{info.title}</span>
                  <span className="tw-text-xs tw-font-semibold">{info.value}</span>
                </Stack>
              </Grid2>
            ))}
            <Grid2 xs={12}>
              <Alert severity="warning">
                <span className="tw-text-xs">
                  Reaktivasi bisa dilakukan apabila tidak memiliki tunggakan
                </span>
              </Alert>
            </Grid2>
          </Grid2>
          <Divider />
          {/* Optional Form */}
          <Grid2 container>
            <Grid2 sm={6}>
              <FormControlLabel
                label="Biaya Instalasi"
                control={
                  <Checkbox
                    checked={usingInstallationFee.value}
                    onChange={(e) => {
                      usingInstallationFee.setValue(e.target.checked);
                      getSimulateBillingDebounce();
                    }}
                  />
                }
              />
            </Grid2>
            <Grid2 sm={6}>
              <FormControlLabel
                label="Biaya Admin & Lainnya"
                control={
                  <Checkbox
                    checked={isUsingFee.value}
                    onChange={(e) => {
                      isUsingFee.setValue(e.target.checked);
                      getSimulateBillingDebounce();
                    }}
                  />
                }
              />
            </Grid2>
          </Grid2>
          {/* End Optional Form */}
          {/* Simulate Billing */}
          <Stack gap={1}>
            {!isUsingFee.value
              ? null
              : fee.map((f, i) => (
                  <div key={i} className="tw-p-4 tw-ring-1 tw-ring-gray-400 tw-rounded-lg">
                    <Stack key={i} spacing={1}>
                      <Stack spacing={0.3}>
                        <span className="tw-text-xs">Nama Biaya</span>
                        <TextField
                          size="small"
                          placeholder="cth: biaya admin"
                          value={f.name}
                          onChange={(e) =>
                            setFeeItems(i, {
                              name: e.target.value,
                            })
                          }
                        />
                      </Stack>
                      <Stack spacing={0.3}>
                        <span className="tw-text-xs">Jumlah Biaya</span>
                        <TextField
                          size="small"
                          placeholder="cth: 20.000"
                          value={fee[i].amount.toString().toNumber().formatCurrency()}
                          onChange={(e) =>
                            setFeeItems(i, {
                              amount: e.target.value.toNumber(),
                            })
                          }
                        />
                      </Stack>
                      <div className="tw-flex tw-flex-row w-full tw-items-center tw-gap-2 tw-justify-end">
                        {fee.length > 1 && (
                          <IconButton size="small" color="error" onClick={() => removeFee(i)}>
                            <Iconify icon="mdi:minus" />
                          </IconButton>
                        )}
                        {i === fee.length - 1 && (
                          <IconButton size="small" color="success" onClick={() => addFee()}>
                            <Iconify icon="mdi:plus" />
                          </IconButton>
                        )}
                      </div>
                    </Stack>
                  </div>
                ))}
            <Divider />
            {!!simulateBody.total && (
              <>
                <span className="tw-text-xs">Simulasi Billing</span>
                <Table>
                  <TableHead>
                    <TableRow>
                      {simulateHeaders.map((h, i) => (
                        <TableCell key={i}>{h}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {simulateBody.items.map((item, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <span className="tw-text-xs">
                            {labelHelper.billingCategory(item.billingCategory)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="tw-text-xs">{item.summaryPeriode}</span>
                        </TableCell>
                        <TableCell>
                          <span className="tw-text-xs">{item.services.join(', ')}</span>
                        </TableCell>
                        <TableCell>
                          <span className="tw-text-xs">
                            Rp. {item.amount.toString().toNumber().formatCurrency()}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={3}>
                        <span className="tw-text-xs tw-text-center tw-w-full">Total</span>
                      </TableCell>
                      <TableCell>
                        <span className="tw-text-xs tw-font-semibold">
                          Rp. {simulateBody.total.toString().toNumber().formatCurrency()}
                        </span>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </>
            )}
          </Stack>
          {/* End Simulate Billing */}
          <Divider />
          <Stack spacing={2}>
            {steps.map((s, i) => (
              <div
                key={i}
                className={`tw-flex tw-flex-row tw-items-center tw-gap-2 ${s.className}`}
              >
                <Iconify icon={s.iconName} />
                <span className="tw-text-xs">
                  {s.label} {s.labelStatus}
                </span>
              </div>
            ))}
          </Stack>
          {deactivateError && (
            <Alert severity="error">
              <span className="tw-text-xs">{deactivateError}</span>
            </Alert>
          )}
          {mikrotikError && (
            <Alert severity="warning">
              <span className="tw-text-xs">{mikrotikError}</span>
            </Alert>
          )}
          <FormControlLabel
            label={`${me?.fullname} menyetujui untuk aktivasi pelanggan ini`}
            control={
              <Checkbox
                checked={checkedUser.value}
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
          loading={loadingSubmit.value}
          disabled={!allowSubmit.value || !checkedUser.value}
          onClick={() => submit()}
          color="primary"
          variant="contained"
        >
          Aktivasi
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
});

export default CustomerActivateDialog;
