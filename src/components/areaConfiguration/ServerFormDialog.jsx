import { z } from 'zod';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { Iconify } from '@components/iconify';
import { parseLatLng } from '@utils/location';
import { incrementIP } from '@utils/ipAddress';
import { useBoolean } from '@hooks/use-boolean';
import { connect, useDispatch } from 'react-redux';
import { Form, Field } from '@components/hook-form';
import { useState, Fragment, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import MapsPickerDialog from '@components/mapsPicker/Maps';
import { PPPoEInterface } from '@components/ServerFormDialogNext/PppoeInterface';

import { TabPanel, TabContext } from '@mui/lab';
import Grid from '@mui/material/Unstable_Grid2';
import {
  Step,
  Stack,
  Button,
  Dialog,
  Select,
  Stepper,
  Divider,
  Tooltip,
  useTheme,
  MenuItem,
  Checkbox,
  StepLabel,
  TextField,
  IconButton,
  DialogTitle,
  DialogActions,
  DialogContent,
  useMediaQuery,
  FormHelperText,
  InputAdornment,
  FormControlLabel,
} from '@mui/material';

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

import { OpenIsolirInvoiceTempField } from './serverFormDialog/OpenIsolirInvoiceTemp';
import { OpenIsolirPaymentRequestField } from './serverFormDialog/OpenIsolirPaymentRequest';

/**
 * @typedef {import('src/repositories/whatsappGroup').WhatsappGroup} WhatsappGroup
 */

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

/**
 * @param {{
 * show: boolean;
 * onClose: void;
 * onSubmit: void;
 * selectedItem: import('src/repositories/area').Area
 * templates: import('src/repositories/broadcastTemplate').BroadcastTemplate[]
 * }} props
 */
function ServerFormDialog({ show, onClose, onSubmit, selectedItem, templates }) {
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isAutoIsolir = useBoolean(false);
  const tabList = [
    'Pengaturan Server',
    'Pengaturan Pelanggan',
    'Pengaturan Whatsapp',
    'Pengaturan Invoice',
  ];
  /** @type {[WhatsappGroup[], void]} */
  const [whatsappGroupList, setWhatsappGroupList] = useState([]);
  const showMaps = useBoolean(false);
  const [selectedTab, setSelectedTab] = useState('0');
  const [schedulerMessage, setSchedulerMessage] = useState([]);
  const autoIncrementStatus = useBoolean(false);
  const [autoIncrementDigit, setAutoIncrementDigit] = useState(0);
  const [autoIncrementLastNumber, setAutoIncrementLastNumber] = useState(0);
  const [prefix, setPrefix] = useState('');
  const isRandomPppoePassword = useBoolean(false);
  const [randomPasswordDigit, setRandomPasswordDigit] = useState(0);
  const [whatsappNode, setWhatsappNode] = useState([]);
  const dynamicCustomerId = useBoolean(false);
  const dynamicCustomerIp = useBoolean(false);
  const usingMaxDateMonth = useBoolean(false);
  const [maxDateMonthVal, setMaxDateMonthVal] = useState(0);
  const showPrtgPassword = useBoolean(false);
  const [randomPPPoEPasswordOption, setRandomPPPoEPasswordOption] = useState('phone_number');
  const isolirPsbDate = useBoolean(false);
  const [pppoeInterfaceFormat, setPPPoEInterfaceFormat] = useState(
    '{customer-id}_{odp}_{phone}_{customer_fullname}_{serial-number}'
  );
  const [nextIpAddress, setNextIpAddress] = useState('');

  const editMikrotikPassword = useBoolean(false);
  const editPrtgPassword = useBoolean(false);
  const showMikrotikPassword = useBoolean(false);
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

  const whatsappHooksTypes = [
    {
      label: 'PSB',
      value: 'psb',
    },
    {
      label: 'Billing',
      value: 'billing',
    },
    {
      label: 'Customer Service',
      value: 'cs',
    },
    {
      label: 'Ticket',
      value: 'ticket',
    },
  ];
  /** @type {[{url: string; types: 'psb' | 'cs' | 'billing' | string;}[], void]} */
  const [whatsappHooks, setWhatsappHooks] = useState([]);

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

  const methods = useForm({
    defaultValues,
    resolver: zodResolver(validator),
  });

  const { handleSubmit } = methods;
  const [placeholder, setPlaceholder] = useState(null);
  async function clearPlaceholder() {
    setPlaceholder(null);

    /** Remove From Server */
    await areaRepository.submitLogoArea(selectedItem._id, null);
  }

  const prefetch = async () => {
    methods.reset();
    setPlaceholder(null);
    setSelectedTab('0');
    setSchedulerMessage([]);
    setWhatsappHooks([]);
    fetchWhatsappNode();
    setNextIpAddress('');

    showMikrotikPassword.onFalse();
    showPrtgPassword.onFalse();
    editMikrotikPassword.onTrue();
    editPrtgPassword.onTrue();
    if (templates.length <= 0) {
      const snapshotTemplate = await broadcastTemplateRepository.getBroadcastTemplate();
      dispatch(setData(snapshotTemplate));
    }

    if (!selectedItem) return;
    // disable password field when edit server to prevent unintentional password change, user must click edit button to enable it
    editMikrotikPassword.onFalse();
    editPrtgPassword.onFalse();

    try {
      const snapshot = await areaRepository.getAreaDetail(selectedItem._id ?? selectedItem.id);
      methods.setValue('areaCode', snapshot.areaCode ?? '');
      methods.setValue('title', snapshot.title);
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
      // methods.set
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

      isolirPsbDate.setValue(!!snapshot.isolirPsbDate);
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

  const submit = handleSubmit((data) => {
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

      // assign data
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
      data.isolirPsbDate = isolirPsbDate.value;

      data.pppoeInterfaceFormat = pppoeInterfaceFormat;
      data.openTemporaryInvoiceTemp = openIsolirInvoiceTemp.value;
      data.openTemporaryInvoiceTempDuration = Number(openIsolirInvoiceTempDuration);
      data.openTemporaryPaymentRequest = openTemporaryPaymentRequest.value;
      data.enabledAutoIsolir = data.autoIsolir;
      data.openTemporaryPaymentRequest = openTemporaryPaymentRequest.value;
      onSubmit(data);
    } catch (error) {
      toast.error(error.message);
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

  methods.watch((data) => {
    isAutoIsolir.setValue(data.autoIsolir ?? false);
    setMaxDateMonthVal(data.maxDateMonth ?? 26);
    staticInterfacePSB.setValue(data.writeStaticInterfacePSB ?? false);
    const nextIp = incrementIP(data.lastIP, 1);
    setNextIpAddress(nextIp);
  });

  /**
   * @param {string} name
   * @param {string} value
   */
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

  useEffect(() => {
    if (!show) return;
    prefetch();
  }, [show]);

  /**
   * WhatsappHooks Method
   */

  // #region WhatsappHooks

  function validateWhatsappNode() {
    const result = whatsappHooks.map((item, i) => {
      if (!item.whatsappNodeId) throw new Error(`Whatsapp node no.${i + 1} tidak valid`);
      return item;
    });

    return result;
  }

  function addWhatsappHooks() {
    setWhatsappHooks((prev) => [...prev, { url: '', types: 'psb' }]);
  }

  function removeWhatsappHooks(index) {
    const copy = [...whatsappHooks];
    copy.splice(index, 1);
    setWhatsappHooks(copy);
  }

  function setOptionWhatsappHooks(index, types) {
    const copy = [...whatsappHooks];
    copy[index].types = types;
    setWhatsappHooks(copy);
  }

  function setWhatsappNodeId(index, id) {
    const copy = [...whatsappHooks];
    copy[index].whatsappNodeId = id;
    setWhatsappHooks(copy);
  }

  // #endregion

  /**
   * Scheduler Method
   */

  function validateScheduleMessageBilling() {
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
  }

  function addSchedule() {
    setSchedulerMessage((prev) => [
      ...prev,
      { date: '1', template: null, billingStatus: [], sendInvoice: false, special: false },
    ]);
  }

  function removeSchedule(index) {
    const copy = [...schedulerMessage];
    copy.splice(index, 1);
    setSchedulerMessage(copy);
  }

  function setTemplateSchedule(index, templateId) {
    const copy = [...schedulerMessage];
    copy[index].template = templateId;
  }

  function setDateSchedule(index, d) {
    const copy = [...schedulerMessage];
    copy[index].date = d;
  }

  /**
   * @param {number} index
   * @param {'paid' | 'unpaid'} status
   */
  function toggleBillingStatusMessageScheduler(index, status) {
    const copy = [...schedulerMessage];
    const isExistIndex = copy[index].billingStatus.indexOf(status);
    if (isExistIndex === -1) {
      copy[index].billingStatus.push(status);
    } else {
      copy[index].billingStatus.splice(isExistIndex, 1);
    }
    setSchedulerMessage(copy);
  }

  function toggleSendInvoiceMessageScheduler(index) {
    const copy = [...schedulerMessage];
    copy[index].sendInvoice = !copy[index].sendInvoice;
    setSchedulerMessage(copy);
  }

  function toggleCustomerSpecialMessageScheduler(index) {
    const copy = [...schedulerMessage];
    copy[index].special = !copy[index].special;
    setSchedulerMessage(copy);
  }

  return (
    <>
      <Form methods={methods}>
        <Dialog open={show} onClose={onClose} fullWidth maxWidth="sm" fullScreen={isMobile}>
          <DialogTitle>Area Server Form</DialogTitle>
          <DialogContent>
            <TabContext value={selectedTab}>
              <Stepper activeStep={parseInt(selectedTab)} alternativeLabel>
                {tabList.map((label, i) => (
                  <Step key={i} onClick={() => setSelectedTab(i.toString())}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>
              <TabPanel value="0">
                <Stack className="tw-py-2" spacing={2}>
                  {/* Area Identity */}
                  <div className="tw-ring-1 tw-ring-gray-400 tw-rounded-lg tw-relative tw-my-2 tw-p-5">
                    <span className="tw-px-2 tw-absolute -tw-top-3 tw-bg-white tw-text-sm tw-left-3">
                      Area Identity
                    </span>
                    <Stack spacing={2}>
                      <Field.Text name="areaCode" label="Kode Area" size="small" />
                      <Field.Text name="title" label="Nama Server" size="small" />
                      <TextField
                        label="Paste Kordinat Maps"
                        size="small"
                        onChange={(e) => seperateLatLng(e.target.value)}
                      />
                      <Grid container spacing={2}>
                        <Grid xs={6}>
                          <Field.Text
                            fullWidth
                            name="lat"
                            label="Lat"
                            size="small"
                            inputProps={{ readOnly: true }}
                          />
                        </Grid>
                        <Grid xs={5}>
                          <Field.Text
                            fullWidth
                            name="lng"
                            label="Lng"
                            size="small"
                            inputProps={{ readOnly: true }}
                          />
                        </Grid>
                        <Grid xs={1}>
                          <IconButton onClick={() => showMaps.onTrue()} color="primary">
                            <Iconify icon="mdi:map-marker" />
                          </IconButton>
                        </Grid>
                      </Grid>
                      <Field.Checkbox name="active" label="Active" />
                      <Field.Checkbox
                        name="requiredInstallationReport"
                        label="Wajib Upload Laporan Instalasi"
                      />
                    </Stack>
                  </div>
                  {/* End Area Identity */}
                  <div className="tw-ring-1 tw-ring-gray-400 tw-rounded-lg tw-relative tw-my-2 tw-p-5">
                    <span className="tw-px-2 tw-absolute -tw-top-3 tw-bg-white tw-text-sm tw-left-3">
                      Mikrotik Router Configuration
                    </span>
                    <Stack spacing={2}>
                      <Field.Text name="address" label="IP Address" size="small" />
                      <Field.Text name="port" label="SSH Port" size="small" />
                      <Field.Text name="username" label="Username" size="small" />
                      <Field.Text
                        name="password"
                        label="Password"
                        size="small"
                        type={showMikrotikPassword.value ? 'text' : 'password'}
                        SelectProps={{ displayEmpty: true }}
                        InputLabelProps={{ shrink: true }}
                        InputProps={{
                          readOnly: !editMikrotikPassword.value,
                          endAdornment: (
                            <InputAdornment position="end">
                              <Tooltip title={editMikrotikPassword.value ? 'Edit' : 'Cancel'}>
                                <IconButton
                                  onClick={() => editMikrotikPassword.onToggle()}
                                  edge="end"
                                >
                                  <Iconify
                                    icon={
                                      editMikrotikPassword.value
                                        ? 'material-symbols:close'
                                        : 'tabler:edit'
                                    }
                                  />
                                </IconButton>
                              </Tooltip>

                              {editMikrotikPassword.value ? (
                                <IconButton
                                  onClick={() => showMikrotikPassword.onToggle()}
                                  edge="end"
                                >
                                  <Iconify
                                    icon={
                                      showMikrotikPassword.value
                                        ? 'solar:eye-bold'
                                        : 'solar:eye-closed-bold'
                                    }
                                  />
                                </IconButton>
                              ) : null}
                            </InputAdornment>
                          ),
                        }}
                      />
                      <FormControlLabel
                        label="Dynamic IP Address"
                        control={
                          <Checkbox
                            checked={dynamicCustomerIp.value}
                            onChange={(e) => dynamicCustomerIp.setValue(e.target.checked)}
                          />
                        }
                      />
                      {dynamicCustomerIp.value ? (
                        <Stack direction="row" spacing={1}>
                          <Field.Text
                            name="lastIP"
                            label="IP Pelanggan PSB Terakhir"
                            size="small"
                            fullWidth
                          />
                          <TextField
                            label="IP Pelanggan PSB Selanjutnya"
                            size="small"
                            value={nextIpAddress}
                            fullWidth
                            inputProps={{ readOnly: true }}
                          />
                        </Stack>
                      ) : null}
                      <Field.Text name="defaultVlan" label="Default Vlan" size="small" />
                      <Field.Checkbox
                        name="writeStaticInterfacePSB"
                        label="Static Interface PPPoE Mikrotik"
                      />
                      {staticInterfacePSB.value ? (
                        <PPPoEInterface
                          value={pppoeInterfaceFormat}
                          onChange={setPPPoEInterfaceFormat}
                        />
                      ) : null}
                    </Stack>
                  </div>

                  {/* ACS */}
                  <div className="tw-ring-1 tw-ring-gray-400 tw-rounded-lg tw-relative tw-my-2 tw-p-5">
                    <span className="tw-px-2 tw-absolute -tw-top-3 tw-bg-white tw-text-sm tw-left-3">
                      ACS Connection
                    </span>
                    <Field.Text name="acsUrl" label="Acs URL" size="small" />
                  </div>
                  {/* END ACS */}
                  <div className="tw-ring-1 tw-ring-gray-400 tw-rounded-lg tw-relative tw-my-2">
                    <span className="tw-px-2 tw-absolute -tw-top-3 tw-bg-white tw-text-sm tw-left-3">
                      PRTG Credentials
                    </span>
                    <Grid container spacing={2} className="tw-p-5">
                      <Grid item columns={12} xs={12}>
                        <Field.Text
                          name="prtgUrl"
                          label="PRTG URL"
                          size="small"
                          SelectProps={{ displayEmpty: true }}
                          InputLabelProps={{ shrink: true }}
                        />
                      </Grid>
                      <Grid item columns={12} xs={12} sm={6}>
                        <Field.Text
                          name="prtgUsername"
                          label="PRTG Username"
                          size="small"
                          SelectProps={{ displayEmpty: true }}
                          InputLabelProps={{ shrink: true }}
                        />
                      </Grid>
                      <Grid item columns={12} xs={12} sm={6}>
                        <Field.Text
                          name="prtgPassword"
                          label="PRTG Password"
                          size="small"
                          type={showPrtgPassword.value ? 'text' : 'password'}
                          SelectProps={{ displayEmpty: true }}
                          InputLabelProps={{ shrink: true }}
                          InputProps={{
                            readOnly: !editPrtgPassword.value,
                            endAdornment: (
                              <InputAdornment position="end">
                                <Tooltip title={editPrtgPassword.value ? 'Edit' : 'Cancel'}>
                                  <IconButton
                                    onClick={() => editPrtgPassword.onToggle()}
                                    edge="end"
                                  >
                                    <Iconify
                                      icon={
                                        editPrtgPassword.value
                                          ? 'material-symbols:close'
                                          : 'tabler:edit'
                                      }
                                    />
                                  </IconButton>
                                </Tooltip>
                                {editPrtgPassword.value ? (
                                  <IconButton
                                    onClick={() => showPrtgPassword.onToggle()}
                                    edge="end"
                                  >
                                    <Iconify
                                      icon={
                                        showPrtgPassword.value
                                          ? 'solar:eye-bold'
                                          : 'solar:eye-closed-bold'
                                      }
                                    />
                                  </IconButton>
                                ) : null}
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>
                    </Grid>
                  </div>
                </Stack>
              </TabPanel>
              <TabPanel value="1">
                <Stack className="tw-py-2" spacing={2}>
                  {/* Customer ID */}
                  <div className="tw-flex tw-flex-col tw-p-4 tw-ring-1 tw-ring-gray-400 tw-rounded-lg">
                    <FormControlLabel
                      label="Dynamic ID Pelanggan"
                      className="tw-mb-4"
                      control={
                        <Checkbox
                          checked={dynamicCustomerId.value}
                          onChange={(e) => dynamicCustomerId.setValue(e.target.checked)}
                        />
                      }
                    />
                    {dynamicCustomerId.value ? (
                      <>
                        <Field.Text
                          name="prefixCustomer"
                          label="Prefix ID Pelanggan"
                          size="small"
                          onChange={(e) => {
                            setPrefix(e.target.value);
                            methods.setValue('prefixCustomer', e.target.value);
                          }}
                        />

                        <FormControlLabel
                          label="Auto Increment"
                          control={
                            <Checkbox
                              checked={autoIncrementStatus.value}
                              onChange={(e) => autoIncrementStatus.setValue(e.target.checked)}
                            />
                          }
                        />
                        <FormHelperText>
                          centang untuk membuat ID Pelanggan berurutan
                        </FormHelperText>
                        {autoIncrementStatus.value && (
                          <Stack direction="row" spacing={1} className="tw-mt-2">
                            <TextField
                              label="Nomor Terakhir"
                              size="small"
                              fullWidth
                              value={autoIncrementLastNumber.toString().toNumber()}
                              onChange={(e) =>
                                setAutoIncrementLastNumber(e.target.value.toString().toNumber())
                              }
                            />
                            <TextField
                              label="Total Digit"
                              size="small"
                              fullWidth
                              value={autoIncrementDigit.toString().toNumber()}
                              onChange={(e) =>
                                setAutoIncrementDigit(e.target.value.toString().toNumber())
                              }
                            />
                            <TextField
                              label="Contoh Hasil"
                              InputProps={{ readOnly: true }}
                              size="small"
                              fullWidth
                              value={
                                prefix +
                                autoIncrementLastNumber.toString().padStart(autoIncrementDigit, '0')
                              }
                            />
                          </Stack>
                        )}
                      </>
                    ) : null}
                  </div>
                  <div className="tw-flex tw-flex-col tw-p-4 tw-ring-1 tw-ring-gray-400 tw-rounded-lg">
                    {/* Dynamic PPPoE Password */}
                    <FormControlLabel
                      label="Dynamic PPPoE Password"
                      control={
                        <Checkbox
                          size="small"
                          checked={isRandomPppoePassword.value}
                          onChange={(e) => isRandomPppoePassword.setValue(e.target.checked)}
                        />
                      }
                    />
                    <FormHelperText>
                      centang untuk mengaktifkan PPPoE Password Pelanggan secara dynamic
                    </FormHelperText>
                    {isRandomPppoePassword.value ? (
                      <Stack spacing={1} className="tw-mt-4">
                        <TextField
                          label="Type"
                          size="small"
                          fullWidth
                          value={randomPPPoEPasswordOption}
                          onChange={(e) => setRandomPPPoEPasswordOption(e.target.value)}
                          select
                        >
                          {randomPPPoEPasswordOptionList.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                              {option.label}
                            </MenuItem>
                          ))}
                        </TextField>
                      </Stack>
                    ) : null}
                    {isRandomPppoePassword.value && randomPPPoEPasswordOption === 'numeric' ? (
                      <Stack spacing={1} className="tw-mt-4">
                        <TextField
                          label="Total Digit"
                          size="small"
                          fullWidth
                          value={randomPasswordDigit}
                          onChange={(e) =>
                            setRandomPasswordDigit(e.target.value.toString().toNumber())
                          }
                        />
                      </Stack>
                    ) : null}
                  </div>
                  <div className="tw-flex tw-flex-col tw-gap-4 tw-p-4 tw-ring-1 tw-ring-gray-400 tw-rounded-lg">
                    <Field.Text name="isPrePaid" label="Jenis Layanan" size="small" select>
                      <MenuItem value={false}>Postpaid/Pascabayar/bayar dibelakang</MenuItem>
                      <MenuItem value>Prepaid/Prabayar/bayar didepan</MenuItem>
                    </Field.Text>

                    {/* <Field.Text name="duoDate" label="Tanggal Jatuh Tempo" size="small" /> */}

                    <Field.Checkbox
                      name="autoIsolirAfterPsb"
                      size="small"
                      label="Isolir Setelah PSB"
                      helperText="Isolir otomatis setelah PSB (ketika pelanggan belum melakukan pembayaran)"
                    />
                  </div>

                  <div className="tw-flex tw-flex-col tw-gap-4 tw-p-4 tw-ring-1 tw-ring-gray-400 tw-rounded-lg">
                    <Stack>
                      <FormControlLabel
                        label="Isolir pada tanggal PSB"
                        control={
                          <Checkbox
                            size="small"
                            checked={isolirPsbDate.value}
                            onChange={(e) => isolirPsbDate.onToggle()}
                          />
                        }
                      />
                      <FormHelperText className="tw-whitespace-pre-line">
                        Centang dan isi tanggal untuk mengaktifkan auto isolir sesuai tanggal PSB
                        pelanggan. {'\n'}
                      </FormHelperText>
                    </Stack>
                    <Stack direction="row" alignItems="start">
                      <Field.Checkbox name="autoIsolir" size="small" />
                      <Stack className="tw-w-full">
                        <Field.Text
                          name="autoIsolirDate"
                          label="Tanggal Auto Isolir"
                          placeholder="Kosongkan apabila tanpa otomatis"
                          size="small"
                          disabled={!isAutoIsolir.value}
                          fullWidth
                          InputLabelProps={{ shrink: true }}
                        />
                        <FormHelperText className="tw-whitespace-pre-line">
                          Centang dan isi tanggal untuk mengaktifkan auto isolir. {'\n'}
                          isolir akan dilakukan pada jam 23:40.
                        </FormHelperText>
                      </Stack>
                    </Stack>

                    <Divider />
                    <OpenIsolirInvoiceTempField
                      checkedValue={openIsolirInvoiceTemp.value}
                      duration={openIsolirInvoiceTempDuration}
                      onDurationChange={(newDuration) =>
                        setOpenIsolirInvoiceTempDuration(newDuration)
                      }
                      onCheckedChange={(newCheckedValue) =>
                        openIsolirInvoiceTemp.setValue(newCheckedValue)
                      }
                    />
                    <Divider />
                    <OpenIsolirPaymentRequestField
                      checkedValue={openTemporaryPaymentRequest.value}
                      onCheckedChange={(newCheckedValue) =>
                        openTemporaryPaymentRequest.setValue(newCheckedValue)
                      }
                    />
                    <Divider />
                    <Stack direction="row" alignItems="start">
                      <FormControlLabel
                        control={
                          <Checkbox
                            size="small"
                            checked={usingMaxDateMonth.value}
                            onChange={(e) => usingMaxDateMonth.setValue(e.target.checked)}
                          />
                        }
                      />
                      <Stack className="tw-w-full">
                        <Field.Text
                          name="maxDateMonth"
                          size="small"
                          label="Rule PSB Intai"
                          type="number"
                          disabled={!usingMaxDateMonth.value}
                        />
                        {usingMaxDateMonth.value ? (
                          <FormHelperText>
                            Mulai tanggal {maxDateMonthVal + 1} akan menggenapkan PSB menjadi
                            tanggal 1 di bulan berikutnya
                          </FormHelperText>
                        ) : null}
                      </Stack>
                    </Stack>
                  </div>
                  <Divider />
                  <div className="tw-flex tw-flex-col tw-gap-4 tw-p-4 tw-ring-1 tw-ring-gray-400 tw-rounded-lg">
                    <span className="tw-text-xs">Billing</span>
                    <Stack direction="row" alignItems="start">
                      <Field.Checkbox name="billingRequireProofOfPayment" size="small" />
                      <Stack className="tw-w-full">
                        <TextField
                          InputProps={{ readOnly: true }}
                          size="small"
                          value="Wajib Upload Resi"
                        />
                        <FormHelperText>
                          Centang agar input pembayaran harus upload bukti transfer / transaksi
                        </FormHelperText>
                        <div className="tw-mt-4" />
                        <Divider />
                        <div className="tw-mb-4" />
                        <Field.Text
                          name="installationCharge"
                          label="Biaya Pemasangan"
                          size="small"
                          onChange={(e) => {
                            methods.setValue(
                              'installationCharge',
                              e.target.value.toString().toNumber().formatCurrency()
                            );
                          }}
                        />
                        <FormHelperText>
                          Input biaya pemasangan agar ditagihkan ke pelanggan saat PSB
                        </FormHelperText>
                      </Stack>
                    </Stack>
                  </div>
                </Stack>
              </TabPanel>
              <TabPanel value="2">
                <Stack spacing={2}>
                  {/* Whatsapp Node Field */}
                  <div className=" tw-px-5 tw-py-7 tw-gap-3 tw-flex tw-flex-col tw-ring-1 tw-ring-gray-500 tw-rounded-lg tw-relative">
                    <div className="tw-bg-white tw-px-2 tw-absolute -tw-top-3">
                      <span className="tw-font-semibold tw-text-xs">Whatsapp Node</span>
                    </div>
                    <div className="tw-grid tw-grid-cols-12 tw-w-full tw-gap-2">
                      {whatsappHooks.map((wh, i) => (
                        <Fragment key={i}>
                          <div className="tw-col-span-12 md:tw-col-span-6">
                            <Select
                              value={whatsappHooks[i].whatsappNodeId}
                              onChange={(e) => {
                                setWhatsappNodeId(i, e.target.value);
                              }}
                              size="small"
                              fullWidth
                              inputProps={{ 'aria-label': 'Without label' }}
                            >
                              {...(whatsappNode ?? []).map((wa, index) => (
                                <MenuItem key={index} value={wa._id}>
                                  {wa.title}
                                </MenuItem>
                              ))}
                            </Select>
                          </div>
                          <div className="tw-col-span-12 md:tw-col-span-6 tw-flex tw-flex-row tw-items-center tw-gap-2">
                            <TextField
                              select
                              fullWidth
                              size="small"
                              color="primary"
                              value={whatsappHooks[i].types}
                              label="Kategori"
                              onChange={(e) => setOptionWhatsappHooks(i, e.target.value)}
                            >
                              {whatsappHooksTypes.map((wht, j) => (
                                <MenuItem key={i} value={wht.value}>
                                  {wht.label}
                                </MenuItem>
                              ))}
                            </TextField>
                            <IconButton color="error" onClick={() => removeWhatsappHooks(i)}>
                              <Iconify icon="mdi:minus" />
                            </IconButton>
                          </div>
                        </Fragment>
                      ))}
                    </div>
                    <div className="tw-flex tw-flex-row tw-items-center tw-justify-end tw-w-full">
                      <Button
                        onClick={() => addWhatsappHooks()}
                        variant="outlined"
                        color="success"
                        className="tw-w-auto"
                        size="small"
                      >
                        <Iconify icon="mdi:plus" /> Whatsapp Node
                      </Button>
                    </div>
                  </div>
                  <Divider />
                  {/* <div className=" tw-px-5 tw-py-7 tw-gap-3 tw-flex tw-flex-col tw-ring-1 tw-ring-gray-500 tw-rounded-lg tw-relative">
                    <div className="tw-bg-white tw-px-2 tw-absolute -tw-top-3">
                      <span className="tw-font-semibold tw-text-xs">Pengaturan Broadcast</span>
                    </div>
                    <Field.Text
                      name="broadcastChunksize"
                      label="Maksimal"
                      size="small"
                      type="number"
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <span className="tw-text-xs">Pesan per sesi</span>
                          </InputAdornment>
                        ),
                      }}
                    />
                    <Field.Text
                      name="broadcastInterval"
                      label="Jeda"
                      size="small"
                      type="number"
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <span className="tw-text-xs">Menit per sesi</span>
                          </InputAdornment>
                        ),
                      }}
                    />
                    <Field.Text
                      name="broadcastDelay"
                      label="Jeda Pesan"
                      size="small"
                      type="number"
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <span className="tw-text-xs">Detik Per Pesan</span>
                          </InputAdornment>
                        ),
                      }}
                    />
                    <Field.Text
                      name="whatsappGroupBroadcast"
                      label="Kategori Whatsapp Broadcast"
                      size="small"
                      select
                    >
                      {whatsappGroupList.map((wg, i) => (
                        <MenuItem key={i} value={wg._id}>
                          {wg.name}
                        </MenuItem>
                      ))}
                    </Field.Text>
                  </div> */}
                  <Divider />
                  <div className=" tw-px-5 tw-py-7 tw-gap-3 tw-flex tw-flex-col tw-ring-1 tw-ring-gray-500 tw-rounded-lg tw-relative">
                    {/* Group Title */}
                    <div className="tw-bg-white tw-px-2 tw-absolute -tw-top-3">
                      <span className="tw-font-semibold tw-text-xs">Whatsapp PSB Auto Respon</span>
                    </div>
                    {/* End Group Title */}
                    <Field.Text
                      name="whatsappId"
                      label="ChatID Group PSB Internal"
                      size="small"
                      fullWidth
                      helperText="Whatsapp Node PSB"
                    />
                    <div className="tw-flex tw-flex-row tw-items-center tw-justify-between tw-gap-2">
                      <Field.Checkbox
                        name="allowBroadcast"
                        label={<span className="tw-text-xs">Laporan PSB harian</span>}
                        size="small"
                      />

                      <div className="tw-flex tw-flex-row tw-items-center tw-justify-end tw-gap-2">
                        <Button
                          onClick={() => {
                            testSendWhatsapp(methods.getValues('whatsappId'), 'psb');
                          }}
                          color="success"
                          variant="outlined"
                          className="tw-flex-none tw-w-min tw-whitespace-nowrap"
                          size="small"
                        >
                          Kirim Test
                        </Button>
                        <Button
                          onClick={() => {
                            checkGroupWhatsappValid(methods.getValues('whatsappId'), 'psb');
                          }}
                          color="success"
                          variant="outlined"
                          className="tw-flex-none tw-w-min tw-whitespace-nowrap"
                          size="small"
                        >
                          Check
                        </Button>
                      </div>
                    </div>
                  </div>
                  <Divider />
                  {/* Whatsapp Billing */}
                  <div className=" tw-px-5 tw-py-7 tw-gap-3 tw-flex tw-flex-col tw-ring-1 tw-ring-gray-500 tw-rounded-lg tw-relative">
                    {/* Group Title */}
                    <div className="tw-bg-white tw-px-2 tw-absolute -tw-top-3">
                      <span className="tw-font-semibold tw-text-xs">
                        Whatsapp Billing Auto Respon Pembayaran
                      </span>
                    </div>
                    {/* End Group Title */}
                    <Field.Text
                      name="whatsappIdBilling"
                      label="ChatID Group Billing Internal"
                      size="small"
                      helperText="Whatsapp Node Billing"
                    />
                    <div className="tw-flex tw-flex-row tw-items-center tw-justify-end tw-gap-2">
                      <Button
                        onClick={() => {
                          testSendWhatsapp(methods.getValues('whatsappIdBilling'), 'billing');
                        }}
                        color="success"
                        variant="outlined"
                        className="tw-flex-none tw-w-min tw-whitespace-nowrap"
                        size="small"
                      >
                        Kirim Test
                      </Button>
                      <Button
                        onClick={() => {
                          checkGroupWhatsappValid(
                            methods.getValues('whatsappIdBilling'),
                            'billing'
                          );
                        }}
                        color="success"
                        variant="outlined"
                        className="tw-flex-none tw-w-min tw-whitespace-nowrap"
                        size="small"
                      >
                        Check
                      </Button>
                    </div>

                    {/* Template Scheduler */}
                  </div>
                  {/* Whatsapp Ticket */}
                  <div className=" tw-px-5 tw-py-7 tw-gap-3 tw-flex tw-flex-col tw-ring-1 tw-ring-gray-500 tw-rounded-lg tw-relative">
                    {/* Group Title */}
                    <div className="tw-bg-white tw-px-2 tw-absolute -tw-top-3">
                      <span className="tw-font-semibold tw-text-xs">
                        Whatsapp Ticket Auto Respon
                      </span>
                    </div>
                    {/* End Group Title */}
                    <Field.Text
                      name="whatsappIdTicket"
                      label="ChatID Group Ticket Internal"
                      size="small"
                      helperText="Whatsapp Node Ticket / PSB"
                    />
                    <div className="tw-flex tw-flex-row tw-items-center tw-justify-end tw-gap-2">
                      <Button
                        onClick={() => {
                          testSendWhatsapp(methods.getValues('whatsappIdTicket'), 'billing');
                        }}
                        color="success"
                        variant="outlined"
                        className="tw-flex-none tw-w-min tw-whitespace-nowrap"
                        size="small"
                      >
                        Kirim Test
                      </Button>
                      <Button
                        onClick={() => {
                          checkGroupWhatsappValid(
                            methods.getValues('whatsappIdBilling'),
                            'billing'
                          );
                        }}
                        color="success"
                        variant="outlined"
                        className="tw-flex-none tw-w-min tw-whitespace-nowrap"
                        size="small"
                      >
                        Check
                      </Button>
                    </div>

                    {/* Template Scheduler */}
                  </div>
                  <Divider />

                  <div className=" tw-px-5 tw-py-7 tw-gap-3 tw-flex tw-flex-col tw-ring-1 tw-ring-gray-500 tw-rounded-lg tw-relative">
                    <div className="tw-bg-white tw-px-2 tw-absolute -tw-top-3">
                      <span className="tw-font-semibold tw-text-xs">Notifikasi Pelanggan</span>
                    </div>
                    <Stack spacing={4}>
                      <Field.Text
                        select
                        name="templateAutoSendBilling"
                        label="Template Konfirmasi Pembayaran ke Pelanggan"
                        size="small"
                        helperText="Whatsapp Node Billing"
                      >
                        {templates.map((t, i) => (
                          <MenuItem key={i} value={t._id}>
                            {t.title}
                          </MenuItem>
                        ))}
                      </Field.Text>
                      <Field.Text
                        select
                        name="notificationPaymentAfterPsb"
                        label="Template Notifikasi Setelah PSB"
                        size="small"
                        InputLabelProps={{ shrink: true }}
                        SelectProps={{ displayEmpty: true }}
                        helperText="Whatsapp Node Customer Service"
                      >
                        {templates.map((t, i) => (
                          <MenuItem key={i} value={t._id}>
                            {t.title}
                          </MenuItem>
                        ))}
                        <MenuItem value={null}>Tanpa Template</MenuItem>
                      </Field.Text>
                    </Stack>
                  </div>
                  <Divider />
                  {/* schedulerMessage.map((m, i) => (
                    <div
                      key={i}
                      className="tw-ring-1 tw-ring-gray-500 tw-rounded-lg tw-px-5 tw-py-6 tw-relative"
                    >
                      <div className="tw-bg-white tw-px-1 tw-absolute -tw-top-3">
                        <span className="tw-font-semibold tw-text-xs">
                          Auto Schedule Billing {i + 1}
                        </span>
                      </div>
                      <div className="tw-flex tw-flex-row tw-items-start tw-w-full tw-gap-2">
                        <div className="tw-grid tw-grid-cols-6 tw-w-full tw-gap-2">
                          <div className="tw-w-full tw-col-span-6 md:tw-col-span-2">
                            <TextField
                              label="Tanggal"
                              size="small"
                              fullWidth
                              defaultValue={m.date}
                              onChange={(e) => setDateSchedule(i, e.target.value)}
                            />
                          </div>
                          <div className="tw-w-full tw-col-span-6 md:tw-col-span-4 tw-flex tw-flex-row tw-items-center tw-gap-1">
                            <TextField
                              select
                              defaultValue={m.template}
                              name="templateAutoSendBilling"
                              label="Template Pesan"
                              size="small"
                              fullWidth
                              onChange={(e) => setTemplateSchedule(i, e.target.value)}
                            >
                              {templates.map((t, j) => (
                                <MenuItem key={j} value={t._id}>
                                  {t.title}
                                </MenuItem>
                              ))}
                            </TextField>
                            <IconButton
                              onClick={() => removeSchedule(i)}
                              variant="outlined"
                              color="error"
                              className="tw-w-min tw-mx-auto"
                            >
                              <Iconify icon="mdi:minus" />
                            </IconButton>
                          </div>
                          <div className="tw-flex tw-flex-wrap tw-gap-2 tw-col-span-6 tw-w-full">
                            <FormControlLabel
                              checked={schedulerMessage[i].billingStatus.includes('paid')}
                              control={<Checkbox />}
                              label="Paid"
                              onClick={(e) => toggleBillingStatusMessageScheduler(i, 'paid')}
                            />
                            <FormControlLabel
                              checked={schedulerMessage[i].billingStatus.includes('unpaid')}
                              control={<Checkbox />}
                              label="Unpaid"
                              onClick={(e) => toggleBillingStatusMessageScheduler(i, 'unpaid')}
                            />
                            <FormControlLabel
                              checked={schedulerMessage[i].billingStatus.includes('partially_paid')}
                              control={<Checkbox />}
                              label="Partially Paid"
                              onClick={(e) =>
                                toggleBillingStatusMessageScheduler(i, 'partially_paid')
                              }
                            />
                            <FormControlLabel
                              checked={m.special}
                              control={<Checkbox />}
                              label="Pelanggan Special"
                              onClick={() => toggleCustomerSpecialMessageScheduler(i)}
                            />
                            <FormControlLabel
                              checked={m.sendInvoice}
                              control={<Checkbox />}
                              label="Invoice"
                              onClick={() => toggleSendInvoiceMessageScheduler(i)}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )) */}
                  {/* <div className="tw-flex tw-flex-row tw-items-center tw-justify-end tw-w-full">
                    <Button
                      onClick={() => addSchedule()}
                      variant="outlined"
                      color="success"
                      className="tw-w-auto"
                      size="small"
                    >
                      <Iconify icon="mdi:plus" /> Auto Schedule Billing
                    </Button>
                  </div> */}
                  <Divider />
                </Stack>
              </TabPanel>
              <TabPanel value="3">
                <Stack className="tw-py-2" spacing={2}>
                  {placeholder != null ? (
                    <div className="tw-relative tw-mx-auto">
                      <div className="-tw-top-5 tw-right-0 tw-absolute">
                        <IconButton color="error" type="button" onClick={() => clearPlaceholder()}>
                          <Iconify icon="mdi:close" />
                        </IconButton>
                      </div>

                      <img
                        className="tw-w-36 tw-aspect-square tw-rounded-full tw-object-cover tw-object-center"
                        src={`/public/uploads/${placeholder.replaceAll('/public/uploads', '')}`}
                        alt="Logo"
                      />
                    </div>
                  ) : (
                    <Field.UploadAvatar name="companyLogo" />
                  )}
                  <span className="tw-text-xs tw-text-gray-500 tw-mx-auto">
                    Default: Logo Intek
                  </span>
                  <Field.Text
                    name="companyName"
                    fullWidth
                    label="Nama Perusahaan"
                    size="small"
                    helperText="default: PT. INFORMASI NUSANTARA TEKNOLOGI"
                  />
                  <Field.Text
                    name="companyAddress"
                    fullWidth
                    label="Alamat Perusahaan"
                    size="small"
                    helperText="default: Ruko King Business Center, Blok A5 No. 11, Batam"
                  />
                </Stack>
              </TabPanel>
            </TabContext>
          </DialogContent>
          <DialogActions>
            <div className="tw-flex tw-flex-row tw-items-center tw-justify-between tw-w-full tw-gap-2">
              <div className="tw-flex tw-flex-row tw-items-center tw-gap-2">
                <Button onClick={onTestPingArea} color="success" variant="outlined">
                  Test
                </Button>
                <Button onClick={writeFirewallRules} color="primary" variant="outlined">
                  <Iconify icon="mdi:plus" /> Firewall Rules
                </Button>
              </div>
              <div className="tw-flex tw-flex-row tw-items-center tw-gap-2">
                <Button onClick={onClose} color="error">
                  Tutup
                </Button>
                {selectedTab !== '0' && (
                  <Button onClick={() => setSelectedTab((parseInt(selectedTab) - 1).toString())}>
                    Prev
                  </Button>
                )}
                {selectedTab !== '3' && (
                  <Button onClick={() => setSelectedTab((parseInt(selectedTab) + 1).toString())}>
                    Next
                  </Button>
                )}
                <Button color="primary" onClick={submit} variant="contained">
                  Simpan
                </Button>
              </div>
            </div>
          </DialogActions>
        </Dialog>
      </Form>
      <MapsPickerDialog
        show={showMaps.value}
        onPick={onPickMaps}
        onClose={() => showMaps.onFalse()}
      />
    </>
  );
}

const mapStateToProps = (state) => ({ templates: state.broadcastStore.data });

export default connect(mapStateToProps)(ServerFormDialog);
