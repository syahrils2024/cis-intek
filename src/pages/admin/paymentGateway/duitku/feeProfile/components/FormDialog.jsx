import { forwardRef, useImperativeHandle } from 'react';
import AreaPickerFilter from '@components/billing/areaPickerFilter';

import { TabPanel, TabContext, LoadingButton } from '@mui/lab';
import {
  Tab,
  Tabs,
  Stack,
  Button,
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
} from '@mui/material';

import FeeProfileFormDialogTabFee from './FormDialogTabFee';
import { useDuitkuFeeProfileFormState } from './formDialog.state';
import { FeeProfileFormDialogTabArea } from './FormDialogTabArea';

const DuitkuFeeProfileFormDialog = forwardRef((props, ref) => {
  const {
    areas,
    fees,
    loading,
    show,
    open,
    profileName,
    setProfileName,
    setAreas,
    mobile,
    close,
    tab,
    setTab,
    tabList,
    areaPickerRef,
    addArea,
    removeArea,
    changeFee,
    loadingSubmit,
    submit,
  } = useDuitkuFeeProfileFormState();

  useImperativeHandle(ref, () => ({
    open,
  }));

  return (
    <Dialog open={show.value} fullWidth maxWidth="sm" fullScreen={mobile}>
      <DialogTitle>
        <Tabs value={tab} onChange={(e, value) => setTab(value)}>
          {tabList.map((tabItem, i) => (
            <Tab key={i} label={tabItem.label} value={tabItem.value} />
          ))}
        </Tabs>
      </DialogTitle>
      <DialogContent>
        <Stack className="tw-relative">
          <TabContext value={tab}>
            <TabPanel value="form" sx={{ paddingX: 0 }}>
              <FeeProfileFormDialogTabArea
                profileName={profileName}
                setProfileName={setProfileName}
                areas={areas}
                onAddArea={() => addArea()}
                onRemoveArea={(index) => removeArea(index)}
              />
            </TabPanel>
            <TabPanel value="fees" sx={{ paddingX: 0 }}>
              <Stack spacing={2}>
                <FeeProfileFormDialogTabFee fees={fees ?? []} onSetFees={changeFee} />
              </Stack>
            </TabPanel>
          </TabContext>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button variant="text" color="error" onClick={close}>
          Tutup
        </Button>
        <LoadingButton
          variant="contained"
          color="primary"
          onClick={() => submit()}
          loading={loadingSubmit.value}
        >
          Simpan
        </LoadingButton>
      </DialogActions>
      <AreaPickerFilter ref={areaPickerRef} />
    </Dialog>
  );
});

export default DuitkuFeeProfileFormDialog;
