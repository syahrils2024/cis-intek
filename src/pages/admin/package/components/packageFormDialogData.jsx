/**
 * @typedef {object} AreaItem
 * @property {string} areaId
 * @property {string} areaName
 * @property {string} pppoeName
 */

import { Iconify } from '@components/iconify';

import {
  Stack,
  Table,
  Tooltip,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  IconButton,
} from '@mui/material';

/**
 * @typedef {object} PropsData
 * @property {AreaItem[]} items
 * @property {Function} onRemove
 * @property {Function} onChangePPPoE
 */

export const PackageFormDialogData = {
  Table: DataTable,
};

/**
 * @param {PropsData} param0
 */
export function DataTable({ items, onRemove, onChangePPPoE }) {
  const headers = ['Area / POP', 'Profile'];

  return (
    <Table>
      <TableHead>
        <TableRow>
          {headers.map((header) => (
            <TableCell key={header}>{header}</TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {items.map((areaData, j) => (
          <TableRow key={j}>
            <TableCell>
              <Stack direction="row" alignItems="center">
                <Tooltip title="Hapus Area / POP">
                  <IconButton color="error" onClick={() => onRemove(areaData, j)}>
                    <Iconify icon="mdi:delete" />
                  </IconButton>
                </Tooltip>
                <span className="tw-text-xs">{areaData.areaName}</span>
              </Stack>
            </TableCell>
            <TableCell>
              <Stack direction="row" alignItems="center">
                <Tooltip title="Pilih PPPoE">
                  <IconButton color="primary" onClick={() => onChangePPPoE(areaData, j)}>
                    <Iconify icon="mdi:edit" />
                  </IconButton>
                </Tooltip>
                <span className="tw-text-xs">{areaData.pppoeName}</span>
              </Stack>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
