// @ts-nocheck
/** @typedef {import("src/repositories/oltDevice").OltDevice} OltDevice */

import { Iconify } from '@components/iconify';

import { DataGrid } from '@mui/x-data-grid';
import {
  Stack,
  Tooltip,
  Accordion,
  IconButton,
  AccordionSummary,
  AccordionDetails,
  AccordionActions,
} from '@mui/material';

/**
 * @typedef {Object} OltDeviceDataProps
 * @property {OltDevice[]} oltDevices - List of OLT devices
 * @property {(item: OltDevice) => void} onDelete - Function to delete an OLT device
 * @property {(item: OltDevice) => void} onEdit - Function to edit an OLT device
 * @property {(item: OltDevice) => void} onQuery - Function to query an OLT device
 * @property {(item: OltDevice) => void} onRebuild - Function to rebuild an OLT device
 */

export const OltDeviceData = {
  Table: DataTable,
  Mobile: MobileData,
};

/** @param {OltDeviceDataProps} props */
function DataTable({ oltDevices, onDelete, onEdit, onQuery, onRebuild }) {
  const columns = [
    { field: 'deviceName', headerName: 'Nama Perangkat', flex: 1 },
    {
      field: 'category',
      headerName: 'Device Type',
      renderCell: (params) => <DeviceType type={params.value} />,
      flex: 1,
    },
    { field: 'deviceModel', headerName: 'Model', flex: 1 },
    { field: 'ipAddress', headerName: 'IP Address', flex: 1 },
    { field: 'port', headerName: 'Port', flex: 1 },
    { field: 'areaTitle', headerName: 'Area', flex: 1 },
    {
      field: 'community',
      headerName: 'Community',
      flex: 1,
      sortable: false,
      renderCell: (params) => (
        <Stack>
          <span>Write: {params.row.communityWrite}</span>
          <span>Read: {params.row.communityRead}</span>
        </Stack>
      ),
    },
    {
      field: 'actions',
      headerName: '',
      width: 200,
      renderCell: ({ row }) => (
        <Stack spacing={1} direction="row">
          <Tooltip title="Hapus">
            <IconButton color="error" onClick={() => onDelete(row)}>
              <Iconify icon="mdi:delete" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit">
            <IconButton color="primary" onClick={() => onEdit(row)}>
              <Iconify icon="mdi:pencil" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Query">
            <IconButton color="success" onClick={() => onQuery(row)}>
              <Iconify icon="mdi:sql-query" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Rebuild Database">
            <IconButton color="warning" onClick={() => onRebuild(row)}>
              <Iconify icon="tabler:database-cog" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ];

  return (
    <DataGrid
      rows={oltDevices}
      columns={columns}
      getRowId={(row) => row._id}
      getRowHeight={() => 'auto'}
      disableColumnResize
      disableColumnFilter
      disableColumnMenu
      initialState={{
        pagination: {
          paginationModel: {
            pageSize: 10,
          },
        },
      }}
      pageSizeOptions={[10, 25, 50, 100]}
      sx={{
        '& .MuiDataGrid-cell': {
          display: 'flex',
          alignItems: 'center',
          py: 1,
        },
      }}
    />
  );
}

/** @param {OltDeviceDataProps} */
function MobileData({ oltDevices, onDelete, onEdit, onQuery, onRebuild }) {
  return oltDevices.map((item, i) => (
    <div className="tw-ring-1 tw-ring-gray-400 tw-rounded-lg" key={i}>
      <Accordion>
        <AccordionSummary>
          <Stack>
            <span className="tw-text-xs tw-font-semibold">{item.deviceName}</span>
            <span className="tw-text-xs tw-font-semibold">
              <DeviceType type={item.category} />
            </span>
            <span className="tw-text-xs">{item.deviceModel}</span>
          </Stack>
        </AccordionSummary>
        <AccordionDetails>
          <Stack spacing={1} className="tw-mb-2">
            <span className="tw-text-xs">IP Address: {item.ipAddress}</span>
            <span className="tw-text-xs">PORT: {item.port}</span>
            <span className="tw-text-xs">Area: {item.areaTitle}</span>
            <span className="tw-text-xs">Community Write: {item.communityWrite}</span>
            <span className="tw-text-xs">Community Read: {item.communityRead}</span>
          </Stack>
        </AccordionDetails>
        <AccordionActions>
          <Stack spacing={1} direction="row">
            <Tooltip title="Hapus">
              <IconButton color="error" onClick={() => onDelete(item)}>
                <Iconify icon="mdi:delete" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Edit">
              <IconButton color="primary" onClick={() => onEdit(item)}>
                <Iconify icon="mdi:pencil" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Query">
              <IconButton color="success" onClick={() => onQuery(item)}>
                <Iconify icon="mdi:sql-query" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Rebuild Database">
              <IconButton color="warning" onClick={() => onRebuild(item)}>
                <Iconify icon="tabler:database-cog" />
              </IconButton>
            </Tooltip>
          </Stack>
        </AccordionActions>
      </Accordion>
    </div>
  ));
}

function DeviceType({ type = 1 }) {
  return (
    {
      1: 'HSGQ',
      2: 'KINGTYPE',
    }[type] || 'Unknown'
  );
}
