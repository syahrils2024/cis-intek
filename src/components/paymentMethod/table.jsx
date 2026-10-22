/**
 * @typedef {import("src/repositories/depositMethod").PaymentMethod} PaymentMethod
 */

import { Icon } from '@iconify/react';
import { getBankImagePath } from '@utils/getBankImage';

import {
  Table,
  Stack,
  Button,
  TableRow,
  Checkbox,
  TableCell,
  TableHead,
  TableBody,
} from '@mui/material';

import 'src/extension/string';

/**
 * @param {{items: PaymentMethod[], onEdit: void, onRemove: (data) => void}} props
 */
export default function PaymentMethodTable({ items, onEdit, onRemove }) {
  const headers = [
    'Keterangan',
    'Jenis',
    'Kode',
    'Rekening',
    'Status',
    'Show Android',
    'Otomatis',
    'Manual',
    'Action',
  ];
  return (
    <Table>
      <TableHead>
        <TableRow>
          {headers.map((h, i) => (
            <TableCell key={i}>{h}</TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {items.map((item, i) => (
          <TableRow key={i}>
            <TableCell>
              <span className="tw-text-xs">{item?.title?.toCapitalCase()}</span>
            </TableCell>
            <TableCell>
              <span className="tw-text-xs">{item?.paymentMethod?.toCapitalCase()}</span>
            </TableCell>
            <TableCell>
              <span className="tw-text-xs">{item?.internalCode?.toString().addPadStart(3, '0') ?? '-'}</span>
            </TableCell>
            <TableCell>
              <Stack direction="row" spacing={1}>
                {item.bankName && (
                  <img
                    src={`/assets/bank/${getBankImagePath(item.bankName)}`}
                    alt={item.bankName}
                    className="tw-w-16 tw-object-contain tw-h-auto"
                  />
                )}{' '}
                <Stack>
                  <span className="tw-text-xs">{item?.bankUsername ?? ''}</span>
                  <span className="tw-text-xs">{item?.bankNumber ?? ''}</span>
                </Stack>
              </Stack>
            </TableCell>
            <TableCell>
              <span className="tw-text-xs">{item?.status?.toCapitalCase()}</span>
            </TableCell>
            <TableCell>
              <Checkbox checked={item?.showAndroid ?? false} size="small" readOnly />
            </TableCell>
            <TableCell>
              <Checkbox checked={item?.isAuto} size="small" readOnly />
            </TableCell>
            <TableCell>
              <Checkbox checked={item?.isManual} size="small" readOnly />
            </TableCell>
            <TableCell>
              <div className="tw-flex tw-flex-row tw-gap-2">
                <Button
                  onClick={() => onEdit(item)}
                  variant="text"
                  color="success"
                  size="small"
                  className="tw-flex tw-flex-row tw-gap-2"
                >
                  <Icon icon="material-symbols:edit-outline" fontSize={24} />
                </Button>
                <Button
                  onClick={() => onRemove(item)}
                  variant="text"
                  color="error"
                  size="small"
                  className="tw-flex tw-flex-row tw-gap-2"
                >
                  <Icon icon="material-symbols:delete" fontSize={24} />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
