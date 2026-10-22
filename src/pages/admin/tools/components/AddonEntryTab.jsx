/**
 * @typedef {import("src/repositories/xlsx").CustomerTemplateValidationV2} CustomerTemplateValidationV2
 * @typedef {import('src/repositories/xlsx').AddonEntry} AddonEntry
 */

import { useMemo } from 'react';
import { proxyMapper } from '@utils/proxyMapper';

import { Stack } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

import 'src/extension/date';
import 'src/extension/string';
import 'src/extension/number';
import { datagridStyle } from 'src/helpers/style.helper';

/**
 * @param {Object} param0
 * @param {AddonEntry[]} param0.items
 */
export function AddonEntryData({ items }) {
  return <AddonEntryDataTable items={items} />;
}

function AddonEntryDataTable({ items }) {
  const mappedItems = useMemo(() => items.map((item, i) => ({ ...item, id: i })), [items]);

  /** @type {AddonEntry} */
  const item = proxyMapper();

  /** @type {import("@mui/x-data-grid").GridColDef<AddonEntry>} */
  const columns = [
    {
      field: item.variantName,
      headerName: 'Addon',
      flex: 1,
      renderCell: ({ row }) => (
        <Stack>
          <span className="tw-text-xs">{row[item.variantName]}</span>
        </Stack>
      ),
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
