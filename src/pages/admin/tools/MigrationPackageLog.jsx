import { toast } from 'sonner';
import { useEffect } from 'react';
import { useBoolean } from '@hooks/use-boolean';
import Overloading from '@components/overloading';
import { useDebouncedCallback } from 'use-debounce';
import CustomerMigrationPackageLogTable from '@components/customer/MigrationPackageLogTable';
import CustomerMigrationPackageLogMobile from '@components/customer/MigrationPackageLogMobile';

import { useTheme, TextField, useMediaQuery, TablePagination } from '@mui/material';

import { customerRepository } from 'src/repositories';
import { useMigrationLogStore } from 'src/stores/migrationLogStore';

/**
 * @typedef {import('src/stores/migrationLogStore').MigrationLogStore} MigrationLogStore
 */

export default function MigrationPackageLogPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  /** @type {MigrationLogStore} */
  const migrationPackageLogStore = useMigrationLogStore();
  const loading = useBoolean(false);

  async function prefetch() {
    loading.onTrue();
    try {
      const snapshot = await customerRepository.getMigrationLog({
        limit: migrationPackageLogStore.limit,
        page: migrationPackageLogStore.page,
        fromPackageId: migrationPackageLogStore.fromPackageId,
        search: migrationPackageLogStore.search,
      });

      migrationPackageLogStore.setStoreData({ key: 'data', value: snapshot.data });
      migrationPackageLogStore.setStoreData({ key: 'total', value: snapshot.total });
    } catch (error) {
      toast.error(error.message);
    } finally {
      loading.onFalse();
    }
  }

  const debouncePrefetch = useDebouncedCallback(prefetch, 700);

  useEffect(() => {
    if (migrationPackageLogStore.data.length <= 0) prefetch();
  }, []);

  return (
    <div className="tw-flex tw-flex-col tw-p-5 tw-relative">
      <div className="tw-flex tw-flex-col md:tw-flex-row tw-w-full tw-items-center tw-justify-between">
        <h1 className="md:tw-text-lg tw-text-base tw-font-semibold">&nbsp;</h1>
        <div className="tw-flex tw-flex-col md:tw-flex-row tw-gap-4 tw-w-full md:tw-w-auto">
          <div className="tw-w-full md:tw-w-48">
            <TextField
              label="Cari"
              size="small"
              defaultValue={migrationPackageLogStore.search}
              fullWidth
              onChange={(e) => {
                migrationPackageLogStore.setStoreData({ key: 'search', value: e.target.value });
                migrationPackageLogStore.setStoreData({ key: 'page', value: 0 });
                debouncePrefetch();
              }}
            />
          </div>
        </div>
      </div>
      <div className="tw-mt-4 tw-relative tw-gap-3 tw-flex tw-flex-col">
        <Overloading loading={loading.value} />
        {isMobile ? (
          <CustomerMigrationPackageLogMobile data={migrationPackageLogStore.data} />
        ) : (
          <CustomerMigrationPackageLogTable data={migrationPackageLogStore.data} />
        )}
      </div>
      <TablePagination
        component="div"
        count={migrationPackageLogStore.total}
        page={migrationPackageLogStore.page}
        onPageChange={(e, n) => {
          migrationPackageLogStore.setStoreData({ key: 'page', value: n });
          debouncePrefetch();
        }}
        rowsPerPage={migrationPackageLogStore.limit}
        onRowsPerPageChange={(e) => {
          migrationPackageLogStore.setStoreData({ key: 'limit', value: e.target.value });
          migrationPackageLogStore.setStoreData({ key: 'page', value: 0 });
          debouncePrefetch();
        }}
      />
    </div>
  );
}
