/**
 * @typedef {import("src/repositories/oltDevice").UnbindSerialNumber} UnbindSerialNumber
 *
 * @typedef {Object} Props
 * @property {UnbindSerialNumber[]} data
 * @property {(item: UnbindSerialNumber) => void} onBind
 */

import { Iconify } from '@components/iconify';
import { proxyMapper } from '@utils/proxyMapper';
import { useMemo, useState, useEffect } from 'react';

import { DataGrid } from '@mui/x-data-grid';
import {
  Stack,
  Tooltip,
  Accordion,
  IconButton,
  TablePagination,
  AccordionSummary,
  AccordionActions,
  AccordionDetails,
} from '@mui/material';

import { datagridStyle } from 'src/helpers/style.helper';

export const UnbindSerialNumberData = {
  Table: UnbindSerialNumberDataTable,
  Mobile: UnbindSerialNumberMobile,
};

/** @param {Props} props */
function UnbindSerialNumberDataTable({ data, onBind }) {
  /** @type {UnbindSerialNumber} */
  const item = proxyMapper();

  /** @type {import('@mui/x-data-grid').GridColDef<UnbindSerialNumber>[]} */
  const columns = [
    {
      field: item.SerialNumber,
      headerName: 'Serial Number',
      flex: 1,
      valueFormatter: (value) => value.toString().toUpperCase(),
    },
    {
      field: item.OltAddress,
      headerName: 'OLT Address',
      flex: 1,
      renderCell: ({ row }) => (
        <span>
          {row.OltAddress}:{row.OltPort}
        </span>
      ),
    },
    {
      field: item.OltName,
      headerName: 'OLT Name',
      flex: 1,
      renderCell: ({ row }) => (
        <Stack>
          <span>{row.OltName}</span>
          <span>{row.OltModel}</span>
        </Stack>
      ),
    },
    {
      field: 'action',
      headerName: '',
      width: 20,
      renderCell: ({ row }) => (
        <Tooltip title="Bind Customer">
          <IconButton color="primary" onClick={() => onBind(row)}>
            <Iconify icon="lsicon:user-leave-filled" />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  return (
    <div style={{ width: '100%', height: 450 }} className="tw-text-xs">
      <DataGrid
        columns={columns}
        rows={data}
        columnBufferPx={10}
        getRowClassName={() => 'tw-text-xs tw-bg-white'}
        pageSizeOptions={[10, 25, 50]}
        disableColumnMenu
        getRowHeight={() => 'auto'}
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: 10,
            },
          },
        }}
        sx={{
          ...datagridStyle.verticalCenter,
          ...datagridStyle.disabledHover,
          ...datagridStyle.disabledSelected,
        }}
      />
    </div>
  );
}

/** @param {Props} props */
function UnbindSerialNumberMobile({ data, onBind }) {
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);

  const paginatedData = useMemo(() => {
    const start = page * limit;
    return data.slice(start, start + limit);
  }, [data, page, limit]);

  useEffect(() => {
    setPage(0);
  }, [data]);

  return (
    <Stack spacing={1}>
      {paginatedData.map((item, index) => (
        <div key={index} className="tw-ring-1 tw-ring-gray-400 tw-rounded-lg">
          <Accordion>
            <AccordionSummary>
              <span className="tw-text-xs">{item.SerialNumber.toUpperCase()}</span>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={1} className="tw-text-xs">
                <div>
                  <strong>OLT Address:</strong> {item.OltAddress}:{item.OltPort}
                </div>
                <div>
                  <strong>OLT Name:</strong> {item.OltName}
                </div>
                <div>
                  <strong>OLT Model:</strong> {item.OltModel}
                </div>
              </Stack>
            </AccordionDetails>
            <AccordionActions>
              <Tooltip title="Bind Customer">
                <IconButton color="primary" onClick={() => onBind(item)}>
                  <Iconify icon="lsicon:user-leave-filled" />
                </IconButton>
              </Tooltip>
            </AccordionActions>
          </Accordion>
        </div>
      ))}
      <TablePagination
        component="div"
        count={data.length}
        page={page}
        onPageChange={(event, newPage) => setPage(newPage)}
        rowsPerPage={limit}
        onRowsPerPageChange={(event) => setLimit(parseInt(event.target.value))}
      />
    </Stack>
  );
}
