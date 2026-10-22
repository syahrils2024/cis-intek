/**
 * @typedef {import("src/repositories/broadcastSchedule").BroadcastSchedule} BroadcastSchedule
 */

import { Iconify } from '@components/iconify';

import {
  Table,
  Stack,
  Switch,
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

/**
 * @typedef {Object} BroadcastScheduleData
 * @property {BroadcastSchedule[]} data - Array of broadcast schedules.
 * @property {(data: BroadcastSchedule) => void} onEdit - Callback function to edit a broadcast schedule.
 * @property {(data: BroadcastSchedule) => void} onDelete - Callback function to delete a broadcast schedule.
 * @property {(data: BroadcastSchedule, enabled: boolean) => void} toggleEnabled
 */

export const BroadcastScheduleData = {
  Table: BroadcastScheduleDataTable,
  Mobile: BroadcastScheduleDataMobile,
};

/**
 * @param {BroadcastScheduleData} props
 */
function BroadcastScheduleDataTable({ data = [], onEdit, onDelete, toggleEnabled }) {
  const headers = ['Title', 'Aktif', 'Tanggal', 'Area', 'Node', 'Rules', ''];

  return (
    <Table>
      <TableHead>
        <TableRow>
          {headers.map((header, index) => (
            <TableCell key={index}>{header}</TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {data.map((item, index) => (
          <TableRow key={index}>
            <TableCell>
              <span className="tw-text-xs">{item.title}</span>
            </TableCell>
            <TableCell>
              <Switch checked={item.enabled} onChange={() => toggleEnabled(item, !item.enabled)} />
            </TableCell>
            <TableCell width={100}>
              <span className="tw-text-xs">{item.date}</span>
            </TableCell>
            <TableCell>
              <div className="tw-flex tw-flex-wrap tw-gap-2">
                <ol className="tw-list-disc tw-ml-4">
                  {item.rules.map((rule) => (
                    <li key={rule.area_id} className="tw-text-xs">
                      {rule.areaTitle}
                    </li>
                  ))}
                </ol>
              </div>
            </TableCell>
            <TableCell>
              <div className="tw-flex tw-flex-wrap tw-gap-2">
                <ol className="tw-list-disc tw-ml-4">
                  {item.whatsappNodes.map((node) => (
                    <li key={node._id} className="tw-text-xs">
                      {node.title}
                    </li>
                  ))}
                </ol>
              </div>
            </TableCell>
            <TableCell>
              <Stack spacing={0.5}>
                <span className="tw-text-xs">{item.messagePerSession} Pesan Per Sesi</span>
                <span className="tw-text-xs">Jeda {item.delayMessage} Detik Antara Pesan</span>
                <span className="tw-text-xs">Jeda {item.delaySession} Menit Antara Sesi</span>
              </Stack>
            </TableCell>
            <TableCell>
              <Stack direction="row" spacing={1}>
                <Tooltip title="Edit">
                  <IconButton disabled={!onEdit} color="success" onClick={() => onEdit(item)}>
                    <Iconify icon="mdi:pencil" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Hapus">
                  <IconButton disabled={!onDelete} color="error" onClick={() => onDelete(item)}>
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

/**
 * @param {BroadcastScheduleData} props
 */
function BroadcastScheduleDataMobile({ data = [], onDelete, onEdit, toggleEnabled }) {
  return data.map((item, index) => (
    <div className="tw-ring-1 tw-ring-gray-400 tw-rounded-lg" key={index}>
      <Accordion>
        <AccordionSummary>
          <Stack spacing={0.5}>
            <span className="tw-text-xs">{item.title} </span>
          </Stack>
        </AccordionSummary>
        <AccordionDetails>
          <Stack spacing={2}>
            <Stack spacing={0.5}>
              <span className="tw-text-xs">Tanggal: {item.messagePerSession} </span>
              <span className="tw-text-xs">{item.messagePerSession} Pesan Per Sesi</span>
              <span className="tw-text-xs">Jeda {item.delayMessage} Detik Antara Pesan</span>
              <span className="tw-text-xs">Jeda {item.delaySession} Menit Antara Sesi</span>
            </Stack>
            <Stack spacing={0.5}>
              <span className="tw-text-xs">Area</span>
              <ol className="tw-list-disc tw-ml-4">
                {item.rules.map((rule) => (
                  <li key={rule.area_id} className="tw-text-xs">
                    {rule.areaTitle}
                  </li>
                ))}
              </ol>
            </Stack>
            <Stack spacing={0.5}>
              <span className="tw-text-xs">Whatsapp Node</span>
              <ol className="tw-list-disc tw-ml-4">
                {item.whatsappNodes.map((node) => (
                  <li key={node._id} className="tw-text-xs">
                    {node.title}
                  </li>
                ))}
              </ol>
            </Stack>
          </Stack>
        </AccordionDetails>
        <AccordionActions>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            className="tw-w-full"
          >
            <Switch checked={item.enabled} onChange={() => toggleEnabled(item, !item.enabled)} />
            <Stack direction="row">
              <Tooltip title="Edit">
                <IconButton disabled={!onEdit} color="success" onClick={() => onEdit(item)}>
                  <Iconify icon="mdi:pencil" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Hapus">
                <IconButton disabled={!onDelete} color="error" onClick={() => onDelete(item)}>
                  <Iconify icon="mdi:delete" />
                </IconButton>
              </Tooltip>
            </Stack>
          </Stack>
        </AccordionActions>
      </Accordion>
    </div>
  ));
}
