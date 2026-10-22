/**
 * @typedef {import('src/stores/customerFinishStore').CustomerFinishStore} CustomerFinishStore
 * @typedef {import('src/repositories/customer').Customer} Customer
 * @typedef {import('src/stores/areaStore').AreaStore} AreaStore
 * @typedef {import("src/repositories/area").Area} Area
 */

import dayjs from 'dayjs';
import { toast } from 'sonner';
import { Icon } from '@iconify/react';
import { Iconify } from '@components/iconify';
import { useBoolean } from '@hooks/use-boolean';
import { useConfirm } from 'material-ui-confirm';
import Overloading from '@components/overloading';
import { connect, useDispatch } from 'react-redux';
import { useDebouncedCallback } from 'use-debounce';
import { usePrivilege } from '@auth/hooks/privileges';
import { useRef, useMemo, useState, useEffect } from 'react';
import { ViewerImageDialog } from '@components/viewerImageDialog';
import CustomerFinishTable from '@components/customerFinish/table';
import CustomerFinishMobileCard from '@components/customerFinish/mobileCard';
import CustomerFormDialog from '@components/areaConfiguration/customerFormDialog';
import CheckStatusMikrotik from '@components/customerEngineer/CheckStatusMikrotik';
import { InstallationReportDialog } from '@components/customerQueue/installationReportDialog';

import { DatePicker } from '@mui/x-date-pickers';
import {
  Menu,
  useTheme,
  MenuItem,
  TextField,
  Typography,
  useMediaQuery,
  TablePagination,
} from '@mui/material';

import 'src/extension/date';
import 'src/extension/string';
import { setArea } from 'src/stores/areaStore';
import { areaRepository, customerRepository } from 'src/repositories';
import {
  customerFinishStoreSetState,
  customerFinishStoreSetStateMulti,
} from 'src/stores/customerFinishStore';

import TicketHistory from 'src/components/ticket/history';
/**
 *
 * @param {CustomerFinishStore & {areaList: Area[]}} props - react props
 * @returns
 */
function CustomerQueue({
  customers,
  limit,
  page,
  find,
  totalItem,
  order,
  orderBy,
  start,
  until,
  selectedArea,
  areaList,
}) {
  const dispatch = useDispatch();
  const theme = useTheme();
  const confirm = useConfirm();
  const [statusMode, setStatusMode] = useState(null);
  const searchRef = useRef();
  const showCheckStatus = useBoolean(false);

  const { isAdmin, isEngineer, isNoc, isLo } = usePrivilege();

  const allowModify = useMemo(() => isAdmin || isNoc || isLo);

  const debounceFind = useDebouncedCallback((value) => {
    dispatch(customerFinishStoreSetState({ key: 'find', value }));
  }, 1000);

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  /**
   * @type {[Customer, void]}
   */
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showCustomerFormDialog, setCustomerFormDialog] = useState(false);
  const [showInstallationReportDialog, setShowInstallationReportDialog] = useState(false);
  const viewerDialog = useRef();
  const loading = useBoolean(false);

  /** @type {[string, void]} */
  const [showCustomerTicket, setShowCustomerTicket] = useState(null);

  const handleOpenMenu = (event, c) => {
    setAnchorEl(event.currentTarget);
    setSelectedCustomer(c);
  };
  const handleCloseMenu = () => {
    setAnchorEl(null);
    setSelectedCustomer(null);
  };

  const [tabsEngineer, setTabsEngineer] = useState('processed');

  const prefetch = async () => {
    loading.onTrue();
    try {
      const snapshot = await customerRepository.getCustomerFinish({
        page,
        limit,
        find,
        order,
        orderBy,
        start: start.format('yyyy-MM-dd'),
        until: until.format('yyyy-MM-dd'),
        area: selectedArea,
      });

      if (areaList.length === 0) {
        const snapshotArea = await areaRepository.getAllArea();
        dispatch(setArea(snapshotArea));
      }

      if (isEngineer) {
        const userId = localStorage.getItem('userId') ?? '';

        const sortableCustomerList = snapshot.customerList.sort((a, b) => {
          if ((a.engineers ?? []).includes(userId) || a.engineer === 'userId') return -1;
          if ((b.engineers ?? []).includes(userId) || b.engineer === 'userId') return 1;
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        });
        dispatch(
          customerFinishStoreSetStateMulti([
            { key: 'customers', value: sortableCustomerList },
            { key: 'totalItem', value: snapshot.total },
          ])
        );
      } else {
        dispatch(
          customerFinishStoreSetStateMulti([
            { key: 'customers', value: snapshot.customerList },
            { key: 'totalItem', value: snapshot.total },
          ])
        );
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      loading.onFalse();
    }
  };

  const availableArea = useMemo(() => {
    const maping = [];

    areaList.forEach((a) => {
      maping.push(a.title);
      a.area.forEach((area) => {
        maping.push(area);
      });
    });

    return maping;
  });

  useEffect(() => {
    prefetch();
  }, [limit, page, tabsEngineer, order, orderBy]);

  useEffect(() => {
    dispatch(customerFinishStoreSetState({ key: 'page', value: 0 }));
    if (page === 0) prefetch();
  }, [find, start, until, selectedArea]);

  /**
   * @param {boolean | undefined} isPrefetch
   */
  const handlerClose = (isPrefetch) => {
    setCustomerFormDialog(false);
    setStatusMode(null);
    setAnchorEl(null);
    handleCloseMenu();
    if (isPrefetch) prefetch();
  };

  /**
   * @param {Customer} item
   */
  const onOpenGmaps = (item) => {
    const url = `https://maps.google.com/?q=${item.location.lat},${item.location.lng}`;
    window.open(url, '_blank');
  };

  /**
   * @param {string} image
   */
  const onShowKtp = (image) => {
    if (isEngineer) {
      return;
    }
    if (!image) {
      toast.error('KTP tidak tersedia');
      return;
    }
    viewerDialog.current.showImage([image]);
  };

  /**
   * @param {Event} e
   * @param {number} page
   */
  const handlerSetPage = (e, n) => {
    // dispatch(setPage(n));
    // setCurrentPage(n);
    dispatch(customerFinishStoreSetState({ key: 'page', value: n }));
  };

  /**
   * @param {Event} e
   */
  const handlerSetLimit = (e) => {
    // setLimit(e.target.value);
    dispatch(customerFinishStoreSetState({ key: 'limit', value: e.target.value }));
  };

  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <>
      <div className=" tw-flex tw-flex-col tw-px-5 tw-w-full tw-mx-auto tw-items-center tw-justify-center">
        {/* Header Page */}
        <div className="tw-flex tw-flex-col md:tw-flex-row tw-w-full tw-items-center tw-justify-between tw-gap-2 tw-mb-4">
          <div className="tw-flex tw-flex-row tw-w-full md:tw-w-auto tw-items-center tw-justify-between md:tw-justify-start tw-gap-2 tw-mb-4">
            <Typography variant={isMobile ? 'overline' : 'h5'}>Riwayat Pemasangan</Typography>
          </div>
          <div className="tw-flex tw-flex-col md:tw-flex-row tw-w-full md:tw-w-auto tw-items-center tw-justify-end tw-gap-2 tw-mb-4">
            <div className="tw-w-full md:tw-w-48">
              <TextField
                select
                name="area"
                label="Area"
                value={selectedArea}
                onChange={(e) =>
                  dispatch(
                    customerFinishStoreSetState({ key: 'selectedArea', value: e.target.value })
                  )
                }
                fullWidth
                size="small"
              >
                <MenuItem value="">Semua</MenuItem>
                {availableArea.map((a, i) =>
                  typeof a === 'string' ? (
                    <MenuItem disabled key={i}>
                      {a}
                    </MenuItem>
                  ) : (
                    <MenuItem key={i} value={a._id}>
                      <div>{a.title}</div>
                    </MenuItem>
                  )
                )}
              </TextField>
            </div>
            <div className="tw-w-full md:tw-w-48">
              <DatePicker
                label="Mulai"
                value={dayjs(start)}
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
                maxDate={dayjs(new Date())}
                onAccept={(value) => {
                  dispatch(customerFinishStoreSetState({ key: 'start', value: value.toDate() }));
                }}
              />
            </div>
            <div className="tw-w-full md:tw-w-48">
              <DatePicker
                label="Sampai"
                value={dayjs(until)}
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
                maxDate={dayjs(new Date())}
                onAccept={(value) => {
                  dispatch(customerFinishStoreSetState({ key: 'until', value: value.toDate() }));
                }}
              />
            </div>
            <div className="tw-w-full md:tw-w-48">
              <TextField
                fullWidth
                inputRef={searchRef}
                size="small"
                label="Cari"
                placeholder=""
                SelectProps={{ native: true }}
                onChange={(e) => debounceFind(e.target.value)}
              />
            </div>
          </div>
        </div>
        <div className="tw-flex tw-flex-col tw-relative tw-w-full tw-mt-4 tw-gap-3">
          <Overloading loading={loading.value} />
          {isMobile ? (
            <>
              {customers.map((c, i) => (
                <CustomerFinishMobileCard
                  key={i}
                  customer={c}
                  onShowMenu={(e) => handleOpenMenu(e, c)}
                  onOpenMap={onOpenGmaps}
                  iteration={i + 1}
                  onShowKtp={onShowKtp}
                />
              ))}
            </>
          ) : (
            <CustomerFinishTable
              onShowMenu={(e, c) => handleOpenMenu(e, c)}
              customers={customers}
              onOpenMap={onOpenGmaps}
              showKtp={onShowKtp}
            />
          )}
          <TablePagination
            component="div"
            count={totalItem}
            page={page}
            onPageChange={handlerSetPage}
            rowsPerPage={limit}
            onRowsPerPageChange={handlerSetLimit}
          />
          <Menu
            id="demo-positioned-menu"
            aria-labelledby="demo-positioned-button"
            anchorEl={anchorEl}
            open={open}
            onClose={handleCloseMenu}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'left',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'left',
            }}
          >
            <MenuItem
              className="tw-gap-2 tw-flex tw-flex-row"
              onClick={() => showCheckStatus.onTrue()}
            >
              <Iconify icon="uil:cloud-data-connection" />
              Cek Status Koneksi
            </MenuItem>

            <MenuItem
              onClick={() => setShowInstallationReportDialog(true)}
              color="success"
              className="tw-gap-2 tw-flex tw-flex-row"
            >
              <Icon icon="icon-park-outline:table-report" />
              Laporan Instalasi
            </MenuItem>

            <MenuItem
              onClick={() => setShowCustomerTicket(selectedCustomer?._id ?? null)}
              color="success"
              className="tw-gap-2 tw-flex tw-flex-row"
            >
              <Icon icon="mingcute:ticket-line" />
              Riwayat Ticket
            </MenuItem>
          </Menu>
        </div>
      </div>
      <CustomerFormDialog
        show={showCustomerFormDialog}
        onClose={handlerClose}
        selectedCustomer={selectedCustomer}
        statusMode={statusMode}
      />
      <InstallationReportDialog
        show={showInstallationReportDialog}
        onClose={() => {
          setShowInstallationReportDialog(false);
          handleCloseMenu();
        }}
        selectedCustomer={selectedCustomer}
      />
      <CheckStatusMikrotik
        customer={selectedCustomer}
        show={showCheckStatus.value}
        onClose={() => {
          showCheckStatus.onFalse();
          handlerClose();
        }}
      />
      <TicketHistory
        customerId={showCustomerTicket}
        onClose={() => {
          setShowCustomerTicket(null);
          handleCloseMenu();
        }}
      />
      <ViewerImageDialog ref={viewerDialog} />
    </>
  );
}

/**
 *
 * @param {{customerFinishStore: CustomerFinishStore; areaStore: AreaStore}} state
 */
const mapsStateToProps = ({ customerFinishStore, areaStore }) => ({
  ...customerFinishStore,
  areaList: areaStore.all,
});
export default connect(mapsStateToProps)(CustomerQueue);
