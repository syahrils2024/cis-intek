/**
 * @typedef {import("src/stores/areaConfiguration").AreaConfigurationStore} AreaConfigurationStore
 * @typedef {import('src/stores/odpStore').OdpStore} OdpStore
 * @typedef {import('src/repositories/customer').Customer} Customer
 */

import { toast } from 'sonner';
import { connect } from 'react-redux';
import { useDebounce } from 'use-debounce';
import { useBoolean } from '@hooks/use-boolean';
import { useConfirm } from 'material-ui-confirm';
import Overloading from '@components/overloading';
import { useRef, useState, useEffect } from 'react';
import { usePrivilege } from '@auth/hooks/privileges';
import OnuChart from '@pages/admin/networkStatus/components/OnuChart';
import CustomerDeactivateDialog from '@components/customer/DeactivateDialog';
import CustomerFormDialog from '@components/areaConfiguration/customerFormDialog';
import CustomerTopologyDialog from '@components/areaConfiguration/CustomerTopology';

import {
  Dialog,
  Button,
  useTheme,
  TextField,
  DialogTitle,
  DialogContent,
  useMediaQuery,
  DialogActions,
  TablePagination,
} from '@mui/material';

import { areaRepository, customerRepository } from 'src/repositories';

import { AreaConfigurationCustomerData } from './CustomerData';

/**
 * @param {{show: boolean; onClose: void} & AreaConfigurationStore & OdpStore} props
 */
function AreaConfigurationV2CustomerDialog({ show, onClose, currentArea, area, selectedOdp }) {
  const theme = useTheme();
  const confirm = useConfirm();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const loading = useBoolean(false);
  const showFormCustomer = useBoolean(false);
  const [currentPage, setCurrentPage] = useState(0);
  const { isAdmin, isNoc } = usePrivilege();
  const deactivateDialogRef = useRef();
  const onuChartRef = useRef();

  /** @type {[Customer[], void]} */
  const [customers, setCustomers] = useState([]);

  /** @type {[string, void]} */
  const [find, setFind] = useState('');

  const [findDebounce] = useDebounce(find, 500);

  const [showTopologyCustomerId, setShowTopologyCustomerId] = useState(null);

  /** @type {[Customer, void]} */
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  /** @type {[number, void]} */
  const [limit, setLimit] = useState(10);

  /** @type {[number, void]} */
  const [page, setPage] = useState(0);

  /** @type {[number, void]} */
  const [totalItems, setTotalItems] = useState(0);
  const fetchCustomerData = async () => {
    // console.log(find);

    if (!currentArea) {
      toast.warning('Mohon memilih area');
      return;
    }
    setPage(0);
    loading.onTrue();
    if (!!selectedOdp) {
      console.log('fetch with ODP');
      const snapshot = await areaRepository
        .getCustomerAreaWithODP(currentArea.id, selectedOdp._id, {
          page: currentPage,
          limit,
          status: 'active',
          find,
        })
        .catch((err) => {
          toast.error(err.message);
          return { customers: [], total: 0 };
        });
      setTotalItems(snapshot.total);
      setCustomers(snapshot.customers);
      loading.onFalse();

      const customerIds = snapshot.customers.map((customer) => customer._id);
      const activeList = await customerRepository.getPPPActiveList(customerIds);
      const onuInfoList = await customerRepository
        .getCustomerOnuInfo(customerIds)
        .catch((e) => ({}));

      const customerList = snapshot.customers.map((s) => {
        const pppActive = activeList[s._id];
        const _onuInfo = onuInfoList[s._id] ?? {
          RunningState: -2,
          State: -2,
        };

        const pppActiveData = !pppActive.lastLoggedOut
          ? { ...pppActive, status: 1 }
          : { status: 2, uptime: '-', address: '-', lastLoggedOut: pppActive?.lastLoggedOut };

        return {
          ...s,
          pppActive: pppActiveData,
          onuInfo: _onuInfo || null,
        };
      });
      setCustomers(customerList);
    } else if (!!currentArea) {
      console.log('fetch without ODP');
      const snapshot = await areaRepository
        .getCustomerArea(currentArea.id ?? currentArea._id, {
          page: currentPage,
          limit,
          status: 'active',
          find: findDebounce,
        })
        .catch((err) => {
          toast.error(err.message);
          return { customers: [], total: 0 };
        });
      setTotalItems(snapshot.total);
      setCustomers(snapshot.customers);
      loading.onFalse();

      const customerIds = snapshot.customers.map((customer) => customer._id);
      const activeList = await customerRepository.getPPPActiveList(customerIds);
      const onuInfoList = await customerRepository
        .getCustomerOnuInfo(customerIds)
        .catch((e) => ({}));

      const customerList = snapshot.customers.map((s) => {
        const pppActive = activeList[s._id];
        const _onuInfo = onuInfoList[s._id] ?? {
          RunningState: -2,
          State: -2,
        };

        const pppActiveData = !pppActive.lastLoggedOut
          ? { ...pppActive, status: 1 }
          : { status: 2, uptime: '-', address: '-', lastLoggedOut: pppActive?.lastLoggedOut };

        return {
          ...s,
          pppActive: pppActiveData,
          onuInfo: _onuInfo || null,
        };
      });
      setCustomers(customerList);
    }
    loading.onFalse();
  };

  /**
   * @param {Subscription} item
   * @param {"pppoe" | "onu"} variant
   */
  function refreshConnection(item, variant = 'pppoe') {
    const index = customers.findIndex((s) => s._id === item._id);
    if (index === -1) return;

    const data = { ...customers[index] };

    if (variant === 'onu') {
      // refresh onu connection
      const onuInfoList = customerRepository.getCustomerOnuInfo([item._id]).catch((e) => ({}));
      const promisesMikrotikIsolirExists = customerRepository
        .checkMikrotikIsolirExists([item._id])
        .catch((e) => ({}));

      const promises = Promise.all([onuInfoList, promisesMikrotikIsolirExists]);

      toast.promise(promises, {
        loading: `Refreshing ONU connection ${item.customerId}...`,
        success: ([infoList, mikrotikIsolirExists]) => {
          const isIsolirMikrotik = mikrotikIsolirExists[item._id];
          const _onuInfo = infoList[item._id] ?? {
            RunningState: -2,
            State: -2,
          };

          const result = Object.assign(data, { onuInfo: _onuInfo, isIsolirMikrotik });
          const copyCustomers = [...customers];
          copyCustomers[index] = result;
          setCustomers(copyCustomers);

          return `Refreshing connection ${item.customerId} completed`;
        },
        error: () => `Failed to refresh onuconnection ${item.customerId}`,
      });
    } else {
      // refresh pppoe connection
      const activeList = customerRepository.getPPPActiveList([item._id]).catch((e) => ({}));
      toast.promise(activeList, {
        loading: `Refreshing PPPoE connection ${item.customerId}...`,
        success: (activeData) => {
          const _pppActive = activeData[item._id];

          const pppActiveData = !_pppActive.lastLoggedOut
            ? { ..._pppActive, status: 1 }
            : { status: 2, uptime: '-', address: '-', lastLoggedOut: _pppActive?.lastLoggedOut };

          const result = Object.assign(data, { pppActive: pppActiveData });
          const copyCustomers = [...customers];
          copyCustomers[index] = result;
          setCustomers(copyCustomers);

          return `Refreshing PPPoE connection ${item.customerId} completed`;
        },
        error: () => {
          const result = Object.assign(data, {
            pppActive: { status: 2, uptime: '-', address: '-' },
          });
          const copyCustomers = [...customers];
          copyCustomers[index] = result;
          setCustomers(copyCustomers);
          return `Failed to refresh PPPoE connection ${item.customerId}`;
        },
      });
    }
  }

  useEffect(() => {
    if (!show) return;
    fetchCustomerData();
  }, [currentArea, selectedOdp, currentPage, limit, findDebounce, show]);

  /**
   * @param {Event} e
   * @param {number} page
   */
  const handlerSetPage = (e, n) => {
    // dispatch(setPage(n));
    setCurrentPage(n);
  };

  /**
   * @param {Event} e
   */
  const handlerSetLimit = (e) => {
    setLimit(e.target.value);
  };

  /** @param {Customer} customer */
  const handlerEdit = (customer) => {
    setSelectedCustomer(customer);
    showFormCustomer.onTrue();
  };

  /** @param {Customer} customer */
  const handlerRemove = async (customer) => {
    await deactivateDialogRef.current?.open(customer._id);
    fetchCustomerData();
  };

  const onCloseForm = (isPrefetch) => {
    showFormCustomer.onFalse();
    setSelectedCustomer(null);
    if (isPrefetch) fetchCustomerData();
  };

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

  return (
    <>
      <Dialog open={show} onClose={onClose} fullScreen>
        <DialogTitle>DAFTAR PELANGGAN - {selectedOdp?.name ?? currentArea?.title}</DialogTitle>
        <DialogContent>
          <div className="tw-w-full tw-relative tw-flex tw-flex-col">
            <div className="tw-flex tw-flex-row tw-items-center tw-justify-end tw-my-2">
              <TextField label="Cari" size="small" onChange={(e) => setFind(e.target.value)} />
            </div>
            <div className="tw-w-full tw-relative tw-flex tw-flex-col tw-gap-2">
              <Overloading loading={loading.value} />
              {isMobile ? (
                customers.map((customer, i) => (
                  <AreaConfigurationCustomerData.Mobile
                    key={i}
                    customer={customer}
                    onEdit={() => handlerEdit(customer)}
                    onRemove={() => handlerRemove(customer)}
                    onShowTopology={() => setShowTopologyCustomerId(customer._id)}
                    readOnly={!isAdmin && !isNoc}
                    onShowHistoryDataOLT={() => {
                      onuChartRef.current?.open(customer._id);
                    }}
                  />
                ))
              ) : (
                <AreaConfigurationCustomerData.Table
                  customers={customers}
                  onEdit={handlerEdit}
                  onRemove={handlerRemove}
                  onShowTopology={(c) => setShowTopologyCustomerId(c._id)}
                  readOnly={!isAdmin && !isNoc}
                  onShowHistoryDataOLT={(s) => {
                    onuChartRef.current?.open(s._id);
                  }}
                  onRebootOnu={(s) => rebootOnu(s)}
                />
              )}
              <TablePagination
                component="div"
                count={totalItems}
                page={currentPage}
                onPageChange={handlerSetPage}
                rowsPerPage={limit}
                onRowsPerPageChange={handlerSetLimit}
              />
            </div>
          </div>
        </DialogContent>
        <DialogActions>
          <Button color="error" onClick={onClose}>
            Tutup
          </Button>
        </DialogActions>
      </Dialog>
      <CustomerFormDialog
        show={showFormCustomer.value}
        onClose={onCloseForm}
        selectedCustomer={selectedCustomer}
        statusMode="active"
      />
      <CustomerTopologyDialog
        customerId={showTopologyCustomerId}
        onClose={() => setShowTopologyCustomerId(null)}
      />
      <CustomerDeactivateDialog ref={deactivateDialogRef} />
      <OnuChart ref={onuChartRef} />
    </>
  );
}

const mapsStateToProps = (state) => {
  const { selectedOdp } = state.odpStore;
  return { ...state.areaConfigurationStore, selectedOdp };
};
export default connect(mapsStateToProps)(AreaConfigurationV2CustomerDialog);
