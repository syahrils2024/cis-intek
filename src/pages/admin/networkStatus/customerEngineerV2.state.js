/**
 * @typedef {import("src/stores/customerEngineerStoreV2").CustomerEngineerV2Store} CustomerEngineerV2Store
 * @typedef {import("src/repositories/subscription").Subscription} Subscription
 */

import { toast } from 'sonner';
import { useBoolean } from '@hooks/use-boolean';
import { useConfirm } from 'material-ui-confirm';
import { useSearchParams } from 'react-router-dom';
import { useDebouncedCallback } from 'use-debounce';
import { useRef, useState, useEffect, useCallback } from 'react';

import { useAddonsStore } from 'src/stores/addons';
import { useAcsDialog } from 'src/globalComponents/acsDialog/useAcsDialog';
import { setCustomerEngineerV2Store } from 'src/stores/customerEngineerStoreV2';
import {
  areaRepository,
  addonsRepository,
  customerRepository,
  packagePlanRepository,
  subscriptionRepository,
} from 'src/repositories';

import { buildOnuInfo, buildPppActiveData, buildCustomerWithConnection } from './customerEngineerV2Helper';

/**
 * @typedef {import('react').MutableRefObject<{open: (params: FilterDialogData) => Promise<FilterDialogData>; close: (value: any) => void;}>} FilterDialogRef
 */

/**
 * Custom hook that encapsulates all the state, refs and business logic of the
 * Customer Engineer V2 (Network Status) page.
 *
 * @param {import('./customerEngineerV2').CustomerEngineerStoreV2} props - redux-connected store props
 * @param {(action: any) => void} dispatch - redux dispatch
 */
export function useCustomerEngineerV2State(props, dispatch) {
  const {
    addons,
    isolated,
    limit,
    page,
    search,
    selectedAreaId,
    selectedAreaName,
    selectedPackageId,
    selectedPaymentStatus,
    selectedUserStatus,
    subscription,
    order,
    orderBy,
    packets,
    areaCategories,
    status,
    differenceNetworkConfiguration
  } = props;

  const loading = useBoolean(false);
  const [showTopologyCustomerId, setShowTopologyCustomerId] = useState(null);
  const showTicketForm = useBoolean(false);
  const [showCustomerTicket, setShowCustomerTicket] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const showCheckStatus = useBoolean(false);
  const confirm = useConfirm();
  const acsDialog = useAcsDialog();
  const { data: addonsData, setAddonsStore } = useAddonsStore();
  const [query, setQuery] = useSearchParams();

  const networkStatusCustomerDialog = useRef();
  const ticketFormDialogRef = useRef();
  const onuChartRef = useRef();
  const viewerImageDialogRef = useRef();
  const historyLogMikrotikDialogRef = useRef();
  const areaPickerFilterRef = useRef();
  const searchRef = useRef();
  const deactivateDialogRef = useRef();
  const historyLastdownRef = useRef();
  const changeCustomerSerialNumberRef = useRef();
  const unbindSerialNumberDialogRef = useRef();
  /** @type {FilterDialogRef} */
  const filterDialogRef = useRef();

  /** @type {import('react').MutableRefObject<AbortController | null>} */
  const prefetchAbortControllerRef = useRef(null);

  const debounceFind = useDebouncedCallback((text) => {
    dispatch(setCustomerEngineerV2Store({ key: 'search', value: text }));
    setQuery({ q: text });
  }, 500);

  const open = Boolean(anchorEl);

  const handleClick = useCallback(
    (event, data) => {
      setAnchorEl(event.currentTarget);
      setSelectedCustomer(data);
    },
    []
  );

  const handleClose = useCallback(() => {
    setAnchorEl(null);
    setSelectedCustomer(null);
  }, []);

  async function openFilterDialog() {
    const result = await filterDialogRef.current.open({
      areaId: selectedAreaId,
      areaTitle: selectedAreaName,
      userStatus: selectedUserStatus,
      search,
      isolatedStatus: isolated,
    });
    if (!result) return;

    dispatch(setCustomerEngineerV2Store({ key: 'selectedAreaId', value: result.areaId }));
    dispatch(setCustomerEngineerV2Store({ key: 'selectedAreaName', value: result.areaTitle }));
    dispatch(setCustomerEngineerV2Store({ key: 'selectedUserStatus', value: result.userStatus }));
    dispatch(setCustomerEngineerV2Store({ key: 'isolated', value: result.isolatedStatus }));
  }

  /** @param {Subscription} s */
  function openCustomerOdp(s) {
    networkStatusCustomerDialog.current.open({
      area: {
        _id: s.areaId,
        id: s.areaId,
        title: s.area,
      },
      odp: {
        _id: s.odpId,
        id: s.odpId,
        name: s.odp,
      },
    });
  }

  const prefetch = async () => {
    /** Abort any in-flight prefetch before starting a new one. */
    prefetchAbortControllerRef.current?.abort();
    const abortController = new AbortController();
    prefetchAbortControllerRef.current = abortController;
    const { signal } = abortController;

    loading.onTrue();
    try {
      if (addonsData.length <= 0) {
        const snapshotAddons = await addonsRepository.getAddons(
          { page: 0, limit: 100 },
          signal
        );
        setAddonsStore({ data: snapshotAddons });
      }

      const snapshotNetworkStatus = await areaRepository.getNetworkStatus(
        {
          area: selectedAreaId.replace('all', ''),
        },
        signal
      );
      dispatch(
        setCustomerEngineerV2Store({
          key: 'pppTotal',
          value: snapshotNetworkStatus.pppTotal,
        })
      );
      dispatch(
        setCustomerEngineerV2Store({
          key: 'pppActive',
          value: snapshotNetworkStatus.pppActive,
        })
      );
      dispatch(
        setCustomerEngineerV2Store({
          key: 'pppInactive',
          value: snapshotNetworkStatus.pppInactive,
        })
      );
      dispatch(
        setCustomerEngineerV2Store({
          key: 'totalIsolated',
          value: snapshotNetworkStatus.isolated,
        })
      );
      dispatch(
        setCustomerEngineerV2Store({
          key: 'totalUnisolated',
          value: snapshotNetworkStatus.unisolated,
        })
      );

      const snapshotBilling = await subscriptionRepository.getListSubscription(
        {
          status: selectedUserStatus.replace('all', ''),
          areaId: selectedAreaId.replace('all', ''),
          limit,
          packageId: selectedPackageId.replace('all', ''),
          page,
          paymentStatus: selectedPaymentStatus.toLowerCase().replaceAll(' ', '_'),
          find: search,
          order,
          orderBy,
          isolated: isolated === 'all' ? undefined : isolated,
          addons: addons.replaceAll('all', ''),
          differenceNetworkConfiguration,
        },
        signal
      );

      dispatch(
        setCustomerEngineerV2Store({ key: 'subscription', value: snapshotBilling.customerList })
      );

      dispatch(setCustomerEngineerV2Store({ key: 'total', value: snapshotBilling.total }));

      loading.onFalse();

      const customerIds = snapshotBilling.customerList.map((s) => s._id);

      /** Promises Get Other Data */
      const promisesActiveList = customerRepository
        .getPPPActiveList(customerIds, signal)
        .catch((e) => ({}));

      const promisesOnuInfoList = customerRepository
        .getCustomerOnuInfo(customerIds, signal)
        .catch((e) => ({}));

      const promisesMikrotikIsolirExists = customerRepository
        .checkMikrotikIsolirExists(customerIds, signal)
        .catch((e) => ({}));

      const [activeList, onuInfoList, mikrotikIsolirExists] = await Promise.all([
        promisesActiveList,
        promisesOnuInfoList,
        promisesMikrotikIsolirExists,
      ]);

      if (signal.aborted) return;

      const customerList = snapshotBilling.customerList.map((s) =>
        buildCustomerWithConnection(s, activeList, onuInfoList, mikrotikIsolirExists)
      );

      dispatch(setCustomerEngineerV2Store({ key: 'subscription', value: customerList }));
    } catch (error) {
      if (abortController.signal.aborted) return;
      console.error(error);
      toast.error(error.message);
    } finally {
      loading.onFalse();
    }
  };

  const initFilter = async () => {
    try {
      if (packets.length <= 0) {
        const snapshotPacket = await packagePlanRepository.getPackageList();
        dispatch(
          setCustomerEngineerV2Store({
            key: 'packets',
            value: snapshotPacket.filter((p) => p.status === 'active'),
          })
        );
      }

      if (areaCategories.length <= 0) {
        const snapshotArea = await areaRepository.getAllArea();
        dispatch(setCustomerEngineerV2Store({ key: 'areas', value: snapshotArea }));
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  /** @param {Event} e @param {number} n */
  const handlerSetPage = (e, n) => {
    dispatch(setCustomerEngineerV2Store({ key: 'page', value: n }));
  };

  /** @param {Event} e */
  const handlerSetLimit = (e) => {
    dispatch(setCustomerEngineerV2Store({ key: 'limit', value: e.target.value }));
    dispatch(setCustomerEngineerV2Store({ key: 'page', value: 0 }));
  };

  function initPage() {
    const q = query.get('q');
    if (q) {
      searchRef.current.value = q;
      debounceFind(q);
    }
  }

  const debouncePrefetch = useDebouncedCallback(() => {
    prefetch();
  }, 1000);

  useEffect(() => {
    initPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    initFilter();
    debouncePrefetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [limit, page, order, orderBy, differenceNetworkConfiguration]);

  useEffect(() => {
    dispatch(setCustomerEngineerV2Store({ key: 'page', value: 0 }));
    if (page === 0) debouncePrefetch();
  }, [
    search,
    status,
    isolated,
    selectedPaymentStatus,
    selectedPackageId,
    selectedUserStatus,
    selectedAreaId,
    addons,
    differenceNetworkConfiguration,
  ]);

  function openTicketForm(customer_id) {
    ticketFormDialogRef.current?.open(customer_id);
  }

  function showKtp(ktpPath) {
    const imageUrl = ktpPath.replaceAll('/public/uploads/', '');
    viewerImageDialogRef.current.showImage([imageUrl], 'KTP');
  }

  /**
   * @param {Subscription} item
   * @param {"pppoe" | "onu"} variant
   */
  function refreshConnection(item, variant = 'pppoe') {
    const index = subscription.findIndex((s) => s._id === item._id);
    if (index === -1) return;

    const data = { ...subscription[index] };

    if (variant === 'onu') {
      const onuInfoList = customerRepository.getCustomerOnuInfo([item._id]).catch((e) => ({}));
      const promisesMikrotikIsolirExists = customerRepository
        .checkMikrotikIsolirExists([item._id])
        .catch((e) => ({}));

      const promises = Promise.all([onuInfoList, promisesMikrotikIsolirExists]);

      toast.promise(promises, {
        loading: `Refreshing ONU connection ${item.customerId}...`,
        success: ([infoList, mikrotikIsolirExists]) => {
          const isIsolirMikrotik = mikrotikIsolirExists[item._id];
          const onuInfo = buildOnuInfo(infoList[item._id]);

          const result = Object.assign(data, { onuInfo, isIsolirMikrotik });
          const copySubscription = [...subscription];
          copySubscription[index] = result;
          dispatch(setCustomerEngineerV2Store({ key: 'subscription', value: copySubscription }));

          return `Refreshing connection ${item.customerId} completed`;
        },
        error: () => `Failed to refresh onuconnection ${item.customerId}`,
      });
    } else {
      const activeList = customerRepository.getPPPActiveList([item._id]).catch((e) => ({}));
      toast.promise(activeList, {
        loading: `Refreshing PPPoE connection ${item.customerId}...`,
        success: (activeData) => {
          const pppActive = buildPppActiveData(activeData[item._id]);

          const result = Object.assign(data, { pppActive });
          const copySubscription = [...subscription];
          copySubscription[index] = result;
          dispatch(setCustomerEngineerV2Store({ key: 'subscription', value: copySubscription }));

          return `Refreshing PPPoE connection ${item.customerId} completed`;
        },
        error: () => {
          const result = Object.assign(data, {
            pppActive: { status: 2, uptime: '-', address: '-' },
          });
          const copySubscription = [...subscription];
          copySubscription[index] = result;
          dispatch(setCustomerEngineerV2Store({ key: 'subscription', value: copySubscription }));
          return `Failed to refresh PPPoE connection ${item.customerId}`;
        },
      });
    }
  }

  async function filterArea() {
    /**
     * @type {import('@components/billing/areaPickerFilter').AreaPickerFilterResult}
     */
    const result = await areaPickerFilterRef.current.open(selectedAreaId);
    if (!result) return;
    dispatch(setCustomerEngineerV2Store({ key: 'selectedAreaId', value: result._id }));
    dispatch(setCustomerEngineerV2Store({ key: 'selectedAreaName', value: result.name }));
  }

  async function openCustomerDeactivateDialog(customerId) {
    await deactivateDialogRef.current?.open(customerId);
    debouncePrefetch();
  }

  async function handleChangeSerialNumber(customerId) {
    await changeCustomerSerialNumberRef.current?.open(customerId);
    debouncePrefetch();
  }

  /** @param {Subscription} item */
  async function rebootOnu(item) {
    try {
      const message = `Apakah anda ingin melakukan reboot perangkat ${item.fullname} via olt ?`;
      await confirm({
        title: 'Reboot Perangkat',
        description: message,
        confirmationText: 'Reboot',
        cancellationText: 'Batal',
        confirmationButtonProps: { color: 'warning', variant: 'contained' },
        cancellationButtonProps: { color: 'error', variant: 'outlined' },
      });

      const promise = customerRepository.rebootOnu(item._id);
      toast.promise(promise, {
        loading: `Melakukan reboot perangkat ${item.customerId}...`,
        success: () => {
          refreshConnection(item, 'onu');
          return `Reboot perangkat ${item.customerId} berhasil`;
        },
        error: (err) => {
          if (err instanceof Error)
            return `Reboot perangkat ${item.customerId} gagal: ${err.message}`;
          return `Reboot perangkat ${item.customerId} gagal`;
        },
      });
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
    }
  }

  async function unbindSerialNumber() {
    await unbindSerialNumberDialogRef.current.open();
    prefetch();
  }

  return {
    state: {
      loading,
      showTopologyCustomerId,
      showTicketForm,
      showCustomerTicket,
      selectedCustomer,
      anchorEl,
      showCheckStatus,
      open,
      addonsData,
      query,
    },
    handlers: {
      debounceFind,
      openFilterDialog,
      openCustomerOdp,
      prefetch,
      initFilter,
      handlerSetPage,
      handlerSetLimit,
      openTicketForm,
      showKtp,
      refreshConnection,
      filterArea,
      openCustomerDeactivateDialog,
      handleChangeSerialNumber,
      rebootOnu,
      handleClick,
      handleClose,
      unbindSerialNumber,
      setShowTopologyCustomerId,
      setShowCustomerTicket,
      setSelectedCustomer,
      setAnchorEl,
      showCheckStatus,
      showTicketForm,
    },
    refs: {
      networkStatusCustomerDialog,
      ticketFormDialogRef,
      onuChartRef,
      viewerImageDialogRef,
      historyLogMikrotikDialogRef,
      areaPickerFilterRef,
      searchRef,
      deactivateDialogRef,
      historyLastdownRef,
      changeCustomerSerialNumberRef,
      unbindSerialNumberDialogRef,
      filterDialogRef,
    },
  };
}
