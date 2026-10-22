/**
 * @typedef {import("src/repositories/addons").Addons} Addons
 *
 * @callback AddonsCallback
 * @param {Addons} addons
 */

import { Iconify } from '@components/iconify';

import {
  Chip,
  Stack,
  Accordion,
  IconButton,
  AccordionSummary,
  AccordionActions,
} from '@mui/material';

/**
 * @param {{data: Addons[]; onEdit: AddonsCallback; onRemove: AddonsCallback; onDuplicate: AddonsCallback}} param0
 */

export default function AddonsMobile({ data, onEdit, onRemove, onDuplicate }) {
  return data.map((d, i) => (
    <div className="tw-ring-1 tw-ring-gray-400 tw-rounded-lg" key={i}>
      <Accordion>
        <AccordionSummary>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            className="tw-w-full"
            spacing={2}
          >
            <span className="tw-text-xs">{d.variantName}</span>
            <Chip label={d.category} variant="outlined" color="primary" size="small" />
          </Stack>
        </AccordionSummary>
        <AccordionActions>
          <IconButton color="success" onClick={() => onEdit(d)}>
            <Iconify icon="mdi:pencil" />
          </IconButton>
          <IconButton color="error" onClick={() => onRemove(d)}>
            <Iconify icon="mdi:trash-can" />
          </IconButton>
          <IconButton color="info" onClick={() => onDuplicate(d)}>
            <Iconify icon="mdi:content-duplicate" />
          </IconButton>
        </AccordionActions>
      </Accordion>
    </div>
  ));
}
