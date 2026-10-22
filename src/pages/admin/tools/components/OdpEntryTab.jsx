/**
 * @typedef {import("src/repositories/xlsx").CustomerTemplateValidationV2} CustomerTemplateValidationV2
 * @typedef {import('src/repositories/xlsx').OdpEntry} OdpEntry
 */

import { useMemo } from 'react';
import { proxyMapper } from '@utils/proxyMapper';

import { DataGrid } from '@mui/x-data-grid';

import 'src/extension/date';
import 'src/extension/string';
import 'src/extension/number';
import { datagridStyle } from 'src/helpers/style.helper';

/**
 * @param {Object} param0
 * @param {OdpEntry[]} param0.items
 */
export function OdpEntryData({ items }) {
  return <OdpEntryDataTable items={items} />;
}

function OdpEntryDataTable({ items }) {
  const mappedItems = useMemo(() => items.map((item, i) => ({ ...item, id: i })), [items]);

  /** @type {OdpEntry} */
  const item = proxyMapper();

  /** @type {import("@mui/x-data-grid").GridColDef<OdpEntry>} */
  const columns = [
    {
      field: item.name,
      headerName: 'ODP',
      flex: 1,
    },
    {
      field: item.port,
      headerName: 'Port',
      flex: 1,
    },
  ];

  return (
    <div style={{ width: '100%', height: 400 }}>
      <DataGrid
        columns={columns}
        rows={mappedItems}
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
