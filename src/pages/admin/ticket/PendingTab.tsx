// @ts-nocheck

/**
 * @typedef {import("src/stores/ticketMain").TicketMainStore} TicketMainStore
 * @typedef {import('src/repositories/ticket').Ticket} Ticket
 * @returns
 */

import { toast } from 'sonner';
import { useNavigate } from 'react-router';
import { useBoolean } from '@hooks/use-boolean';
import { useConfirm } from 'material-ui-confirm';
import Overloading from '@components/overloading';
import { useDebouncedCallback } from 'use-debounce';
import { usePrivilege } from '@auth/hooks/privileges';
import { TicketLogForm } from '@components/ticket/logForm';
import AreaPickerFilter from '@components/billing/areaPickerFilter';
import { TicketEngineerPicker } from '@components/ticket/engineerPicker';
import { useRef, useMemo, useState, useEffect, forwardRef, useImperativeHandle } from 'react';

import {
  Menu,
  Stack,
  useTheme,
  MenuItem,
  TextField,
  useMediaQuery,
  TablePagination,
} from '@mui/material';

import { useInfoStore } from 'src/stores/info';
import { ticketRepository } from 'src/repositories';
import { useTicketMainStore } from 'src/stores/ticketMain';
import { TICKET_TYPE_LABELS_LIST } from 'src/enums/ticketType';

import TicketTable from 'src/components/ticket/table';
import TicketMobile from 'src/components/ticket/mobileCard';

import type { ShowKtp, TicketRecord, TicketDataTabHandle } from './types';

const TicketPendingTab = forwardRef<TicketDataTabHandle, { showKtp: ShowKtp }>(({ showKtp }, ref) => {
  /** @type {import('src/stores/info').InfoStore} */
  const infoStore = useInfoStore();
  const isLoading = useBoolean(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { isAdmin, userId, isEngineer, isNoc } = usePrivilege();
  const allowProcessEngineer = useBoolean(false);
  const engineerPickerRef = useRef();
  const ticketLogFormRef = useRef();
  const areaPickerRef = useRef();
  const confirm = useConfirm();
  const navigate = useNavigate();

  /** @type {[Ticket, void]} */
  const [selectedTicket, setSelectTicket] = useState<TicketRecord | null>(null);
  const [anchorEl, setAnchorEl] = useState(null);

  /** @type {TicketMainStore} */
  const {
    pendingData,
    pendingDataPage,
    pendingDataSearch,
    pendingDatalimit,
    setPendingData,
    pendingTotalItems,
    pendingAreaId,
    pendingAreaTitle,
    pendingTicketType,
    pendingSortBy,
    pendingSort,
  } = useTicketMainStore();

  /**
   * @param {Event} event
   * @param {Ticket} ticket
   */
  const handleClick = (event, ticket) => {
    setAnchorEl(event.currentTarget);
    setSelectTicket(ticket);

    if (isEngineer) {
      const allow = ticket.engineers.some((e) => e._id === userId);
      if (allow) {
        allowProcessEngineer.onTrue();
      } else {
        allowProcessEngineer.onFalse();
      }
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
    setSelectTicket(null);
    allowProcessEngineer.onFalse();
  };

  const open = Boolean(anchorEl);
  const allowModify = useMemo(() => isAdmin || isNoc);

  async function pickArea() {
    const area = await areaPickerRef.current?.open();
    if (area) {
      setPendingData({ areaId: area._id, areaTitle: area.name });
    }
  }

  async function prefetch() {
    isLoading.onTrue();
    infoStore.refresh();
    try {
      const result = await ticketRepository.getList({
        find: pendingDataSearch,
        limit: pendingDatalimit,
        page: pendingDataPage,
        status: 'pending',
        area: pendingAreaId,
        ticketType: pendingTicketType,
        sortBy: pendingSortBy,
        sort: pendingSort,
      });
      setPendingData({ data: result.data, totalItems: result.total });
    } catch (error) {
      toast.error(error.message);
    } finally {
      isLoading.onFalse();
    }
  }

  const debouncePrefetch = useDebouncedCallback(() => {
    prefetch();
  }, 500);

  const onProcessed = async () => {
    try {
      await confirm({
        title: 'Proses',
        content: `Apakah anda ingin memproses Ticket ${selectedTicket?.ticketId}`,
        confirmationText: 'Proses',
        cancellationText: 'Batal',
        confirmationButtonProps: { color: 'primary' },
        cancellationButtonProps: { color: 'error' },
      });

      await ticketRepository.changeStatus(selectedTicket._id, 'processed');
      toast.success('Berhasil memproses');
      prefetch();
    } catch (error) {
      toast.error(error.message);
    } finally {
      handleClose();
    }
  };

  const onSendNotif = async () => {
    try {
      await confirm({
        title: 'Ajukan penyelesaian',
        content: `Apakah anda ingin mengajukan penyelesaian Ticket ${selectedTicket?.ticketId}`,
        confirmationText: 'Ajukan',
        cancellationText: 'Batal',
        confirmationButtonProps: { color: 'primary' },
        cancellationButtonProps: { color: 'error' },
      });

      toast.info('Mohon mengunggu');

      await ticketRepository.requestFinising(selectedTicket._id);
      toast.success('Request Whatsapp');
      prefetch();
    } catch (error) {
      toast.error(error.message);
    } finally {
      handleClose();
    }
  };

  function navigateToCustomerData() {
    const currentTicket = selectedTicket;
    handleClose();
    navigate(`/v2/customer?q=${currentTicket.customerId}`);
  }

  const onFinishing = async () => {
    try {
      await confirm({
        title: 'Selesaikan',
        content: `Apakah anda ingin menyelesaikan Ticket ${selectedTicket?.ticketId}`,
        confirmationText: 'Selesaikan',
        cancellationText: 'Batal',
        confirmationButtonProps: { color: 'primary' },
        cancellationButtonProps: { color: 'error' },
      });

      const currentTicket = selectedTicket;
      const promises = ticketRepository.changeStatus(currentTicket._id, 'finish');
      handleClose();

      toast.promise(promises, {
        loading: 'Menyelesaikan Ticket...',
        success: () => {
          prefetch();
          return 'Ticket Diselesaikan';
        },
        error: (error) => `Gagal menyelesaikan: ${error.message}`,
      });
      // toast.success('Ticket Diselesaikan');
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
    } finally {
      handleClose();
    }
  };

  const onProcess = async () => {
    try {
      await confirm({
        title: 'Proses',
        content: `Apakah anda ingin memproses Ticket ${selectedTicket?.ticketId}`,
        confirmationText: 'Proses',
        cancellationText: 'Batal',
        confirmationButtonProps: { color: 'primary' },
        cancellationButtonProps: { color: 'error' },
      });

      const currentTicket = selectedTicket;
      const promises = ticketRepository.changeStatus(currentTicket._id, 'processed');
      handleClose();

      toast.promise(promises, {
        loading: 'Memproses Ticket...',
        success: () => {
          prefetch();
          return 'Ticket Diproses';
        },
        error: (error) => `Gagal memproses: ${error.message}`,
      });
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
    } finally {
      handleClose();
    }
  };

  const onRemove = async () => {
    try {
      await confirm({
        title: 'Hapus',
        content: `Apakah anda ingin menghapus Ticket ${selectedTicket?.ticketId}`,
        confirmationText: 'Hapus',
        cancellationText: 'Batal',
        confirmationButtonProps: { color: 'error' },
        cancellationButtonProps: { color: 'primary' },
      });

      await ticketRepository.remove(selectedTicket._id);
      toast.success('Ticket dihapus');
      prefetch();
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
    } finally {
      handleClose();
    }
  };

  /**
   * @param {Ticket} ticket
   */
  const onChangeEngineer = async (ticket) => {
    try {
      const engineers = await engineerPickerRef.current.open(ticket.engineers.map((e) => e._id));
      if (!engineers) return;
      await ticketRepository.changeEngineer(ticket._id, engineers);
      toast.success('Teknisi telah diganti');
      prefetch();
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
    } finally {
      handleClose();
    }
  };

  useEffect(() => {
    debouncePrefetch();
  }, [pendingDataPage, pendingSortBy, pendingSort]);

  useEffect(() => {
    setPendingData({ page: 0 });
    debouncePrefetch();
  }, [pendingDataSearch, pendingDatalimit, pendingAreaId, pendingTicketType]);

  useImperativeHandle(ref, () => ({ prefetch: debouncePrefetch }));

  return (
    <Stack gap={2}>
      <Stack
        direction="row"
        className="w-full"
        alignItems="center"
        justifyItems="end"
        justifyContent="end"
        spacing={1}
      >
        <TextField
          size="small"
          label="Jenis"
          value={pendingTicketType}
          className="tw-w-full md:tw-w-48"
          InputLabelProps={{ shrink: true }}
          SelectProps={{ displayEmpty: true }}
          select
          onChange={(e) => setPendingData({ ticketType: e.target.value })}
        >
          <MenuItem value="">Semua</MenuItem>
          {TICKET_TYPE_LABELS_LIST.map((item) => (
            <MenuItem key={item.value} value={item.value}>
              {item.label}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          size="small"
          label="Area"
          value={pendingAreaTitle}
          InputProps={{ readOnly: true }}
          className="tw-w-full md:tw-w-48"
          onClick={() => pickArea()}
        />
        <TextField
          defaultValue={pendingDataSearch}
          size="small"
          label="Cari"
          className="tw-w-full md:tw-w-48"
          onChange={(e) => setPendingData({ search: e.target.value })}
        />
      </Stack>
      {/* Content */}
      <div className="tw-flex tw-flex-col tw-mt-4 tw-relative tw-w-full tw-gap-2">
        <Overloading loading={isLoading.value} />
        {isMobile ? (
          <TicketMobile
            tickets={pendingData}
            onMenu={handleClick}
            showKtp={(ktp) => showKtp(ktp)}
            showLogs={(ticket) => ticketLogFormRef.current?.open(ticket, ticket.customer_id)}
          />
        ) : (
          <TicketTable
            tickets={pendingData}
            onMenu={handleClick}
            showKtp={(ktp) => showKtp(ktp)}
            sort={pendingSort}
            sortBy={pendingSortBy}
            onChangeSort={(sb, s) => setPendingData({ sortBy: sb, sort: s })}
          />
        )}
        <TablePagination
          component="div"
          count={pendingTotalItems}
          page={pendingDataPage}
          onPageChange={(e, n) => setPendingData({ page: n })}
          rowsPerPage={pendingDatalimit}
          onRowsPerPageChange={(e) => setPendingData({ page: 0, limit: e.target.value })}
        />
      </div>
      {/* Menu */}
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
      >
        <MenuItem onClick={() => navigateToCustomerData()}>Network Status</MenuItem>

        {allowModify && ['waiting_finishing', 'pending'].includes(selectedTicket?.status) ? (
          <>
            <MenuItem onClick={onProcess}>Proses</MenuItem>
            <MenuItem onClick={onFinishing}>Selesaikan</MenuItem>
          </>
        ) : null}

        {allowModify && ['processed', 'pending'].includes(selectedTicket?.status) ? (
          <MenuItem onClick={() => onChangeEngineer(selectedTicket)}>Ganti Teknisi</MenuItem>
        ) : null}

        {allowModify && <MenuItem onClick={onRemove}>Hapus</MenuItem>}

        {/* Engineer Action */}
        {isEngineer && allowProcessEngineer.value && selectedTicket?.status === 'pending' ? (
          <MenuItem onClick={onProcessed}>Proses</MenuItem>
        ) : null}

        {isEngineer && allowProcessEngineer.value && selectedTicket?.status === 'processed' ? (
          <MenuItem onClick={onSendNotif}>Ajukan Penyelesaian</MenuItem>
        ) : null}

        <MenuItem
          onClick={() => {
            ticketLogFormRef.current.open(selectedTicket, selectedTicket.customer_id);
            handleClose();
          }}
        >
          Log
        </MenuItem>

        {isEngineer && !allowProcessEngineer.value && <MenuItem>Forbiden</MenuItem>}
      </Menu>
      <TicketLogForm ref={ticketLogFormRef} />
      <TicketEngineerPicker ref={engineerPickerRef} />
      <AreaPickerFilter ref={areaPickerRef} />
    </Stack>
  );
});

export default TicketPendingTab;
