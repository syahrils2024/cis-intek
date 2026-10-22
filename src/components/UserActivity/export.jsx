import dayjs from 'dayjs';
import { toast } from 'sonner';
import { download } from '@utils/download';
import { useBoolean } from '@hooks/use-boolean';
import Overloading from '@components/overloading';
import { format, endOfMonth, startOfMonth } from 'date-fns';
import { useMemo, useState, useEffect, forwardRef, useImperativeHandle } from 'react';

import { LoadingButton } from '@mui/lab';
import Grid from '@mui/material/Unstable_Grid2';
import { DatePicker } from '@mui/x-date-pickers';
import {
  Stack,
  Button,
  Dialog,
  useTheme,
  DialogTitle,
  DialogActions,
  DialogContent,
  useMediaQuery,
  TablePagination,
} from '@mui/material';

import { userRepository, userActivityRepository } from 'src/repositories';

import UserActivityTable from './Table';
import { useUserActivityState } from './state';

/**
 * @typedef {import('src/repositories/user').User} User
 */

const UserActivityExport = forwardRef((props, ref) => {
  const [start, setStart] = useState(startOfMonth(new Date()));
  const [until, setUntil] = useState(endOfMonth(new Date()));
  const show = useBoolean(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isLoadingExport = useBoolean(false);
  const loading = useBoolean(false);
  /** @type {[User, void]} */
  const [userData, setUserData] = useState(null);

  const { activities, fetchActivities, limit, page, reset, setPage, setLimit, activitiesPage } =
    useUserActivityState();

  const userDataField = useMemo(() => [
    { label: 'Nama', value: userData?.fullname ?? '-' },
    { label: 'Email', value: userData?.email ?? '-' },
    { label: 'Telepon', value: userData?.phone ?? '-' },
    { label: 'Privilege', value: userData?.privilege?.join(', ') ?? '-' },
  ]);

  function resetFilter() {
    setStart(startOfMonth(new Date()));
    setUntil(endOfMonth(new Date()));
    show.onFalse();
  }

  async function fetchUserData(user_id) {
    loading.onTrue();
    try {
      const user = await userRepository.getUserById(user_id);
      setUserData(user);
      await fetchActivities({
        user_id,
        start: format(start, 'yyyy-MM-dd'),
        until: format(until, 'yyyy-MM-dd'),
      });
    } catch (error) {
      toast.error(error.message);
    } finally {
      loading.onFalse();
    }
  }

  function open(user_id) {
    if (!user_id) return;
    resetFilter();
    reset();
    setCurrentUserId(user_id);
    fetchUserData(user_id);
    show.onTrue();
  }

  async function doExport() {
    isLoadingExport.onTrue();
    try {
      const blobData = await userActivityRepository.exportToExcel({
        user: currentUserId,
        start: format(start, 'yyyy-MM-dd'),
        until: format(until, 'yyyy-MM-dd'),
      });
      download(blobData, `user-activity.xlsx`);
    } catch (error) {
      toast.error(error.message);
    } finally {
      isLoadingExport.onFalse();
    }
  }

  function close() {
    show.onFalse();
  }

  useImperativeHandle(ref, () => ({
    open,
    close,
  }));

  useEffect(() => {
    if (!currentUserId) return;
    fetchActivities({
      currentUserId,
      start: format(start, 'yyyy-MM-dd'),
      until: format(until, 'yyyy-MM-dd'),
    });
  }, [start, until]);

  return (
    <Dialog open={show.value} fullWidth fullScreen={isMobile} maxWidth="sm">
      <DialogTitle>Export Excel</DialogTitle>
      <DialogContent>
        <Stack spacing={2} className="tw-py-2 tw-relative">
          <Overloading loading={loading.value} />
          <Grid container gap={2}>
            {userDataField.map((item, index) => (
              <Grid xs={5} key={index}>
                <Stack className="tw-text-xs">
                  <span>{item.label}</span>
                  <span className="tw-font-semibold">{item.value}</span>
                </Stack>
              </Grid>
            ))}
          </Grid>
          <Stack direction={isMobile ? 'column' : 'row'} gap={2}>
            <DatePicker
              value={dayjs(start)}
              label="Mulai"
              slotProps={{ textField: { fullWidth: true, size: 'small' } }}
              onChange={(value) => setStart(value.toDate())}
            />
            <DatePicker
              value={dayjs(until)}
              label="Sampai"
              slotProps={{ textField: { fullWidth: true, size: 'small' } }}
              onChange={(value) => setUntil(value.toDate())}
            />
          </Stack>
          <UserActivityTable data={activitiesPage} />
          <TablePagination
            size="small"
            component="div"
            count={activities.length}
            page={page}
            onPageChange={(e, p) => {
              setPage(p);
              // dispatch(setInvoiceStore({ key: 'page', value: p }))
            }}
            rowsPerPage={limit}
            onRowsPerPageChange={(e) => {
              setLimit(e.target.value);
              // dispatch(setInvoiceStore({ key: 'limit', value: e.target.value }))
            }}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button variant="text" color="error" onClick={() => close()}>
          Tutup
        </Button>
        <LoadingButton
          color="success"
          variant="soft"
          loading={isLoadingExport.value}
          onClick={() => doExport()}
        >
          Export
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
});

export default UserActivityExport;
