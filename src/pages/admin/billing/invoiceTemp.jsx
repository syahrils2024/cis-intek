/**
 * @typedef {import("@/stores/invoiceTempStore").InvoiceTempStore} InvoiceTempStore
 */

import dayjs from 'dayjs';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { useBoolean } from '@hooks/use-boolean';
import Overloading from '@components/overloading';
import { useRef, useMemo, useEffect } from 'react';
import { connect, useDispatch } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { useDebouncedCallback } from 'use-debounce';
import { usePrivilege } from '@auth/hooks/privileges';
import InvoiceTempTable from '@components/invoiceTemp/table';
import InvoiceTempMobile from '@components/invoiceTemp/mobile';
import { ViewerImageDialog } from '@components/viewerImageDialog';
import AreaPickerFilter from '@components/billing/areaPickerFilter';
import InvoiceDetailDialog from '@components/invoiceTemp/detailDialog';

import { DatePicker } from '@mui/x-date-pickers';
import {
  useTheme,
  MenuItem,
  TextField,
  useMediaQuery,
  TablePagination,
} from '@mui/material';

import 'src/extension/date';
import { useInfoStore } from 'src/stores/info';
import { setInvoiceTempStore } from 'src/stores/invoiceTempStore';
import { paymentMethodStoreSetState } from 'src/stores/paymentMethodStore';
import { invoiceTempRepository, depositMethodRepository } from 'src/repositories';

/**
 * @typedef {import('src/stores/info').InfoStore} InfoStore
 * @param {InvoiceTempStore} props
 * @returns
 */
function InvoiceTemp({
  limit,
  find,
  invoiceTemporaries,
  page,
  status,
  totalItems,
  order,
  orderBy,
  start,
  until,
  requestBy,
  area,
  areaName,
  cash, // from store depositMethodStore
  transfer, // from store depositMethodStore
  depositMethod, // from store invoiceTemp
}) {
  /** @type {InfoStore} */
  const infoStore = useInfoStore();
  const theme = useTheme();
  const dispatch = useDispatch();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const loading = useBoolean(false);
  const [query, setQuery] = useSearchParams();
  const { isEngineer } = usePrivilege();
  const searchRef = useRef();
  const viewerImageDialogRef = useRef();
  const rejectDialogRef = useRef();
  const areaPickerFilterRef = useRef();
  // const isMounted = useRef(false)
  const debounceFind = useDebouncedCallback((value) => {
    dispatch(setInvoiceTempStore({ key: 'find', value }));
    setQuery({ q: value });
  }, 1000);

  const debounceRequestBy = useDebouncedCallback((value) => {
    dispatch(setInvoiceTempStore({ key: 'requestBy', value }));
  }, 1000);

  const detailDialogRef = useRef();

  const filteredCash = useMemo(() => cash?.filter((c) => c.status === 'active') ?? []);
  const filteredTransfer = useMemo(() => transfer?.filter((c) => c.status === 'active') ?? []);

  const statusList = [
    { label: 'Semua', value: 'all' },
    { label: 'Pending', value: 'pending' },
    { label: 'Disetujui', value: 'approve' },
    { label: 'Ditolak', value: 'reject' },
  ];

  async function filterArea() {
    /**
     * @type {import('@components/billing/areaPickerFilter').AreaPickerFilterResult}
     */
    const result = await areaPickerFilterRef.current.open(area);
    if (!result) return;
    dispatch(setInvoiceTempStore({ key: 'areaName', value: result.name }));
    dispatch(setInvoiceTempStore({ key: 'area', value: result._id }));
  }

  const prefetch = async () => {
    loading.onTrue();
    infoStore.refresh();
    try {
      if (cash.length <= 0) {
        const snapshotCash = await depositMethodRepository.getPaymentMethod('cash').catch(() => []);
        dispatch(paymentMethodStoreSetState({ key: 'cash', value: snapshotCash }));
      }

      if (transfer.length <= 0) {
        const snapshotTransfer = await depositMethodRepository
          .getPaymentMethod('transfer')
          .catch(() => []);
        dispatch(paymentMethodStoreSetState({ key: 'transfer', value: snapshotTransfer }));
      }

      const snapshot = await invoiceTempRepository.getList({
        limit,
        page,
        status: status === 'all' ? undefined : status,
        find,
        order,
        orderBy,
        start: format(start, 'yyyy-MM-dd'),
        until: format(until, 'yyyy-MM-dd'),
        requestBy,
        area,
        depositMethod,
      });

      dispatch(setInvoiceTempStore({ key: 'invoiceTemporaries', value: snapshot.data }));
      dispatch(setInvoiceTempStore({ key: 'totalItems', value: snapshot.total }));
    } catch (error) {
      toast.error(error.message);
    } finally {
      loading.onFalse();
    }
  };

  useEffect(() => {
    prefetch();
  }, [page, limit, order, orderBy]);

  useEffect(() => {
    if (page === 0) prefetch();
    dispatch(setInvoiceTempStore({ key: 'page', value: 0 }));
  }, [status, find, start, until, requestBy, area, depositMethod]);

  useEffect(() => {
    const q = query.get('q');
    if (q) {
      setTimeout(() => {
        dispatch(setInvoiceTempStore({ key: 'find', value: q }));
        searchRef.current.value = q;
      }, 500);
    }
  }, []);

  /**
   * @param {*} invoiceTemp
   */
  const handlerDetail = async (invoiceTemp) => {
    const isPrefetch = await detailDialogRef.current.open(invoiceTemp);
    if (isPrefetch) prefetch();
  };

  /**
   * @param {Event} e
   * @param {number} page
   */
  const handlerSetPage = (e, n) => {
    // dispatch(setPage(n));
    dispatch(setInvoiceTempStore({ key: 'page', value: n }));
  };

  /**
   * @param {Event} e
   */
  const handlerSetLimit = (e) => {
    dispatch(setInvoiceTempStore({ key: 'limit', value: e.target.value }));
    // setLimit(e.target.value);
  };

  function showKtp(ktpPath) {
    if (isEngineer) return;
    const imageUrl = ktpPath.replaceAll('/public/uploads/', '');
    viewerImageDialogRef.current.showImage([imageUrl], 'KTP');
  }

  return (
    <div className="tw-flex tw-flex-col tw-p-5 tw-w-full tw-gap-4">
      <div className="tw-flex tw-flex-col tw-items-start tw-w-full tw-justify-between tw-gap-4">
        {/* <Typography className="tw-whitespace-nowrap" variant={isMobile ? 'h6' : 'h4'}>
          Pengajuan Pembayaran
        </Typography> */}
        <div className="tw-grid tw-grid-cols-1 sm:tw-grid-cols-2 md:tw-grid-cols-4 lg:tw-grid-cols-7 tw-items-center tw-justify-end tw-w-full tw-gap-4 tw-mt-4">
          <TextField
            label="Rekening Tujuan"
            fullWidth
            value={depositMethod}
            onChange={(e) =>
              dispatch(setInvoiceTempStore({ key: 'depositMethod', value: e.target.value }))
            }
            select
            size="small"
          >
            <MenuItem value="">Semua</MenuItem>
            <MenuItem value="" disabled>
              Transfer
            </MenuItem>
            {filteredTransfer.map((t, i) => (
              <MenuItem value={t._id} key={i}>
                <span>{t.title}</span>
              </MenuItem>
            ))}
            <MenuItem value="" disabled>
              Cash
            </MenuItem>
            {filteredCash.map((c, i) => (
              <MenuItem value={c._id} key={i}>
                <span>{c.title}</span>
              </MenuItem>
            ))}
          </TextField>

          <TextField
            fullWidth
            defaultValue={requestBy}
            label="Request By"
            size="small"
            onChange={(e) => debounceRequestBy(e.target.value)}
          />
          <DatePicker
            value={dayjs(start)}
            label="Mulai"
            slotProps={{
              textField: { size: 'small', fullWidth: true },
            }}
            onChange={(value) =>
              dispatch(
                setInvoiceTempStore({
                  key: 'start',
                  value: value.toDate(),
                })
              )
            }
          />
          <DatePicker
            value={dayjs(until)}
            label="Sampai"
            slotProps={{
              textField: { size: 'small', fullWidth: true },
            }}
            onChange={(value) =>
              dispatch(
                setInvoiceTempStore({
                  key: 'until',
                  value: value.toDate(),
                })
              )
            }
          />

          <TextField
            fullWidth
            select
            value={status}
            label="Status"
            size="small"
            onChange={(e) =>
              dispatch(setInvoiceTempStore({ key: 'status', value: e.target.value }))
            }
          >
            {statusList.map((s) => (
              <MenuItem key={s.value} value={s.value}>
                {s.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            fullWidth
            label="Area"
            value={areaName}
            size="small"
            onClick={() => filterArea()}
          />
          <TextField
            fullWidth
            defaultValue={find}
            label="Cari"
            size="small"
            inputRef={searchRef}
            onChange={(e) => debounceFind(e.target.value)}
          />
        </div>
      </div>
      <div className="tw-flex tw-flex-col tw-w-full tw-mt-2 tw-gap-4 tw-relative">
        <Overloading loading={loading.value} />
        {isMobile ? (
          <InvoiceTempMobile
            invoiceTemporaries={invoiceTemporaries}
            onDetail={handlerDetail}
            showKtp={(url) => showKtp(url)}
          />
        ) : (
          <InvoiceTempTable
            invoiceTemporaries={invoiceTemporaries}
            onDetail={handlerDetail}
            showKtp={(url) => showKtp(url)}
          />
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
      <InvoiceDetailDialog ref={detailDialogRef} />
      <ViewerImageDialog ref={viewerImageDialogRef} />
      <AreaPickerFilter ref={areaPickerFilterRef} />
    </div>
  );
}

const mapStateToprops = (store) => {
  const { invoiceTempStore } = store;
  const { cash, transfer } = store.paymentMethodStore;
  return { cash, transfer, ...invoiceTempStore };
};
export default connect(mapStateToprops)(InvoiceTemp);
