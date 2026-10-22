// @ts-nocheck

/**
 * @typedef {import("src/stores/ticketMain").TicketMainStore} TicketMainStore
 * @typedef {import('src/repositories/ticket').Ticket} Ticket
 * @returns
 */

import dayjs from 'dayjs';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { useNavigate } from 'react-router';
import { useBoolean } from '@hooks/use-boolean';
import { useConfirm } from 'material-ui-confirm';
import Overloading from '@components/overloading';
import { useDebouncedCallback } from 'use-debounce';
import { useRef, useState, useEffect } from 'react';
import { usePrivilege } from '@auth/hooks/privileges';
import { TicketLogForm } from '@components/ticket/logForm';
import AreaPickerFilter from '@components/billing/areaPickerFilter';
import { TicketEngineerPicker } from '@components/ticket/engineerPicker';

import { DatePicker } from '@mui/x-date-pickers';
import {
  Menu,
  Stack,
  useTheme,
  MenuItem,
  TextField,
  useMediaQuery,
  TablePagination,
} from '@mui/material';

import { ticketRepository } from 'src/repositories';
import { useTicketMainStore } from 'src/stores/ticketMain';
import { TICKET_TYPE_LABELS_LIST } from 'src/enums/ticketType';

import TicketTable from 'src/components/ticket/table';
import TicketMobile from 'src/components/ticket/mobileCard';

import type { ShowKtp, TicketRecord } from './types';

export default function TicketFinishTab({ showKtp }: { showKtp: ShowKtp }) {
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
    finished,
    finishedPage,
    finishedSearch,
    finishedLimit,
    setFinished,
    finishedTotalItems,
    finishedStart,
    finishedUntil,
    finishedAreaId,
    finishedAreaTitle,
    finishedTicketType,
    finishedSortBy,
    finishedSort,
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
  const allowModify = isAdmin || isNoc;

  async function pickArea() {
    const area = await areaPickerRef.current?.open();
    if (area) {
      setFinished({ areaId: area._id, areaTitle: area.name });
    }
  }

  async function prefetch() {
    isLoading.onTrue();
    try {
      const result = await ticketRepository.getList({
        find: finishedSearch,
        limit: finishedLimit,
        page: finishedPage,
        status: 'finish',
        start: format(finishedStart, 'yyyy-MM-dd'),
        until: format(finishedUntil, 'yyyy-MM-dd'),
        area: finishedAreaId,
        ticketType: finishedTicketType,
        sortBy: finishedSortBy,
        sort: finishedSort,
      });
      setFinished({ data: result.data, totalItems: result.total });
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

      await ticketRepository.changeStatus(selectedTicket._id, 'finish');
      toast.success('Ticket Diselesaikan');
      prefetch();
    } catch (error) {
      toast.error(error.message);
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

  function navigateToCustomerData() {
    const currentTicket = selectedTicket;
    handleClose();
    navigate(`/v2/customer?q=${currentTicket.customerId}`);
  }

  useEffect(() => {
    debouncePrefetch();
  }, [finishedPage, finishedSortBy, finishedSort]);

  useEffect(() => {
    setFinished({ page: 0 });
    debouncePrefetch();
  }, [
    finishedSearch,
    finishedLimit,
    finishedStart,
    finishedUntil,
    finishedAreaId,
    finishedTicketType,
  ]);

  return (
    <Stack gap={2}>
      <Stack
        direction={isMobile ? 'column' : 'row'}
        className="w-full"
        alignItems="center"
        justifyItems="end"
        justifyContent="end"
        spacing={2}
      >
        <TextField
          size="small"
          label="Jenis"
          value={finishedTicketType}
          className="tw-w-full md:tw-w-48"
          InputLabelProps={{ shrink: true }}
          SelectProps={{ displayEmpty: true }}
          select
          onChange={(e) => setFinished({ ticketType: e.target.value })}
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
          value={finishedAreaTitle}
          InputProps={{ readOnly: true }}
          className="tw-w-full md:tw-w-48"
          onClick={() => pickArea()}
        />
        <DatePicker
          value={dayjs(finishedStart)}
          slotProps={{
            textField: { size: 'small', label: 'Mulai', fullWidth: isMobile },
          }}
          maxDate={dayjs(new Date())}
          onChange={(value) => setFinished({ start: value.toDate() })}
        />
        <DatePicker
          value={dayjs(finishedUntil)}
          slotProps={{
            textField: {
              size: 'small',
              label: 'Sampai',
              fullWidth: isMobile,
            },
          }}
          maxDate={dayjs(new Date())}
          onChange={(value) => setFinished({ until: value.toDate() })}
        />
        <TextField
          defaultValue={finishedSearch}
          size="small"
          label="Cari"
          className="tw-w-full md:tw-w-48"
          onChange={(e) => setFinished({ search: e.target.value })}
        />
      </Stack>
      {/* Content */}
      <div className="tw-flex tw-flex-col tw-mt-4 tw-relative tw-w-full tw-gap-2">
        <Overloading loading={isLoading.value} />
        {isMobile ? (
          <TicketMobile tickets={finished} onMenu={handleClick} showKtp={(ktp) => showKtp(ktp)} />
        ) : (
          <TicketTable
            tickets={finished}
            onMenu={handleClick}
            showKtp={(ktp) => showKtp(ktp)}
            showLogs={(ticket) => ticketLogFormRef.current?.open(ticket, ticket.customer_id)}
            sort={finishedSort}
            sortBy={finishedSortBy}
            onChangeSort={(sb, s) => setFinished({ sortBy: sb, sort: s })}
          />
        )}
        <TablePagination
          component="div"
          count={finishedTotalItems}
          page={finishedPage}
          onPageChange={(e, n) => setFinished({ page: n })}
          rowsPerPage={finishedLimit}
          onRowsPerPageChange={(e) => setFinished({ page: 0, limit: e.target.value })}
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

        {allowModify && selectedTicket?.status === 'waiting_finishing' && (
          <MenuItem onClick={onFinishing}>Selesaikan</MenuItem>
        )}

        {allowModify && ['processed', 'pending'].includes(selectedTicket?.status) && (
          <MenuItem onClick={() => onChangeEngineer(selectedTicket)}>Ganti Teknisi</MenuItem>
        )}

        {allowModify && <MenuItem onClick={onRemove}>Hapus</MenuItem>}

        {/* Engineer Action */}
        {isEngineer && allowProcessEngineer.value && selectedTicket?.status === 'pending' && (
          <MenuItem onClick={onProcessed}>Proses</MenuItem>
        )}

        {isEngineer && allowProcessEngineer.value && selectedTicket?.status === 'processed' && (
          <MenuItem onClick={onSendNotif}>Ajukan Penyelesaian</MenuItem>
        )}

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
}
