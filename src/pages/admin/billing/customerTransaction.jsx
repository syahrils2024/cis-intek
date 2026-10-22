import dayjs from 'dayjs';
import { toast } from 'sonner';
import { useRef, useEffect } from 'react';
import { useBoolean } from '@hooks/use-boolean';
import Overloading from '@components/overloading';
import { useSearchParams } from 'react-router-dom';
import { useDebouncedCallback } from 'use-debounce';
import { ViewerImageDialog } from '@components/viewerImageDialog';
import CustomerTransactionAdminTable from '@components/customerTransactionAdmin/table';
import CustomerTransactionAdminMobile from '@components/customerTransactionAdmin/mobile';
import CustomerTransactionAdminDetail from '@components/customerTransactionAdmin/detailDialog';

import { DatePicker } from '@mui/x-date-pickers';
import { MenuItem, useTheme, TextField, useMediaQuery, TablePagination } from '@mui/material';

import 'src/extension/date';
import 'src/extension/string';
import { customerTransactionAdminRepository } from 'src/repositories';
import { useCustomerTransactionAdmin } from 'src/stores/customerTransactionAdmin';

import AreaPickerFilter from 'src/components/billing/areaPickerFilter';

/**
 * @typedef {import('@/stores/customerTransactionAdmin').CustomerTransactionAdminStore} CustomerTransactionAdminStore
 */

export default function CustomerTransactionAdmin() {
  /** @type {CustomerTransactionAdminStore} */
  const {
    start,
    until,
    area,
    areaName,
    data,
    limit,
    page,
    status,
    totalItems,
    find,
    setStart,
    setUntil,
    setArea,
    setData,
    setPage,
    setStatus,
    setLimit,
    setTotalItems,
    setFind,
  } = useCustomerTransactionAdmin();

  const areaPickerFilterRef = useRef();
  const viewerImageDialogRef = useRef();
  const detailDialogRef = useRef();
  const loading = useBoolean(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [query, setQuery] = useSearchParams();
  const hasMounted = useBoolean(false);
  const findRef = useRef();

  const debounceFind = useDebouncedCallback((text) => {
    setFind(text);
  }, 500);

  async function pickArea() {
    const result = await areaPickerFilterRef.current.open();
    if (!result) return;
    setArea({
      _id: result._id,
      title: result.name,
    });
  }

  async function prefetch() {
    loading.onTrue();
    try {
      const snapshot = await customerTransactionAdminRepository.list({
        start: start.format('yyyy-MM-dd'),
        until: until.format('yyyy-MM-dd'),
        page,
        status: status.replaceAll('all', ''),
        limit,
        area,
        find,
      });
      setData(snapshot.data);
      setTotalItems(snapshot.total ?? 0);
    } catch (error) {
      toast.error(error.message);
    } finally {
      loading.onFalse();
    }
  }

  function showKtp(image) {
    image = image.replaceAll('/public/uploads', '');
    viewerImageDialogRef.current.showImage([image], 'KTP');
  }

  /**
   *
   * @param {import('src/repositories/customerTransactionAdmin').CustomerTransactionAdmin} item
   */
  async function openDetail(item) {
    await detailDialogRef.current.open(item);
    prefetch();
  }

  useEffect(() => {
    setPage(0);
    prefetch();
  }, [start, until, area, limit, status, find]);

  useEffect(() => {
    prefetch();
  }, [page]);

  function onMounted() {
    const q = query.get('q');
    if (q) {
      debounceFind(q);
      findRef.current.value = q;
    }
  }

  useEffect(() => {
    if (hasMounted.value) return;
    hasMounted.onTrue();
    onMounted();
  }, []);

  return (
    <div className="tw-flex tw-flex-col tw-w-full tw-px-5 tw-mt-4">
      {/* Heading Content */}
      <div className="tw-flex tw-flex-col md:tw-flex-row tw-items-center tw-justify-end tw-gap-2 tw-w-full">
        <div className="tw-w-full md:tw-w-48">
          <DatePicker
            label="Mulai"
            slotProps={{ textField: { size: 'small', fullWidth: true } }}
            maxDate={dayjs(new Date())}
            value={dayjs(start)}
            onAccept={(value) => setStart(value.toDate())}
          />
        </div>
        <div className="tw-w-full md:tw-w-48">
          <DatePicker
            label="Sampai"
            slotProps={{ textField: { size: 'small', fullWidth: true } }}
            minDate={dayjs(start)}
            maxDate={dayjs(new Date())}
            value={dayjs(until)}
            onAccept={(value) => setUntil(value.toDate())}
          />
        </div>
        <div className="tw-w-full md:tw-w-48">
          <TextField
            value={areaName}
            readOnly
            size="small"
            label="Area"
            fullWidth
            onClick={() => pickArea()}
          />
        </div>
        <div className="tw-w-full md:tw-w-48">
          <TextField
            select
            value={status}
            readOnly
            size="small"
            label="Status"
            fullWidth
            onChange={(e) => setStatus(e.target.value)}
          >
            <MenuItem value="all">Semua</MenuItem>
            <MenuItem value="reject">Reject</MenuItem>
            <MenuItem value="paid">Selesai</MenuItem>
            <MenuItem value="expired">Expired</MenuItem>
            {/* <MenuItem value="unpaid">Menunggu Pembayaran</MenuItem> */}
            <MenuItem value="verify">Menunggu Verifikasi</MenuItem>
            <MenuItem value="cancel">Batal</MenuItem>
          </TextField>
        </div>
        <div className="tw-w-full md:tw-w-48">
          <TextField
            defaultValue={find}
            size="small"
            label="Cari"
            fullWidth
            inputRef={findRef}
            onChange={(e) => debounceFind(e.target.value)}
          />
        </div>
      </div>
      {/* Data Content */}
      <div className="tw-flex tw-flex-col tw-gap-2 tw-mt-4 tw-relative">
        <Overloading loading={loading.value} />
        {isMobile ? (
          <CustomerTransactionAdminMobile
            items={data}
            showKtp={(ktp) => showKtp(ktp)}
            onDetail={(item) => openDetail(item)}
          />
        ) : (
          <CustomerTransactionAdminTable
            items={data}
            showKtp={(ktp) => showKtp(ktp)}
            onDetail={(item) => openDetail(item)}
          />
        )}

        <TablePagination
          size="small"
          component="div"
          count={totalItems}
          page={page}
          onPageChange={(e, p) => setPage(p)}
          rowsPerPage={limit}
          onRowsPerPageChange={(e) => setLimit(e.target.value)}
        />
      </div>
      <AreaPickerFilter ref={areaPickerFilterRef} />
      <ViewerImageDialog ref={viewerImageDialogRef} />
      <CustomerTransactionAdminDetail ref={detailDialogRef} />
    </div>
  );
}
