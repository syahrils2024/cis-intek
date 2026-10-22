/**
 * @typedef {import('src/repositories/area').Odp} Odp
 */
import { Iconify } from '@components/iconify';

import {
  Chip,
  Table,
  Stack,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  IconButton,
  TableSortLabel,
} from '@mui/material';

import { ODP_HEADERS, coloringPort } from '../odpList.helper';

/**
 * @param {Object} props
 * @param {Odp[]} props.items
 * @param {string} props.orderBy
 * @param {'asc'|'desc'} props.order
 * @param {(key: string) => void} props.onSort
 * @param {boolean} props.readOnly
 * @param {(item: Odp) => void} props.onShowCustomer
 * @param {(data: {id: string; name: string}) => void} props.onBroadcast
 * @param {(item: Odp) => void} props.onEdit
 * @param {(item: Odp) => void} props.onRemove
 */
export default function OdpTable({
  items,
  orderBy,
  order,
  onSort,
  readOnly = false,
  onShowCustomer,
  onBroadcast,
  onEdit,
  onRemove,
}) {
  return (
    <Table>
      <TableHead>
        <TableRow>
          {ODP_HEADERS.map((h) => (
            <TableCell key={h.id} sortDirection={h.id === orderBy ? order : false}>
              {h.sortable ? (
                <TableSortLabel
                  direction={orderBy === h.id ? order : 'asc'}
                  onClick={() => onSort(h.id)}
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
                <span className="tw-text-xs tw-text-gray-500">{item.description}</span>
              </Stack>
            </TableCell>
            <TableCell>
              <Stack>
                <span className={`tw-text-xs ${coloringPort(item)}`}>
                  {item.port ?? '?'} Total Port
                </span>
                <span className="tw-text-xs">{item.availablePort ?? '?'} Free Port</span>
              </Stack>
            </TableCell>

            <TableCell>
              <Stack>
                <span className="tw-text-xs">{item.totalCustomers}</span>
              </Stack>
            </TableCell>
            <TableCell>
              <Stack spacing={1}>
                {/* Active */}
                <Chip
                  className="tw-w-min"
                  label={
                    <div className="tw-flex tw-flex-row tw-items-center tw-gap-2">
                      <div className="tw-w-2 tw-h-2 tw-rounded-full tw-bg-success" />
                      <span className="tw-text-xs tw-font-semibold">{item.pppActiveCount}</span>
                      <span className="tw-text-xs tw-uppercase"> Active</span>
                    </div>
                  }
                  size="small"
                  variant="soft"
                  color="success"
                />
                {/* Inactive */}
                <Chip
                  className="tw-w-min"
                  label={
                    <div className="tw-flex tw-flex-row tw-items-center tw-gap-2">
                      <div className="tw-w-2 tw-h-2 tw-rounded-full tw-bg-error" />
                      <span className="tw-text-xs tw-font-semibold">{item.totalCustomers - (item.pppActiveCount ?? 0)}</span>
                      <span className="tw-text-xs tw-uppercase"> Inactive</span>
                    </div>
                  }
                  size="small"
                  variant="soft"
                  color="error"
                />
              </Stack>
            </TableCell>
            <TableCell>
              <div className="tw-flex tw-flex-row">
                <IconButton onClick={() => onShowCustomer(item)}>
                  <Iconify icon="mdi:account-outline" />
                </IconButton>
                <IconButton onClick={() => onBroadcast({ id: item._id, name: item.name })}>
                  <Iconify icon="mdi:send" />
                </IconButton>
                {!readOnly && (
                  <>
                    <IconButton onClick={() => onEdit(item)}>
                      <Iconify icon="mdi:pencil-outline" />
                    </IconButton>
                    <IconButton onClick={() => onRemove(item)}>
                      <Iconify icon="mdi:delete-forever-outline" />
                    </IconButton>
                  </>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
