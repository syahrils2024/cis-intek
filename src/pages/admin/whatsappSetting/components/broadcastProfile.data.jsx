import { Iconify } from '@components/iconify';
import { proxyMapper } from '@utils/proxyMapper';

import { DataGrid } from '@mui/x-data-grid';
import {
  Chip,
  Stack,
  Tooltip,
  Divider,
  Accordion,
  IconButton,
  AccordionSummary,
  AccordionDetails,
  AccordionActions,
} from '@mui/material';

import { datagridStyle } from 'src/helpers/style.helper';

/**
 * @typedef {import("src/repositories/broadcastOptionTemplate").BroadcastOptionTemplate} BroadcastOptionTemplate
 */

/**
 * @typedef {Object} Props
 * @property {BroadcastOptionTemplate[]} items
 * @property {(data: BroadcastOptionTemplate) => void} onEdit
 * @property {(data: BroadcastOptionTemplate) => void} onRemove
 */

export const BroadcastProfileData = {
  Table: DataTable,
  Mobile,
};

/** @param {Props} props */
function Mobile({ items, onEdit, onRemove }) {
  return items.map((item, i) => (
    <div key={i} className="tw-ring-1 tw-ring-slate-500 tw-rounded-lg tw-w-full">
      <Accordion className="tw-w-full">
        <AccordionSummary className="tw-w-full">
          <Stack spacing={1} className="tw-w-full">
            <div className="tw-flex tw-flex-wrap tw-items-center tw-justify-end tw-gap-2">
              {item.billingStatus.map((status) => (
                <BillingChip key={status} billingStatus={status} />
              ))}
            </div>
            <Divider />
            <span className="tw-text-xs">{item.name}</span>
          </Stack>
        </AccordionSummary>
        <AccordionDetails>
          <LabelColumn item={item} />
        </AccordionDetails>
        <AccordionActions>
          <Stack direction="row" spacing={1}>
            <Tooltip title="Edit Profile">
              <IconButton onClick={() => onRemove?.(item)} color="error">
                <Iconify icon="mdi:close" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Hapus Profile">
              <IconButton onClick={() => onEdit?.(item)} color="primary">
                <Iconify icon="mdi:pencil" />
              </IconButton>
            </Tooltip>
          </Stack>
        </AccordionActions>
      </Accordion>
    </div>
  ));
}

/** @param {Props} props */
function DataTable({ items, onEdit, onRemove }) {
  /** @type {BroadcastOptionTemplate} */
  const item = proxyMapper();

  /** @type {import('@mui/x-data-grid').DataGridProps['columns']} */
  const headers = [
    { field: item.name, headerName: 'Profile', flex: 1 },
    {
      field: item.messageDelay,
      headerName: 'Konfigurasi',
      flex: 1,
      renderCell: ({ row }) => (
        <Stack spacing={1}>
          <span>Pesan Per Sesi: {row[item.messagePerSession]}</span>
          <span>Jeda Pesan: {row[item.messageDelay]} detik</span>
          <span>Jeda Sesi: {row[item.sessionDelay]} detik</span>
        </Stack>
      ),
    },
    {
      field: item.templateName,
      headerName: 'Template',
      flex: 1,
      renderCell: ({ row }) => row[item.templateName] ?? row[item.message] ?? '-',
    },
    {
      field: item.billingStatus,
      headerName: 'Billing',
      flex: 1,
      renderCell: ({ row }) => (
        <div className="tw-flex tw-flex-wrap tw-py-2 tw-gap-2">
          {row[item.billingStatus].map((status) => (
            <BillingChip key={status} billingStatus={status} />
          ))}
        </div>
      ),
    },
    {
      field: item.whatsappNodes,
      headerName: 'Whatsapp Node',
      flex: 1,
      renderCell: ({ row }) => (
        <div className="tw-flex tw-flex-wrap tw-py-2 tw-gap-2">
          {row[item.whatsappNodes].map((node) => (
            <Chip key={node._id} label={node.title} size="small" className="tw-mr-1 tw-mb-1" />
          ))}
        </div>
      ),
    },
    {
      field: 'action',
      headerName: '',
      width: 120,
      renderCell: ({ row }) => (
        <Stack direction="row" spacing={1}>
          <Tooltip title="Edit Profile">
            <IconButton onClick={() => onEdit?.(row)} color="primary">
              <Iconify icon="mdi:pencil" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Hapus Profile">
            <IconButton onClick={() => onRemove?.(row)} color="error">
              <Iconify icon="mdi:close" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ];

  return (
    <div style={{ width: '100%', height: '600px' }}>
      <DataGrid
        columns={headers}
        rows={items}
        getRowHeight={() => 'auto'}
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: 10,
            },
          },
        }}
        disableColumnMenu
        pageSizeOptions={[10, 25, 50]}
        getRowClassName={() => 'tw-text-xs'}
        sx={{
          ...datagridStyle.verticalCenter,
          ...datagridStyle.disabledHover,
          ...datagridStyle.disabledSelected,
        }}
      />
    </div>
  );
}

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
    <Stack spacing={1}>
      {entries.map((entry) => (
        <Stack key={entry.label} className="tw-flex tw-justify-between tw-text-xs">
          <span>{entry.label}</span>
          <span className="tw-font-semibold">{entry.value}</span>
        </Stack>
      ))}
      <Stack className="tw-flex tw-justify-between tw-text-xs">
        <span>Whatsapp Node</span>
        <ul className="tw-list-disc tw-pl-5">
          {data.whatsappNodes.map((node) => (
            <li key={node._id}>{node.title}</li>
          ))}
        </ul>
      </Stack>
    </Stack>
  );
}
