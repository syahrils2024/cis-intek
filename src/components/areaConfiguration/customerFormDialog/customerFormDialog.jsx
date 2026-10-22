import { Form } from '@components/hook-form';
import CropperImage from '@components/CropperImage';
import KtpFormConfirm from '@components/ktpFormConfirm';
import MapsPickerDialog from '@components/mapsPicker/Maps';

import { TabPanel, TabContext, LoadingButton } from '@mui/lab';
import {
  Step, Stack, Dialog, Button,
  Stepper, Checkbox, useTheme, StepLabel, DialogTitle, DialogContent,
  DialogActions, useMediaQuery, FormHelperText, FormControlLabel,
} from '@mui/material';

import SetDataTab from './SetDataTab';
import SetAreaTab from './SetAreaTab';
import TeknisiTab from './TeknisiTab';
import PaketOnuTab from './PaketOnuTab';
import PPPoENetworkTab from './PPPoENetworkTab';
import DeviceFormDialog from '../DeviceFormDialog';
import { useCustomerFormDialogState } from './customerFormDialog.state';

/**
 * @param {{show: boolean, onClose: (isPrefetch?: boolean) => void; selectedCustomer: any; statusMode: null | string, labelConfirm: string; readonlyPackage: boolean}} props
 */
export default function CustomerFormDialog({
  show,
  onClose,
  selectedCustomer,
  statusMode = 'pending',
  readonlyPackage,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const state = useCustomerFormDialogState({
    show,
    onClose,
    selectedCustomer,
    statusMode,
    readonlyPackage,
  });

  return (
    <Form methods={state.methods}>
      <Dialog open={show} onClose={state.onBeforeClose} fullWidth maxWidth="sm" fullScreen={isMobile}>
        <DialogTitle>Formulir Registrasi</DialogTitle>
        <DialogContent>
          <TabContext value={state.selectedTab}>
            <Stepper sx={{ width: '100%' }} activeStep={parseInt(state.selectedTab)} alternativeLabel>
              {state.tabsLabel.map((t) => (
                <Step
                  key={t.value}
                  onClick={() => {
                    if (!(state.isAdmin || state.isNoc) && t.value >= 4) {
                      return;
                    }
                    state.setSelectedTab(t.value.toString());
                  }}
                >
                  <StepLabel>{t.label}</StepLabel>
                  {t.value.toString() === state.selectedTab && (
                    <div className="tw-h-[1px] tw-w-1/2 tw-mx-auto tw-bg-black" />
                  )}
                </Step>
              ))}
            </Stepper>
            <TabPanel value="0" sx={{ paddingX: isMobile && 0 }}>
              <SetDataTab
                methods={state.methods}
                placeholderKtp={state.placeholderKtp}
                setPlaceholderKtp={state.setPlaceholderKtp}
                changeKtp={state.changeKtp}
                cropKtp={state.cropKtp}
                scanOcrKtp={state.scanOcrKtp}
                pickPhone={state.pickPhone}
                checkWhatsapp={state.checkWhatsapp}
                seperateLatLng={state.seperateLatLng}
                showMaps={state.showMaps}
                isEdit={state.statusMode === "active"}
              />
            </TabPanel>
            <TabPanel value="1" sx={{ paddingX: isMobile && 0 }}>
              <SetAreaTab
                methods={state.methods}
                areaList={state.areaList}
                odpList={state.odpList}
                vlanList={state.vlanList}
                pickArea={state.pickArea}
                statusMode={statusMode}
                disableEditNetwork={state.disableEditNetwork}
                allowModify={state.allowModify}
                showOdpForm={state.showOdpForm}
              />
            </TabPanel>
            <TabPanel value="2" sx={{ paddingX: isMobile && 0 }}>
              <PaketOnuTab
                methods={state.methods}
                packageList={state.packageList}
                pickPrice={state.pickPrice}
                serverAreaId={state.serverAreaId}
                statusMode={statusMode}
                readonlyPackage={readonlyPackage}
                addons={state.addons}
                setAddons={state.setAddons}
                addonsList={state.addonsList}
                loadingAddons={state.loadingAddons}
                addonsRef={state.addonsRef}
              />
            </TabPanel>
            <TabPanel value="3" sx={{ paddingX: isMobile && 0 }}>
              <PPPoENetworkTab
                methods={state.methods}
                statusMode={statusMode}
                usingDynamicIP={state.usingDynamicIP}
                usingDynamicCustomerId={state.usingDynamicCustomerId}
                isRandomPppoePassword={state.isRandomPppoePassword}
                disableEditNetwork={state.disableEditNetwork}
                loadingGenerate={state.loadingGenerate}
                generateId={state.generateId}
              />
            </TabPanel>
            <TabPanel value="4" sx={{ paddingX: isMobile && 0 }}>
              <TeknisiTab
                methods={state.methods}
                availableSelectEngineer={state.availableSelectEngineer}
              />
            </TabPanel>
          </TabContext>
        </DialogContent>
        <DialogActions>
          <Stack
            justifyContent={statusMode === 'pending-process' ? 'space-between' : 'end'}
            alignItems="start"
            className="tw-w-full"
            spacing={3}
            direction={isMobile ? 'column' : 'row'}
          >
            {statusMode === 'pending-process' && (
              <Stack>
                <FormControlLabel
                  label="Simple PSB"
                  control={
                    <Checkbox
                      checked={state.isSimplePSB.value}
                      onChange={(e) => state.isSimplePSB.setValue(e.target.checked)}
                    />
                  }
                />
                <FormHelperText className="tw-whitespace-nowrap">
                  Selesaikan PSB tanpa teknisi
                </FormHelperText>
              </Stack>
            )}
            <div className="tw-flex tw-flex-row tw-items-center tw-justify-end tw-w-full">
              <Button onClick={() => state.resetAll()}>Reset</Button>
              <Button color="error" onClick={state.onBeforeClose}>
                Tutup
              </Button>
              <LoadingButton
                loading={state.loading.value}
                onClick={state.submitForm}
                disabled={state.submitLabel === 'Proses' && !state.allowProcess.value}
                color="success"
                variant="contained"
                className="tw-whitespace-nowrap"
              >
                {state.submitLabel}
              </LoadingButton>
            </div>
          </Stack>
        </DialogActions>
      </Dialog>
      <MapsPickerDialog
        show={state.showMaps.value}
        onPick={state.onPickMaps}
        onClose={() => state.showMaps.onFalse()}
      />
      <DeviceFormDialog
        show={state.showOdpForm.value}
        onClose={() => state.showOdpForm.onFalse()}
        onSubmit={state.onSubmitODP}
      />
      <KtpFormConfirm ref={state.ktpFormConfirmRef} />
      <CropperImage ref={state.cropperImageRef} />
    </Form>
  );
}
