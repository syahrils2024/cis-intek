import { useEffect } from 'react';
import { Iconify } from '@components/iconify';
import Overloading from '@components/overloading';
import { useDebouncedCallback } from 'use-debounce';

import { Stack, Button, TablePagination } from '@mui/material';

import { DuitkuSecretData } from './components/Data';
import DuitkuFormDialog from './components/formDialog';
import { useDuitkuSecretState } from './duitkuSecret.state';

export default function DuitkuSecretPage() {
  const {
    data,
    limit,
    loadData,
    loading,
    page,
    search,
    setStore,
    dialogRef,
    add,
    mobile,
    onEdit,
    onRemove,
    total,
  } = useDuitkuSecretState();

  const debounceLoad = useDebouncedCallback(() => {
    loadData();
  }, 300);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    debounceLoad();
  }, [page]);

  useEffect(() => {
    setStore({ page: 0 });
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
        {mobile ? (
          <DuitkuSecretData.Mobile
            data={data}
            onEdit={(item) => onEdit(item._id)}
            onRemove={(item) => onRemove(item)}
          />
        ) : (
          <DuitkuSecretData.Table
            data={data}
            onEdit={(item) => onEdit(item._id)}
            onRemove={(item) => onRemove(item)}
          />
        )}
        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={(e, n) => setStore({ page: n })}
          rowsPerPage={limit}
          onRowsPerPageChange={(e) => setStore({ page: 0, limit: e.target.value })}
        />
      </Stack>
      <DuitkuFormDialog ref={dialogRef} />
    </>
  );
}
