import { Icon } from '@iconify/react';
import { Iconify } from '@components/iconify';

import {
  Table,
  Stack,
  Button,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  TableSortLabel,
} from '@mui/material';

import { fDateTime } from 'src/utils/format-time';

import { TEMPLATE_HEADERS } from '../notificationTemplate.helper';

/**
 * @param {Object} props
 * @param {import('src/repositories/networkMonitoringNotificationTemplate').NetworkMonitoringNotificationTemplate[]} props.templates
 * @param {string} props.orderBy
 * @param {'asc'|'desc'} props.order
 * @param {(key: string) => void} props.onSort
 * @param {(template: import('src/repositories/networkMonitoringNotificationTemplate').NetworkMonitoringNotificationTemplate) => void} props.onEdit
 * @param {(template: import('src/repositories/networkMonitoringNotificationTemplate').NetworkMonitoringNotificationTemplate) => void} props.onDelete
 */
export default function TemplateTable({ templates, orderBy, order, onSort, onEdit, onDelete }) {
  return (
    <Table>
      <TableHead>
        <TableRow>
          {TEMPLATE_HEADERS.map((h) => (
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
        {templates?.map((t, i) => (
          <TableRow key={t._id || i} tabIndex={-1}>
            <TableCell>
              <span className="tw-text-xs tw-font-medium">{t.templateName}</span>
            </TableCell>
            <TableCell>
              <span className="tw-text-xs tw-text-gray-600 tw-line-clamp-2">
                {t.template}
              </span>
            </TableCell>
            <TableCell>
              <span className="tw-text-xs">{fDateTime(t.createdAt)}</span>
            </TableCell>
            <TableCell>
              <span className="tw-text-xs">{fDateTime(t.updatedAt)}</span>
            </TableCell>
            <TableCell>
              <Stack spacing={1} direction="row" alignItems="center">
                <Button variant="soft" color="info" size="small" onClick={() => onEdit(t)}>
                  <Icon icon="material-symbols:edit-outline" className="tw-mr-1" />
                  Edit
                </Button>
                <Button variant="soft" color="error" size="small" onClick={() => onDelete(t)}>
                  <Icon icon="material-symbols:delete-outline" className="tw-mr-1" />
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
