import { useMemo, createContext } from 'react';
import Overloading from '@components/overloading';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Chip,
  Grid,
  Stack,
  Button,
  Dialog,
  Accordion,
  Typography,
  DialogTitle,
  DialogActions,
  AccordionSummary,
  AccordionDetails,
  AccordionActions,
} from '@mui/material';

import { useBroadcastProfilePickerState } from './broadcastProfilePicker.state';

export const BroadcastPickerContext = createContext();

export const BroadcastPickerProvider = ({ children }) => {
  const { handlers, state } = useBroadcastProfilePickerState();

  const { open } = handlers;
  const { close } = handlers;

  const contextValue = useMemo(() => ({ open, close }), [open, close]);

  return (
    <BroadcastPickerContext.Provider value={contextValue}>
      {children}
      {/* Dialog Picker */}
      <Dialog open={state.show.value} fullWidth maxWidth="sm" fullScreen={state.mobile}>
        <DialogTitle>Pilih Profile Broadcast</DialogTitle>
        {/* Content */}
        <Stack spacing={1} className="tw-relative tw-p-2">
          <Overloading loading={state.loading.value} />
          {state.data.map((item, i) => (
            <Accordion key={i}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Stack direction="row" spacing={1} alignItems="center" className="tw-flex-wrap">
                  <Typography sx={{ color: 'text.secondary', fontSize: 14, fontWeight: 500 }}>
                    {item.name}
                  </Typography>
                  <div className="tw-flex tw-flex-wrap tw-gap-2">
                    {item.billingStatus.map((status) => (
                      <BillingChip key={status} billingStatus={status} />
                    ))}
                    {item.templateName ? (
                      <Chip label={item.templateName} size="small" color="info" variant="soft" />
                    ) : null}
                  </div>
                </Stack>
              </AccordionSummary>
              <AccordionDetails>
                <Stack spacing={2}>
                  {item.message ? (
                    <span className="tw-text-xs tw-text-gray-400">{item.message}</span>
                  ) : null}
                  <LabelColumn item={item} />
                </Stack>
              </AccordionDetails>
              <AccordionActions>
                <Stack direction="row" spacing={1} justifyContent="end">
                  <Button size="small" variant="contained" onClick={() => close(item)}>
                    Pilih
                  </Button>
                </Stack>
              </AccordionActions>
            </Accordion>
          ))}
        </Stack>
        {/* End Content */}
        <DialogActions>
          <Stack direction="row" spacing={1} justifyContent="end">
            <Button color="error" variant="text" onClick={() => handlers.close()}>
              Tutup
            </Button>
          </Stack>
        </DialogActions>
      </Dialog>
      {/* End Dialog Picker */}
    </BroadcastPickerContext.Provider>
  );
};

function BillingChip({ billingStatus }) {
  const label =
    {
      paid: 'Paid',
      unpaid: 'Unpaid',
      partially_paid: 'Partially Paid',
      canceled: 'Canceled',
    }[billingStatus] ?? billingStatus;

  const color =
    {
      paid: 'success',
      unpaid: 'error',
      partially_paid: 'warning',
      canceled: 'error',
    }[billingStatus] ?? 'default';

  return <Chip label={label} size="small" color={color} variant="soft" />;
}

/** @param {{item: BroadcastOptionTemplate}} */
function LabelColumn({ item: data }) {
  const keys = {
    'Pesan Per Sesi': data.messagePerSession,
    'Jeda Pesan': `${data.messageDelay} detik`,
    'Jeda Sesi': `${data.sessionDelay} detik`,
    Template: data.templateName ?? data.message ?? '-',
  };

  const entries = Object.entries(keys).map(([label, value]) => ({ label, value }));

  return (
    <Grid container spacing={2}>
      {entries.map((entry, i) => (
        <Grid item columns={12} md={4} key={i}>
          <Stack key={entry.label} className="tw-flex tw-justify-between tw-text-xs">
            <span>{entry.label}</span>
            <span className="tw-font-semibold">{entry.value}</span>
          </Stack>
        </Grid>
      ))}
      <Grid item columns={12} md={4}>
        <Stack className="tw-flex tw-justify-between tw-text-xs">
          <span>Whatsapp Node</span>
          <ul className="tw-list-disc tw-pl-5">
            {data.whatsappNodes.map((node) => (
              <li key={node._id}>{node.title}</li>
            ))}
          </ul>
        </Stack>
      </Grid>
    </Grid>
  );
}
