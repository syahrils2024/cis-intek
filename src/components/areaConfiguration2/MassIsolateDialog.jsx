import dayjs from 'dayjs';
import { toast } from 'sonner';
import { id } from 'date-fns/locale';
import { format, addMonths } from 'date-fns';
import { useBoolean } from '@hooks/use-boolean';
import { useRef, useMemo, useState, forwardRef, useImperativeHandle } from 'react';

import { LoadingButton } from '@mui/lab';
import { DatePicker } from '@mui/x-date-pickers';
import Grid2 from '@mui/material/Unstable_Grid2';
import {
  Stack,
  Button,
  Dialog,
  useTheme,
  DialogTitle,
  DialogActions,
  DialogContent,
  useMediaQuery,
} from '@mui/material';

import { areaRepository, subscriptionRepository } from 'src/repositories';

/**
 * @typedef {import('src/repositories/area').Area} Area
 */

const MassIsolateDialog = forwardRef((props, ref) => {
  const show = useBoolean(false);
  const loading = useBoolean(false);
  /** @type {[Area, void]} */
  const [currentArea, setCurrentArea] = useState(null);
  const [date, setDate] = useState(new Date());
  const resolver = useRef();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const areaData = useMemo(() => [
    {
      title: 'Area / POP',
      value: currentArea?.title ?? '-',
    },
    {
      title: 'Jenis Layanan',
      value: currentArea?.isPrePaid
        ? 'Prepaid / Prabayar / Bayar Depan'
        : 'Postpaid / Pascabayar / Bayar Belakang',
    },
  ]);

  const summary = useMemo(() => {
    if (!currentArea) return '';
    if (currentArea.isPrePaid) {
      const start = date;
      const end = addMonths(start, 1);
      const formatStart = format(start, 'MMMM yyyy', { locale: id });
      const formatEnd = format(end, 'MMMM yyyy', { locale: id });
      return `Billing yang akan terkena Isolate adalah ${formatStart} - ${formatEnd}, apabila pelanggan belum melakukan pembayaran`;
    }

    const start = addMonths(date, -1);
    const end = addMonths(start, 1);
    const formatStart = format(start, 'MMMM yyyy', { locale: id });
    const formatEnd = format(end, 'MMMM yyyy', { locale: id });
    return `Billing yang akan terkena Isolate adalah ${formatStart} - ${formatEnd}, apabila pelanggan belum melakukan pembayaran`;
  });

  function initData() {
    setCurrentArea(null);
    setDate(new Date());
  }

  async function prefetch(areaId) {
    loading.onTrue();
    try {
      const snapshot = await areaRepository.getAreaDetail(areaId);
      setCurrentArea(snapshot);
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
    } finally {
      loading.onFalse();
    }
  }

  function open(areaId) {
    initData();
    prefetch(areaId);
    show.onTrue();
    return new Promise((resolve) => {
      resolver.current = resolve;
    });
  }

  async function isolate() {
    loading.onTrue();
    try {
      await subscriptionRepository.isolateNetworkArea(currentArea._id, {
        month: date.getMonth() + 1,
        year: date.getFullYear(),
      });
      toast.success('Melakukan Isolate Tagihan');
      close();
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
    } finally {
      loading.onFalse();
    }
  }

  function close() {
    show.onFalse();
    resolver.current();
  }

  useImperativeHandle(ref, () => ({ open, close }));

  return (
    <Dialog open={show.value} fullWidth maxWidth="sm" fullScreen={isMobile}>
      <DialogTitle>Isolate Tagihan</DialogTitle>
      <DialogContent>
        <div className="tw-flex tw-flex-col tw-gap-5 tw-relative tw-py-2">
          <Grid2 container>
            {areaData.map((a, i) => (
              <Grid2 xs={6} key={i}>
                <Stack>
                  <span className="tw-text-xs">{a.title}</span>
                  <span className="tw-text-xs tw-font-semibold">{a.value}</span>
                </Stack>
              </Grid2>
            ))}
          </Grid2>
          <DatePicker
            label="Periode Billing"
            value={dayjs(date)}
            views={['month', 'year']}
            slotProps={{ textField: { size: 'small' } }}
            onChange={(e) => setDate(e.toDate())}
          />
          <p className="tw-text-xs tw-text-gray-500">{summary}</p>
        </div>
      </DialogContent>
      <DialogActions>
        <Button color="error" variant="text" onClick={() => close()}>
          Tutup
        </Button>
        <LoadingButton
          loading={loading.value}
          color="primary"
          variant="contained"
          onClick={() => isolate()}
        >
          Isolate
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
});

export default MassIsolateDialog;
