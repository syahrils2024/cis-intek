import dayjs from 'dayjs';
import { toast } from 'sonner';
import { useMemo, useState, useContext, createContext } from 'react';

import { LoadingButton } from '@mui/lab';
import { DatePicker } from '@mui/x-date-pickers';
import {
  Stack,
  Dialog,
  TextField,
  DialogTitle,
  DialogActions,
  DialogContent,
} from '@mui/material';

import { subscriptionRepository } from 'src/repositories';

// ----------------------------------------------------------------------

/**
 * Context untuk Generate Billing Masal
 * @type {React.Context<{generate: (area: {id: string; title: string}) => Promise<void>} | null>}
 */
export const MassBillingGenerateContext = createContext(null);

// ----------------------------------------------------------------------

export function MassBillingGenerateProvider({ children }) {
  const [open, setOpen] = useState(false);
  const [area, setArea] = useState(null);
  const [period, setPeriod] = useState(dayjs());
  const [loading, setLoading] = useState(false);

  /**
   * Buka dialog generate billing masal
   * @param {{id: string; title: string}} selectedArea
   * @returns {Promise<void>}
   */
  function generate(selectedArea) {
    setArea(selectedArea);
    setPeriod(dayjs());
    setOpen(true);
    return Promise.resolve();
  }

  function handleClose() {
    if (loading) return;
    setOpen(false);
    setArea(null);
  }

  function handleSubmit() {
    const body = {
      area: area.id,
      month: period.month() + 1,
      year: period.year(),
    };

    setLoading(true);

    const promise = subscriptionRepository.generateMassBilling(body);

    toast.promise(promise, {
      loading: 'Generate billing masal...',
      success: (message) => {
        setOpen(false);
        setArea(null);
        return message ?? 'Billing masal berhasil dibuat';
      },
      error: (error) =>
        // jangan tutup dialog ketika error
        error?.message ?? 'Gagal generate billing masal',
      finally: () => {
        setLoading(false);
      },
    });
  }

  const contextValue = useMemo(
    () => ({
      generate,
    }),
    []
  );

  return (
    <MassBillingGenerateContext.Provider value={contextValue}>
      {children}

      <Dialog open={open} onClose={() => handleClose()} fullWidth maxWidth="xs">
        <DialogTitle>Generate Billing Masal</DialogTitle>
        <DialogContent sx={{ overflow: 'unset' }}>
          <Stack spacing={3} sx={{ pt: 1 }}>
            <TextField
              label="Nama Area"
              value={area?.title ?? '-'}
              InputProps={{ readOnly: true }}
              size="small"
              fullWidth
            />

            <DatePicker
              views={['year', 'month']}
              label="Periode Billing"
              value={period}
              onChange={(newValue) => {
                if (newValue) setPeriod(newValue);
              }}
              slotProps={{ textField: { size: 'small', fullWidth: true } }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <LoadingButton
            variant="text"
            color="error"
            onClick={() => handleClose()}
            loading={loading}
            disabled={loading}
          >
            Tutup
          </LoadingButton>
          <LoadingButton
            variant="contained"
            color="primary"
            onClick={() => handleSubmit()}
            loading={loading}
          >
            Generate
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </MassBillingGenerateContext.Provider>
  );
}

// ----------------------------------------------------------------------

/**
 * Hook untuk membuka dialog generate billing masal
 * @returns {{generate: (area: {id: string; title: string}) => Promise<void>}}
 */
export function useGenerateMassBilling() {
  const context = useContext(MassBillingGenerateContext);
  if (!context) {
    throw new Error('useGenerateMassBilling harus digunakan di dalam MassBillingGenerateProvider');
  }
  return context;
}
