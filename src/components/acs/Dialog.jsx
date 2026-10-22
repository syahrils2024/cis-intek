/* eslint-disable no-unused-expressions */
import { Iconify } from '@components/iconify';
import { useConfirm } from 'material-ui-confirm';
import Overloading from '@components/overloading';
import { forwardRef, useImperativeHandle } from 'react';
import ChangeCustomerSerialNumberDialog from '@pages/admin/networkStatus/components/ChangeCustomerSerialNumberDialog';

import { TabList, TabPanel, TabContext } from '@mui/lab';
import {
  Tab,
  Chip,
  Dialog,
  Button,
  useTheme,
  DialogTitle,
  DialogContent,
  useMediaQuery,
  DialogActions,
} from '@mui/material';

import 'src/extension/string';

import AcsDialogSSIDList from './DialogSSIDList';
import { useAcsDialogState } from './Dialog.state';
import DialogPrtgTraffic from './DialogPrtgTraffic';
import AcsDialogStatusInfo from './DialogStatusInfo';
import AcsDialogMikrotikLog from './DialogLogMikrotik';
import AcsDialogMikrotikPing from './DialogPingMikrotik';
import AcsDialogDeviceConnect from './DialogDeviceConnect';
import AcsDialogCustomerHeader from './DialogCustomerHeader';
import AcsDialogStatusMikrotik from './DialogStatusMikrotik';
import AcsDialogMikrotikBandwith from './DialogMikrotikBandwith';

/**
 * @typedef {import('@/repositories/acs').AcsStatus} AcsStatus
 * @typedef {import('@/repositories/customer').CustomerDetail} CustomerDetail
 */

const AcsDialog = forwardRef(({ title }, ref) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const confirm = useConfirm();

  const {
    show,
    loading,
    customerData,
    setCustomerData,
    acsData,
    setAcsData,
    mikrotikStore,
    mikrotikStatusRef,
    mikrotikLogRef,
    mikrotikPingRef,
    mikrotikTrafficRef,
    tab,
    acsSecurityList,
    setTab,
    isPing,
    isTrafficRunning,
    tabList,
    prefetch,
    changeSSIDValue,
    saveSSIDValue,
    acsReboot,
    summon,
    refreshMikrotik,
    pingMikrotik,
    runTrafficMikrotik,
    overlayError,
    updateSerialNumber,
    changeCustomerSerialNumberRef,
  } = useAcsDialogState();

  function close() {
    show.onFalse();
    setCustomerData(null);
    setAcsData(null);
    mikrotikPingRef.current?.disconnect();
    mikrotikTrafficRef.current?.disconnect();
    mikrotikStore.reset();
  }

  async function open(customerId) {
    show.onTrue();
    prefetch(customerId);
  }

  useImperativeHandle(ref, () => ({ open }));
  return (
    <Dialog open={show.value} fullScreen={isMobile} fullWidth maxWidth="md">
      <DialogTitle>
        <div className="tw-flex tw-flex-row tw-items-center tw-justify-between">
          <span>{title ?? 'ACS'}</span>
          <div className="tw-flex tw-flex-row tw-items-center tw-justify-end tw-gap-4">
            {!loading.value && !overlayError ? (
              <Button
                variant="contained"
                color="warning"
                disabled={loading.value}
                onClick={() => acsReboot()}
              >
                <Iconify icon="mdi:refresh" />
                Restart
              </Button>
            ) : null}
          </div>
        </div>
      </DialogTitle>
      <DialogContent>
        <div className="tw-relative tw-flex tw-flex-col">
          <Overloading loading={loading.value} />
          {/* Overlay Warning */}
          {overlayError ? (
            <div className="tw-absolute tw-inset-0 tw-flex tw-items-center tw-justify-center tw-z-30 tw-bg-white/80">
              <Chip color="error" label={overlayError} />
            </div>
          ) : null}
          {/* End Overlay Warning */}
          <AcsDialogCustomerHeader
            fullname={customerData?.fullname}
            phone={customerData?.phone}
            customerId={customerData?.customerId}
            address={customerData?.address}
            serialNumber={customerData?.routerSerialNumber}
          />
          <TabContext value={tab}>
            <TabList onChange={(e, value) => setTab(value)}>
              {tabList.map((t) => (
                <Tab label={t.label} value={t.value} key={t.value} />
              ))}
            </TabList>
            <TabPanel value="acs.info" sx={{ paddingX: 0 }}>
              <AcsDialogStatusInfo
                acsStatus={acsData}
                currentRouterSerialNumber={customerData?.routerSerialNumber}
                onUpdateSerialNumber={updateSerialNumber}
              />
            </TabPanel>
            <TabPanel value="acs.ssid" sx={{ paddingX: 0 }}>
              <AcsDialogSSIDList
                ssidList={acsData?.ssidList ?? []}
                changeValue={(index, { key, value }) => changeSSIDValue(index, { key, value })}
                save={(index) => saveSSIDValue(index)}
                securityList={acsSecurityList}
              />
            </TabPanel>
            <TabPanel value="acs.lanHost" sx={{ paddingX: 0 }}>
              <AcsDialogDeviceConnect devices={acsData?.deviceConnectList ?? []} />
            </TabPanel>
            <TabPanel value="mikrotik.status" sx={{ paddingX: 0 }}>
              <AcsDialogStatusMikrotik ref={mikrotikStatusRef} customerId={customerData?._id} />
            </TabPanel>
            <TabPanel value="mikrotik.log" sx={{ paddingX: 0 }}>
              <AcsDialogMikrotikLog ref={mikrotikLogRef} customerId={customerData?._id} />
            </TabPanel>
            <TabPanel value="mikrotik.ping" sx={{ paddingX: 0 }}>
              <AcsDialogMikrotikPing ref={mikrotikPingRef} />
            </TabPanel>
            <TabPanel value="mikrotik.traffic" sx={{ paddingX: 0 }}>
              <AcsDialogMikrotikBandwith ref={mikrotikTrafficRef} customer={customerData} />
            </TabPanel>
            <TabPanel value="prtg.traffic" sx={{ paddingX: 0 }}>
              <DialogPrtgTraffic customer_id={customerData?._id} />
            </TabPanel>
          </TabContext>
        </div>
      </DialogContent>
      <DialogActions>
        {tab.includes('acs') && (
          <Button
            variant="outlined"
            color="success"
            disabled={loading.value}
            onClick={() => summon()}
          >
            <Iconify icon="ic:baseline-sync" />
            Summon
          </Button>
        )}
        {['mikrotik.log', 'mikrotik.status'].includes(tab) && (
          <Button
            variant="outlined"
            color="success"
            disabled={loading.value}
            onClick={() => refreshMikrotik()}
          >
            <Iconify icon="ic:baseline-sync" />
            Refresh
          </Button>
        )}
        {tab === 'mikrotik.ping' && (
          <Button
            variant="outlined"
            color={isPing.value ? 'error' : 'success'}
            onClick={() => pingMikrotik()}
          >
            {isPing.value ? 'Stop Ping' : 'Ping'}
          </Button>
        )}

        {tab === 'mikrotik.traffic' && (
          <Button
            variant="outlined"
            color={isTrafficRunning.value ? 'error' : 'success'}
            onClick={() => runTrafficMikrotik()}
          >
            {isTrafficRunning.value ? 'Stop Traffic' : 'Start Traffic'}
          </Button>
        )}

        <Button variant="outlined" color="error" onClick={() => close()}>
          Tutup
        </Button>
      </DialogActions>
      <ChangeCustomerSerialNumberDialog ref={changeCustomerSerialNumberRef} />
    </Dialog>
  );
});

export default AcsDialog;
