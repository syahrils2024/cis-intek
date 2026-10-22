import { toast } from 'sonner';
import { useBoolean } from '@hooks/use-boolean';
import { useConfirm } from 'material-ui-confirm';
import { useRef, useMemo, useState } from 'react';

import { useMikrotikStore } from 'src/stores/mikrotikStatus';
import { acsRepository, customerRepository } from 'src/repositories';

/**
 * @typedef {import('@/repositories/acs').AcsStatus} AcsStatus
 * @typedef {import('@/repositories/customer').CustomerDetail} CustomerDetail
 * @typedef {import('@/repositories/acs').ACSSecurity} ACSSecurity
 */

export function useAcsDialogState() {
  const confirm = useConfirm();
  const show = useBoolean(false);
  /** @type {[CustomerDetail, void]} */
  const [customerData, setCustomerData] = useState(null);
  /** @type {[AcsStatus, void]} */
  const [acsData, setAcsData] = useState(null);

  /** @type {[ACSSecurity[], void]} */
  const [acsSecurityList, setAcsSecurityList] = useState([]);

  const overlayError = useMemo(() => {
    if (!customerData) return null;
    if (!customerData.pppoeName) return 'PPPoE Name Kosong';
    return null;
  });

  const loading = useBoolean(false);

  const mikrotikStore = useMikrotikStore();
  const mikrotikStatusRef = useRef();
  const mikrotikLogRef = useRef();
  const mikrotikPingRef = useRef();
  const mikrotikTrafficRef = useRef();
  const [tab, setTab] = useState('acs.info');
  const isPing = useBoolean(false);
  const isTrafficRunning = useBoolean(false);
  const changeCustomerSerialNumberRef = useRef()
  const tabList = [
    {
      label: 'Status',
      value: 'mikrotik.status',
    },
    {
      label: 'Live Traffic',
      value: 'mikrotik.traffic',
    },
     {
      label: 'Traffic',
      value: 'prtg.traffic',
    },
    {
      label: 'Log',
      value: 'mikrotik.log',
    },
    {
      label: 'ping',
      value: 'mikrotik.ping',
    },

    {
      label: 'Device Info',
      value: 'acs.info',
    },
    {
      label: 'SSID',
      value: 'acs.ssid',
    },
    {
      label: 'Perangkat Terhubung',
      value: 'acs.lanHost',
    },
  ];

  async function prefetch(customerId, fetchAcsData = true) {
    loading.onTrue();
    try {
      const snapshotCustomerData = await customerRepository.getCustomer(customerId);
      setCustomerData(snapshotCustomerData);
      if (fetchAcsData) {
        const result = await acsRepository.getStatus(customerId);
        setAcsData(result);
        const snapshotSecurityList = await acsRepository.getSecurityList();
        setAcsSecurityList(snapshotSecurityList);
      }
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
    } finally {
      loading.onFalse();
    }
  }

  /** @param {number, {key: 'password' | 'active' | 'ssid', value: any}} */
  function changeSSIDValue(index, { key, value }) {
    const copyData = [...acsData.ssidList];
    copyData[index][key] = value;
    const resultAcsData = { ...acsData, ssidList: copyData };
    setAcsData(resultAcsData);
  }

  async function saveSSIDValue(index) {
    const ssidData = acsData.ssidList[index];
    const iteration = ssidData._object.split('.').at(-1).formatNumber();
    loading.onTrue();
    try {
      if (!iteration) throw new Error('Gagal simpan SSID');
      await acsRepository.updateSSID(customerData?._id, {
        active: ssidData.active,
        password: ssidData.password,
        ssid: ssidData.ssid,
        iteration: iteration.toNumber(),
      });
      prefetch(customerData?._id ?? '');
      toast.success('Berhasil menyimpan SSID');
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
    } finally {
      loading.onFalse();
    }
  }

  async function summon() {
    loading.onTrue();
    try {
      await acsRepository.summon(customerData?._id ?? '');
      prefetch(customerData?._id ?? '');
      toast.success('Berhasil melakukan summon perangkat');
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
    } finally {
      loading.onFalse();
    }
  }

  async function acsReboot() {
    try {
      await confirm({
        title: 'Restart',
        description: 'Apakah anda yakin ingin melakukan restart perangkat',
      });
      loading.onTrue();
      await acsRepository.reboot(customerData?._id ?? '');
      prefetch(customerData?._id ?? '');
    } catch (error) {
      console.error(error);
      if (error instanceof Error) toast.error(error.message);
    } finally {
      loading.onFalse();
    }
  }

  function refreshMikrotik() {
    if (tab === 'mikrotik.status') mikrotikStatusRef.current.refresh(customerData._id);
    if (tab === 'mikrotik.log') mikrotikLogRef.current.prefetch({ customerId: customerData._id });
  }

  function pingMikrotik() {
    if (isPing.value) {
      isPing.onFalse();
    } else {
      isPing.onTrue();
    }

    if (isPing.value) {
      mikrotikPingRef.current.disconnect();
    } else {
      mikrotikPingRef.current.connect(customerData);
    }
  }

  function runTrafficMikrotik() {
    if (isTrafficRunning.value) {
      isTrafficRunning.onFalse();
    } else {
      isTrafficRunning.onTrue();
    }

    if (isTrafficRunning.value) {
      mikrotikTrafficRef.current.disconnect();
    } else {
      mikrotikTrafficRef.current.connect({ customer_id: customerData._id });
    }
  }

  async function updateSerialNumber() {
    await changeCustomerSerialNumberRef.current.open(customerData._id, {defaultValue: acsData.serialNumber});
    prefetch(customerData._id ?? '', false);
  }

  return {
    show,
    customerData,
    setCustomerData,
    acsData,
    setAcsData,
    loading,
    mikrotikStore,
    mikrotikStatusRef,
    mikrotikLogRef,
    mikrotikPingRef,
    mikrotikTrafficRef,
    changeCustomerSerialNumberRef,
    tab,
    setTab,
    isPing,
    isTrafficRunning,
    tabList,
    acsSecurityList,
    prefetch,
    changeSSIDValue,
    saveSSIDValue,
    summon,
    acsReboot,
    refreshMikrotik,
    pingMikrotik,
    runTrafficMikrotik,
    updateSerialNumber,
    overlayError,
  };
}
