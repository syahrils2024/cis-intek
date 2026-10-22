import { useMemo, createContext } from 'react';

import {
  Stack,
  Button,
  Dialog,
  TextField,
  DialogTitle,
  DialogActions,
  DialogContent,
} from '@mui/material';

import { EngineerAreaItem } from './EngineerArea';
import { useEngineerPickerDialogState } from './engineerPickerDialog.state';

export const EngineerPickerContext = createContext(null);

export const EngineerPickerProvider = ({ children }) => {
  const { handlers, state } = useEngineerPickerDialogState();

  const { open } = handlers;
  const { close } = handlers;

  const contextValue = useMemo(() => ({ open, close }), [open, close]);

  return (
    <EngineerPickerContext.Provider value={contextValue}>
      {children}
      {/* Engineer Picker component */}
      <Dialog
        open={state.show.value}
        fullWidth
        maxWidth="sm"
        fullScreen={state.mobile}
        onClose={close}
      >
        <DialogTitle>
          <Stack direction="row" alignContent="center" justifyContent="space-between">
            <span>Pilih Teknisi</span>
            <div className="tw-w-full md:tw-w-48">
              <TextField
                label="Cari Teknisi"
                value={state.search}
                onChange={(e) => handlers.setSearch(e.target.value)}
                size="small"
              />
            </div>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Stack className="tw-py-2" spacing={2}>
            {state.areaEngineers.map((item) => (
              <EngineerAreaItem
                key={item._id}
                item={item}
                onToggleEngineer={(_id) => state.selectedEngineer.toggle(_id)}
                selectedEngineers={state.selectedEngineer.data}
                onToggleEngineerArea={(area_id) => handlers.toggleEngineerArea(area_id)}
                multiple={state.multiple.value}
                search={state.search}
              />
            ))}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={close} color="error" variant="text">
            Tutup
          </Button>
          {state.multiple.value ? (
            <Button
              disabled={!state.availableSubmit}
              color="primary"
              variant="contained"
              onClick={() => handlers.submit()}
            >
              Pilih
            </Button>
          ) : null}
        </DialogActions>
      </Dialog>
      {/* End Engineer Picker component */}
    </EngineerPickerContext.Provider>
  );
};
