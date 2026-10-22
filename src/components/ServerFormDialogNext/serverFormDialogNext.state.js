import { z } from 'zod';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { parseLatLng } from '@utils/location';
import { incrementIP } from '@utils/ipAddress';
import { useBoolean } from '@hooks/use-boolean';
import { useRef, useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';

import 'src/extension/string';
import 'src/extension/number';
import { setData } from 'src/stores/broadcastStore';
import {
  areaRepository,
  whatsappRepository,
  mikrotikRepository,
  whatsappNodeRepository,
  whatsappGroupRepository,
  broadcastTemplateRepository,
} from 'src/repositories';

const validator = z.object({
  areaCode: z.string(),
  address: z.string().min(1, 'Tidak boleh kosong'),
  port: z.string().min(1, 'Tidak boleh kosong'),
  username: z.string().min(1, 'Tidak boleh kosong'),
  password: z.string().min(0, 'Tidak boleh kosong'),
  lastIP: z.string().min(1, 'Tidak boleh kosong'),
  title: z.string().min(1, 'Tidak boleh kosong'),
  prefixCustomer: z.string().min(1, 'Tidak boleh kosong'),
  duoDate: z.string().min(1, 'Tidak boleh kosong'),
  installationCharge: z.string(),
  autoIsolir: z.boolean(),
  autoIsolirDate: z.string().nullable(),
  isPrePaid: z.boolean(),
  lat: z.string().or(z.number()),
  lng: z.string().or(z.number()),
  defaultVlan: z.string(),
  whatsappId: z.string().nullable(),
  whatsappIdBilling: z.string().nullable(),
  whatsappIdTicket: z.string().nullable(),
  allowBroadcast: z.boolean(),
  templateAutoSendBilling: z.string().nullable(),
  companyName: z.string(),
  companyAddress: z.string(),
  companyLogo: z.any().optional(),
  billingRequireProofOfPayment: z.boolean().optional(),
  acsUrl: z.string().optional(),
  notificationPaymentAfterPsb: z.string().optional().nullable(),
  autoIsolirAfterPsb: z.boolean().optional().nullable(),
  active: z.boolean().optional().nullable(),
  requiredInstallationReport: z.boolean().optional().nullable(),
  isRandomPppoePassword: z.boolean().optional().nullable(),
  allowRemote: z.boolean().optional().nullable().default(true),
  maxDateMonth: z.number().optional().nullable(),
  writeStaticInterfacePSB: z.boolean().optional().nullable().default(true),
  broadcastChunksize: z.number().optional().nullable(),
  broadcastInterval: z.number().optional().nullable(),
  broadcastDelay: z.number().optional().nullable(),
  whatsappGroupBroadcast: z.string().optional().nullable(),
  prtgUrl: z.string().optional().nullable(),
  prtgUsername: z.string().optional().nullable(),
  prtgPassword: z.string().optional().nullable(),
});

const defaultValues = {
  areaCode: '',
  autoIsolir: false,
  address: '127.0.0.1',
  port: '22',
  username: '',
  password: '',
  lastIP: '',
  title: '',
  prefixCustomer: '',
  duoDate: '',
  autoIsolirDate: null,
  installationCharge: '0',
  isPrePaid: false,
  lat: '',
  lng: '',
  defaultVlan: '',
  whatsappId: '',
  whatsappIdBilling: '',
  whatsappIdTicket: '',
  allowBroadcast: false,
  templateAutoSendBilling: null,
  companyName: '',
  companyAddress: '',
  companyLogo: null,
  billingRequireProofOfPayment: false,
  acsUrl: '',
  notificationPaymentAfterPsb: null,
  autoIsolirAfterPsb: false,
  active: true,
  requiredInstallationReport: true,
  allowRemote: true,
  writeStaticInterfacePSB: true,
  maxDateMonth: 26,
  broadcastChunksize: null,
  broadcastInterval: null,
  broadcastDelay: null,
  whatsappGroupBroadcast: null,
  prtgUrl: null,
  prtgUsername: null,
  prtgPassword: null,
};

export const useServerFormDialogState = (templates) => {
  const dispatch = useDispatch();
  const isAutoIsolir = useBoolean(false);
  const showDialog = useBoolean(false);
  const showMaps = useBoolean(false);
  const autoIncrementStatus = useBoolean(false);
  const isRandomPppoePassword = useBoolean(false);
  const dynamicCustomerId = useBoolean(false);
  const dynamicCustomerIp = useBoolean(false);
  const usingMaxDateMonth = useBoolean(false);
  const loading = useBoolean(false);
  const [pppoeInterfaceFormat, setPPPoEInterfaceFormat] = useState(
    '{customer-id}_{odp}_{phone}_{customer_fullname}_{serial-number}'
  );

  const duplicate = useBoolean(false);

  const [whatsappGroupList, setWhatsappGroupList] = useState([]);
  const [selectedTab, setSelectedTab] = useState('0');
  const [schedulerMessage, setSchedulerMessage] = useState([]);
  const [autoIncrementDigit, setAutoIncrementDigit] = useState(0);
  const [autoIncrementLastNumber, setAutoIncrementLastNumber] = useState(0);
  const [prefix, setPrefix] = useState('');
  const [randomPasswordDigit, setRandomPasswordDigit] = useState(0);
  const [whatsappNode, setWhatsappNode] = useState([]);
  const [maxDateMonthVal, setMaxDateMonthVal] = useState(0);
  const [placeholder, setPlaceholder] = useState(null);
  const [whatsappHooks, setWhatsappHooks] = useState([]);
  const [currentItemId, setCurrentItemId] = useState(null);
  const showPrtgPassword = useBoolean(false);
  const editMikrotikPassword = useBoolean(false);
  const editPrtgPassword = useBoolean(false);
  const showMikrotikPassword = useBoolean(false);
  const [nextIpAddress, setNextIpAddress] = useState('');

  const [randomPPPoEPasswordOption, setRandomPPPoEPasswordOption] = useState('phone_number');
  const staticInterfacePSB = useBoolean(false);

  // Open Isolir ketika teknisi melakukan request pembayaran
  const openIsolirInvoiceTemp = useBoolean(false);
  const [openIsolirInvoiceTempDuration, setOpenIsolirInvoiceTempDuration] = useState(1);
  const openTemporaryPaymentRequest = useBoolean(false);

  const randomPPPoEPassword = {
    'Nomor Telepon': 'phone_number',
    'Auto Increment ID Pelanggan': 'autoincrement_from_customer_id',
    Numeric: 'numeric',
  };

  const randomPPPoEPasswordOptionList = Object.entries(randomPPPoEPassword).map(
    ([label, value]) => ({
      label,
      value,
    })
  );

  const resolver = useRef();

  const methods = useForm({
    defaultValues,
    resolver: zodResolver(validator),
  });

  const { handleSubmit } = methods;

  const tabList = [
    'Pengaturan Server',
    'Pengaturan Pelanggan',
    'Pengaturan Whatsapp',
    'Pengaturan Invoice',
  ];

  const whatsappHooksTypes = [
    { label: 'PSB', value: 'psb' },
    { label: 'Billing', value: 'billing' },
    { label: 'Customer Service', value: 'cs' },
    { label: 'Ticket', value: 'ticket' },
  ];

  const fetchWhatsappNode = async () => {
    try {
      const response = await whatsappNodeRepository.getWhatsappNode();
      setWhatsappNode(response);
      const groupList = await whatsappGroupRepository.getWhatsappGroup();
      setWhatsappGroupList(groupList);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const clearPlaceholder = async () => {
    setPlaceholder(null);

    /** Remove From Server */
    await areaRepository.submitLogoArea(currentItemId, null);
  };

  const prefetch = async (itemId, isDuplicate) => {
    methods.reset();
    setPlaceholder(null);
    setSelectedTab('0');
    setSchedulerMessage([]);
    setWhatsappHooks([]);
    fetchWhatsappNode();
    editMikrotikPassword.onTrue();
    editPrtgPassword.onTrue();
    showMikrotikPassword.onFalse();
    showPrtgPassword.onFalse();
    setNextIpAddress('');
    setPPPoEInterfaceFormat('{customer-id}_{odp}_{phone}_{customer_fullname}_{serial-number}');

    if (templates.length <= 0) {
      const snapshotTemplate = await broadcastTemplateRepository.getBroadcastTemplate();
      dispatch(setData(snapshotTemplate));
    }

    if (!itemId) return;

    editMikrotikPassword.onFalse();
    editPrtgPassword.onFalse();
    try {
      const snapshot = await areaRepository.getAreaDetail(itemId);
      const title = isDuplicate ? `${snapshot.title} (Duplicate)` : snapshot.title;
      console.log(duplicate.value, 'duplicate.value');
      methods.setValue('title', title);
      methods.setValue('areaCode', snapshot.areaCode ?? '');
      methods.setValue('username', snapshot.routerConfig.username);
      methods.setValue('password', snapshot.routerConfig.password);
      methods.setValue('lastIP', snapshot.routerConfig.lastIP);
      methods.setValue('defaultVlan', snapshot.defaultVlan ?? '');
      methods.setValue('port', snapshot.routerConfig.port);
      methods.setValue('address', snapshot.routerConfig.address);
      methods.setValue('prefixCustomer', snapshot.prefixCustomer);
      setPrefix(snapshot.prefixCustomer ?? '');

      methods.setValue('duoDate', snapshot.duoDate?.toString());
      methods.setValue('autoIsolirDate', snapshot.autoIsolirDate?.toString() ?? '-');
      methods.setValue('isPrePaid', snapshot.isPrePaid ?? false);
      methods.setValue(
        'installationCharge',
        (snapshot.installationCharge ?? 0).toString().toNumber().formatCurrency()
      );
      methods.setValue('lat', snapshot.lat?.toString() ?? '');
      methods.setValue('lng', snapshot.lng?.toString() ?? '');
      methods.setValue('whatsappId', snapshot.whatsappId);
      methods.setValue('whatsappIdBilling', snapshot.whatsappIdBilling);
      methods.setValue('whatsappIdTicket', snapshot.whatsappIdTicket);
      methods.setValue('allowBroadcast', snapshot.allowBroadcast ?? false);
      methods.setValue('templateAutoSendBilling', snapshot.templateAutoSendBilling ?? null);
      methods.setValue('companyName', snapshot.companyName ?? '');
      methods.setValue('companyAddress', snapshot.companyAddress ?? '');
      methods.setValue('acsUrl', snapshot.acsUrl ?? '');
      methods.setValue('notificationPaymentAfterPsb', snapshot.notificationPaymentAfterPsb ?? '');
      methods.setValue('autoIsolirAfterPsb', snapshot.autoIsolirAfterPsb ?? false);
      methods.setValue('active', snapshot.active ?? true);
      methods.setValue('requiredInstallationReport', snapshot.requiredInstallationReport ?? true);
      methods.setValue('allowRemote', !snapshot.allowRemote ?? true);
      dynamicCustomerIp.setValue(snapshot.dynamicIP ?? true);
      methods.setValue('maxDateMonth', snapshot.maxDateMonth ?? 26);
      methods.setValue('writeStaticInterfacePSB', snapshot.writeStaticInterfacePSB ?? true);
      dynamicCustomerId.setValue(snapshot.dynamicCustomerId ?? true);
      usingMaxDateMonth.setValue((snapshot.maxDateMonth ?? 30) < 30);
      methods.setValue('broadcastChunksize', snapshot.broadcastChunksize ?? null);
      methods.setValue('broadcastInterval', snapshot.broadcastInterval ?? null);
      methods.setValue('broadcastDelay', snapshot.broadcastDelay ?? null);
      methods.setValue('whatsappGroupBroadcast', snapshot.broadcastWhatsappGroup ?? null);
      methods.setValue('prtgUrl', snapshot.prtgUrl ?? null);
      methods.setValue('prtgUsername', snapshot.prtgUsername ?? null);
      methods.setValue('prtgPassword', snapshot.prtgPassword ?? null);
      methods.setValue('autoIsolir', snapshot.enabledAutoIsolir ?? true);
      console.log(snapshot.enabledAutoIsolir)

      setAutoIncrementDigit(snapshot.autoIncrementMaxDigits ?? 0);
      setAutoIncrementLastNumber(snapshot.autoIncrementLastNumber ?? 0);
      autoIncrementStatus.setValue(snapshot.autoIncrementStatus ?? false);
      methods.setValue(
        'billingRequireProofOfPayment',
        snapshot.additional?.billingRequireProofOfPayment ?? false
      );

      setRandomPasswordDigit(snapshot.randomPppoePasswordMaxDigits ?? 0);
      isRandomPppoePassword.setValue(snapshot.isRandomPppoePassword ?? false);

      if (snapshot.companyLogo) {
        setPlaceholder(snapshot.companyLogo);
      }

      // if (!!snapshot.autoIsolirDate) {
      //   methods.setValue('autoIsolir', true);
      // }

      if (snapshot.autoNotificationDate) {
        setSchedulerMessage(snapshot.autoNotificationDate);
      }

      if (snapshot.whatsappHooks) {
        setWhatsappHooks(snapshot.whatsappHooks);
      }

      if (snapshot.randomPPPoEPasswordType) {
        setRandomPPPoEPasswordOption(snapshot.randomPPPoEPasswordType);
      }

      setPPPoEInterfaceFormat(
        snapshot.pppoeInterfaceFormat ??
          '{customer-id}_{odp}_{phone}_{customer_fullname}_{serial-number}'
      );

      openIsolirInvoiceTemp.setValue(snapshot.openTemporaryInvoiceTemp ?? false);
      setOpenIsolirInvoiceTempDuration(snapshot.openTemporaryInvoiceTempDuration ?? 1);
      openTemporaryPaymentRequest.setValue(snapshot.openTemporaryPaymentRequest ?? false);
    } catch (error) {
      toast.error(error.message);
    }
  };

  /**
   *
   * @param {string | null} id
   * @param {boolean} d -- as duplicate param
   */
  const openDialog = (id = null, d = false) => {
    duplicate.setValue(d);
    setCurrentItemId(id);
    showDialog.onTrue();
    prefetch(id, d);

    return new Promise((resolve) => {
      resolver.current = resolve;
    });
  };

  const closeDialog = () => {
    showDialog.onFalse();
    setCurrentItemId(null);
    resolver.current?.();
  };

  function validateRandomPPPoEPassword({ dynamicCustomerIdEnable }) {
    const randomPPPoEPasswordEnable = isRandomPppoePassword.value;
    if (!randomPPPoEPasswordEnable) return;

    const randomPPPoEPasswordAutoIncrement =
      randomPPPoEPasswordOption === 'autoincrement_from_customer_id';

    const randomPPPoEPasswordNumeric = randomPPPoEPasswordOption === 'numeric';
    const randomPPPoEPasswordDigits = randomPasswordDigit;

    const autoIncrementEnabled = autoIncrementStatus.value && dynamicCustomerIdEnable;

    // validate auto increment
    if (randomPPPoEPasswordEnable && randomPPPoEPasswordAutoIncrement && !autoIncrementEnabled) {
      throw new Error(
        'Untuk menggunakan opsi Auto Increment ID Pelanggan pada password PPPoE, fitur Auto Increment ID Pelanggan harus diaktifkan'
      );
    }

    // validate random password digit
    if (randomPPPoEPasswordNumeric && randomPPPoEPasswordDigits <= 0) {
      throw new Error('Jumlah digit password PPPoE harus lebih dari 0');
    }
  }

  function validateLastIP(lastIP) {
    const dynamicIpAddressEnable = dynamicCustomerIp.value;
    if (!dynamicIpAddressEnable) return;

    const lastIpEmpty = !lastIP || lastIP.trim() === '';
    if (lastIpEmpty) {
      throw new Error('Last IP tidak boleh kosong jika Dynamic IP Address diaktifkan');
    }
  }

  function validateCustomerId({
    dynamicCustomerIdEnable,
    autoIncrementEnable,
    autoIncrementMaxDigits,
    prefixCustomerId,
  }) {
    if (!dynamicCustomerIdEnable) return;

    const prefixIsEmpty = !prefixCustomerId || prefixCustomerId.trim() === '';
    if (prefixIsEmpty) {
      throw new Error(
        'Prefix ID Pelanggan tidak boleh kosong jika Dynamic ID Pelanggan diaktifkan'
      );
    }

    const emptyMaxDigits =
      autoIncrementEnable && (!autoIncrementMaxDigits || autoIncrementMaxDigits <= 0);
    if (emptyMaxDigits) {
      throw new Error(
        'Jumlah digit Auto Increment ID Pelanggan harus lebih dari 0 jika fitur tersebut diaktifkan'
      );
    }
  }

  const submit = handleSubmit(async (data) => {
    loading.onTrue();
    try {
      validateScheduleMessageBilling();
      validateWhatsappNode();

      validateLastIP(data.lastIP);
      validateCustomerId({
        dynamicCustomerIdEnable: dynamicCustomerId.value,
        autoIncrementEnable: autoIncrementStatus.value,
        autoIncrementMaxDigits: autoIncrementDigit,
        prefixCustomerId: data.prefixCustomer,
      });

      // Validate Dynamic PPPoE Password
      validateRandomPPPoEPassword({ dynamicCustomerIdEnable: dynamicCustomerId.value });

      data.autoNotificationDate = schedulerMessage;
      data.autoIsolirDate = isAutoIsolir.value ? data.autoIsolirDate : null;
      data.installationCharge = data.installationCharge.toString().toNumber();
      data.whatsappHooks = whatsappHooks;
      data.autoIncrementStatus = autoIncrementStatus.value;
      data.autoIncrementMaxDigits = autoIncrementDigit;
      data.autoIncrementLastNumber = autoIncrementLastNumber;
      data.isRandomPppoePassword = isRandomPppoePassword.value;
      data.randomPppoePasswordMaxDigits = randomPasswordDigit;
      data.dynamicIP = dynamicCustomerIp.value;
      data.dynamicCustomerId = dynamicCustomerId.value;
      data.maxDateMonth = usingMaxDateMonth.value ? data.maxDateMonth : 31;
      data.randomPPPoEPasswordType = randomPPPoEPasswordOption;
      data.pppoeInterfaceFormat = pppoeInterfaceFormat;
      data.openTemporaryInvoiceTemp = openIsolirInvoiceTemp.value;
      data.openTemporaryInvoiceTempDuration = Number(openIsolirInvoiceTempDuration);
      data.openTemporaryPaymentRequest = openTemporaryPaymentRequest.value;
      data.enabledAutoIsolir = data.autoIsolir;

      if (duplicate.value) {
        data.duplicateFromId = currentItemId;
      }

      const isUpdate = !duplicate.value && !!currentItemId;
      /** @type {Promise<import('src/repositories/area').Area>} */
      if (isUpdate) {
        data.id = currentItemId;
      }

      const result = await areaRepository.submitArea(data);
      if (data.companyLogo) {
        await areaRepository.submitLogoArea(result._id, data.companyLogo);
      }

      toast.success('Berhasil menyimpan');

      closeDialog();
    } catch (error) {
      toast.error(error.message);
    } finally {
      loading.onFalse();
    }
  });

  const onTestPingArea = handleSubmit(async (data) => {
    try {
      toast.warning('Mohon menunggu');
      const { address, username, password, port } = data;
      const result = await areaRepository.testPing({
        address,
        user: username,
        password,
        port,
      });
      toast.success(result);
    } catch (error) {
      toast.error(error.message);
    }
  });

  const writeFirewallRules = handleSubmit(async (data) => {
    try {
      toast.warning('Mohon menunggu !!');
      const { address, username, password, port } = data;
      const result = await mikrotikRepository.addIsolirFirewall({
        address,
        password,
        port,
        user: username,
      });
      toast.success(result ?? 'OK');
    } catch (error) {
      toast.error(error.message);
    }
  });

  const seperateLatLng = (value) => {
    if (value.includes(',')) {
      const result = parseLatLng(value);
      if (result == null) return;
      const { lat, lng } = result;
      methods.setValue('lat', lat?.toString());
      methods.setValue('lng', lng?.toString());
      return;
    }
  };

  const onPickMaps = ([lat, lng]) => {
    methods.setValue('lat', lat.toString());
    methods.setValue('lng', lng.toString());
    showMaps.onFalse();
  };

  const checkGroupWhatsappValid = async (whatsappId, nodeCategory) => {
    const node = whatsappHooks.find((d) => d.types === nodeCategory);
    try {
      if (!node) throw new Error(`pilih Whatsapp Node untuk ${nodeCategory}`);
      toast.info('Mohon menunggu');
      if (whatsappId.length <= 0) throw new Error('Mohon mengisi kolom whatsapp Id');
      const result = await whatsappRepository.checkWhatsapp(
        'group',
        whatsappId,
        node.whatsappNodeId
      );
      if (!result.valid) throw new Error('WhatsappId tidak valid');

      toast.success('WhatsappId valid');
    } catch (error) {
      toast.error(error.message);
    }
  };

  const testSendWhatsapp = async (whatsappId, nodeCategory) => {
    const node = whatsappHooks.find((d) => d.types === nodeCategory);
    try {
      if (!node) throw new Error(`pilih Whatsapp Node untuk ${nodeCategory}`);
      toast.info('Mohon menunggu');
      if (whatsappId.length <= 0) throw new Error('Mohon mengisi kolom whatsapp Id');
      const result = await whatsappRepository.testWhatsapp(whatsappId, node.whatsappNodeId);
      toast.success(result);
    } catch (error) {
      toast.error(error.message);
    }
  };

  // WhatsappHooks Methods
  const validateWhatsappNode = () => {
    const result = whatsappHooks.map((item, i) => {
      if (!item.whatsappNodeId) throw new Error(`Whatsapp node no.${i + 1} tidak valid`);
      return item;
    });
    return result;
  };

  const addWhatsappHooks = () => {
    setWhatsappHooks((prev) => [...prev, { url: '', types: 'psb' }]);
  };

  const removeWhatsappHooks = (index) => {
    const copy = [...whatsappHooks];
    copy.splice(index, 1);
    setWhatsappHooks(copy);
  };

  const setOptionWhatsappHooks = (index, types) => {
    const copy = [...whatsappHooks];
    copy[index].types = types;
    setWhatsappHooks(copy);
  };

  const setWhatsappNodeId = (index, id) => {
    const copy = [...whatsappHooks];
    copy[index].whatsappNodeId = id;
    setWhatsappHooks(copy);
  };

  // Scheduler Methods
  const validateScheduleMessageBilling = () => {
    const result = schedulerMessage.forEach((item, i) => {
      if (item.date === '') throw new Error(`Lengkapi tanggal Auto Schedule Billing no. ${i + 1}`);
      const dateNumber = item.date.toString().toNumber();
      if (dateNumber <= 0 || dateNumber >= 31)
        throw new Error(`Tanggal tidak sesuai pada Auto Schedule Billing no. ${i + 1}`);

      if (item.template == null)
        throw new Error(`Pilih template pada Auto Schedule Billing no. ${i + 1}`);
      if (item.billingStatus.length <= 0)
        throw new Error(`Pilih paid atau unpaid pada Auto Schedule Billing no. ${i + 1}`);

      item.date = dateNumber;
      return item;
    });
    return result;
  };

  const addSchedule = () => {
    setSchedulerMessage((prev) => [
      ...prev,
      { date: '1', template: null, billingStatus: [], sendInvoice: false, special: false },
    ]);
  };

  const removeSchedule = (index) => {
    const copy = [...schedulerMessage];
    copy.splice(index, 1);
    setSchedulerMessage(copy);
  };

  const setTemplateSchedule = (index, templateId) => {
    const copy = [...schedulerMessage];
    copy[index].template = templateId;
  };

  const setDateSchedule = (index, d) => {
    const copy = [...schedulerMessage];
    copy[index].date = d;
  };

  const toggleBillingStatusMessageScheduler = (index, status) => {
    const copy = [...schedulerMessage];
    const isExistIndex = copy[index].billingStatus.indexOf(status);
    if (isExistIndex === -1) {
      copy[index].billingStatus.push(status);
    } else {
      copy[index].billingStatus.splice(isExistIndex, 1);
    }
    setSchedulerMessage(copy);
  };

  const toggleSendInvoiceMessageScheduler = (index) => {
    const copy = [...schedulerMessage];
    copy[index].sendInvoice = !copy[index].sendInvoice;
    setSchedulerMessage(copy);
  };

  const toggleCustomerSpecialMessageScheduler = (index) => {
    const copy = [...schedulerMessage];
    copy[index].special = !copy[index].special;
    setSchedulerMessage(copy);
  };

  // Watch form changes
  useEffect(() => {
    const subscription = methods.watch((data) => {
      isAutoIsolir.setValue(data.autoIsolir ?? false);
      setMaxDateMonthVal(data.maxDateMonth ?? 26);
      staticInterfacePSB.setValue(data.writeStaticInterfacePSB ?? false);
      const nextIp = incrementIP(data.lastIP ?? '', 1);
      setNextIpAddress(nextIp);
    });
    return () => subscription.unsubscribe();
  }, [methods.watch]);

  return {
    // State
    methods,
    showDialog,
    showMaps,
    selectedTab,
    tabList,
    whatsappGroupList,
    schedulerMessage,
    autoIncrementStatus,
    autoIncrementDigit,
    autoIncrementLastNumber,
    prefix,
    isRandomPppoePassword,
    randomPasswordDigit,
    whatsappNode,
    dynamicCustomerId,
    dynamicCustomerIp,
    usingMaxDateMonth,
    maxDateMonthVal,
    placeholder,
    whatsappHooks,
    whatsappHooksTypes,
    isAutoIsolir,
    loading,
    showPrtgPassword,
    randomPPPoEPasswordOption,
    randomPPPoEPasswordOptionList,
    editMikrotikPassword,
    editPrtgPassword,
    showMikrotikPassword,
    pppoeInterfaceFormat,
    staticInterfacePSB,
    nextIpAddress,
    openIsolirInvoiceTemp,
    openIsolirInvoiceTempDuration,
    openTemporaryPaymentRequest,
    // Methods
    openDialog,
    closeDialog,
    setSelectedTab,
    submit,
    onTestPingArea,
    writeFirewallRules,
    seperateLatLng,
    onPickMaps,
    checkGroupWhatsappValid,
    testSendWhatsapp,
    clearPlaceholder,
    setPrefix,
    setAutoIncrementDigit,
    setAutoIncrementLastNumber,
    setRandomPasswordDigit,
    setRandomPPPoEPasswordOption,
    setPPPoEInterfaceFormat,
    setOpenIsolirInvoiceTempDuration,
    // WhatsappHooks methods
    addWhatsappHooks,
    removeWhatsappHooks,
    setOptionWhatsappHooks,
    setWhatsappNodeId,

    // Scheduler methods
    addSchedule,
    removeSchedule,
    setTemplateSchedule,
    setDateSchedule,
    toggleBillingStatusMessageScheduler,
    toggleSendInvoiceMessageScheduler,
    toggleCustomerSpecialMessageScheduler,
  };
};
