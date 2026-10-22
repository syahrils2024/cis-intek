/**
 * @typedef {import("src/repositories/customer").Customer} Customer
 * @typedef {import("src/repositories/inventory").Inventory} Inventory
 *
 * @typedef {Object} InventoryUsageItem
 * @property {string} resource
 * @property {number} quantity
 */

import { z } from 'zod';
import { toast } from 'sonner';
import { Icon } from '@iconify/react';
import { useForm } from 'react-hook-form';
import { Iconify } from '@components/iconify';
import { useBoolean } from '@hooks/use-boolean';
import { createSelector } from '@reduxjs/toolkit';
import { Form, Field } from '@components/hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDispatch, useSelector } from 'react-redux';
import { useMemo, useState, Fragment, useEffect } from 'react';

import Grid from '@mui/material/Unstable_Grid2';
import { Stack, useTheme, useMediaQuery } from '@mui/system';
import { TabPanel, TabContext, LoadingButton } from '@mui/lab';
import {
  Step,
  Dialog,
  Button,
  Stepper,
  MenuItem,
  TextField,
  StepLabel,
  IconButton,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';

import { setItems } from 'src/stores/inventoryStore';
import { inventoryRepository, installationRepository } from 'src/repositories';

import InstallationReportDialogAddons from './installationReportDialogAddons';

const validator = z.object({
  OPMResultPhoto: z.instanceof(File).nullable(),
  installedModemPhoto: z.instanceof(File).nullable(),
  modelSerialNumberPhoto: z.instanceof(File).nullable(),
  clientHousePhoto: z.instanceof(File).nullable(),
});

/**
 * @param {{selectedCustomer: Customer; show: boolean; onClose: void}} props
 */

export function InstallationReportDialog({ selectedCustomer, show, onClose }) {
  /**
   * @typedef {[InventoryUsageItem[], void]}
   */
  const [inventoryUsed, setInventoryUsed] = useState([{ resource: '', quantity: 1 }]);
  const theme = useTheme();
  const dispatch = useDispatch();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const loading = useBoolean(false);

  const [selectedStep, setSelectedStep] = useState('0');

  const invetoryItemsSelector = createSelector(
    (state) => state.inventoryStore,
    (inventoryStore) => inventoryStore.items
  );
  /**
   * @type {Inventory[]}
   */
  const inventoryItems = useSelector(invetoryItemsSelector);

  const selectInventoryItem = (index, inventoryId) => {
    const items = [...inventoryUsed];
    const item = { ...items[index] };
    item.resource = inventoryId;
    items[index] = item;
    setInventoryUsed(items);
  };

  const setQuantityInventoryItem = (index, quantity) => {
    const items = [...inventoryUsed];
    const item = { ...items[index] };
    item.quantity = quantity;
    items[index] = item;
    setInventoryUsed(items);
  };

  const onRemoveItem = (index) => {
    if (inventoryUsed.length <= 1) return;
    const items = [...inventoryUsed];
    items.splice(index, 1);
    setInventoryUsed(items);
  };

  const onAddItem = () => {
    setInventoryUsed((items) => [...items, { quantity: 1, resource: '' }]);
  };

  const defaultValues = {
    OPMResultPhoto: null,
    installedModemPhoto: null,
    modelSerialNumberPhoto: null,
    clientHousePhoto: null,
  };

  /**
   * @type {[string, void]}
   */
  const [placeholderOPMResultPhoto, setPlaceholderOPMResultPhoto] = useState(null);

  /**
   * @type {[string, void]}
   */
  const [installedModemPhoto, setInstalledModemPhoto] = useState(null);

  /**
   * @type {[string, void]}
   */
  const [modelSerialNumberPhoto, setModelSerialNumberPhoto] = useState(null);

  /**
   * @type {[string, void]}
   */
  const [clientHousePhoto, setClientHousePhoto] = useState(null);

  /**
   * @type {[Array<{addons: string; addonsName: string; photo: string; file?: File}>, void]}
   */
  const [installationAddons, setInstallationAddons] = useState([]);

  const steps = [
    { key: '0', label: 'Foto PSB' },
    { key: '1', label: 'Foto Addons' },
    { key: '2', label: 'Penggunaan Stok' },
  ];

  const computedSteps = useMemo(() => {
    if (installationAddons.length > 0) {
      return steps;
    }
    return steps.filter((s) => s.key !== '1');
  });

  function changeStepPage(mode) {
    const currentStep = parseInt(selectedStep);
    let nextStep = Math.min(2, currentStep + 1).toString();
    let prevStep = Math.max(0, currentStep - 1).toString();

    if (nextStep === '1' && installationAddons.length <= 0) {
      nextStep = '2';
    }

    if (prevStep === '1' && installationAddons.length <= 0) {
      prevStep = '0';
    }

    if (mode === 'next') {
      setSelectedStep(nextStep);
    } else if (mode === 'prev') {
      setSelectedStep(prevStep);
    }
  }

  const methods = useForm({ defaultValues, resolver: zodResolver(validator) });
  const { handleSubmit } = methods;

  const checkInstallationReportIsExist = async () => {
    const snapshot = await installationRepository
      .getSomeInstallationRequest(selectedCustomer._id)
      .catch((err) => undefined);

    if (!snapshot) return;

    /**
     * Map Items
     */
    const mapResource = snapshot.usedResources.map((r) => ({
      quantity: r.quantity,
      resource: r.resource,
    }));

    setInventoryUsed((items) => [...mapResource]);

    setPlaceholderOPMResultPhoto(snapshot.OPMResultPhoto ?? null);
    setInstalledModemPhoto(snapshot.installedModemPhoto ?? null);
    setModelSerialNumberPhoto(snapshot.modemSerialNumberPhoto ?? null);
    setClientHousePhoto(snapshot.clientHousePhoto ?? null);
    setInstallationAddons(snapshot.installationAddons ?? []);
  };

  const prefetch = async () => {
    try {
      checkInstallationReportIsExist();
      if (inventoryItems.length <= 0) {
        const snapshot = await inventoryRepository.getInventoryItems();
        dispatch(setItems(snapshot));
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const submit = async (data) => {
    loading.onTrue();
    try {
      inventoryUsed.forEach((i, index) => {
        if (i.resource === '') throw new Error(`Lengkapi stok pada nomor ${index + 1}`);
        if (i.quantity < 1) throw new Error(`Quantity pada nomor ${index + 1} minimal 1`);
      });
      const items = inventoryUsed.map((d) => {
        d.quantity = parseInt(d.quantity.toString());
        return d;
      });

      await installationRepository.submitInstallationReport(selectedCustomer._id, {
        usedResources: items,
        clientHousePhoto: data.clientHousePhoto,
        OPMResultPhoto: data.OPMResultPhoto,
        installedModemPhoto: data.installedModemPhoto,
        modemSerialNumberPhoto: data.modelSerialNumberPhoto,
      });

      const addons = installationAddons
        .filter((a) => !!a.file)
        .map((addon) => ({
          addons: addon.addons,
          photo: addon.file,
        }));

      if (addons.length > 0) {
        await installationRepository.submitInstallationAddons({
          customer: selectedCustomer._id,
          addons,
        });
      }

      const message =
        selectedCustomer?.status === 'processed'
          ? 'Berhasil mengirim laporan instalasi'
          : 'Berhasil menyimpan';
      toast.success(message);
      onClose(true);
    } catch (error) {
      toast.error(error.message);
    } finally {
      loading.onFalse();
    }
  };

  // const onBeforeNext = () => {
  //   const OPMResultFoto = methods.getValues('OPMResultPhoto');
  //   const clientHousePhoto = methods.getValues('clientHousePhoto');
  //   const installedModemPhoto = methods.getValues('installedModemPhoto');
  //   const modelSerialNumberPhoto = methods.getValues('modelSerialNumberPhoto');
  // };

  useEffect(() => {
    if (!show) {
      methods.reset();
      setInventoryUsed([{ resource: '', quantity: 1 }]);
      setSelectedStep('0');
      setPlaceholderOPMResultPhoto(null);
      setInstalledModemPhoto(null);
      setModelSerialNumberPhoto(null);
      setClientHousePhoto(null);
      setInstallationAddons([]);
      return;
    }
    prefetch();
  }, [show]);

  return (
    <Form methods={methods}>
      <Dialog open={show} onClose={onClose} fullWidth maxWidth="sm" fullScreen={isMobile}>
        <DialogTitle>Laporan Instalasi</DialogTitle>
        <DialogContent>
          <TabContext value={selectedStep}>
            <Stepper alternativeLabel activeStep={parseInt(selectedStep)}>
              {computedSteps.map((s) => (
                <Step key={s.key} onClick={() => setSelectedStep(s.key)}>
                  <StepLabel>{s.label}</StepLabel>
                </Step>
              ))}
            </Stepper>
            <TabPanel value="0">
              <Stack spacing={2}>
                <Stack>
                  {placeholderOPMResultPhoto ? (
                    <div className="tw-relative tw-w-1/2 md:tw-w-1/3 tw-mx-auto tw-items-center tw-justify-center tw-flex">
                      <div className="tw-absolute tw-top-0 tw-right-0">
                        <IconButton
                          color="error"
                          onClick={() => setPlaceholderOPMResultPhoto(null)}
                        >
                          <Iconify icon="mdi:close" />
                        </IconButton>
                      </div>
                      <img
                        src={`/public/uploads/${placeholderOPMResultPhoto}`}
                        className="tw-rounded-full tw-aspect-square tw-object-cover"
                        alt={placeholderOPMResultPhoto}
                      />
                    </div>
                  ) : (
                    <Field.UploadAvatar name="OPMResultPhoto" label="Hasil Foto OPM" />
                  )}
                  <span className="tw-text-xs tw-font-semibold tw-text-center">Hasil Foto OPM</span>
                </Stack>
                <Stack>
                  {installedModemPhoto ? (
                    <div className="tw-relative tw-w-1/2 md:tw-w-1/3 tw-mx-auto tw-items-center tw-justify-center tw-flex">
                      <div className="tw-absolute tw-top-0 tw-right-0">
                        <IconButton color="error" onClick={() => setInstalledModemPhoto(null)}>
                          <Iconify icon="mdi:close" />
                        </IconButton>
                      </div>
                      <img
                        src={`/public/uploads/${installedModemPhoto}`}
                        className="tw-rounded-full tw-aspect-square tw-object-cover"
                        alt={installedModemPhoto}
                      />
                    </div>
                  ) : (
                    <Field.UploadAvatar name="installedModemPhoto" label="Foto Instalasi Model" />
                  )}
                  <span className="tw-text-xs tw-font-semibold tw-text-center">
                    Foto Instalasi Modem
                  </span>
                </Stack>
                <Stack>
                  {modelSerialNumberPhoto ? (
                    <div className="tw-relative tw-w-1/2 md:tw-w-1/3 tw-mx-auto tw-items-center tw-justify-center tw-flex">
                      <div className="tw-absolute tw-top-0 tw-right-0">
                        <IconButton color="error" onClick={() => setModelSerialNumberPhoto(null)}>
                          <Iconify icon="mdi:close" />
                        </IconButton>
                      </div>
                      <img
                        src={`/public/uploads/${modelSerialNumberPhoto}`}
                        className="tw-rounded-full tw-aspect-square  tw-object-cover"
                        alt={modelSerialNumberPhoto}
                      />
                    </div>
                  ) : (
                    <Field.UploadAvatar name="modelSerialNumberPhoto" label="Foto SN Modem/ONU" />
                  )}
                  <span className="tw-text-xs tw-font-semibold tw-text-center">
                    Foto SN Modem/ONU
                  </span>
                </Stack>
                <Stack>
                  {clientHousePhoto ? (
                    <div className="tw-relative tw-w-1/2 md:tw-w-1/3 tw-mx-auto tw-items-center tw-justify-center tw-flex">
                      <div className="tw-absolute tw-top-0 tw-right-0">
                        <IconButton color="error" onClick={() => setClientHousePhoto(null)}>
                          <Iconify icon="mdi:close" />
                        </IconButton>
                      </div>
                      <img
                        src={`/public/uploads/${clientHousePhoto}`}
                        className="tw-rounded-full tw-aspect-square tw-object-cover"
                        alt={clientHousePhoto}
                      />
                    </div>
                  ) : (
                    <Field.UploadAvatar name="clientHousePhoto" label="Foto Rumah Pelanggan" />
                  )}
                  <span className="tw-text-xs tw-font-semibold tw-text-center">
                    Foto Rumah Pelanggan
                  </span>
                </Stack>
              </Stack>
            </TabPanel>
            <TabPanel value="1">
              <InstallationReportDialogAddons
                addons={installationAddons}
                onAddonChange={setInstallationAddons}
              />
            </TabPanel>
            <TabPanel value="2">
              <Grid container spacing={2}>
                {inventoryUsed.map((used, a) => (
                  <Fragment key={a}>
                    <Grid xs={8} key={a}>
                      <TextField
                        select
                        value={used.resource}
                        label="Stok"
                        size="small"
                        fullWidth
                        onChange={(e) => selectInventoryItem(a, e.target.value)}
                      >
                        <MenuItem disabled value="">
                          Pilih Stok
                        </MenuItem>
                        {inventoryItems.map((item, i) => (
                          <MenuItem key={i} value={item._id}>
                            {item.name} ({item.unitType})
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                    <Grid xs={3}>
                      <TextField
                        value={used.quantity}
                        type="number"
                        min={1}
                        label="Quantity"
                        size="small"
                        fullWidth
                        onChange={(e) => setQuantityInventoryItem(a, e.target.value)}
                      />
                    </Grid>
                    <Grid xs={1}>
                      <button
                        onClick={() => onRemoveItem(a)}
                        type="button"
                        className="tw-my-auto tw-mt-2"
                      >
                        <Icon icon="ic:baseline-close" fontSize={24} color="red" />
                      </button>
                    </Grid>
                  </Fragment>
                ))}
                <Grid xs={12} className="tw-flex tw-flex-row tw-items-center tw-justify-end">
                  <Button onClick={onAddItem} color="primary" variant="outlined" size="small">
                    Tambah Item
                  </Button>
                </Grid>
              </Grid>
            </TabPanel>
          </TabContext>
        </DialogContent>
        <DialogActions>
          <Button color="error" onClick={() => onClose()}>
            Batal
          </Button>
          {['1', '2'].includes(selectedStep) ? (
            <Button onClick={() => changeStepPage('prev')}>Prev</Button>
          ) : null}
          {['0', '1'].includes(selectedStep) ? (
            <Button onClick={() => changeStepPage('next')}>Next</Button>
          ) : null}

          {selectedStep === '2' && (
            <LoadingButton
              loading={loading.value}
              color="success"
              variant="contained"
              onClick={handleSubmit(submit)}
            >
              {selectedCustomer?.status === 'processed' ? 'Kirim' : 'Simpan'}
            </LoadingButton>
          )}
        </DialogActions>
      </Dialog>
    </Form>
  );
}
