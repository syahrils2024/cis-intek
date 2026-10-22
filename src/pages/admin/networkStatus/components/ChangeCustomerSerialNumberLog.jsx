import { Iconify } from '@components/iconify';

import { DataGrid } from '@mui/x-data-grid';
import {
  Stack,
  useTheme,
  Accordion,
  useMediaQuery,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';

import 'src/extension/date';
import 'src/extension/string';

/**
 * @typedef {import('src/repositories/customer').PartialCustomerUpdateLog} PartialCustomerUpdateLog
 * @param {{ items: PartialCustomerUpdateLog[] }} param0
 */
export default function ChangeCustomerSerialNumberLog({ items }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  if (isMobile) return <Mobile items={items} />;

  return <Table items={items} />;
}

/**
 * @param {{ items: PartialCustomerUpdateLog[] }} param0
 */
function Table({ items }) {
  const dataTableColumns = [
    { field: 'userFullname', headerName: 'Agent', flex: 1 },
    {
      field: 'serialNumber',
      headerName: 'Serial Number',
      flex: 1,
      renderCell: (param) => (
        <Stack direction="row" alignContent="center" alignItems="center" spacing={1}>
          <span>{param.row.serialNumber?.from ?? '-'}</span>
          <Iconify icon="mdi:arrow-right" />
          <span>{param.row.serialNumber?.to ?? '-'}</span>
        </Stack>
      ),
    },
    {
      field: 'createdAt',
      headerName: 'Timestamp',
      renderCell: (param) => param.row.createdAt?.toDate().format('dd MMM yyyy HH:mm') ?? '-',
      flex: 1,
    },
  ];

  return (
    <div style={{ height: 400, width: '100%' }}>
      <DataGrid
        rows={items}
        columns={dataTableColumns}
        getRowId={(row) => row._id}
        columnBufferPx={200}
      />
    </div>
  );
}

/**
 * @param {{ items: PartialCustomerUpdateLog[] }} param0
 */
function Mobile({ items }) {
  const dataTableColumns = [
    {
      field: 'userFullname',
      headerName: 'Data',
      flex: 1,
      renderCell: (param) => (
        <div className="tw-w-full tw-my-1 tw-ring-1 tw-ring-gray-500 tw-rounded-lg">
          <Accordion sx={{ width: '100%' }}>
            <AccordionSummary>
              <span className="tw-text-xs">
                {param.row.createdAt?.toDate().format('dd MMM yyyy HH:mm')}
              </span>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={2}>
                <Stack>
                  <span className="tw-text-xs tw-text-gray-500">Serial Number</span>
                  <Stack
                    direction="row"
                    alignContent="center"
                    alignItems="center"
                    spacing={1}
                    className="tw-text-xs"
                  >
                    <span>{param.row.serialNumber?.from ?? '-'}</span>
                    <Iconify icon="mdi:arrow-right" />
                    <span>{param.row.serialNumber?.to ?? '-'}</span>
                  </Stack>
                </Stack>
                <Stack>
                  <span className="tw-text-xs tw-text-gray-500">Agent</span>
                  <span className="tw-text-xs">{param.row.userFullname ?? '-'}</span>
                </Stack>
              </Stack>
            </AccordionDetails>
          </Accordion>
        </div>
      ),
    },
  ];

  return (
    <DataGrid
      rows={items}
      columns={dataTableColumns}
      getRowId={(row) => row._id}
      getRowHeight={() => 'auto'}
      sx={{
        '.MuiDataGrid-row': {
          backgroundColor: 'transparent',
          // Optional: remove hover background color if desired
          '&:hover': {
            backgroundColor: 'transparent',
          },
        },
      }}
      slots={{
        columnHeaders: () => null,
      }}
    />
  );
}
