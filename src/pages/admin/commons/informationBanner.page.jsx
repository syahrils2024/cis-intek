import { useEffect } from 'react';
import { Iconify } from '@components/iconify';
import Overloading from '@components/overloading';

import { Stack, Button, useTheme, useMediaQuery, TablePagination } from '@mui/material';

import { useInformationBannerState } from './informationBanner.state';
import { InformationBannerData } from './components/InformationBannerData';
import InformationBannerFormDialog from './components/InformationBannerFormDialog';

export default function InformationBannerPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { formRef, data, loading, load, limit, setLimit, page, setPage, total, remove } =
    useInformationBannerState();

  async function onAdd() {
    await formRef.current?.open();
    load();
  }

  async function onEdit(item) {
    await formRef.current?.open(item);
    load();
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <>
      <div className="tw-p-5 tw-w-full">
        <Stack className="tw-w-full" spacing={2}>
          <Stack direction={isMobile ? 'column' : 'row'} className="tw-w-full" spacing={2}>
            <Stack className="tw-w-full">
              <h1 className="tw-text-md tw-font-semibold">Informasi Mobile</h1>
              <p className="tw-text-gray-600 tw-text-xs">
                halaman ini digunakan untuk menyediakan informasi atau gangguan internet pada
                aplikasi mobile
              </p>
            </Stack>
            <Button
              color="primary"
              variant="contained"
              className="tw-gap-2 tw-w-min tw-self-end"
              onClick={() => onAdd()}
            >
              <Iconify icon="mdi:plus" /> Tambah
            </Button>
          </Stack>
          <Stack className="tw-relative" spacing={1}>
            <Overloading loading={loading.value} />
            {isMobile ? (
              <InformationBannerData.Mobile
                data={data}
                onRemove={(item) => remove(item)}
                onEdit={(item) => onEdit(item)}
              />
            ) : (
              <InformationBannerData.Table
                data={data}
                onRemove={(item) => remove(item)}
                onEdit={(item) => onEdit(item)}
              />
            )}
            <TablePagination
              component="div"
              count={total}
              page={page}
              onPageChange={(e, value) => setPage(value)}
              rowsPerPage={limit}
              onRowsPerPageChange={(e) => setLimit(e.target.value)}
            />
          </Stack>
        </Stack>
      </div>
      <InformationBannerFormDialog ref={formRef} />
    </>
  );
}
