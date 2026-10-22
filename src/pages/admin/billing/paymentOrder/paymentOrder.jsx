import { useEffect } from 'react';
import Overloading from '@components/overloading';
import AreaPickerFilter from '@components/billing/areaPickerFilter';

import { TablePagination } from '@mui/material';

import { usePaymentOrderState } from './paymentOrder.state';
import PaymentOrderFilter from './components/paymentOrderFilter';
import { PaymentOrderData } from './components/paymentOrderData';
import PaymentOrderDataDialog from './components/paymentOrderDataDialog';

export default function PaymentOrder() {
  const {
    data,
    limit,
    load,
    loading,
    page,
    search,
    setStore,
    start,
    until,
    total,
    status,
    mobile,
    detailDialogRef,
    openDetail,
    debounceLoad,
    areaName,
    openAreaPicker,
    areaPickerRef,
  } = usePaymentOrderState();

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    setStore({ page: 0 });
    debounceLoad();
  }, [start, until, status, limit, areaName, search]);

  useEffect(() => {
    debounceLoad();
  }, [page]);

  return (
    <div className="tw-flex tw-flex-col tw-w-full tw-px-5 tw-mt-4 tw-gap-4">
      <PaymentOrderFilter
        start={start}
        until={until}
        status={status}
        area={areaName}
        search={search}
        onChangeSearch={(v) => setStore({ search: v })}
        onChangeStart={(d) => setStore({ start: d })}
        onChangeUntil={(d) => setStore({ until: d })}
        onChangeStatus={(s) => setStore({ status: s })}
        onPickArea={() => openAreaPicker()}
      />
      <div className="tw-relative">
        <Overloading loading={loading} />
        {mobile ? (
          <PaymentOrderData.Mobile data={data} onDetail={openDetail} />
        ) : (
          <PaymentOrderData.Table data={data} onDetail={openDetail} />
        )}
        <TablePagination
          size="small"
          component="div"
          count={total}
          page={page}
          onPageChange={(e, p) => setStore({ page: p })}
          rowsPerPage={limit}
          onRowsPerPageChange={(e) => setStore({ limit: e.target.value })}
        />
      </div>
      <PaymentOrderDataDialog ref={detailDialogRef} />
      <AreaPickerFilter ref={areaPickerRef} />
    </div>
  );
}
