import { Iconify } from '@components/iconify';

import { Table, Stack, Button, TableRow, TableCell, TableHead, TableBody } from '@mui/material';

/**
 * @typedef {import("src/repositories/addons").AddonsCategory} AddonsCategory
 *
 */

/**
 * @callback ActionsCallback
 * @param {AddonsCategory} data
 */

/**
 * @param {{data: AddonsCategory[]; onRemove: ActionsCallback; onEdit: ActionsCallback}} param0
 */
export default function AddonsCategoryTable({ data, onEdit, onRemove }) {
  const headers = ['Nama', ''];

  return (
    <Table>
      <TableHead>
        <TableRow>
          {headers.map((h) => (
            <TableCell key={h}>{h}</TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {data.map((d, i) => (
          <TableRow key={i}>
            <TableCell>
              <span className="tw-text-xs">{d.category}</span>
            </TableCell>
            <TableCell width={20}>
              <Stack direction="row">
                <Button variant="text" color="error" onClick={() => onRemove(d)}>
                  <Iconify icon="material-symbols:delete-outline" />
                </Button>
                <Button variant="text" color="success" onClick={() => onEdit(d)}>
                  <Iconify icon="material-symbols:edit-outline" />
                </Button>
              </Stack>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
