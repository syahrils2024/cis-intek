import { toast } from 'sonner';
import { useEffect } from 'react';
import { useConfirm } from 'material-ui-confirm';
import Overloading from '@components/overloading';
import { useDebouncedCallback } from 'use-debounce';

import { Stack, useTheme, useMediaQuery, TablePagination } from '@mui/material';

import { broadcastJobRunnerRepository } from 'src/repositories';

import { BroadcastJobData } from './broadcastJobData';
import { useBroadcastJobStore } from '../stores/broadcastJob.store';
/** @typedef {import("../stores/broadcastJob.store").BroadcastJobStore} BroadcastJobStore */

export default function BroadcastJob() {
  /** @type {BroadcastJobStore} */
  const { data, limit, loadData, loading, page, total, setState } = useBroadcastJobStore();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const confirm = useConfirm();

  const debounceLoad = useDebouncedCallback(() => {
    loadData();
  }, 500);

  /** @param {import('src/repositories/broadcastJobRunner').BroadcastJobRunner} item */
  async function onCancel(item) {
    try {
      await confirm({
        title: 'Cancel Broadcast Job',
        description: `Apakah anda ingin melanjutkan cancel Broadcast Job ${item.template} ?`,
        confirmationText: 'Cancel',
        cancellationText: 'Tidak',
      });

      const id = item._id;
      const promises = broadcastJobRunnerRepository.cancel(id);
      toast.promise(promises, {
        loading: 'Membatalkan Broadcast Job',
        success: () => {
          debounceLoad();
          return 'Berhasil membatalkan Broadcast Job';
        },
        error: (e) => e.message,
      });
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
    }
  }

  useEffect(() => {
    debounceLoad();
  }, []);

  useEffect(() => {
    setState({ key: 'page', value: 0 });
    debounceLoad();
  }, [limit]);

  useEffect(() => {
    debounceLoad();
  }, [page]);

  return (
    <Stack className="tw-w-full">
      <Stack className="tw-relative" spacing={1}>
        <Overloading loading={loading} />
        {isMobile ? (
          <BroadcastJobData.Mobile data={data} onCancel={(item) => onCancel(item)} />
        ) : (
          <BroadcastJobData.Table data={data} onCancel={(item) => onCancel(item)} />
        )}
        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={(e, value) => setState({ key: 'page', value })}
          rowsPerPage={limit}
          onRowsPerPageChange={(e) => setState({ key: 'limit', value: e.target.value })}
        />
      </Stack>
    </Stack>
  );
}
