/**
 * @typedef {import('src/repositories/area').Odp} Odp
 */
import { Iconify } from '@components/iconify';

import {
  Stack,
  Accordion,
  IconButton,
  AccordionSummary,
  AccordionDetails,
  AccordionActions,
} from '@mui/material';

import { coloringPort } from '../odpList.helper';

/**
 * @param {Object} props
 * @param {Odp} props.item
 * @param {boolean} props.readOnly
 * @param {(item: Odp) => void} props.onShowCustomer
 * @param {(data: {id: string; name: string}) => void} props.onBroadcast
 * @param {(item: Odp) => void} props.onEdit
 * @param {(item: Odp) => void} props.onRemove
 */
export default function OdpMobileSection({
  item,
  readOnly = false,
  onShowCustomer,
  onBroadcast,
  onEdit,
  onRemove,
}) {
  return (
    <div className="tw-ring-1 tw-ring-gray-300 tw-rounded-lg">
      <Accordion>
        <AccordionSummary>
          <Stack>
            <span className="tw-text-xs">{item.name}</span>
            <span className="tw-text-xs tw-text-gray-500">{item.description}</span>
          </Stack>
        </AccordionSummary>
        <AccordionDetails>
          <Stack>
            <span className={`tw-text-xs ${coloringPort(item)}`}>
              {item.port ?? '?'} Total Port
            </span>
            <span className="tw-text-xs">{item.availablePort ?? '?'} Free Port</span>
            <span className="tw-text-xs">{item.totalCustomers ?? '?'} Used</span>
          </Stack>
        </AccordionDetails>
        <AccordionActions>
          <IconButton onClick={() => onShowCustomer(item)}>
            <Iconify icon="mdi:account-outline" />
          </IconButton>
          <IconButton onClick={() => onBroadcast({ id: item._id, name: item.name })}>
            <Iconify icon="mdi:send" />
          </IconButton>
          {!readOnly && (
            <>
              <IconButton onClick={() => onEdit(item)}>
                <Iconify icon="mdi:pencil-outline" />
              </IconButton>
              <IconButton onClick={() => onRemove(item)}>
                <Iconify icon="mdi:delete-forever-outline" />
              </IconButton>
            </>
          )}
        </AccordionActions>
      </Accordion>
    </div>
  );
}
