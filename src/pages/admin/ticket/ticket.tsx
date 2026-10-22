// @ts-nocheck

/**
 * @typedef {import("src/stores/ticketStore").TicketStore} TicketStore
 * @typedef {import('src/repositories/ticket').Ticket} Ticket
 */

import { toast } from 'sonner';
import { useBoolean } from '@hooks/use-boolean';
import { useConfirm } from 'material-ui-confirm';
import Overloading from '@components/overloading';
import { connect, useDispatch } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { useDebouncedCallback } from 'use-debounce';
import { usePrivilege } from '@auth/hooks/privileges';
import { TicketLogForm } from '@components/ticket/logForm';
import { useRef, useMemo, useState, useEffect } from 'react';
import { ViewerImageDialog } from '@components/viewerImageDialog';
import { TicketEngineerPicker } from '@components/ticket/engineerPicker';

import { Menu, useTheme, MenuItem, TextField, useMediaQuery, TablePagination } from '@mui/material';

import { useInfoStore } from 'src/stores/info';
import { ticketRepository } from 'src/repositories';
import { setTicketStore } from 'src/stores/ticketStore';

import TicketTable from 'src/components/ticket/table';
import TicketMobile from 'src/components/ticket/mobileCard';

/**
 * @param {TicketStore} props - react Props
 */
function TicketPage({ data, find, limit, page, status, totalItems }) {
  /** @type {import('src/stores/info').InfoStore} */
  const infoStore = useInfoStore();
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const confirm = useConfirm();
  const [query, setQuery] = useSearchParams();
  const searchRef = useRef();
  const [showTicketLog, setShowTicketLog] = useState(null);

  const engineerPickerRef = useRef();
  const ticketLogFormRef = useRef();

  const { isAdmin, userId, isEngineer, isNoc } = usePrivilege();
  const allowModify = useMemo(() => isAdmin || isNoc);
  const statusList = [
    {
      label: 'Semua',
      value: 'all',
    },
    {
      label: 'Pending',
      value: 'pending',
    },
    {
      label: 'On Progress',
      value: 'processed',
    },
    {
      label: 'Menunggu Penyelesaian',
      value: 'waiting_finishing',
    },
    {
      label: 'Selesai',
      value: 'finish',
    },
  ];

  const allowProcessEngineer = useBoolean(false);

  const findDebounce = useDebouncedCallback((value) => {
    setQuery({ q: value });
    dispatch(setTicketStore({ key: 'find', value }));
  }, 500);
  const loading = useBoolean(false);

  /** @type {[Ticket, void]} */
  const [selectedTicket, setSelectTicket] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const viewerImageDialogRef = useRef();

  const open = Boolean(anchorEl);

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

  const prefetch = async () => {
    loading.onTrue();
    infoStore.refresh();
    try {
      const snapshot = await ticketRepository.getList({
        find,
        limit,
        page,
        status: status === 'all' ? undefined : status,
      });
      dispatch(setTicketStore({ key: 'data', value: snapshot.data }));
      dispatch(setTicketStore({ key: 'totalItems', value: snapshot.total }));
    } catch (error) {
      toast.error(error.message);
    } finally {
      loading.onFalse();
    }
  };

  const debouncePrefetch = useDebouncedCallback(prefetch, 500);

  /**
   * @param {Event} e
   * @param {number} n
   */
  const handlerSetPage = (e, n) => {
    dispatch(setTicketStore({ key: 'page', value: n }));
  };

  /**
   * @param {Event} e
   */
  const handlerSetLimit = (e) => {
    dispatch(setTicketStore({ key: 'limit', value: e.target.value }));
    dispatch(setTicketStore({ key: 'page', value: 0 }));
  };

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
      debouncePrefetch();
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
      debouncePrefetch();
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
      debouncePrefetch();
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
      debouncePrefetch();
    } catch (error) {
      toast.error(error.message);
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
      debouncePrefetch();
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
    } finally {
      handleClose();
    }
  };

  useEffect(() => {
    debouncePrefetch();
  }, [page, limit]);

  useEffect(() => {
    dispatch(setTicketStore({ key: 'page', value: 0 }));
    if (page === 0) debouncePrefetch();
  }, [find, status]);

  useEffect(() => {
    const q = query.get('q');
    const qStatus = query.get('status');
    if (q) {
      dispatch(setTicketStore({ key: 'find', value: q }));
      searchRef.current.value = q;
      searchRef.current.focus();
    }
    if (qStatus) dispatch(setTicketStore({ key: 'status', value: qStatus }));
  }, []);

  function showKtp(ktpPath) {
    const imageUrl = ktpPath.replaceAll('/public/uploads/', '');
    viewerImageDialogRef.current.showImage([imageUrl], 'KTP');
  }
  return (
    <div className="tw-flex tw-flex-col tw-p-5">
      <div className="tw-flex tw-flex-col md:tw-flex-row tw-w-full tw-items-center tw-justify-between">
        <h1 className="md:tw-text-lg tw-text-base tw-font-semibold">Daftar Ticket</h1>
        <div className="tw-flex tw-flex-col md:tw-flex-row tw-w-full md:tw-w-auto tw-gap-2">
          <TextField
            value={status}
            size="small"
            label="Status"
            onChange={(e) => {
              dispatch(setTicketStore({ key: 'status', value: e.target.value }));
            }}
            className="tw-w-full md:tw-w-48"
            select
          >
            {statusList.map((s, i) => (
              <MenuItem key={i} value={s.value}>
                {s.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            inputRef={searchRef}
            defaultValue={find}
            size="small"
            label="Cari"
            onChange={(e) => findDebounce(e.target.value)}
            className="tw-w-full md:tw-w-48"
          />
        </div>
      </div>
      {/* Content */}
      <div className="tw-flex tw-flex-col tw-mt-4 tw-relative tw-w-full tw-gap-2">
        <Overloading loading={loading.value} />
        {isMobile ? (
          <TicketMobile tickets={data} onMenu={handleClick} showKtp={(ktp) => showKtp(ktp)} />
        ) : (
          <TicketTable tickets={data} onMenu={handleClick} showKtp={(ktp) => showKtp(ktp)} />
        )}
        <TablePagination
          component="div"
          count={totalItems}
          page={page}
          onPageChange={handlerSetPage}
          rowsPerPage={limit}
          onRowsPerPageChange={handlerSetLimit}
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
      <ViewerImageDialog ref={viewerImageDialogRef} />
    </div>
  );
}

const mapStateToProps = (state) => state.ticketStore;
export default connect(mapStateToProps)(TicketPage);
