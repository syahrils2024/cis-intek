import React from 'react';
import { Iconify } from '@components/iconify';

import {
  Chip,
  Paper,
  Table,
  Tooltip,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  IconButton,
  TableContainer,
  type ChipProps,
} from '@mui/material';

import type { ChannelTableProps } from '../../openclaw.types';

const statusColors: Record<string, ChipProps['color']> = {
  connected: 'success',
  disconnected: 'error',
  qr_ready: 'warning',
  'not-linked': 'warning',
  linked: 'success',
  authenticating: 'info',
  unknown: 'default',
};

export default function ChannelTable({
  channels,
  loginChannelId,
  polling,
  onLogin,
  onLogout,
  onDelete,
}: ChannelTableProps) {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Workspace</TableCell>
            <TableCell>Status</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {channels.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} align="center">No channels found</TableCell>
            </TableRow>
          ) : (
            channels.map((channel) => (
              <TableRow key={channel.id}>
                <TableCell>{channel.workspace}</TableCell>
                <TableCell>
                  <Chip
                    label={channel.status}
                    color={statusColors[channel.status] || 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">
                  {['connected', 'linked'].includes(channel.status) ? (
                    <Tooltip title="Logout">
                      <IconButton color="warning" onClick={() => onLogout(channel.id)}>
                        <Iconify icon="mdi:logout" />
                      </IconButton>
                    </Tooltip>
                  ) : (
                    <Tooltip title="Login">
                      <IconButton
                        color="primary"
                        onClick={() => onLogin(channel.id)}
                        disabled={loginChannelId === channel.id && polling}
                      >
                        <Iconify icon="mdi:login" />
                      </IconButton>
                    </Tooltip>
                  )}
                  <Tooltip title="Delete">
                    <IconButton color="error" onClick={() => onDelete(channel.id)}>
                      <Iconify icon="mdi:delete" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
