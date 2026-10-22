/**
 * @typedef {import('src/repositories/user').User} User
 */
import { Icon } from '@iconify/react';
import { Iconify } from '@components/iconify';

import {
  Chip,
  Table,
  Stack,
  Button,
  Avatar,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  TableSortLabel,
} from '@mui/material';

import { USER_HEADERS, formatPrivilege } from '../user.helper';

/**
 * @param {Object} props
 * @param {User[]} props.users
 * @param {string} props.orderBy
 * @param {'asc'|'desc'} props.order
 * @param {(key: string) => void} props.onSort
 * @param {(user: User) => void} props.onEdit
 * @param {(user: User) => void} props.onRemove
 * @param {(user: User) => void} props.onToggleLock
 * @param {(userId: string) => void} props.onExportActivity
 * @param {boolean} props.allowEdit
 * @param {object} props.meData - current logged-in user data
 * @param {boolean} props.isDeveloper
 */
export default function UserTable({
  users,
  orderBy,
  order,
  onSort,
  onEdit,
  onRemove,
  onToggleLock,
  onExportActivity,
  allowEdit,
  meData,
  isDeveloper,
}) {
  return (
    <Table>
      <TableHead>
        <TableRow>
          {USER_HEADERS.map((h) => (
            <TableCell key={h.id}>
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
        {users?.map((u, i) => (
          <TableRow key={i} tabIndex={-1}>
            <TableCell>
              <Stack spacing={2} direction="row" alignItems="center">
                <Avatar src="https://api-dev-minimal-v6.vercel.app/assets/images/avatar/avatar-17.webp" />
                <Stack sx={{ typography: 'body2', flex: '1 1 auto', alignItems: 'flex-start' }}>
                  <span className="tw-text-xs tw-font-medium">{u.fullname}</span>
                  <span className="tw-text-xs tw-text-gray-500">{u.email}</span>
                  <span className="tw-text-xs tw-text-gray-500">{u.phone}</span>
                </Stack>
              </Stack>
            </TableCell>
            <TableCell>
              <span className="tw-text-xs tw-font-medium">{u.profileTitle ?? 'Non Profile'}</span>
            </TableCell>
            <TableCell>
              <span className="tw-text-xs tw-font-medium">{u.parentUser ?? '-'}</span>
            </TableCell>
            <TableCell>
              <div className="tw-flex tw-flex-wrap tw-gap-1 tw-mt-2">
                <Chip label={u.status} size="small" className="tw-w-min" />
                {u.locked && (
                  <Chip label="Locked" size="small" color="error" variant="soft" />
                )}
              </div>
            </TableCell>
            <TableCell>
              <div className="tw-flex tw-flex-wrap tw-gap-2 tw-mt-2">
                {u.privilege.map((p, k) => (
                  <Chip key={k} label={formatPrivilege(p)} size="small" />
                ))}
              </div>
            </TableCell>
            <TableCell>
              <Stack spacing={2} direction="row" alignItems="center">
                <Button disabled={!allowEdit} variant="soft" color="info" onClick={() => onEdit(u)}>
                  <Icon icon="material-symbols:edit-outline" className="tw-mr-2" />
                  Edit
                </Button>
                {isDeveloper ? (
                  <Button
                    variant="soft"
                    color={!u.locked ? 'error' : 'success'}
                    onClick={() => onToggleLock(u)}
                  >
                    <Icon
                      icon={
                        !u.locked
                          ? 'material-symbols:lock-outline'
                          : 'material-symbols:lock-open-outline'
                      }
                      className="tw-mr-2"
                    />
                    {!u.locked ? 'Lock' : 'Unlock'}
                  </Button>
                ) : null}
                <Button variant="soft" color="success" onClick={() => onExportActivity(u._id)}>
                  <Icon icon="ph:microsoft-excel-logo-fill" className="tw-mr-2" />
                  Activity
                </Button>
                <Button
                  disabled={meData?._id?.toString() === u._id.toString() || !allowEdit}
                  variant="soft"
                  color="error"
                  onClick={() => onRemove(u)}
                >
                  Hapus
                </Button>
              </Stack>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
