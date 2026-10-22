/**
 * @typedef {import("@/stores/customerEngineerStore").CustomerEngineerStore} CustomerEngineerStore
 */

import { toast } from 'sonner';
import { useBoolean } from '@hooks/use-boolean';
import Overloading from '@components/overloading';
import { connect, useDispatch } from 'react-redux';
import { useDebouncedCallback } from 'use-debounce';
import { usePrivilege } from '@auth/hooks/privileges';
import { useRef, useMemo, useState, useEffect } from 'react';
import { ViewerImageDialog } from '@components/viewerImageDialog';
import HistoryLogMikrotik from '@components/customerEngineer/historyLogMikrotik';
import CustomerTopologyDialog from '@components/areaConfiguration/CustomerTopology';

import {
  Menu,
  useTheme,
  MenuItem,
  TextField,
  Typography,
  useMediaQuery,
  TablePagination,
} from '@mui/material';

import { setCustomerEngineerStore } from 'src/stores/customerEngineerStore';
import { areaRepository, customerRepository, packagePlanRepository } from 'src/repositories';

import AcsDialog from 'src/components/acs/Dialog';
import TicketHistory from 'src/components/ticket/history';
import TicketForm from 'src/components/customerEngineer/TicketForm';
import CustomerEngineerTable from 'src/components/customerEngineer/table';
import CustomerEngineerMobile from 'src/components/customerEngineer/mobile';
import CheckStatusMikrotik from 'src/components/customerEngineer/CheckStatusMikrotik';

/**
 *
 * @param {CustomerEngineerStore} props -- react props
 */
function CustomerEngineer({
  area,
  areaCategory,
  customers,
  limit,
  packet,
  page,
  search,
  total,
  areaCategories,
  packets,
  areas,
  order,
  orderBy,
}) {
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { isAdmin, isNoc } = usePrivilege();
  const allowModify = useMemo(() => isAdmin || isNoc);
  const loading = useBoolean(false);
  const [showTopologyCustomerId, setShowTopologyCustomerId] = useState(null);
  const showTicketForm = useBoolean(false);

  const showCheckStatus = useBoolean(false);
  const [showCustomerTicket, setShowCustomerTicket] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const viewerImageDialogRef = useRef();
  const historyLogMikrotikDialogRef = useRef();
  const acsDialogRef = useRef();

  const debounceFind = useDebouncedCallback((text) => {
    dispatch(setCustomerEngineerStore({ key: 'search', value: text }));
  }, 500);

  const open = Boolean(anchorEl);
  const handleClick = (event, data) => {
    setAnchorEl(event.currentTarget);
    setSelectedCustomer(data);
  };
  const handleClose = () => {
    setAnchorEl(null);
    setSelectedCustomer(null);
  };

  const prefetch = async () => {
    loading.onTrue();
    try {
      const snapshot = await customerRepository.findCustomerFromEnginner({
        page,
        limit,
        search,
        packet,
        area: area.replaceAll('all', ''),
        areaCategory,
        order,
        orderBy,
      });
      dispatch(setCustomerEngineerStore({ key: 'total', value: snapshot.total }));
      dispatch(setCustomerEngineerStore({ key: 'customers', value: snapshot.customers }));
    } catch (error) {
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
          setCustomerEngineerStore({
            key: 'packets',
            value: snapshotPacket.filter((p) => p.status === 'active'),
          })
        );
      }

      if (areaCategories.length <= 0) {
        const snapshotArea = await areaRepository.getAllArea();
        dispatch(setCustomerEngineerStore({ key: 'areas', value: snapshotArea }));
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  /**
   * @param {Event} e
   * @param {number} n
   */
  const handlerSetPage = (e, n) => {
    dispatch(setCustomerEngineerStore({ key: 'page', value: n }));
  };

  /**
   * @param {Event} e
   */
  const handlerSetLimit = (e) => {
    dispatch(setCustomerEngineerStore({ key: 'limit', value: e.target.value }));
    dispatch(setCustomerEngineerStore({ key: 'page', value: 0 }));
  };

  useEffect(() => {
    initFilter();
    prefetch();
  }, [limit, page, order, orderBy]);

  useEffect(() => {
    dispatch(setCustomerEngineerStore({ key: 'page', value: 0 }));
    if (page >= 1) return;
    prefetch();
  }, [search, packet, area]);

  function showKtp(ktpPath) {
    const imageUrl = ktpPath.replaceAll('/public/uploads/', '');
    viewerImageDialogRef.current.showImage([imageUrl], 'KTP');
  }

  return (
    <div className="tw-flex tw-flex-col tw-p-5">
      <div className="tw-flex tw-flex-col md:tw-flex-row tw-w-full tw-items-center tw-justify-between tw-gap-2 tw-mb-4">
        <Typography variant={isMobile ? 'overline' : 'h5'}>Cek Data</Typography>
        <div className="tw-flex tw-flex-col md:tw-flex-row tw-w-full md:tw-w-auto tw-gap-2">
          <TextField
            select
            label="Area / Wilayah"
            value={area}
            size="small"
            className="md:tw-w-48 tw-w-full"
            onChange={(e) =>
              dispatch(setCustomerEngineerStore({ key: 'area', value: e.target.value }))
            }
          >
            <MenuItem value="all">Semua</MenuItem>
            {areas.map((a, i) => (
              <MenuItem key={i} value={a._id}>
                {a.title}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Cari"
            defaultValue={search}
            size="small"
            className="md:tw-w-48 tw-w-full"
            onChange={
              (e) => debounceFind(e.target.value)
              // dispatch(setCustomerEngineerStore({ key: 'search', value: e.target.value }))
            }
          />
        </div>
      </div>
      <div className="tw-flex tw-flex-col tw-gap-2 tw-relative">
        <Overloading loading={loading.value} />
        {isMobile ? (
          <CustomerEngineerMobile
            onAction={handleClick}
            customers={customers}
            showKtp={(ktp) => showKtp(ktp)}
          />
        ) : (
          <CustomerEngineerTable
            customers={customers}
            onAction={handleClick}
            showKtp={(ktp) => showKtp(ktp)}
          />
        )}

        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={handlerSetPage}
          rowsPerPage={limit}
          onRowsPerPageChange={handlerSetLimit}
        />
        <Menu
          id="basic-menu"
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          MenuListProps={{
            'aria-labelledby': 'basic-button',
          }}
        >
          {allowModify && <MenuItem onClick={() => showTicketForm.onTrue()}>Buat Ticket</MenuItem>}

          <MenuItem onClick={() => setShowCustomerTicket(selectedCustomer._id)}>
            Riwayat Ticket
          </MenuItem>
          <MenuItem onClick={() => setShowTopologyCustomerId(selectedCustomer._id)}>
            Topologi
          </MenuItem>
          {/* <MenuItem onClick={() => showCheckStatus.onTrue()}>Cek Status Koneksi</MenuItem> */}
          <MenuItem onClick={() => acsDialogRef.current.open(selectedCustomer._id)}>
            ACS & Cek Koneksi
          </MenuItem>
          <MenuItem onClick={() => historyLogMikrotikDialogRef.current.open(selectedCustomer._id)}>
            History Log Mikrotik
          </MenuItem>
        </Menu>
      </div>
      <TicketHistory
        customerId={showCustomerTicket}
        onClose={() => {
          setShowCustomerTicket(null);
          handleClose();
        }}
      />
      <CheckStatusMikrotik
        customer={selectedCustomer}
        show={showCheckStatus.value}
        onClose={() => {
          showCheckStatus.onFalse();
          handleClose();
        }}
      />
      <CustomerTopologyDialog
        customerId={showTopologyCustomerId}
        onClose={() => {
          setShowTopologyCustomerId(null);
          handleClose();
        }}
      />
      <TicketForm
        customer={selectedCustomer}
        show={showTicketForm.value}
        onClose={() => {
          showTicketForm.onFalse();
          handleClose();
        }}
      />
      <ViewerImageDialog ref={viewerImageDialogRef} />
      <HistoryLogMikrotik ref={historyLogMikrotikDialogRef} />
      <AcsDialog title="ACS & Cek Koneksi" ref={acsDialogRef} />
    </div>
  );
}

const mapStateToProps = (state) => state.customerEngineerStore;
export default connect(mapStateToProps)(CustomerEngineer);
