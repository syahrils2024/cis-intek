/**
 * @typedef {import("src/repositories/duoDateCharge").DuoDateCharge} DuoDateCharge
 */

import { Iconify } from '@components/iconify';

import { Table, Button, TableRow, TableBody, TableCell, TableHead } from '@mui/material';

import 'src/extension/number';

/**
 * @param {{data: DuoDateCharge[]; onMenu: (e: Event, data: DuoDateCharge) => void}} param0
 */
export default function DuoDateChargeTable({ data, onMenu }) {
  const headers = ['Nama Denda', 'Nominal Denda', 'Actions'];

  return (
    <Table className="tw-my-4">
      <TableHead>
        <TableRow>
          {headers.map((label) => (
            <TableCell key={label}>{label}</TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {data.map((d, i) => (
          <TableRow key={i}>
            <TableCell>{d.name}</TableCell>
            <TableCell>Rp. {d.charge?.formatCurrency()}</TableCell>
            <TableCell>
              <Button
                size="small"
                onClick={(e) => onMenu(e, d)}
                color="primary"
                variant="contained"
              >
                <Iconify icon="mdi:menu" /> Actions
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
