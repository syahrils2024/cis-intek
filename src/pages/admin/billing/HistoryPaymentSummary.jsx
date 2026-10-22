import dayjs from 'dayjs';
import { toast } from 'sonner';
import { useRef, useEffect } from 'react';
import { useBoolean } from '@hooks/use-boolean';
import Overloading from '@components/overloading';
import AreaPickerFilter from '@components/billing/areaPickerFilter';
import HistoryPaymentSummaryTable from '@components/historyPaymentSummary/Table';
import HistoryPaymentSummaryMobile from '@components/historyPaymentSummary/Mobile';

import { DatePicker } from '@mui/x-date-pickers';
import { useTheme, TextField, useMediaQuery } from '@mui/material';

import { subscriptionRepository } from 'src/repositories';
import { useHistoryPaymentStore } from 'src/stores/historyPaymentSummary';

/**
 * @typedef {import("src/stores/historyPaymentSummary").HistoryPaymentStore} HistoryPaymentStore
 * @typedef {import('src/components/billing/areaPickerFilter').AreaPickerFilterResult} AreaPickerFilterResult
 */

/**
 *
 * @returns
 */

export default function HistoryPaymentSummary() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const loading = useBoolean(false);
  const pickerRef = useRef();

  /** @type {HistoryPaymentStore} */
  const {
    data,
    start,
    until,
    selectedAreaId,
    selectedAreaName,
    setData,
    setStart,
    setUntil,
    setFilterArea,
  } = useHistoryPaymentStore();

  async function pickArea() {
    /** @type {AreaPickerFilterResult} */
    const result = await pickerRef.current.open(selectedAreaId);
    if (!result) return;
    setFilterArea(result);
  }

  async function prefetch() {
    loading.onTrue();
    try {
      const snapshot = await subscriptionRepository.getHistoryPaymentSummary({
        start,
        until,
        area: selectedAreaId,
      });
      setData(snapshot);
    } catch (error) {
      toast.error(error.message);
    } finally {
      loading.onFalse();
    }
  }

  useEffect(() => {
    prefetch();
  }, [start, until, selectedAreaId]);

  return (
    <>
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
              value={selectedAreaName}
              readOnly
              size="small"
              label="Area"
              fullWidth
              onClick={() => pickArea()}
            />
          </div>
        </div>
        {/* Content */}
        <div className="tw-mt-4 tw-relative tw-gap-3 tw-flex tw-flex-col">
          <Overloading loading={loading.value} />
          {isMobile ? (
            <HistoryPaymentSummaryMobile data={data} />
          ) : (
            <HistoryPaymentSummaryTable data={data} />
          )}
        </div>
      </div>
      <AreaPickerFilter ref={pickerRef} />
    </>
  );
}
