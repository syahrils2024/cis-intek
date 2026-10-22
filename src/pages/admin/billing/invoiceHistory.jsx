import dayjs from 'dayjs';
import { toast } from 'sonner';
import { useBoolean } from '@hooks/use-boolean';
import Overloading from '@components/overloading';
import { useRef, useMemo, useEffect } from 'react';
import { connect, useDispatch } from 'react-redux';
import { useDebouncedCallback } from 'use-debounce';
import { ViewerImageDialog } from '@components/viewerImageDialog';

import { DatePicker } from '@mui/x-date-pickers';
import { useTheme, MenuItem, TextField, useMediaQuery, TablePagination } from '@mui/material';

import { setArea } from 'src/stores/areaStore';
import { useInfoStore } from 'src/stores/info';
import { setInvoiceStore } from 'src/stores/invoiceStore';
import { paymentMethodStoreSetState } from 'src/stores/paymentMethodStore';
import { areaRepository, subscriptionRepository, depositMethodRepository } from 'src/repositories';

import InvoiceMobile from 'src/components/invoiceHistory/mobile';
import InvoiceHistoryTable from 'src/components/invoiceHistory/table';

/**
 * @typedef {import('src/repositories/subscription').InvoiceHistory} InvoiceHistory
 * @typedef {import('src/repositories/area').Area} Area
 * @typedef {import('src/stores/info').InfoStore} InfoStore
 */

/**
 * @param {import('src/stores/invoiceStore').InvoiceStore & import('@/stores/paymentMethodStore').PaymentMethodStore & {areaList: Area[]}} props
 * @returns
 */
function InvoiceHistory({
  order,
  orderBy,
  data,
  limit,
  page,
  find,
  start,
  until,
  total,
  transfer,
  cash,
  depositMethod,
  area,
  areaList,
}) {
  /** @type {InfoStore} */
  const infoStore = useInfoStore();
  const dispatch = useDispatch();
  const loading = useBoolean(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const viewerImageDialogRef = useRef();
  const debounceFind = useDebouncedCallback((text) => {
    dispatch(setInvoiceStore({ key: 'find', value: text }));
  }, 500);

  const mapAreaList = useMemo(() => {
    const maping = [];
    areaList.forEach((a) => {
      maping.push(a.title);
      a.area.forEach((currentArea) => {
        maping.push(currentArea);
      });
    });

    return maping;
  });

  async function prefetch() {
    loading.onTrue();
    infoStore.refresh();
    try {
      if (areaList.length <= 0) {
        const snapshotAreaList = await areaRepository.getAllArea();
        dispatch(setArea(snapshotAreaList));
      }

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

      const snapshot = await subscriptionRepository.getInvoiceHistory({
        order,
        orderBy,
        limit,
        page,
        find,
        start: start.format('yyyy-MM-dd'),
        until: until.format('yyyy-MM-dd'),
        depositMethod: depositMethod !== '' ? depositMethod : undefined,
        area: area !== '' && area ? area : undefined,
      });

      dispatch(setInvoiceStore({ key: 'data', value: snapshot.data }));
      dispatch(setInvoiceStore({ key: 'total', value: snapshot.total ?? 0 }));
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    } finally {
      loading.onFalse();
    }
  }

  const filteredCash = useMemo(() => cash?.filter((c) => c.status === 'active') ?? []);
  const filteredTransfer = useMemo(() => transfer?.filter((c) => c.status === 'active') ?? []);

  /**
   * @param {InvoiceHistory} d
   */
  function showEvidence(d) {
    const imageUrl = d.paymentEvidences.map((e) => e.replaceAll('/public/uploads/', ''));
    viewerImageDialogRef.current.showImage(imageUrl, 'Resi');
  }

  useEffect(() => {
    prefetch();
  }, [page, order, orderBy]);

  useEffect(() => {
    if (page === 0) prefetch();
    dispatch(setInvoiceStore({ key: 'page', value: 0 }));
  }, [find, start, until, limit, depositMethod, area]);

  return (
    <div className="tw-flex tw-flex-col tw-px-5">
      <div className="tw-w-full tw-items-center tw-justify-end tw-flex tw-flex-col md:tw-flex-row tw-mt-3 tw-gap-3">
        {/* <Typography variant="h4">Riwayat Pembayaran</Typography> */}
        <div className="tw-flex tw-flex-col md:tw-flex-row tw-items-center tw-justify-end tw-gap-2 tw-w-full md:tw-w-auto">
          <DatePicker
            size="small"
            label="Mulai"
            fullWidth
            value={dayjs(start)}
            slotProps={{ textField: { size: 'small' } }}
            onChange={(e) => {
              dispatch(setInvoiceStore({ key: 'start', value: e.toDate() }));
            }}
            className="md:tw-w-48 tw-w-full"
          />
          <div className="md:tw-w-48 tw-w-full">
            <DatePicker
              size="small"
              label="Sampai"
              fullWidth
              slotProps={{ textField: { size: 'small' } }}
              value={dayjs(until)}
              onChange={(e) => dispatch(setInvoiceStore({ key: 'until', value: e.toDate() }))}
              className="md:tw-w-48 tw-w-full"
            />
          </div>
          <div className="md:tw-w-48 tw-w-full">
            <TextField
              select
              value={area}
              onChange={(e) => dispatch(setInvoiceStore({ key: 'area', value: e.target.value }))}
              label="Area / POP"
              size="small"
              placeholder="Pilih Area / POP"
              fullWidth
            >
              <MenuItem value="">Semua</MenuItem>
              {mapAreaList.map((a, i) =>
                typeof a === 'string' ? (
                  <MenuItem key={i} disabled>
                    {a}
                  </MenuItem>
                ) : (
                  <MenuItem key={i} value={a._id}>
                    <div className="tw-pl-2">{a.title}</div>
                  </MenuItem>
                )
              )}
            </TextField>
          </div>
          <div className="md:tw-w-48 tw-w-full">
            <TextField
              label="Pilih Rekening Tujuan"
              fullWidth
              value={depositMethod}
              onChange={(e) =>
                dispatch(setInvoiceStore({ key: 'depositMethod', value: e.target.value }))
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
          </div>
          <div className="md:tw-w-48 tw-w-full">
            <TextField
              label="Cari"
              fullWidth
              defaultValue={find}
              size="small"
              onChange={(e) => debounceFind(e.target.value)}
            />
          </div>
        </div>
      </div>
      {/* Content */}
      <div className="tw-flex tw-flex-col tw-mt-4 tw-relative tw-gap-2">
        <Overloading loading={loading.value} />
        {isMobile ? (
          <InvoiceMobile data={data} showEvidence={(d) => showEvidence(d)} />
        ) : (
          <InvoiceHistoryTable data={data} showEvidence={(d) => showEvidence(d)} />
        )}
        <TablePagination
          size="small"
          component="div"
          count={total}
          page={page}
          onPageChange={(e, p) => dispatch(setInvoiceStore({ key: 'page', value: p }))}
          rowsPerPage={limit}
          onRowsPerPageChange={(e) =>
            dispatch(setInvoiceStore({ key: 'limit', value: e.target.value }))
          }
        />
      </div>
      <ViewerImageDialog ref={viewerImageDialogRef} />
    </div>
  );
}

const mapStateToProps = (state) => {
  const { cash, transfer } = state.paymentMethodStore;
  const { all } = state.areaStore;
  return {
    cash,
    transfer,
    areaList: all,
    ...state.invoiceStore,
  };
};
export default connect(mapStateToProps)(InvoiceHistory);
