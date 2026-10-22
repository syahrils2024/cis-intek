import { toast } from 'sonner';
import { useBoolean } from '@hooks/use-boolean';
import { useRef, useMemo, useState, forwardRef, useImperativeHandle } from 'react';

import {
  Grid,
  Stack,
  Table,
  Button,
  Dialog,
  Divider,
  TableRow,
  useTheme,
  TableBody,
  TableCell,
  TableHead,
  DialogTitle,
  DialogActions,
  DialogContent,
  useMediaQuery,
} from '@mui/material';

import { areaRepository } from 'src/repositories';

import Overloading from './overloading';

/**
 * @typedef {import('src/repositories/area').Area} Area
 */

const PPPoENameDialogPicker = forwardRef((props, ref) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  /** @type {Area, Function} */
  const [area, setArea] = useState(null);
  const loadingPppoe = useBoolean(false);
  const loadingArea = useBoolean(false);
  const show = useBoolean(false);
  const resolver = useRef();
  const tableHeaders = ['Profile', ''];

  /** @type {string[], Function} */
  const [pppoeNames, setPppoeNames] = useState([]);

  const headers = useMemo(() => [
    { label: 'POP / Area', value: area?.title ?? '-' },
    {
      label: 'IP Address / Hostname',
      value: area?.routerConfig?.address ?? '-',
    },
  ]);

  async function prefetchData(areaId) {
    loadingArea.onTrue();
    try {
      const snapshotArea = await areaRepository.getAreaDetail(areaId);
      setArea(snapshotArea);

      loadingPppoe.onTrue();
      const snapshotPPPoE = await areaRepository.getPppoeProfile(areaId);
      setPppoeNames(snapshotPPPoE.map((item) => item.name));
    } catch (error) {
      toast.error(error.message);
    } finally {
      loadingPppoe.onFalse();
      loadingArea.onFalse();
    }
  }

  function open(areaId) {
    setArea(null);
    setPppoeNames([]);
    show.onTrue();
    prefetchData(areaId);
    return new Promise((resolve) => {
      resolver.current = resolve;
    });
  }

  function cancel() {
    resolver.current();
    show.onFalse();
  }

  function pick(pppoeName) {
    resolver.current(pppoeName);
    show.onFalse();
  }

  useImperativeHandle(ref, () => ({
    open,
  }));

  return (
    <Dialog open={show.value} maxWidth="sm" fullWidth fullScreen={isMobile}>
      <DialogTitle>Pilih Profile PPPoE</DialogTitle>
      <DialogContent>
        <Stack className="tw-py-2 tw-w-full" spacing={2}>
          <div className="tw-w-full tw-relative">
            <Overloading loading={loadingArea.value} />
            <Grid container spacing={2}>
              {headers.map((header) => (
                <Grid item xs={12} md={6} key={header.label}>
                  <Stack>
                    <span className="tw-text-xs tw-text-gray-500">{header.label}</span>
                    <span className="tw-text-xs tw-font-semibold">{header.value}</span>
                  </Stack>
                </Grid>
              ))}
            </Grid>
          </div>
          <Divider />
          {/* PPPoE Items */}
          <Table>
            <TableHead>
              <TableRow>
                {tableHeaders.map((header) => (
                  <TableCell key={header}>{header}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {pppoeNames.map((pppoeName, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <span className="tw-text-xs">{pppoeName}</span>
                  </TableCell>
                  <TableCell>
                    <Button color="primary" size="small" onClick={() => pick(pppoeName)}>
                      Pilih
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {/* End PPPoE Items */}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button variant="text" color="error" size="small" onClick={() => cancel()}>
          Tutup
        </Button>
      </DialogActions>
    </Dialog>
  );
});

export default PPPoENameDialogPicker;
