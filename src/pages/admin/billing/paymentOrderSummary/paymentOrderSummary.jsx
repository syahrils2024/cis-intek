/** @typedef {import("./paymentOrderSummary.store").PaymentOrderSummaryStore} PaymentOrderSummaryStore */

import { useMemo, useEffect } from 'react';
import Overloading from '@components/overloading';

import { useTheme, useMediaQuery, TablePagination } from '@mui/material';

import { usePaymentOrderSummaryStore } from './paymentOrderSummary.store';
import PaymentOrderSummaryFilter from './components/paymentOrderSummaryFilter';
import { PaymentOrderSummaryData } from './components/paymentOrderSummaryData';

export default function PaymentOrderSummary() {
  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down('md'));

  /** @type {PaymentOrderSummaryStore} */
  const { data, load, loading, start, until, setStore, limit, page, search } =
    usePaymentOrderSummaryStore();

  const filteredData = useMemo(() => {
    if (!search) return data;
    return data.filter((item) => item.title.toLowerCase().includes(search.toLowerCase()));
  }, [data, search]);

  const paginatedData = useMemo(() => {
    const startIndex = page * limit;
    return filteredData.slice(startIndex, startIndex + limit);
  }, [filteredData, page, limit]);

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    setStore({ page: 0 });
    load();
  }, [start, until]);

  return (
    <div className="tw-flex tw-flex-col tw-w-full tw-px-5 tw-mt-4 tw-gap-4">
      <PaymentOrderSummaryFilter
        start={start}
        until={until}
        search={search}
        onChangeStart={(d) => setStore({ start: d })}
        onChangeUntil={(d) => setStore({ until: d })}
        onChangeSearch={(v) => setStore({ search: v, page: 0 })}
      />
      <div className="tw-relative">
        <Overloading loading={loading} />
        {mobile ? (
          <PaymentOrderSummaryData.Mobile data={paginatedData} />
        ) : (
          <PaymentOrderSummaryData.Table data={paginatedData} />
        )}
        <TablePagination
          size="small"
          component="div"
          count={data.length}
          page={page}
          onPageChange={(e, p) => setStore({ page: p })}
          rowsPerPage={limit}
          onRowsPerPageChange={(e) => setStore({ limit: e.target.value })}
        />
      </div>
    </div>
  );
}
