/**
 * @typedef {import("src/stores/areaConfiguration").AreaConfigurationStore} AreaConfigurationStore
 * @typedef {import('src/stores/odpStore').OdpStore} OdpStore
 * @typedef {import('src/repositories/customer').Customer} Customer
 */

import { toast } from 'sonner';
import { useDebounce } from 'use-debounce';
import { useBoolean } from '@hooks/use-boolean';
import { useConfirm } from 'material-ui-confirm';
import Overloading from '@components/overloading';
import { usePrivilege } from '@auth/hooks/privileges';
import CustomerDeactivateDialog from '@components/customer/DeactivateDialog';
import CustomerFormDialog from '@components/areaConfiguration/customerFormDialog';
import CustomerTopologyDialog from '@components/areaConfiguration/CustomerTopology';
import { useRef, useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { AreaConfigurationCustomerData } from '@components/areaConfiguration2/CustomerData';

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

import OnuChart from './OnuChart';
import HistoryLastdownDialog from './HistoryLastdownDialog';

/**
 * @param {{show: boolean; onClose: void} & AreaConfigurationStore & OdpStore} props
 */
const NetworkStatusCustomerDialog = forwardRef((props, ref) => {
  const [currentArea, setCurrentArea] = useState(null);
  const [selectedOdp, setSelectedOdp] = useState(null);
  const show = useBoolean();

  const theme = useTheme();
  const confirm = useConfirm();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const loading = useBoolean(false);
  const showFormCustomer = useBoolean(false);
  const [currentPage, setCurrentPage] = useState(0);
  const { isAdmin, isNoc } = usePrivilege();
  const deactivateDialogRef = useRef();
  const onuChartRef = useRef();
  const historyLastdownRef = useRef();

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

  useEffect(() => {
    if (!show.value) return;
    fetchCustomerData();
  }, [currentArea, selectedOdp, currentPage, limit, findDebounce, show.value]);

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

  function open({ area, odp }) {
    setCurrentArea(null);
    setSelectedOdp(null);
    setCustomers([]);
    setPage(0);
    if (area) setCurrentArea(area);
    if (odp) setSelectedOdp(odp);
    show.onTrue();
  }

  useImperativeHandle(ref, () => ({ open }));

  return (
    <>
      <Dialog open={show.value} onClose={() => show.onFalse()} fullScreen>
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
                  onShowHistoryLastdown={(c) => {
                    historyLastdownRef.current?.open(c._id);
                  }}
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
          <Button color="error" onClick={() => show.onFalse()}>
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
      <HistoryLastdownDialog ref={historyLastdownRef} />
    </>
  );
});

export default NetworkStatusCustomerDialog;
