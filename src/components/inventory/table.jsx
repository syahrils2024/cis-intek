/**
 * @typedef {import("src/repositories/inventory").Inventory} Inventory
 */

import { Icon } from '@iconify/react';
import { changeSorter } from '@utils/sort';
import { connect, useDispatch } from 'react-redux';

import {
  Table,
  Stack,
  Button,
  TableRow,
  TableHead,
  TableCell,
  TableBody,
  TableSortLabel,
} from '@mui/material';

import { setInventoryStore } from 'src/stores/inventoryStore';

import { Iconify } from 'src/components/iconify';

/**
 *
 * @param {{items: Inventory[], onShowMenu: void; order: string; orderBy: string; readOnly: boolean}} props -- react props
 */
function InventoryTable({ items, onShowMenu, order, orderBy, readOnly = false }) {
  const dispatch = useDispatch();
  const headers = [
    { label: 'Nama Item', id: 'name', sortable: true },
    { label: 'Satuan', id: 'unit', sortable: true },
    { label: 'Stok Digunakan', id: 'usage', sortable: true },
    { label: 'Stok Total', id: 'stock', sortable: true },
    { label: 'Stok Tersedia', id: 'available', sortable: true },
    { label: '', id: '_' },
  ];

  function sort(key) {
    const sortBy = orderBy === key ? changeSorter(order) : 'asc';
    if (key !== orderBy) {
      dispatch(setInventoryStore({ key: 'orderBy', value: key }));
    }
    dispatch(setInventoryStore({ key: 'order', value: sortBy }));
  }

  return (
    <Table>
      <TableHead>
        <TableRow>
          {headers.map((h) => (
            <TableCell key={h.id} sortDirection={h.id === orderBy ? order : false}>
              {h.sortable ? (
                <TableSortLabel
                  direction={orderBy === h.id ? order : 'asc'}
                  onClick={() => sort(h.id)}
                  className="tw-gap-2"
                  IconComponent={() => (
                    <Iconify
                      icon={
                        orderBy === h.id
                          ? order === 'asc'
                            ? 'mdi:menu-up'
                            : 'mdi:menu-down'
                          : 'mdi:menu-up'
                      }
                    />
                  )}
                >
                  {h.label}
                </TableSortLabel>
              ) : (
                h.label
              )}
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {items.map((item, i) => (
          <TableRow key={i}>
            <TableCell>
              <Stack>
                <span className="tw-text-xs tw-font-semibold">{item.name}</span>
                <span className="tw-text-xs">{item.description}</span>
              </Stack>
            </TableCell>
            <TableCell>
              <span className="tw-text-xs">{item.unitType}</span>
            </TableCell>
            {/* <TableCell>
              <Stack spacing={0.5}>
                <div className="tw-flex tw-flex-row tw-gap-2 tw-items-center">
                  <Chip label="Total" color="info" size="small" />{' '}
                  <Typography variant="body1">{item.stock}</Typography>
                </div>
                <div className="tw-flex tw-flex-row tw-gap-2 tw-items-center">
                  <Chip label="Digunakan" color="success" size="small" />{' '}
                  <Typography variant="body1">{item.usage}</Typography>
                </div>
                <div className="tw-flex tw-flex-row tw-gap-2 tw-items-center">
                  <Chip label="Tersisa" color="warning" size="small" />{' '}
                  <Typography variant="body1">{item.available}</Typography>
                </div>
              </Stack>
            </TableCell> */}
            <TableCell>
              <span className="tw-text-xs">{item.usage}</span>
            </TableCell>
            <TableCell>
              <span className="tw-text-xs">{item.stock}</span>
            </TableCell>
            <TableCell>
              <span className="tw-text-xs">{item.available}</span>
            </TableCell>
            {!readOnly && (
              <TableCell>
                <Button
                  onClick={(e) => onShowMenu(e, item)}
                  color="primary"
                  variant="contained"
                  size="small"
                >
                  <Icon icon="ic:baseline-menu" className="tw-mr-2" />
                  Action
                </Button>
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

const mapStateToProps = (state) => {
  const { order, orderBy } = state.inventoryStore;
  return { order, orderBy };
};

export default connect(mapStateToProps)(InventoryTable);
