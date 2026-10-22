import dayjs from 'dayjs';
import { toast } from 'sonner';
import { useEffect } from 'react';
import { useBoolean } from '@hooks/use-boolean';
import Overloading from '@components/overloading';
import HistoryPaymentSummaryByAreaTable from '@components/historyPaymentSummaryByArea/table';
import HistoryPaymentSummaryByAreaMobileCard from '@components/historyPaymentSummaryByArea/mobileCard';

import { DatePicker } from '@mui/x-date-pickers';
import { useTheme, useMediaQuery } from '@mui/material';

import { subscriptionRepository } from 'src/repositories';
import { useHistoryPaymentStoreByArea } from 'src/stores/historyPaymentSummary';

/**
 *
 * @typedef {import("@/stores/historyPaymentSummary").HistoryPaymentByAreaStore} HistoryPaymentByAreaStore
 */

export default function HistoryPaymentSummaryByArea() {
  /** @type {HistoryPaymentByAreaStore} */
  const { data, start, until, setData, setDate, setStart, setUntil } =
    useHistoryPaymentStoreByArea();
  const isLoading = useBoolean(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  async function prefetch() {
    isLoading.onTrue();
    try {
      const snapshot = await subscriptionRepository.getHistoryPaymentSummaryByArea({
        start,
        until,
      });
      setData(snapshot);
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
    } finally {
      isLoading.onFalse();
    }
  }

  useEffect(() => {
    prefetch();
  }, [start, until]);

  useEffect(() => {
    if (data.length <= 0) prefetch();
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
      </div>
      {/* Body */}
      <div className="tw-flex tw-flex-col tw-relative tw-gap-4 tw-mt-4">
        <Overloading loading={isLoading.value} />
        {isMobile ? (
          data.map((d, i) => <HistoryPaymentSummaryByAreaMobileCard key={i} data={d} />)
        ) : (
          <HistoryPaymentSummaryByAreaTable data={data} />
        )}
      </div>
    </div>
  );
}
