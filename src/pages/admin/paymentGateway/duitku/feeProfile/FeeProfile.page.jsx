import { useEffect } from 'react';
import { Iconify } from '@components/iconify';
import Overloading from '@components/overloading';
import { useDebouncedCallback } from 'use-debounce';

import { Stack, Button, TablePagination } from '@mui/material';

import { useFeeProfileState } from './feeProfile.state';
import { DuitkuFeeProfileData } from './components/Data';
import DuitkuFeeProfileFormDialog from './components/FormDialog';

export default function DuitkuFeeProfilePage() {
  const {
    mobile,
    data,
    limit,
    loading,
    page,
    search,
    total,
    load,
    formDialogRef,
    add,
    onRemove,
    onEdit,
    onDuplicate,
    setFeeProfile,
  } = useFeeProfileState();

  const debounceLoad = useDebouncedCallback(() => {
    load();
  }, 300);

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    debounceLoad();
  }, [page]);

  useEffect(() => {
    setFeeProfile({ page: 0 });
    debounceLoad();
  }, [limit]);

  return (
    <>
      <Stack spacing={2}>
        <div className="tw-flex tw-flex-row tw-items-center tw-justify-end">
          <Button color="primary" variant="contained" onClick={() => add()}>
            <Iconify icon="eva:plus-fill" /> Tambah
          </Button>
        </div>
        <Overloading loading={loading} />
        <Stack spacing={2}>
          {mobile ? (
            <DuitkuFeeProfileData.Mobile
              items={data}
              onRemove={onRemove}
              onEdit={onEdit}
              onDuplicated={onDuplicate}
            />
          ) : (
            <DuitkuFeeProfileData.Table
              items={data}
              onRemove={onRemove}
              onEdit={onEdit}
              onDuplicated={onDuplicate}
            />
          )}
          <TablePagination
            component="div"
            count={total}
            page={page}
            onPageChange={(e, n) => setFeeProfile({ page: n })}
            rowsPerPage={limit}
            onRowsPerPageChange={(e) => setFeeProfile({ page: 0, limit: e.target.value })}
          />
        </Stack>
      </Stack>
      <DuitkuFeeProfileFormDialog ref={formDialogRef} />
    </>
  );
}
