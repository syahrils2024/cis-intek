/**
 * @typedef {import('@/stores/customerFormStore').CustomerFormStore} CustomerFormStore
 * @typedef {import('@/repositories/area').Area} Area
 * @typedef {import('@/repositories/area').Odp} Odp
 * @typedef {import('@/repositories/area').PPPOEItems} PPPOEItems
 * @typedef {import('@/repositories/package').ResultPackageList} Package
 * @typedef {import('@/repositories/customer').Customer} Customer
 * @typedef {import('@/repositories/user').User} User
 * @typedef {import('@/repositories/installationRequest').InstallationRequestInsert} InstallationRequestInsert
 * @typedef {import('@/repositories/area').SubmitODP} SubmitODP
 */

import { z } from 'zod';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { parseLatLng } from '@utils/location';
import { useBoolean } from '@hooks/use-boolean';
import { useConfirm } from 'material-ui-confirm';
import { zodResolver } from '@hookform/resolvers/zod';
import { usePrivilege } from '@auth/hooks/privileges';
import { useDispatch, useSelector } from 'react-redux';
import { useRef, useMemo, useState, useEffect } from 'react';

import 'src/extension/date';
import 'src/extension/number';
import 'src/extension/string';
import { reset, setFormState } from 'src/stores/customerFormStore';
import {
  ktpRepository,
  areaRepository,
  userRepository,
  addonsRepository,
  customerRepository,
  whatsappRepository,
  packagePlanRepository,
  installationRequestRepository,
} from 'src/repositories';

const schemaValidator = z.object({
  fullname: z.string().min(1, 'tidak boleh kosong'),
  phone: z.string().min(1, 'tidak boleh kosong'),
  // .regex(/^(?:\+62|62|0)[2-9][0-9]{7,15}$/, 'tidak valid'),
  address: z.string().min(1, 'tidak boleh kosong'),
  // birth: z.string().min(1, 'tidak boleh kosong'),
  lat: z.string().or(z.number()).optional(),
  long: z.string().or(z.number()).optional(),
  serverAreaId: z.string(), // .min(1, 'tidak boleh kosong'),
  vlanId: z.string(),
  ipRemote: z.string().optional(),
  customerId: z.string(),
  PPPoEName: z.string(),
  PPPoEPassword: z.string(),
  packetPlanId: z.string(),
  price: z.string().or(z.number()), // .min(0, 'minimal 0'),
  start: z.string().optional(),
  ktpImage: z.instanceof(File).nullable(),
  serverOdpId: z.any(),
  engineers: z.array(z.string()),
  routerSsid: z.string(),
  routerMac: z.string().default(''),
  routerSerialNumber: z.string(),
  routerPassword: z.string(),
  isSpecial: z.boolean(),
  additionalPhoneNumber: z.array(z.string()).default([]),
});

const defaultValues = {
  fullname: '',
  phone: '',
  address: '',
  // birth: '',
  lat: '0',
  long: '0',
  ktpImage: null,
  serverAreaId: '',
  serverOdpId: '',
  vlanId: '',
  ipRemote: '',
  customerId: '', // Customer ID
  PPPoEName: '', // PPPoEName
  PPPoEPassword: '',
  packetPlanId: '',
  price: '0',
  start: '',
  routerSsid: '',
  routerPassword: '',
  routerSerialNumber: '',
  routerMac: '',
  engineers: [],
  isSpecial: false,
  additionalPhoneNumber: [],
};

/**
 * @param {{show: boolean, onClose: void; selectedCustomer: Customer | null; statusMode: null | string, labelConfirm: string; readonlyPackage: boolean}} props
 */
export const useCustomerFormDialogState = ({
  show,
  onClose,
  selectedCustomer,
  statusMode = 'pending',
  readonlyPackage,
}) => {
  const confirm = useConfirm();
  const dispatch = useDispatch();
  const loading = useBoolean(false);
  const { isEngineer, isAdmin, isNoc } = usePrivilege();
  const allowModify = useMemo(() => isAdmin || isNoc);
  const isAutoIncrementID = useBoolean(false);
  const isRandomPppoePassword = useBoolean(false);

  const [serverAreaId, setServerAreaId] = useState('');

  const showGeneratedID = useBoolean(false);
  const usingDynamicIP = useBoolean(true);
  const usingDynamicCustomerId = useBoolean(true);

  /** @type {[Area[], void]} */
  const [areas, setAreas] = useState([]);

  /** @type {[Odp[], void]} */
  const [odpList, setOdpList] = useState([]);

  /** @type {[PPPOEItems[], void]} */
  const [vlanList, setVlanList] = useState([]);

  /** @type {[Package[], void]} */
  const [availablePackage, setAvailablePackage] = useState([]);

  // Engineer Data
  /** @type {[User[], void]} */
  const [engineers, setEngineers] = useState([]);

  /** @type {[User[], void]} */
  const [selectedEngineer, setSelectedEngineer] = useState(['']);

  /** @type {'Proses' | 'Registrasi' | 'Simpan'} */
  const submitLabel = useMemo(() => {
    let buttonLabel = '';

    if (statusMode === 'processed') {
      buttonLabel = 'Proses';
    } else if (statusMode === 'pending' && selectedCustomer == null) {
      buttonLabel = 'Simpan';
    } else if (statusMode === 'pending-process') {
      buttonLabel = 'Setujui & Proses';
    } else {
      buttonLabel = 'Simpan';
    }

    return buttonLabel;
  });

  const allowProcess = useBoolean(false);

  const ktpFormConfirmRef = useRef();

  /** @type {{current: {cropImage: (data: File) => Promise<File>}}} */
  const cropperImageRef = useRef();

  const checkAllowProcess = (data) => {
    const snapshotData = {
      address: data.address,
      area: data.serverAreaId,
      // dateOfBirth: data.birth,
      fullname: data.fullname,
      id: selectedCustomer?._id,
      IPRemote: data.ipRemote,
      ktp: data.ktpImage,
      lat: data.lat,
      lng: data.long,
      ODP: data.serverOdpId?.value ?? '',
      phone: data.phone,
      customerId: data.customerId,
      PPPoEName: data.PPPoEName,
      PPPoEPassword: data.PPPoEPassword,
      subscriptionPlan: data.packetPlanId,
      subscriptionPrice: data.price?.toString(),
      vlan: data.vlanId,
    };

    const checkEmptyString = [
      snapshotData.address,
      snapshotData.area,
      // snapshotData.dateOfBirth,
      snapshotData.fullname,
      snapshotData.IPRemote,
      snapshotData.ODP,
      snapshotData.phone,
      snapshotData.customerId,
      snapshotData.PPPoEPassword,
      snapshotData.subscriptionPlan,
      snapshotData.vlan,
    ];

    const checkEmptyNumber = [snapshotData.lat, snapshotData.lng];
    const ktpIsNull = data.ktpImage === null && placeholderKtp === null;

    if (checkEmptyString.includes('') || checkEmptyNumber.includes(0) || ktpIsNull) {
      allowProcess.onFalse();
    } else {
      allowProcess.onTrue();
    }
  };

  const showOdpForm = useBoolean(false);

  const isSelfInstallation = useBoolean(false);
  const isSimplePSB = useBoolean(false);

  const availableSelectEngineer = useMemo(() => {
    const userId = localStorage.getItem('userId');
    return engineers.map((e) => ({
      label: e._id === userId ? `${e.fullname} (Anda)` : e.fullname,
      value: e._id,
    }));
  });

  const areaList = useMemo(() => {
    const maping = [];

    areas.forEach((a) => {
      maping.push(a.title);
      a.area.forEach((area) => {
        maping.push(area);
      });
    });

    return maping;
  });

  const packageList = useMemo(() => {
    // console.log(serverAreaId);
    if (serverAreaId === '' || !serverAreaId) {
      return availablePackage;
    }

    const resultMap = availablePackage
      .map((p) => {
        const data = { ...p };
        const findPrice = p.prices.find((price) => price.area === serverAreaId);
        if (!findPrice) return null;
        if (findPrice.price === 0 && !p.title.toLowerCase().includes('free')) return null;
        data.price = findPrice.price.toString().toNumber().formatCurrency();
        return data;
      })
      .filter((result) => !!result);

    return resultMap;
  });

  const tabsLabel = useMemo(() => {
    const currentItem = [
      { label: 'Set Data', value: 0 },
      { label: 'Set Area', value: 1 },
      { label: 'Paket & ONU', value: 2 },
      { label: 'PPPoE Network', value: 3 },
      { label: 'Teknisi', value: 4 },
    ];

    return currentItem;
  });
  const [selectedTab, setSelectedTab] = useState('0');

  const [addons, setAddons] = useState([]); // Addons Items
  const [addonsList, setAddonsList] = useState([]); // Addons Area
  const loadingAddons = useBoolean(false);
  const addonsRef = useRef();
  async function prefetchAddons(areaId) {
    loadingAddons.onTrue();
    try {
      const snapshot = await addonsRepository.getAddonsArea(areaId);
      setAddonsList(snapshot);
    } catch (error) {
      toast.error(error.message);
    } finally {
      loadingAddons.onFalse();
    }
  }

  function getAddons() {
    return addonsList.map((item, i) => {
      if (item.addon === '') throw new Error(`Addon ${i + 1} tidak boleh kosong`);
      return item;
    });
  }

  /** @type {[string, void]} */
  const [placeholderKtp, setPlaceholderKtp] = useState(null);

  const isAllFilled = useBoolean(false);

  const methods = useForm({
    defaultValues,
    resolver: zodResolver(schemaValidator),
  });
  const { handleSubmit } = methods;

  const showMaps = useBoolean(false);

  const onPickMaps = ([lat, lng]) => {
    methods.setValue('lat', lat.toString());
    methods.setValue('long', lng.toString());
    showMaps.onFalse();
  };

  const prefetch = async () => {
    isAutoIncrementID.onFalse();
    isRandomPppoePassword.onFalse();
    loading.onTrue();
    try {
      const snapshot = await areaRepository.getAllArea();
      setAreas(snapshot);
      // dispatch(setArea(snapshot));

      const snapshotPackage = await packagePlanRepository.getPackageList();
      setAvailablePackage(snapshotPackage);
      // dispatch(setPackage(snapshotPackage));
      const selectedArea = methods.getValues('area');

      const snapshotEngineers = await userRepository.getUserByPrivilege('engineer', {
        area: selectedArea,
      });

      const snapshotLo = await userRepository.getUserByPrivilege('liaison_officer', {
        area: selectedArea,
      });
      const filteredActiveEngineer = [...snapshotEngineers, ...snapshotLo].filter(
        (e) => e.status === 'active'
      );

      setEngineers(filteredActiveEngineer);
    } catch (error) {
      console.error(error);
      toast.error(error.message);
      onBeforeClose();
    } finally {
      loading.onFalse();
    }
  };

  const pickArea = async (areaId, isReplace) => {
    if (areaId === '' || !areaId) return;
    methods.setValue('serverAreaId', areaId);

    const areaDetail = await areaRepository.getAreaDetail(areaId);
    prefetchAddons(areaId);
    isAutoIncrementID.setValue(areaDetail.autoIncrementStatus);
    isRandomPppoePassword.setValue(areaDetail.isRandomPppoePassword ?? false);
    usingDynamicIP.setValue(areaDetail.dynamicIP ?? true);
    usingDynamicCustomerId.setValue(areaDetail.dynamicCustomerId ?? true);

    const currentcustomerId = methods.getValues('customerId');
    if (
      areaDetail.prefixCustomer &&
      isReplace &&
      !currentcustomerId.includes(areaDetail.prefixCustomer)
    ) {
      methods.setValue('customerId', areaDetail.prefixCustomer);
    }
    const currentIP = methods.getValues('ipRemote');
    if (areaDetail && statusMode === 'processed') {
      // console.log('Gen');
      methods.setValue('ipRemote', areaDetail.routerConfig.lastIP);
    }

    const snapshotOdp = await areaRepository.getOdpList(areaId, { recursive: 'true' });
    setOdpList(snapshotOdp);
    // dispatch(setOdp(snapshotOdp));

    // const vlan = await areaRepository.getVlanList(areaId);

    methods.setValue('vlanId', areaDetail.defaultVlan);

    // if vlan exist
    // const defaultVlanExist = vlan.some((v) => v.name === areaDetail.defaultVlan);
    // if (!defaultVlanExist && !!areaDetail.defaultVlan) {
    //   vlan.push({ name: areaDetail.defaultVlan });
    // }

    if (areaDetail.defaultVlan) {
      setVlanList([{ name: areaDetail.defaultVlan }]);
    } else {
      setVlanList([]);
    }

    const snapshotEngineers = await userRepository.getUserByPrivilege('engineer', {
      area: areaId,
    });

    const snapshotLo = await userRepository.getUserByPrivilege('liaison_officer', {
      area: areaId,
    });

    /** @type {string[]} */
    const currentSelectedEngineer = methods.getValues('engineers');

    const filteredActiveEngineer = [...snapshotEngineers, ...snapshotLo].filter(
      (e) => e.status === 'active'
    );

    const activeEngineerId = filteredActiveEngineer.map((e) => e._id);

    const notReplaceEngineer = currentSelectedEngineer.filter((e) => activeEngineerId.includes(e));

    setEngineers(filteredActiveEngineer);
    methods.setValue('engineers', notReplaceEngineer);
  };

  /**
   *
   * @param {string} packetId
   */
  const pickPrice = async (packetId) => {
    const packet = availablePackage.find((p) => p._id === packetId);
    // console.log({ packet, packetId });
    if (typeof packet.price === 'number') {
      methods.setValue('price', packet.price.toString().toNumber().formatCurrency());
    } else {
      const price = packet.prices.find((p) => p.area === serverAreaId);
      methods.setValue('price', (price?.price ?? 0).toString().toNumber().formatCurrency());
    }
    methods.setValue('packetPlanId', packetId);
  };

  /**
   *
   * @param {string} phone
   */
  const pickPhone = async (phone) => {
    // methods.setValue('PPPoEPassword', phone);
    methods.setValue('phone', phone);
  };

  const customerFormStore = useSelector((state) => state.customerFormStore);
  const [temp, setTemp] = useState(null);
  const disableEditNetwork = useBoolean(false);

  const getPersistData = async () => {
    if (selectedCustomer != null && ['pending', 'pending-process'].includes(statusMode)) {
      setTemp(customerFormStore);
      const snapshot = await installationRequestRepository.getSomeInstallationRequest(
        selectedCustomer._id
      );
      setAddons(snapshot.addons ?? []);

      methods.setValue('fullname', snapshot.fullname);
      methods.setValue('phone', snapshot.phone);
      // methods.setValue('birth', snapshot.dateOfBirth);
      methods.setValue('address', snapshot.address);

      if (snapshot.location?.lat) methods.setValue('lat', snapshot.location.lat);
      if (snapshot.location?.lng) methods.setValue('long', snapshot.location.lng);

      methods.setValue('serverAreaId', snapshot.area);
      methods.setValue('packetPlanId', snapshot.subscriptionPlan);
      methods.setValue('price', snapshot.subscriptionPrice.toString().toNumber().formatCurrency());
      methods.setValue('ipRemote', snapshot.ipRemote);
      methods.setValue('customerId', snapshot.customerId ?? '');
      methods.setValue('PPPoEName', (snapshot.pppoeName ?? '').replaceAll('undefined', ''));
      methods.setValue('PPPoEPassword', snapshot.pppoePassword);
      methods.setValue('vlanId', snapshot.vlan ?? '');
      methods.setValue('routerMac', snapshot.routerMac ?? '');
      if (snapshot.ODP) {
        methods.setValue('serverOdpId', {
          label: snapshot.ODPName,
          value: snapshot.ODP,
        });
      } else {
        methods.setValue('serverOdpId', null);
      }

      methods.setValue('routerSsid', snapshot.routerSsid ?? '');
      methods.setValue('routerSerialNumber', snapshot.routerSerialNumber ?? '');
      methods.setValue('routerPassword', snapshot.routerPassword ?? '');
      methods.setValue('isSpecial', snapshot?.isSpecial ?? false);
      methods.setValue('routerMac', snapshot.routerMac ?? '');
      methods.setValue('additionalPhoneNumber', snapshot.additionalPhoneNumber ?? []);

      if (snapshot.ktp) {
        setPlaceholderKtp(snapshot.ktp?.replaceAll('/public/uploads', ''));
      }

      if (snapshot.engineers) {
        const engineerList = [...snapshot.engineers];
        const currentUser = localStorage.getItem('fullname') || '';
        const snapshotEngineer = await userRepository.getUserByPrivilege('engineer', {
          area: snapshot.area,
        });
        const snapshotLo = await userRepository.getUserByPrivilege('liaison_officer', {
          area: snapshot.area,
        });
        const user = [...snapshotEngineer, ...snapshotLo].find((e) => e.fullname === currentUser);
        const index = !!user && user._id ? engineerList.indexOf(user._id) : -1;
        if (index !== -1) {
          engineerList.splice(index, 1);

          isSelfInstallation.setValue(true);
        }
        methods.setValue('engineers', engineerList);
      }

      if (snapshot.status === 'unconfirmed') {
        showGeneratedID.onTrue();
      }

      if (['active', 'inactive', 'banned', 'processed'].includes(snapshot.status)) {
        // console.log(snapshot.status);
        showGeneratedID.onTrue();
        disableEditNetwork.onTrue();
      }

      pickArea(snapshot.area, false);
    } else if (selectedCustomer != null) {
      setTemp(customerFormStore);
      const snapshot = await customerRepository.getCustomer(selectedCustomer._id);
      pickArea(snapshot.area, snapshot.customerId);

      methods.setValue('fullname', snapshot.fullname);
      methods.setValue('phone', snapshot.phone);
      methods.setValue('start', snapshot.activePackage.start);
      // methods.setValue('birth', snapshot.dateOfBirth);
      methods.setValue('address', snapshot.address);

      if(snapshot.location?.lat) methods.setValue('lat', snapshot.location.lat);
      if(snapshot.location?.lng) methods.setValue('long', snapshot.location.lng);

      methods.setValue('serverAreaId', snapshot.area ?? '');
      methods.setValue('packetPlanId', snapshot.subscriptionPlan ?? '');
      methods.setValue('vlanId', snapshot.vlan ?? '');
      methods.setValue('packetPlanId', snapshot.activePackage?.package ?? '');
      methods.setValue(
        'price',
        snapshot.activePackage?.price.toString().toNumber().formatCurrency() ?? ''
      );
      methods.setValue('customerId', snapshot.customerId ?? '');
      methods.setValue('PPPoEName', (snapshot.pppoeName ?? '').replaceAll('undefined', ''));
      methods.setValue('PPPoEPassword', snapshot.pppoePassword ?? '');
      setAddons(snapshot.addons ?? []);
      if (snapshot.ODP) {
        methods.setValue('serverOdpId', {
          label: snapshot.ODPName,
          value: snapshot.ODP,
        });
      } else {
        methods.setValue('serverOdpId', null);
      }
      methods.setValue('ipRemote', snapshot.ipRemote);

      methods.setValue('routerSsid', snapshot.routerSsid ?? '');
      methods.setValue('routerSerialNumber', snapshot.routerSerialNumber ?? '');
      methods.setValue('routerPassword', snapshot.routerPassword ?? '');
      methods.setValue('isSpecial', snapshot?.isSpecial ?? false);
      methods.setValue('routerMac', snapshot.routerMac ?? '');
      methods.setValue('additionalPhoneNumber', snapshot.additionalPhoneNumber ?? []);

      if (snapshot.engineers) {
        const engineerList = [...snapshot.engineers];
        const currentUser = localStorage.getItem('fullname') || '';
        const snapshotEngineer = await userRepository.getUserByPrivilege('engineer', {
          area: snapshot.area,
        });
        const snapshotLo = await userRepository.getUserByPrivilege('liaison_officer', {
          area: snapshot.area,
        });
        const user = [...snapshotEngineer, ...snapshotLo].find((e) => e.fullname === currentUser);
        const index = !!user && user._id ? engineerList.indexOf(user._id) : -1;
        if (index !== -1) {
          engineerList.splice(index, 1);

          isSelfInstallation.setValue(true);
        }
        methods.setValue('engineers', engineerList);
      }

      if (snapshot.ktp) {
        setPlaceholderKtp(snapshot.ktp?.replaceAll('/public/uploads', ''));
        // setPlaceholderKtp(snapshot.ktp);
      }

      if (snapshot.status === 'unconfirmed') {
        showGeneratedID.onTrue();
      }

      if (['active', 'inactive', 'banned', 'processed'].includes(snapshot.status)) {
        // console.log(snapshot.status);
        showGeneratedID.onTrue();
        disableEditNetwork.onTrue();
      }

      pickArea(snapshot.area, false);
    } else {
      showGeneratedID.onFalse();
      Object.keys(customerFormStore).map((key) => {
        methods.setValue(key, customerFormStore[key]);
        if (key === 'serverAreaId') {
          if (!!customerFormStore[key]) pickArea(customerFormStore[key]);
        }
        return;
      });
    }
  };

  const onBeforePrefetch = async () => {
    await Promise.all([prefetch(), getPersistData()]);
  };

  const onBeforeClose = (isPrefetch) => {
    setPlaceholderKtp(null);
    if (selectedCustomer != null) {
      methods.reset();
      dispatch(reset());
      isSimplePSB.onFalse();
      if (!!temp) {
        Object.keys(temp).map((key) => {
          if (key === 'ktpImage') return;
          dispatch(setFormState({ key, value: temp[key] }));
          return;
        });
      }
    }
    methods.setValue('engineers', []);
    onClose(isPrefetch);
    disableEditNetwork.onFalse();
    setTemp(null);
  };

  useEffect(() => {
    if (!show) {
      return;
    }
    setSelectedTab('0');
    onBeforePrefetch();
    setAddons([]);
  }, [show]);

  const submit = async (data) => {
    data.price = data.price?.toString().toNumber();
    loading.onTrue();
    try {
      if (!data.serverAreaId) throw new Error('Pilih Area / POP');
      // if (!data.serverOdpId) throw new Error('Pilih ODP');
      /** @type {InstallationRequestInsert} */
      const snapshotData = {
        address: data.address,
        area: data.serverAreaId,
        // dateOfBirth: data.birth,
        fullname: data.fullname,
        id: selectedCustomer?._id,
        IPRemote: data.ipRemote,
        ktp: data.ktpImage,
        lat: data.lat,
        lng: data.long,
        ODP: data.serverOdpId?.value ?? '',
        phone: data.phone,
        PPPoEName: data.PPPoEName,
        customerId: data.customerId,
        PPPoEPassword: data.PPPoEPassword,
        subscriptionPlan: data.packetPlanId,
        subscriptionPrice: data.price,
        vlan: data.vlanId,
        routerPassword: data.routerPassword,
        routerSsid: data.routerSsid,
        routerSerialNumber: data.routerSerialNumber,
        routerMac: data.routerMac,
        addons,
        additionalPhoneNumber: (data.additionalPhoneNumber ?? []).filter(Boolean),
      };
      if (statusMode === 'pending') {
        snapshotData.engineers = data.engineers;
        snapshotData.selfInstallation = isSelfInstallation.value;
        snapshotData.serverOdpId = data.serverOdpId?.value ?? '';
        await installationRequestRepository.insertInstallationRequest(snapshotData);
      } else if (statusMode === 'pending-process') {
        await confirm({
          title: 'Setujui & Proses',
          content: `Apakah anda ingin menyetujui permintaan dan proses pemasangan ${data.fullname}`,
          confirmationText: 'Setujui & Proses',
          confirmationButtonProps: { color: 'primary', variant: 'contained' },
          cancellationText: 'Batal',
        });

        snapshotData.engineers = data.engineers;
        snapshotData.selfInstallation = isSelfInstallation.value;
        snapshotData.serverOdpId = data.serverOdpId?.value ?? '';
        await installationRequestRepository.insertInstallationRequest(snapshotData);
        if (isSimplePSB.value) {
          await installationRequestRepository.approveAndFinish({
            id: selectedCustomer?._id,
            engineers: snapshotData.engineers,
          });
        } else {
          await installationRequestRepository.approve({
            id: selectedCustomer?._id,
            engineers: snapshotData.engineers,
          });
        }
      } else {
        await customerRepository.submitCustomer({
          ...data,
          ktp: data.ktpImage,
          serverOdpId: data.serverOdpId?.value ?? '',
          status: statusMode ?? 'unconfirmed',
          id: selectedCustomer?._id ?? undefined,
        });
      }

      onBeforeClose(true);
      dispatch(reset());
      isSimplePSB.onFalse();
      toast.success('Berhasil menyimpan');
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
    } finally {
      loading.onFalse();
    }
  };

  // Watch form changes
  methods.watch((data) => {
    if (!show) return;
    if (statusMode === 'processed') checkAllowProcess(data);
    const {
      fullname,
      phone,
      birth,
      lat,
      long,
      ktpImage,
      serverAreaId: server,
      serverOdpId,
      vlanId,
    } = data;

    if (
      [fullname, phone, birth, server, serverOdpId, vlanId].includes('') ||
      (ktpImage === null && placeholderKtp === null) ||
      [lat, long].includes(0)
    ) {
      isAllFilled.onFalse();
    } else {
      isAllFilled.onTrue();
    }

    setServerAreaId(data.serverAreaId ?? '');

    if (!selectedCustomer) {
      Object.keys(data).map((key) => {
        if (key === 'ktpImage') return;
        dispatch(setFormState({ key, value: data[key] }));
        return;
      });
    }
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
      methods.setValue('lat', lat?.toString().replaceAll(',', '.'));
      methods.setValue('long', lng?.toString().replaceAll(',', '.'));
      return;
    }
  };

  const resetAll = () => {
    setPlaceholderKtp(null);
    methods.reset();
  };

  /**
   * @param {SubmitODP} data
   */
  const onSubmitODP = async (data) => {
    try {
      const area = methods.getValues('serverAreaId');
      showOdpForm.onFalse();
      data.parentArea = area;
      await areaRepository.submitODP(data);
      toast.info('Berhasil menyimpan');
      // prefetch();
      pickArea(area, false);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const loadingGenerate = useBoolean(false);

  const generateId = () => {
    if (selectedCustomer && statusMode === 'active') {
      toast.info('Tidak dapat melakukan generate');
      return;
    }
    loadingGenerate.onTrue();
    setTimeout(async () => {
      try {
        const area = methods.getValues('serverAreaId');
        const snapshot = await areaRepository.generateCustomerId(area);
        methods.setValue('customerId', snapshot);
        methods.setValue('PPPoEName', snapshot);
      } catch (error) {
        toast.error(error.message);
      } finally {
        loadingGenerate.onFalse();
      }
    }, 2000);
  };

  /**
   * @param {Event} e
   */
  const changeKtp = (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      setPlaceholderKtp(URL.createObjectURL(file));
      methods.setValue('ktpImage', file);
    } else {
      methods.setValue('ktpImage', null);
    }
  };

  /**
   *
   * @param {File} file
   */
  async function scanOcrKtp(file) {
    toast.info('Mohon menunggu');
    try {
      const ocrResult = await ktpRepository.ocrKtp(file);

      /** @type {import('@components/ktpFormConfirm').KtpOcrResult} */
      const result = await ktpFormConfirmRef.current.confirm(ocrResult);
      if (result) {
        const address = `${result.address_1} ${result.address_2} ${result.address_3} ${result.address_4}, ${result.district}, ${result.province}`;
        methods.setValue('fullname', result.name);
        methods.setValue('address', address);

        if (result.dateOfBirth) {
          methods.setValue('birth', new Date(result.dateOfBirth).toISOString());
        }
      }
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
    }
  }

  async function cropKtp() {
    const placeholder = placeholderKtp.includes('blob')
      ? placeholderKtp
      : `/public/uploads/${placeholderKtp}`;
    const croppedImageResult = await cropperImageRef.current.cropImage(placeholder);
    if (croppedImageResult) {
      setPlaceholderKtp(URL.createObjectURL(croppedImageResult));
      methods.setValue('ktpImage', croppedImageResult);
    }
  }

  async function checkWhatsapp() {
    const phoneNumber = methods.getValues('phone');
    toast.info('Mohon menunggu');
    try {
      const result = await whatsappRepository.checkWhatsapp('phone', phoneNumber);
      if (!result.valid) throw new Error('Nomor tidak terdaftar di whatsapp');
      toast.success('Nomor Terdaftar Whatsapp');
    } catch (error) {
      toast.error(error.message);
    }
  }

  const submitForm = handleSubmit((data) => {
    try {
      data.addons = getAddons();
      submit(data);
    } catch (error) {
      toast.error(error.message);
      return;
    }
  });

  return {
    // State
    methods,
    loading,
    isAutoIncrementID,
    isRandomPppoePassword,
    showGeneratedID,
    usingDynamicIP,
    usingDynamicCustomerId,
    showOdpForm,
    isSelfInstallation,
    isSimplePSB,
    loadingAddons,
    showMaps,
    isAllFilled,
    allowProcess,
    disableEditNetwork,
    loadingGenerate,
    serverAreaId,
    areas,
    odpList,
    vlanList,
    availablePackage,
    engineers,
    selectedEngineer,
    addons,
    addonsList,
    placeholderKtp,
    selectedTab,
    // Refs
    ktpFormConfirmRef,
    cropperImageRef,
    addonsRef,
    // Computed
    submitLabel,
    availableSelectEngineer,
    areaList,
    packageList,
    tabsLabel,
    // Privilege
    isAdmin,
    isNoc,
    allowModify,
    statusMode,
    // Methods
    handleSubmit,
    prefetch,
    pickArea,
    pickPrice,
    pickPhone,
    getPersistData,
    getAddons,
    onBeforeClose,
    submit,
    submitForm,
    checkAllowProcess,
    seperateLatLng,
    resetAll,
    onSubmitODP,
    generateId,
    changeKtp,
    scanOcrKtp,
    cropKtp,
    checkWhatsapp,
    onPickMaps,
    prefetchAddons,
    // Setters
    setPlaceholderKtp,
    setSelectedTab,
    setAddons,
  };
};
