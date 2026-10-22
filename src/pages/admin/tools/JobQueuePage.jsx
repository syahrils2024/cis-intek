/**
 * @typedef {import("src/stores/jobQueue").JobQueueStore} JobQueueStore
 * @typedef {import('src/repositories/jobQueue').JobQueue} JobQueue
 */

import { toast } from 'sonner';
import { useRef, useEffect } from 'react';
import { useBoolean } from '@hooks/use-boolean';
import { useConfirm } from 'material-ui-confirm';
import Overloading from '@components/overloading';
import { useDebouncedCallback } from 'use-debounce';
import JobQueueTable from '@components/JobQueue/TableData';
import JobQueueMobileCard from '@components/JobQueue/MobileCard';
import AreaPickerFilter from '@components/billing/areaPickerFilter';

import {
  useTheme,
  Checkbox,
  TextField,
  useMediaQuery,
  TablePagination,
  FormControlLabel,
} from '@mui/material';

import { jobQueueRespository } from 'src/repositories';
import { useJobQueueStore } from 'src/stores/jobQueue';

export default function JobQueuePage() {
  /** @type {JobQueueStore} */
  const {
    area,
    data,
    find,
    limit,
    mikrotikType,
    page,
    setQueueStore,
    type,
    totalItems,
    areaName,
    activeOnly,
  } = useJobQueueStore();
  const isLoading = useBoolean();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const confirm = useConfirm();
  const areaPickerFilterRef = useRef();

  async function prefetch() {
    isLoading.onTrue();
    try {
      const result = await jobQueueRespository.list({
        area,
        limit,
        find,
        mikrotikType,
        page,
        type,
        activeOnly,
      });
      setQueueStore({
        data: result.data,
        totalItems: result.totalItems,
      });
    } catch (error) {
      toast.error(error.message);
    } finally {
      isLoading.onFalse();
    }
  }

  async function pickArea() {
    const result = await areaPickerFilterRef.current.open();
    if (!result) return;
    if (result._id === '') {
      setQueueStore({
        areaName: 'Semua',
        area: '',
      });
      return;
    }
    setQueueStore({
      areaName: result.name,
      area: result._id,
    });
  }

  const debouncePrefetch = useDebouncedCallback(() => {
    prefetch();
  }, 700);

  useEffect(() => {
    debouncePrefetch();
  }, [page]);

  useEffect(() => {
    setQueueStore({ page: 0 });
    debouncePrefetch();
  }, [limit, area, activeOnly]);

  const debounceFind = useDebouncedCallback((text) => {
    setQueueStore({ find: text, page: 0 });
    debouncePrefetch();
  }, 500);

  /**
   *
   * @param {JobQueue} d
   */
  async function cancel(d) {
    try {
      await confirm({
        title: 'Cancel Job Queue',
        description: `Apakah anda ingin membatalkan Job Queue ${d.mikrotikType} pelanggan ${d.customerFullname} ?`,
        confirmationText: 'Batalkan',
        cancellationText: 'Tidak',
        confirmationButtonProps: { color: 'error', variant: 'contained' },
      });
      await jobQueueRespository.cancel(d._id);
      await prefetch();
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
    }
  }

  return (
    <div className="tw-flex tw-flex-col tw-p-5 tw-relative">
      <div className="tw-flex tw-flex-col md:tw-flex-row tw-w-full tw-items-center tw-justify-between">
        <h1 className="md:tw-text-lg tw-text-base tw-font-semibold">Job Queue</h1>
        <div className="tw-flex tw-flex-col md:tw-flex-row tw-gap-4 tw-w-full md:tw-w-auto">
          <FormControlLabel
            label="Running Only"
            control={
              <Checkbox
                checked={activeOnly}
                onClick={(e) =>
                  setQueueStore({
                    activeOnly: e.target.checked,
                  })
                }
              />
            }
          />

          <div className="tw-w-full md:tw-w-48">
            <TextField
              label="Cari"
              size="small"
              defaultValue={find}
              fullWidth
              onChange={(e) => debounceFind(e.target.value)}
            />
          </div>
          <div className="tw-w-full md:tw-w-48">
            <TextField
              label="Area"
              size="small"
              value={areaName}
              InputProps={{ readOnly: true }}
              fullWidth
              onClick={() => pickArea()}
            />
          </div>
        </div>
      </div>
      <div className="tw-relative tw-mt-4 tw-gap-4 tw-flex tw-flex-col">
        <Overloading loading={isLoading.value} />
        {isMobile ? (
          data.map((d, i) => (
            <JobQueueMobileCard key={i} data={d} onCancel={(job) => cancel(job)} />
          ))
        ) : (
          <JobQueueTable data={data} onCancel={(d) => cancel(d)} />
        )}
        <TablePagination
          component="div"
          count={totalItems}
          page={page}
          onPageChange={(e, n) => {
            setQueueStore({ page: n });
          }}
          rowsPerPage={limit}
          onRowsPerPageChange={(e) => setQueueStore({ page: 0, limit: e.target.value })}
        />
      </div>
      <AreaPickerFilter ref={areaPickerFilterRef} />
    </div>
  );
}
