/**
 * @typedef {import("src/repositories/duoDateCharge").DuoDateCharge} DuoDateCharge
 */

import { Iconify } from '@components/iconify';

import {
  Stack,
  Button,
  Accordion,
  Typography,
  AccordionSummary,
  AccordionActions,
} from '@mui/material';

import 'src/extension/number';

/**
 * @param {{data: DuoDateCharge[]; onMenu: (e: Event, data: DuoDateCharge) => void}} param0
 */
export default function DuoDateChargeMobileCard({ data, onMenu }) {
  return (
    <Stack spacing={2} className="tw-my-4">
      {data.map((d, i) => (
        <Accordion key={i}>
          <AccordionSummary>
            <div className="tw-flex tw-flex-row tw-items-center tw-w-full">
              <Typography variant="overline" className="tw-w-full">
                {d.name}
              </Typography>
              <Typography variant="overline" className="tw-whitespace-nowrap tw-flex-none">
                Rp. {d.charge?.formatCurrency()}
              </Typography>
            </div>
          </AccordionSummary>
          <AccordionActions>
            <Button size="small" onClick={(e) => onMenu(e, d)} color="primary" variant="contained">
              <Iconify icon="mdi:menu" /> Actions
            </Button>
          </AccordionActions>
        </Accordion>
      ))}
    </Stack>
  );
}
