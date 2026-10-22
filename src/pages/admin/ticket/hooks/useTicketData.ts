// @ts-nocheck

/**
 * @typedef {import("src/stores/ticketMain").TicketMainStore} TicketMainStore
 * @typedef {import('src/repositories/ticket').Ticket} Ticket
 * @typedef {import('src/repositories/ticket').TicketDashboard} TicketDashboard
 */

import { toast } from 'sonner';
import { useNavigate } from 'react-router';
import { useBoolean } from '@hooks/use-boolean';
import { useConfirm } from 'material-ui-confirm';
import { useDebouncedCallback } from 'use-debounce';
import { useMemo, useState, useEffect } from 'react';
import { useAppPicker } from '@hooks/use-app-picker';
import { usePrivilege } from '@auth/hooks/privileges';

import { useTheme, useMediaQuery } from '@mui/material';

import 'src/extension/date';
import { useInfoStore } from 'src/stores/info';
import { ticketRepository } from 'src/repositories';
import { useTicketMainStore } from 'src/stores/ticketMain';

export function useTicketData() {
  const appPicker = useAppPicker();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  /** @type {import('src/stores/info').InfoStore} */
  const infoStore = useInfoStore();
  const isLoading = useBoolean(false);
  const { isAdmin, userId, isEngineer, isNoc } = usePrivilege();
  const allowProcessEngineer = useBoolean(false);
  const confirm = useConfirm();
  const navigate = useNavigate();

  /** @type {[Ticket, void]} */
  const [selectedTicket, setSelectTicket] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);

  const tabs = [
    {
      label: 'Daftar Ticket',
      value: 'ticket.list',
    },
    {
      label: 'Rekap',
      value: 'ticket.recap',
    },
  ];

  const [tab, setTab] = useState(tabs[0].value);

  /** @type {TicketMainStore} */
  const {
    data,
    page,
    search,
    limit,
    setData,
    totalItems,
    areaId,
    ticketType,
    sort,
    sortBy,
    status,
    start,
    until,
    ticketDashboard,
    setStatus,
    createdBy,
  } = useTicketMainStore();

  const open = Boolean(anchorEl);
  const allowModify = useMemo(() => isAdmin || isNoc, [isAdmin, isNoc]);

  const ticketDashboardChart = useMemo(
    () => [
      {
        title: 'Pending',
        total: ticketDashboard?.pending ?? 0,
        icon: 'icon-park-outline:ticket',
        color: theme.vars.palette.warning.main,
        subtitle: 'Menunggu Diproses',
        onClick: () => setData({ status: 'pending' }),
      },
      {
        title: 'Processed',
        total: ticketDashboard?.processed ?? 0,
        icon: 'icon-park-outline:ticket',
        color: theme.vars.palette.primary.main,
        subtitle: 'Sedang Diproses',
        onClick: () => setData({ status: 'processed' }),
      },
      {
        title: 'Req Finish',
        total: ticketDashboard?.waiting_finishing ?? 0,
        icon: 'icon-park-outline:ticket',
        color: theme.vars.palette.violet.main,
        subtitle: 'Menunggu Penyelesaian',
        onClick: () => setData({ status: 'waiting_finishing' }),
      },
      {
        title: 'Finished',
        total: ticketDashboard?.finish ?? 0,
        icon: 'icon-park-outline:ticket',
        color: theme.vars.palette.success.main,
        subtitle: 'Sudah Selesai',
        onClick: () => setData({ status: 'finish' }),
      },
    ],
    [ticketDashboard]
  );

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

  async function prefetch() {
    isLoading.onTrue();
    infoStore.refresh();
    try {
      const result = await ticketRepository.getList({
        find: search,
        limit,
        page,
        status,
        area: areaId,
        ticketType: Array.isArray(ticketType) ? ticketType.join(',') : '',
        sortBy,
        sort,
        start: start.format('yyyy-MM-dd'),
        until: until.format('yyyy-MM-dd'),
        createdBy: createdBy?._id,
      });
      setData({ data: result.data, totalItems: result.total });

      const snapshotTicketDashboard = await ticketRepository.getDashboard({
        find: search,
        area: areaId,
        ticketType,
        start: start.format('yyyy-MM-dd'),
        until: until.format('yyyy-MM-dd'),
      });
      setData({ ticketDashboard: snapshotTicketDashboard });
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
   * @param {string[]} engineers
   */
  const onChangeEngineer = async (ticket, engineers) => {
    try {
      await ticketRepository.changeEngineer(ticket._id, engineers);
      toast.success('Teknisi telah diganti');
      prefetch();
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
    } finally {
      handleClose();
    }
  };

  /**
   * @param {Ticket} ticket
   * @param {string} newStatus
   */
  async function onChangeStatus(ticket, newStatus) {
    const oldStatus = ticket.status;
    setStatus(ticket._id, newStatus);
    const promises = ticketRepository.changeStatus(ticket._id, newStatus);
    toast.promise(promises, {
      loading: 'Mengubah status...',
      success: 'Berhasil mengubah status',
      error: (error) => {
        setStatus(ticket.customerId, oldStatus);
        return `Gagal mengubah status: ${error.message}`;
      },
    });
  }

  /**
   * @param {Ticket} ticket
   */
  const openAcsDialog = () => appPicker.acs.open(selectedTicket.customer_id);

  useEffect(() => {
    debouncePrefetch();
  }, [page, sortBy, sort, status]);

  useEffect(() => {
    setData({ page: 0 });
    debouncePrefetch();
  }, [search, limit, areaId, ticketType, start, createdBy]);

  return {
    state: {
      data,
      selectedTicket,
      anchorEl,
      open,
      isLoading,
      allowProcessEngineer,
      allowModify,
      start,
      until,
      ticketDashboardChart,
      isMobile,
      tabs,
      tab,
      page,
      limit,
      totalItems,
      sort,
      sortBy,
    },
    handler: {
      handleClick,
      handleClose,
      prefetch: debouncePrefetch,
      onProcessed,
      onSendNotif,
      navigateToCustomerData,
      onFinishing,
      onProcess,
      onRemove,
      onChangeEngineer,
      onChangeStatus,
      setTab,
      setData,
      openAcsDialog,
    },
  };
}
