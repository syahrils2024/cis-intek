import { toast } from 'sonner';
import { Iconify } from '@components/iconify';
import { useRef, forwardRef, useImperativeHandle } from 'react';
import AreaPickerFilter from '@components/billing/areaPickerFilter';
import PPPoENameDialogPicker from '@components/PppoeNameDialogPicker';

import { LoadingButton } from '@mui/lab';
import {
  Stack,
  Button,
  Dialog,
  Divider,
  Checkbox,
  useTheme,
  TextField,
  DialogTitle,
  DialogContent,
  DialogActions,
  useMediaQuery,
  FormControlLabel,
} from '@mui/material';

import 'src/extension/string';
import 'src/extension/number';

import { PackageFormDialogData } from './packageFormDialogData';
import { usePackageFormDialogState } from './packageFormDialog.state';

const PackageFormDialog = forwardRef((props, ref) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const {
    addAreaToPrice,
    addPrice,
    loading,
    prices,
    removeAreaFromPrice,
    removePrice,
    resetPrices,
    setPrice,
    setPrices,
    show,
    title,
    setTitle,
    packageActive,
    packageFree,
    setPPPoE,
    loadingSubmit,
    submit,
    reset,
    load,
    duplicate
  } = usePackageFormDialogState();

  const resolver = useRef();

  const areaPickerFilterRef = useRef();
  const pppoePickerRef = useRef();
  async function pickArea(index) {
    const area = await areaPickerFilterRef.current.open(null, false);
    if (!area) return;

    const exists = prices[index].areas.some((a) => a.areaId === area._id);
    if (exists) {
      toast.error(`${area.name} sudah ada di daftar harga ini`);
      return;
    }

    const pppoeName = await pppoePickerRef.current.open(area._id);
    if (!pppoeName) return;

    addAreaToPrice(index, {
      areaId: area._id,
      areaName: area.name,
      pppoeName,
    });
  }

  async function changePPPoE(index, areaIndex, area) {
    const pppoeName = await pppoePickerRef.current.open(area.areaId);
    if (!pppoeName) return;

    setPPPoE(index, areaIndex, pppoeName);
  }

  async function submitPackage() {
    loadingSubmit.onTrue();
    try {
      await submit();
      toast.success('Paket Internet berhasil disimpan');
      closeSuccess();
    } catch (error) {
      toast.error(error.message);
    } finally {
      loadingSubmit.onFalse();
    }
  }

  function open(id, isDuplicated = false) {
    reset();
    show.onTrue();
    duplicate.setValue(isDuplicated);
    if (id) {
      load(id, isDuplicated);
    }
    return new Promise((resolve) => {
      resolver.current = resolve;
    });
  }

  function close() {
    show.onFalse();
    resolver.current?.();
  }

  function closeSuccess() {
    show.onFalse();
    resolver.current?.(true);
  }

  useImperativeHandle(ref, () => ({
    open,
    close,
  }));

  return (
    <>
      <Dialog maxWidth="sm" fullWidth open={show.value} fullScreen={isMobile}>
        <DialogTitle>Form Paket Internet</DialogTitle>
        <DialogContent className="tw-w-full">
          <Stack spacing={2} className="tw-w-full tw-py-2">
            <TextField
              value={title}
              fullWidth
              size="small"
              label="Nama Paket Internet"
              onChange={(e) => setTitle(e.target.value)}
            />
            <div className="tw-w-full tw-flex tw-flex-wrap tw-gap-2">
              <FormControlLabel
                label="Active"
                control={
                  <Checkbox
                    checked={packageActive.value}
                    onChange={(e) => packageActive.setValue(e.target.checked)}
                  />
                }
              />
              <FormControlLabel
                label="Free"
                control={
                  <Checkbox
                    checked={packageFree.value}
                    onChange={(e) => packageFree.setValue(e.target.checked)}
                  />
                }
              />
            </div>
            <Divider />
            {/* Prices Items */}
            <Stack spacing={1}>
              {prices.map((item, index) => (
                <div key={index} className="tw-p-4 tw-ring-1 tw-ring-gray-400 tw-rounded-lg">
                  <Stack spacing={1.5}>
                    <Stack spacing={0.5}>
                      <span className="tw-text-xs">Harga</span>
                      <TextField
                        fullWidth
                        size="small"
                        value={item.price.toString().toNumber().formatCurrency()}
                        onChange={(e) => setPrice(index, e.target.value.toString().toNumber())}
                      />
                    </Stack>
                    {/* Area Items */}
                    <PackageFormDialogData.Table
                      items={item.areas}
                      onChangePPPoE={(areaData, areaIndex) =>
                        changePPPoE(index, areaIndex, areaData)
                      }
                      onRemove={(areaData, areaIndex) => removeAreaFromPrice(index, areaIndex)}
                    />
                    {/* End Area Items */}
                    <div className="tw-w-full tw-flex tw-flex-row tw-items-center tw-justify-end tw-gap-2">
                      {prices.length > 1 ? (
                        <Button
                          color="error"
                          variant="soft"
                          size="small"
                          className="tw-gap-1"
                          onClick={() => removePrice(index)}
                        >
                          <Iconify icon="mdi:remove" />
                          Hapus
                        </Button>
                      ) : null}

                      <Button
                        color="success"
                        variant="soft"
                        size="small"
                        className="tw-gap-1"
                        onClick={() => pickArea(index)}
                      >
                        <Iconify icon="mdi:plus" />
                        Area
                      </Button>
                    </div>
                  </Stack>
                </div>
              ))}
            </Stack>
            {/* End Prices Items */}
            <Divider />
            <div className="tw-w-full tw-flex tw-flex-row tw-items-center tw-justify-end">
              <Button
                color="success"
                variant="soft"
                size="small"
                className="tw-gap-1"
                onClick={addPrice}
              >
                <Iconify icon="mdi:plus" />
                Tambah
              </Button>
            </div>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button variant="text" color="error" size="small" onClick={() => close()}>
            Tutup
          </Button>
          <LoadingButton
            loading={loadingSubmit.value}
            variant="contained"
            color="primary"
            size="small"
            onClick={() => submitPackage()}
          >
            Simpan
          </LoadingButton>
        </DialogActions>
      </Dialog>
      <AreaPickerFilter ref={areaPickerFilterRef} />
      <PPPoENameDialogPicker ref={pppoePickerRef} />
    </>
  );
});

export default PackageFormDialog;
