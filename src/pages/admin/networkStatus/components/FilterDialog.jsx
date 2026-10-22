import { useBoolean } from '@hooks/use-boolean';
import { useAppPicker } from '@hooks/use-app-picker';
import { useRef, useState, forwardRef, useImperativeHandle } from 'react';

import {
  Stack,
  Dialog,
  Button,
  useTheme,
  TextField,
  DialogTitle,
  useMediaQuery,
  DialogActions,
  DialogContent,
} from '@mui/material';

const CustomerEngineerFilterDialog = forwardRef((props, ref) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const show = useBoolean(false);
  const resolver = useRef();

  const appPicker = useAppPicker();
  const [state, setState] = useState({
    areaId: null,
    areaTitle: 'Semua',
    search: '',
    userStatus: 'active',
    isolatedStatus: 'all',
  });

  const userStatusList = ['active', 'inactive', 'banned'];

  async function pickArea() {
    const result = await appPicker.area.open(state.areaId);
    if (result) {
      setState((prev) => ({
        ...prev,
        areaId: result._id,
        areaTitle: result.name,
      }));
    }
  }

  function open(params) {
    setState(params);
    show.onTrue();
    return new Promise((resolve) => {
      resolver.current = resolve;
    });
  }

  function close(value) {
    show.onFalse();
    resolver.current(value);
  }

  useImperativeHandle(ref, () => ({ open, close }));

  return (
    <Dialog open={show.value} fullWidth maxWidth="sm" fullScreen={isMobile}>
      <DialogTitle>Filter Network Status</DialogTitle>
      <DialogContent dividers>
        <Stack className="tw-py-2" spacing={2}>
          <TextField
            select
            fullWidth
            size="small"
            value={state.userStatus}
            label="Status User"
            variant="filled"
            SelectProps={{ native: true }}
            onChange={(e) => setState((prev) => ({ ...prev, userStatus: e.target.value }))}
            id="select-user-status"
            InputLabelProps={{ htmlFor: `select-user-status` }}
            inputProps={{ id: `select-user-status` }}
          >
            {userStatusList.map((p, i) => (
              <option key={i} value={p}>
                {p}
              </option>
            ))}
          </TextField>
          <TextField
            select
            fullWidth
            size="small"
            value={state.isolatedStatus}
            label="Status Isolir"
            variant="filled"
            SelectProps={{ native: true }}
            onChange={(e) => setState((prev) => ({ ...prev, isolatedStatus: e.target.value }))}
          >
            <option value="all">Semua</option>
            <option value="true">Isolir</option>
            <option value="false">Open</option>
          </TextField>
          <TextField
            fullWidth
            size="small"
            label="Area"
            variant="filled"
            placeholder="Klik untuk memilih area"
            value={!!state.areaTitle ? state.areaTitle : 'Cari'}
            readOnly
            onClick={() => pickArea()}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button variant="text" color="error" onClick={() => close(null)}>
          Batal
        </Button>
        <Button variant="contained" color="primary" onClick={() => close(state)}>
          Apply
        </Button>
      </DialogActions>
    </Dialog>
  );
});

export default CustomerEngineerFilterDialog;
