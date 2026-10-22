/**
 * @typedef {import("src/stores/areaConfiguration").AreaConfigurationStore} AreaConfigurationStore
 * @typedef {import('src/stores/odpStore').OdpStore} OdpStore
 * @typedef {import('src/repositories/customer').Customer} Customer
 */

import { toast } from 'sonner';
import { download } from '@utils/download';
import { useBoolean } from '@hooks/use-boolean';
import { useConfirm } from 'material-ui-confirm';
import Overloading from '@components/overloading';
import { connect, useDispatch } from 'react-redux';
import { useRef, useState, useEffect } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { usePrivilege } from '@auth/hooks/privileges';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ViewerImageDialog } from '@components/viewerImageDialog';
import CustomerDeactivateDialog from '@components/customer/DeactivateDialog';
import CustomerAreaConfigurationTable from '@components/areaConfiguration/Table';
import CustomerFormDialog from '@components/areaConfiguration/customerFormDialog';
import CustomerTopologyDialog from '@components/areaConfiguration/CustomerTopology';
import { AreaConfigurationMobileCard } from '@components/areaConfiguration/MobileCard';
import CustomerTab2FilterAction from '@components/areaConfiguration2/CustomerTab2FilterAction';

import {
  useTheme,
  MenuItem,
  Checkbox,
  TextField,
  useMediaQuery,
  TablePagination,
  FormControlLabel,
} from '@mui/material';

import { areaRepository, customerRepository, mikrotikRepository } from 'src/repositories';
import {
  setPage,
  setFind,
  setLimit,
  setCustomers,
  setTotalItems,
} from 'src/stores/areaConfiguration';

/**
 * @param {{show: boolean; onClose: void} & AreaConfigurationStore & OdpStore} props
 */
function CustomerTab2({
  customers,
  currentArea,
  find,
  area,
  page,
  limit,
  totalItems,
  selectedOdp,
  customerOrder,
  customerOrderBy,
}) {
  const theme = useTheme();
  const confirm = useConfirm();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const dispatch = useDispatch();
  const loading = useBoolean(false);
  const loadingExport = useBoolean(false);
  const showFormCustomer = useBoolean(false);
  const [currentPage, setCurrentPage] = useState(page);
  const [query, setQuery] = useSearchParams();
  const searchRef = useRef();
  const navigate = useNavigate();
  const { isAdmin, isNoc } = usePrivilege();
  const viewerImageDialogRef = useRef();
  const [customerStatus, setCustomerStatus] = useState('active');
  const customerStatusList = ['active', 'inactive', 'banned'];
  const special = useBoolean(false);
  const deactivateDialogRef = useRef();

  const debounceFindText = useDebouncedCallback((text) => {
    dispatch(setFind(text));
    setQuery({ qCustomer: text });
  }, 500);

  const [showTopologyCustomerId, setShowTopologyCustomerId] = useState(null);

  /** @type {[Customer, void]} */
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const fetchCustomerData = async () => {
    // if (!currentArea) {
    //   toast.warning('Mohon memilih area');
    //   return;
    // }
    dispatch(setPage(0));
    loading.onTrue();
    if (!!currentArea) {
      const snapshot = await areaRepository
        .getCustomerArea(currentArea.id ?? currentArea._id, {
          page: currentPage,
          limit,
          status: customerStatus,
          find: find.replace('+', ''),
          orderBy: customerOrderBy,
          order: customerOrder,
          special: special.value,
        })
        .catch((err) => {
          toast.error(err.message);
          return { customers: [], total: 0 };
        });
      dispatch(setTotalItems(snapshot.total));
      dispatch(setCustomers(snapshot.customers));
    }
    loading.onFalse();
  };

  const debounceFetch = useDebouncedCallback(() => {
    fetchCustomerData();
  }, 700);

  useEffect(() => {
    debounceFetch();
  }, [currentPage, limit, customerOrder, customerOrderBy]);

  useEffect(() => {
    dispatch(setPage(0));
    debounceFetch();
  }, [currentArea, selectedOdp, find, customerStatus, special.value]);

  useEffect(() => {
    const qCustomer = query.get('qCustomer');
    if (qCustomer) {
      dispatch(setFind(qCustomer));
      // debounceFindText(qCustomer);
      setTimeout(() => {
        searchRef.current.value = qCustomer;
        searchRef.current.focus();
      }, 500);
    }
  }, []);

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
    dispatch(setLimit(e.target.value));
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

  /**
   * @param {Customer} customer
   */
  const navigateToBilling = (customer) => {
    navigate(`/v2/billing?q=${customer.customerId ?? customer.fullname}`);
  };

  function showKtp(ktpPath) {
    const imageUrl = ktpPath.replaceAll('/public/uploads/', '');
    viewerImageDialogRef.current.showImage([imageUrl], 'KTP');
  }

  async function exportData() {
    loadingExport.onTrue();
    try {
      const data = await customerRepository.exportCustomer({
        area: currentArea?.id ?? currentArea?._id,
      });
      const filename = `customer - ${currentArea?.title}.xlsx`;
      download(data, filename);
    } catch (error) {
      toast.error(error.message);
    } finally {
      loadingExport.onFalse();
    }
  }

  /**
   *
   * @param {Customer} customer
   */
  async function rewritePppoe(customer) {
    try {
      await confirm({
        title: 'Konfirmasi',
        description: `Apakah anda yakin ingin menulis ulang PPPoE Interface ${customer.fullname} pada mikrotik?`,
      });

      const promise = mikrotikRepository.rewritePPPoE(customer._id);
      toast.promise(promise, {
        loading: 'Menulis ulang PPPoE Interface...',
        success: 'Berhasil menulis ulang PPPoE Interface',
        error: (err) => `Gagal menulis ulang PPPoE Interface: ${err.message}`,
      });
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
    }
  }

  return (
    <div className="tw-flex tw-flex-col tw-gap-4">
      <div className="tw-flex tw-flex-col-reverse tw-gap-2 md:tw-flex-row tw-items-center tw-justify-between tw-px-1">
        <div className="tw-w-full md:tw-w-min">
          <FormControlLabel
            value={special.value}
            label="Special"
            control={<Checkbox onChange={(e) => special.setValue(e.target.checked)} />}
          />
        </div>
        <div className="tw-flex tw-flex-row tw-items-center tw-justify-end tw-gap-2">
          <div className="tw-w-full md:tw-w-48">
            <TextField
              value={customerStatus}
              onChange={(e) => setCustomerStatus(e.target.value)}
              label="Status"
              size="small"
              select
              fullWidth
            >
              {customerStatusList.map((c, i) => (
                <MenuItem key={i} value={c}>
                  {c}
                </MenuItem>
              ))}
            </TextField>
          </div>
          <div className="tw-w-full md:tw-w-48">
            <TextField
              inputRef={searchRef}
              defaultValue={find}
              onChange={(e) => debounceFindText(e.target.value)}
              label="Cari"
              size="small"
            />
          </div>
          {isAdmin || isNoc ? (
            <CustomerTab2FilterAction
              isMobile={isMobile}
              loadingExport={loadingExport.value}
              onExport={() => exportData()}
              onAdd={() => {
                setSelectedCustomer(null);
                showFormCustomer.onTrue();
              }}
            />
          ) : (
            <div />
          )}
        </div>
      </div>
      <div className="tw-w-full tw-relative tw-flex tw-flex-col tw-gap-2 tw-mt-2">
        <Overloading loading={loading.value} />
        {isMobile ? (
          <div className="tw-px-1 tw-gap-2 tw-flex tw-flex-col">
            {customers.map((customer, i) => (
              <AreaConfigurationMobileCard
                key={i}
                customer={customer}
                onEdit={() => handlerEdit(customer)}
                onRemove={() => handlerRemove(customer)}
                onShowTopology={() => setShowTopologyCustomerId(customer._id)}
                onClickBilling={() => navigateToBilling(customer)}
                readOnly={!isAdmin && !isNoc}
                showKtp={(ktp) => showKtp(ktp)}
                rewritePPPoE={() => rewritePppoe(customer)}
              />
            ))}
          </div>
        ) : (
          <CustomerAreaConfigurationTable
            customers={customers}
            onEdit={handlerEdit}
            onRemove={handlerRemove}
            onShowTopology={(customer) => setShowTopologyCustomerId(customer._id)}
            onClickBilling={(customer) => navigateToBilling(customer)}
            readOnly={!isAdmin && !isNoc}
            showKtp={(ktp) => showKtp(ktp)}
            rewritePPPoE={(customer) => rewritePppoe(customer)}
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
      <ViewerImageDialog ref={viewerImageDialogRef} />
      <CustomerDeactivateDialog ref={deactivateDialogRef} />
    </div>
  );
}

const mapsStateToProps = (state) => {
  const { selectedOdp } = state.odpStore;
  return { ...state.areaConfigurationStore, selectedOdp };
};
export default connect(mapsStateToProps)(CustomerTab2);
