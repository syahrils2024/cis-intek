/**
 * @typedef {import("@/stores/mikrotikLog").MikrotikLogStore} MikrotikLogStore
 * @typedef {import('@/repositories/mikrotik').MikrotikActionLog} MikrotikActionLog
 */

import dayjs from 'dayjs';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { useRef, useEffect } from 'react';
import { useBoolean } from '@hooks/use-boolean';
import { useConfirm } from 'material-ui-confirm';
import Overloading from '@components/overloading';
import { useDebouncedCallback } from 'use-debounce';
import AreaPickerFilter from '@components/billing/areaPickerFilter';
import HistoryLogMikrotikTable from '@components/customerEngineer/historyLogMikrotik/table';
import HistoryLogMikrotikMobileCard from '@components/customerEngineer/historyLogMikrotik/mobileCard';

import { DatePicker } from '@mui/x-date-pickers';
import { useTheme, TextField, Typography, useMediaQuery, TablePagination } from '@mui/material';

import { mikrotikRepository } from 'src/repositories';
import { useMikrotikLog } from 'src/stores/mikrotikLog';

export default function MikrotikLog() {
  const isLoading = useBoolean(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const areaPickerFilterRef = useRef();
  const confirm = useConfirm();

  /** @type {MikrotikLogStore} */
  const {
    data,
    find,
    page,
    remote,
    limit,
    totalItem,
    area,
    start,
    until,
    setData,
    setFind,
    setLimit,
    setPage,
    setRemote,
    setTotalItem,
    setArea,
    setDateRange,
  } = useMikrotikLog();

  const debouncerFind = useDebouncedCallback((value) => {
    if (page === 0) {
      prefetch();
    }
    setPage(0);
  }, 500);

  const debouncerRemote = useDebouncedCallback((value) => {
    if (page === 0) {
      prefetch();
    }
    setPage(0);
  }, 500);

  /**
   * @param {Event} e
   * @param {number} n
   */
  const handlerSetPage = (e, n) => {
    setPage(n);
  };

  /**
   * @param {Event} e
   */
  const handlerSetLimit = (e) => {
    setPage(0);
    setLimit(e.target.value);
  };

  async function prefetch() {
    isLoading.onTrue();
    try {
      const snapshot = await mikrotikRepository.getHistoryActionLog({
        find,
        limit,
        page,
        remote,
        start: format(start, 'yyyy-MM-dd'),
        until: format(until, 'yyyy-MM-dd'),
        area: area?._id,
      });
      setData(snapshot.data);
      setTotalItem(snapshot.total);
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
    } finally {
      isLoading.onFalse();
    }
  }

  /**
   *
   * @param {MikrotikActionLog} d
   */
  async function redoJob(d) {
    try {
      await confirm({
        title: 'Jalankan ulang',
        description: `Apakah anda yakin ingin menjalankan ulang script mikrotik ini?`,
        confirmationText: 'Ya',
        cancellationText: 'Tidak',
      });

      toast.promise(mikrotikRepository.redoLog(d._id), {
        success: 'Terkirim ke mikrotik',
        error: (error) => {
          if (error instanceof Error) return error.message;
          return 'Gagal mengirim ke mikrotik';
        },
        loading: 'Mengirim ke mikrotik...',
        finally: () => {
          prefetch();
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }

  async function pickArea() {
    const result = await areaPickerFilterRef.current.open();
    if (!result) return;
    if (result._id === '') {
      setArea(null);
      return;
    }
    setArea(result);
  }

  useEffect(() => {
    prefetch();
  }, [page]);

  useEffect(() => {
    if (page === 0) {
      prefetch();
    }
    setPage(0);
  }, [limit, area, start, until]);

  return (
    <div className=" tw-flex tw-flex-col tw-px-5 tw-container tw-w-full tw-mx-auto tw-items-center tw-justify-center">
      {/* Header Page */}
      <div className="tw-flex tw-flex-col tw-w-full tw-gap-2">
        <Typography variant="h4">Mikrotik Log</Typography>
        <div className="tw-flex tw-flex-col md:tw-flex-row tw-items-center tw-gap-4 tw-w-full md:tw-w-auto tw-justify-end">
          <div className="tw-w-full md:tw-w-48">
            <DatePicker
              value={dayjs(start)}
              label="Mulai"
              slotProps={{ textField: { size: 'small' } }}
              onChange={(date) => {
                if (!date) return;
                setDateRange({ start: date.toDate() });
              }}
            />
          </div>
          <div className="tw-w-full md:tw-w-48">
            <DatePicker
              value={dayjs(until)}
              label="Sampai"
              slotProps={{ textField: { size: 'small' } }}
              onChange={(date) => {
                if (!date) return;
                setDateRange({ until: date.toDate() });
              }}
            />
          </div>
          <div className="tw-w-full md:tw-w-48">
            <TextField
              value={area?.name ?? 'Semua'}
              size="small"
              label="Area"
              fullWidth
              InputProps={{ readOnly: true }}
              onClick={() => pickArea()}
            />
          </div>
          <div className="tw-w-full md:tw-w-48">
            <TextField
              defaultValue={remote}
              size="small"
              label="IP Remote"
              fullWidth
              onChange={(e) => {
                setRemote(e.target.value);
                debouncerRemote(e.target.value);
              }}
            />
          </div>
          <div className=" tw-w-full md:tw-w-48">
            <TextField
              defaultValue={find}
              size="small"
              label="Cari"
              fullWidth
              onChange={(e) => {
                setFind(e.target.value);
                debouncerFind(e.target.value);
              }}
            />
          </div>
        </div>
      </div>
      {/* Body */}
      <div className="tw-flex tw-flex-col tw-relative tw-gap-4 tw-w-full tw-mt-4">
        <Overloading loading={isLoading.value} />
        <div className="tw-flex tw-flex-col tw-gap-4 tw-py-1 tw-w-full">
          {isMobile ? (
            data.map((d, i) => (
              <HistoryLogMikrotikMobileCard data={d} key={i} onRedo={() => redoJob(d)} />
            ))
          ) : (
            <HistoryLogMikrotikTable data={data} onRedo={(d) => redoJob(d)} />
          )}
        </div>
        <TablePagination
          component="div"
          count={totalItem}
          page={page}
          onPageChange={handlerSetPage}
          rowsPerPage={limit}
          onRowsPerPageChange={handlerSetLimit}
        />
      </div>
      {/* End Body */}
      <AreaPickerFilter ref={areaPickerFilterRef} />
    </div>
  );
}
