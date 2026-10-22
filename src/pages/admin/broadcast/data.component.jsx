import { Iconify } from '@components/iconify';
import { useExpansionToggle } from '@hooks/use-expansion-toggle';

import {
  Table,
  Stack,
  Tooltip,
  TableRow,
  TableCell,
  TableHead,
  TableBody,
  Accordion,
  IconButton,
  AccordionSummary,
  AccordionDetails,
  AccordionActions,
} from '@mui/material';

export const BroadcastData = {
  Mobile: MobileCard,
  Table: BroadcastTable,
};

/**
 * @typedef {import('src/repositories/broadcastTemplate').BroadcastTemplate} BroadcastTemplate
 */

/**
 * @param {{
 * data: BroadcastTemplate[];
 * onEdit: (data: BroadcastTemplate) => void
 * onRemove: (data: BroadcastTemplate) => void
 * }} param0
 */
export function MobileCard({ data, onEdit, onRemove }) {
  return data.map((item, index) => (
    <div className="tw-ring-1 tw-rounded-lg tw-ring-gray-400" key={index}>
      <Accordion>
        <AccordionSummary>
          <span className="tw-text-xs tw-font-semibold">{item.title}</span>
        </AccordionSummary>
        <AccordionDetails>
          <Stack spacing={2}>
            <Stack>
              <span className="tw-text-xs tw-text-gray-500">Notification App Title</span>
              <span className="tw-text-xs tw-whitespace-pre-line">
                {item.notificationTitle ?? '-'}
              </span>
            </Stack>
            <Stack>
              <span className="tw-text-xs tw-text-gray-500">Content</span>
              <span className="tw-text-xs tw-whitespace-pre-line">{item.content}</span>
            </Stack>
          </Stack>
        </AccordionDetails>
        <AccordionActions>
          <Tooltip title="Edit" onClick={() => onEdit(item)}>
            <IconButton color="success">
              <Iconify icon="mdi:edit" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Hapus" onClick={() => onRemove(item)}>
            <IconButton color="error">
              <Iconify icon="mdi:delete" />
            </IconButton>
          </Tooltip>
        </AccordionActions>
      </Accordion>
    </div>
  ));
}

/**
 *
 * @param {{
 * data: BroadcastTemplate[];
 * onEdit: (data: BroadcastTemplate) => void
 * onRemove: (data: BroadcastTemplate) => void
 * }} param0
 */
export function BroadcastTable({ data, onEdit, onRemove }) {
  const headers = ['Title', 'Notification App Title', 'Content', ''];
  const expansion = useExpansionToggle();

  return (
    <Table>
      <TableHead>
        <TableRow>
          {headers.map((header, index) => (
            <TableCell key={index} className="tw-text-xs tw-font-semibold">
              {header}
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {data.map((item, index) => (
          <TableRow key={index}>
            <TableCell width="230">
              <Stack direction="row" justifyItems="center" alignItems="center" spacing={0.5}>
                <IconButton onClick={() => expansion.toggle(item._id)} size="small">
                  <Iconify icon="mdi:menu" />
                </IconButton>
                <span className="tw-text-xs tw-font-semibold">{item.title}</span>
              </Stack>
            </TableCell>
            <TableCell width="230">
              <span className="tw-text-xs tw-font-semibold">{item.notificationTitle ?? '-'}</span>
            </TableCell>
            <TableCell>
              <span
                className={`tw-text-xs ${
                  expansion.isIncludes(item._id) ? 'tw-whitespace-pre-line' : 'tw-line-clamp-4'
                }`}
              >
                {item.content}
              </span>
            </TableCell>
            <TableCell>
              <Stack direction="row" justifyContent="flex-end" spacing={1}>
                <Tooltip title="Edit" onClick={() => onEdit(item)}>
                  <IconButton color="success">
                    <Iconify icon="mdi:edit" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Hapus" onClick={() => onRemove(item)}>
                  <IconButton color="error">
                    <Iconify icon="mdi:delete" />
                  </IconButton>
                </Tooltip>
              </Stack>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
