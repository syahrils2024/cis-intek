/**
 * @typedef {import("src/repositories/addons").Addons} Addons
 *
 * @callback AddonsCallback
 * @param {Addons} addons
 */

import { Iconify } from '@components/iconify';

import { Table, TableRow, TableCell, TableHead, TableBody, IconButton } from '@mui/material';

/**
 * @param {{data: Addons[]; onEdit: AddonsCallback; onRemove: AddonsCallback; onDuplicate: AddonsCallback}} param0
 */
export default function AddonsTable({ data, onEdit, onRemove, onDuplicate }) {
  const headers = ['Variant', 'Kategori', 'Actions'];

  return (
    <Table>
      <TableHead>
        <TableRow>
          {headers.map((header, i) => (
            <TableCell key={i}>{header}</TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {data.map((d, i) => (
          <TableRow key={i}>
            <TableCell>
              <span className="tw-text-xs">{d.variantName}</span>{' '}
            </TableCell>
            <TableCell>
              <span className="tw-text-xs">{d.category}</span>{' '}
            </TableCell>
            <TableCell width={50}>
              <div className="tw-flex tw-flex-row tw-gap-2">
                <IconButton color="success" onClick={() => onEdit(d)}>
                  <Iconify icon="mdi:pencil" />
                </IconButton>
                <IconButton color="error" onClick={() => onRemove(d)}>
                  <Iconify icon="mdi:trash-can" />
                </IconButton>
                <IconButton color="info" onClick={() => onDuplicate(d)}>
                  <Iconify icon="mdi:content-duplicate" />
                </IconButton>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
