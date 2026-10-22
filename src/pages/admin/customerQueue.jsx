/**
 * @typedef {import("src/stores/customerQueueStore").CustomerQueueStore} CustomerQueueStore
 * @typedef {import('src/repositories/customer').Customer} Customer
 */

import { toast } from 'sonner';
import { Icon } from '@iconify/react';
import { Iconify } from '@components/iconify';
import { useBoolean } from '@hooks/use-boolean';
import { useConfirm } from 'material-ui-confirm';
import Overloading from '@components/overloading';
import { connect, useDispatch } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { useDebouncedCallback } from 'use-debounce';
import { usePrivilege } from '@auth/hooks/privileges';
import { useRef, useMemo, useState, useEffect } from 'react';
import { ViewerImageDialog } from '@components/viewerImageDialog';
import CustomerQueueMobileCard from '@components/customerQueue/mobileCard';
import CustomerFormDialog from '@components/areaConfiguration/customerFormDialog';
import CheckStatusMikrotik from '@components/customerEngineer/CheckStatusMikrotik';
import { InstallationReportDialog } from '@components/customerQueue/installationReportDialog';

import {
  Menu,
  useTheme,
  MenuItem,
  TextField,
  Typography,
  useMediaQuery,
  TablePagination,
} from '@mui/material';

import { useInfoStore } from 'src/stores/info';
import { customerRepository, installationRepository } from 'src/repositories';
import {
  customerQueueStoreSetState,
  customerQueueStoreSetStateMulti,
} from 'src/stores/customerQueueStore';

import TicketHistory from 'src/components/ticket/history';
import CustomerQueueTable from 'src/components/customerQueue/table';

/** @typedef {import('src/stores/info').InfoStore} InfoStore */
/**
 *
 * @param {CustomerQueueStore} props - react props
 * @returns
 */
function CustomerQueue({ customers, limit, page, status, find, totalItem, order, orderBy }) {
  /** @type {InfoStore} */
  const infoStore = useInfoStore();
  const dispatch = useDispatch();
  const theme = useTheme();
  const confirm = useConfirm();
  const [statusMode, setStatusMode] = useState(null);
  const [query, setQuery] = useSearchParams();
  const searchRef = useRef();
  const showCheckStatus = useBoolean(false);

  const { isAdmin, isEngineer, isNoc, isLo, isDeveloper } = usePrivilege();

  const allowModify = useMemo(() => isAdmin || isNoc || isDeveloper);

  const debounceFind = useDebouncedCallback((value) => {
    dispatch(customerQueueStoreSetState({ key: 'find', value }));
    setQuery({ q: value });
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
  const viewerImageDialogRef = useRef();

  const handleOpenMenu = (event, c) => {
    setAnchorEl(event.currentTarget);
    setSelectedCustomer(c);
  };
  const handleCloseMenu = () => {
    setAnchorEl(null);
    setSelectedCustomer(null);
  };

  const statusList = [
    {
      label: 'Semua',
      value: 'all',
    },
    {
      label: 'Belum dikonfirmasi',
      value: 'unconfirmed',
    },
    {
      label: 'Proses',
      value: 'processed',
    },
    {
      label: 'Aktif',
      value: 'active',
    },
    {
      label: 'Menunggu Penyelesaian',
      value: 'waiting_approval',
    },
    {
      label: 'Batal',
      value: 'cancel',
    },
  ];

  const [tabsEngineer, setTabsEngineer] = useState('processed');
  const tabsEngineerList = [
    { label: 'Antrean', value: 'processed' },
    { label: 'Riwayat', value: 'active' },
  ];

  const prefetch = async () => {
    infoStore.refresh();
    loading.onTrue();
    const s = status === 'all' ? undefined : status;
    try {
      const snapshot = await customerRepository.getCustomerQueue({
        page,
        limit,
        find,
        status: s,
        // status: isEngineer ? tabsEngineer : status === 'all' ? undefined : status,
        order,
        orderBy,
      });

      const statusFilterableValue = {
        processed: 1,
        active: 5,
      };

      if (isEngineer) {
        const userId = localStorage.getItem('userId') ?? '';

        const sortableCustomerList = snapshot.customerList.sort((a, b) => {
          if ((a.engineers ?? []).includes(userId) || a.engineer === 'userId') return -1;
          if ((b.engineers ?? []).includes(userId) || b.engineer === 'userId') return 1;
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        });
        dispatch(
          customerQueueStoreSetStateMulti([
            { key: 'customers', value: sortableCustomerList },
            { key: 'totalItem', value: snapshot.total },
          ])
        );
      } else {
        dispatch(
          customerQueueStoreSetStateMulti([
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

  useEffect(() => {
    prefetch();
  }, [limit, page, tabsEngineer, order, orderBy, status]);

  useEffect(() => {
    if (page === 0) prefetch();
    dispatch(customerQueueStoreSetState({ key: 'page', value: 0 }));
  }, [status, find]);

  useEffect(() => {
    const q = query.get('q');
    if (q) {
      setTimeout(() => {
        dispatch(customerQueueStoreSetState({ key: 'find', value: q }));
      }, 500);
      searchRef.current.value = q;
    }
  }, []);

  const onRemove = async () => {
    try {
      if (!selectedCustomer) throw new Error('Mohon mengulangi proses');
      await confirm({
        content: `Apakah anda ingin menghapus antrian pemasangan ${selectedCustomer?.fullname}`,
        confirmationText: 'Hapus',
        cancellationText: 'Batal',
        confirmationButtonProps: { color: 'error' },
      });

      await customerRepository.removeCustomer(selectedCustomer._id);
      await prefetch();
      toast.info('Menghapus customer');
      toast.success('Berhasil menghapus customer');
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
    } finally {
      handleCloseMenu();
    }
  };
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

  const onProcess = () => {
    setStatusMode('processed');
    setCustomerFormDialog(true);
  };

  /**
   * @param {Customer} item
   */
  const onOpenGmaps = (item) => {
    const url = `https://maps.google.com/?q=${item.location.lat},${item.location.lng}`;
    window.open(url, '_blank');
  };

  const onFinish = async () => {
    try {
      await confirm({
        title: 'Selesaikan Pemasangan',
        content: `Apakah anda ingin menyelesaikan pemasangan ${selectedCustomer.fullname}? pastikan seluruh data terlengkapi, apabila terdapat data kosong maka penyelesaian tidak dapat dilakukan`,
        confirmationText: 'Selesaikan',
        cancellationText: 'Batal',
      });
      await installationRepository.finishReport(selectedCustomer._id);
      await prefetch();
      toast.success('Berhasil menyelesaikan instalasi');
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
    } finally {
      handleCloseMenu();
    }
  };

  const onSendNotif = async () => {
    try {
      await confirm({
        title: 'Kirim Notifikasi',
        content: `Apakah anda ingin mengirim pengajuan penyelesaian pemasangan ${selectedCustomer.fullname}`,
        confirmationText: 'Kirim',
        cancellationText: 'Batal',
      });

      const message = await customerRepository.notiFinishInstallation(selectedCustomer._id);
      handlerClose();
      toast.success(message);
      prefetch();
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
    } finally {
      handleCloseMenu();
    }
  };

  const onCancelQueue = async () => {
    try {
      await confirm({
        title: 'Batalkan',
        content: `Apakah anda ingin membatalkan pemasangan ${selectedCustomer.fullname}`,
        confirmationText: 'Ya',
        cancellationText: 'Tidak',
      });

      const message = await customerRepository.cancelCustomerQueue(selectedCustomer._id);
      handlerClose();
      toast.success('Membatalkan Pemasangan');
      await prefetch();
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
    }
  };

  const onRollbackQueue = async () => {
    try {
      await confirm({
        title: 'Kembalikan',
        content: `Apakah anda ingin mengembalikan pemasangan ${selectedCustomer.fullname} yang telah dibatalkan`,
        confirmationText: 'Ya',
        cancellationText: 'Tidak',
      });

      const message = await customerRepository.rollbackCustomerQueue(selectedCustomer._id);
      handlerClose();
      toast.success('Mengembalikan Data Pemasangan');
      await prefetch();
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
    } finally {
      handleCloseMenu();
    }
  };

  /**
   * @param {string} image
   */
  const onShowKtp = (image) => {
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
    dispatch(customerQueueStoreSetState({ key: 'page', value: n }));
  };

  /**
   * @param {Event} e
   */
  const handlerSetLimit = (e) => {
    // setLimit(e.target.value);
    dispatch(customerQueueStoreSetState({ key: 'limit', value: e.target.value }));
  };

  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <>
      <div className=" tw-flex tw-flex-col tw-px-5 tw-w-full tw-mx-auto tw-items-center tw-justify-center">
        {/* Header Page */}
        <div className="tw-flex tw-flex-col md:tw-flex-row tw-w-full tw-items-center tw-justify-between tw-gap-2 tw-mb-4">
          <div className="tw-flex tw-flex-row tw-w-full md:tw-w-auto tw-items-center tw-justify-between md:tw-justify-start tw-gap-2 tw-mb-4">
            <Typography variant={isMobile ? 'overline' : 'h5'}>Antrian Pemasangan</Typography>
          </div>
          <div className="tw-flex tw-flex-col md:tw-flex-row tw-w-full md:tw-w-auto tw-items-center tw-justify-end tw-gap-2 tw-mb-4">
            {(isAdmin || isNoc || isLo) && (
              <div className="tw-w-full md:tw-w-48">
                <TextField
                  select
                  size="small"
                  label="Status"
                  placeholder=""
                  value={status}
                  SelectProps={{ native: true }}
                  onChange={(e) =>
                    dispatch(customerQueueStoreSetState({ key: 'status', value: e.target.value }))
                  }
                  className="tw-w-full md:tw-w-48"
                >
                  {statusList.map((s, i) => (
                    <option key={i} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </TextField>
              </div>
            )}

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
                <CustomerQueueMobileCard
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
            <CustomerQueueTable
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
            {['waiting_approval'].includes(selectedCustomer?.status) && allowModify && (
              <MenuItem onClick={onFinish} color="success" className="tw-gap-2 tw-flex tw-flex-row">
                <Icon icon="lets-icons:check-fill" />
                Selesaikan
              </MenuItem>
            )}

            {selectedCustomer?.status === 'processed' && (
              <>
                <MenuItem
                  onClick={onSendNotif}
                  color="success"
                  className="tw-gap-2 tw-flex tw-flex-row"
                >
                  <Icon icon="vaadin:paperplane-o" />
                  Ajukan Penyelesaian
                </MenuItem>
                <MenuItem
                  className="tw-gap-2 tw-flex tw-flex-row"
                  onClick={() => showCheckStatus.onTrue()}
                >
                  <Iconify icon="uil:cloud-data-connection" />
                  Cek Status Koneksi
                </MenuItem>
              </>
            )}

            {(allowModify || isEngineer || isLo) && (
              <MenuItem
                onClick={() => setShowInstallationReportDialog(true)}
                color="success"
                className="tw-gap-2 tw-flex tw-flex-row"
              >
                <Icon icon="icon-park-outline:table-report" />
                Laporan Instalasi
              </MenuItem>
            )}

            {allowModify && selectedCustomer?.status === 'unconfirmed' && (
              <MenuItem
                onClick={onProcess}
                color="success"
                className="tw-gap-2 tw-flex tw-flex-row"
              >
                <Icon icon="fluent-mdl2:processing" />
                Proses
              </MenuItem>
            )}

            {['cancel'].includes(selectedCustomer?.status) && allowModify && (
              <MenuItem
                onClick={onRollbackQueue}
                color="primary"
                className="tw-gap-2 tw-flex tw-flex-row"
              >
                <Icon icon="ic:outline-refresh" />
                Kembalikan
              </MenuItem>
            )}

            <MenuItem
              onClick={() => setShowCustomerTicket(selectedCustomer?._id ?? null)}
              color="success"
              className="tw-gap-2 tw-flex tw-flex-row"
            >
              <Icon icon="mingcute:ticket-line" />
              Riwayat Ticket
            </MenuItem>

            {allowModify && selectedCustomer?.status !== 'active' && (
              <MenuItem
                onClick={() => setCustomerFormDialog(true)}
                color="success"
                className="tw-gap-2 tw-flex tw-flex-row"
              >
                <Icon icon="ic:baseline-edit" />
                Edit
              </MenuItem>
            )}

            {['processed', 'waiting_approval', 'unconfirmed'].includes(selectedCustomer?.status) &&
              allowModify && (
                <MenuItem
                  onClick={onCancelQueue}
                  color="error"
                  className="tw-gap-2 tw-flex tw-flex-row"
                >
                  <Icon icon="quill:send-cancelled" />
                  Batalkan
                </MenuItem>
              )}

            {allowModify && ['unconfirmed', 'cancel'].includes(selectedCustomer?.status) && (
              <MenuItem onClick={onRemove} color="success" className="tw-gap-2 tw-flex tw-flex-row">
                <Icon icon="material-symbols:delete-outline" />
                Hapus
              </MenuItem>
            )}
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

const mapsStateToProps = (state) => state.customerQueueStore;
export default connect(mapsStateToProps)(CustomerQueue);
