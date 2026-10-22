import { useRef, useEffect } from 'react';
import Overloading from '@components/overloading';
import { useDebouncedCallback } from 'use-debounce';
import AreaPickerFilter from '@components/billing/areaPickerFilter';

import { useTheme, TextField, useMediaQuery, TablePagination } from '@mui/material';

import { useAppNotificationState } from './appNotification.state';
import { AppNotificationData } from './components/AppNotificationData';

export default function AppNotificationPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const areaPickerFilterRef = useRef();

  const {
    limit,
    loadNotifications,
    loading,
    notifications,
    page,
    search,
    setLimit,
    setPage,
    setSearch,
    total,
    areaName,
    setAreaName,
    setArea,
  } = useAppNotificationState();

  const debounceLoadNotifications = useDebouncedCallback(loadNotifications, 700);

  async function pickArea() {
    const result = await areaPickerFilterRef.current.open();
    if (!result) return;
    if (result._id === '') {
      setArea(null);
      setAreaName('Semua');
      return;
    }
    setArea(result._id);
    setAreaName(result.name);
  }

  useEffect(() => {
    debounceLoadNotifications();
  }, []);

  useEffect(() => {
    debounceLoadNotifications();
  }, [page, limit]);

  useEffect(() => {
    debounceLoadNotifications();
  }, [search, areaName]);

  return (
    <div className="tw-flex tw-flex-col tw-p-5 tw-relative">
      <div className="tw-flex tw-flex-col md:tw-flex-row tw-w-full tw-items-center tw-justify-between">
        <h1 className="md:tw-text-lg tw-text-base tw-font-semibold">&nbsp;</h1>
        <div className="tw-flex tw-flex-col md:tw-flex-row tw-gap-4 tw-w-full md:tw-w-auto">
          <div className="tw-w-full md:tw-w-48">
            <TextField
              label="Area"
              size="small"
              value={areaName}
              fullWidth
              InputProps={{ readOnly: true }}
              onClick={() => pickArea()}
            />
          </div>
          <div className="tw-w-full md:tw-w-48">
            <TextField
              label="Cari"
              size="small"
              value={search}
              fullWidth
              onChange={(e) => {
                setSearch(e.target.value);
              }}
            />
          </div>
        </div>
      </div>
      {/* Content */}
      <div className="tw-relative tw-mt-4 tw-gap-2 tw-flex-col tw-flex">
        <Overloading loading={loading.value} />
        {isMobile ? (
          <AppNotificationData.Mobile notifications={notifications} />
        ) : (
          <AppNotificationData.Table notifications={notifications} />
        )}
      </div>
      {/* End Content */}
      <TablePagination
        component="div"
        count={total}
        page={page}
        onPageChange={(e, n) => {
          setPage(n);
        }}
        rowsPerPage={limit}
        onRowsPerPageChange={(e) => {
          setLimit(e.target.value);
        }}
      />
      <AreaPickerFilter ref={areaPickerFilterRef} />
    </div>
  );
}
