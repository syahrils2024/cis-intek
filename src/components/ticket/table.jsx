/**
 * @typedef {import("src/repositories/ticket").Ticket} Ticket
 */

import { Iconify } from '@components/iconify';

import {
  Chip,
  Table,
  Stack,
  Button,
  Tooltip,
  TableRow,
  MenuItem,
  TableCell,
  TableHead,
  TableBody,
  TextField,
  TableSortLabel,
} from '@mui/material';

import 'src/extension/date';
import 'src/extension/string';

/**
 * @param {{ticket: Ticket}} param0
 */
function EngineerColumn({ ticket }) {
  const isMorethanThree = ticket.engineers.length > 3;
  return (
    <Stack>
      <ul className="tw-list-disc tw-pl-4">
        {ticket.engineers.slice(0, 3).map((e, j) => (
          <li key={j}>
            <span className="tw-text-xs tw-uppercase tw-font-medium tw-whitespace-nowrap">
              {e.fullname}
            </span>
          </li>
        ))}
      </ul>
      {isMorethanThree ? (
        <Tooltip
          title={
            <ul className="tw-list-disc tw-pl-4">
              {ticket.engineers.slice(3).map((e, j) => (
                <li key={j}>
                  <span className="tw-text-xs tw-uppercase tw-font-medium tw-whitespace-nowrap">
                    {e.fullname}
                  </span>
                </li>
              ))}
            </ul>
          }
        >
          <Button size="small" className="tw-text-xs">
            {ticket.engineers.length - 3} Lainnya
          </Button>
        </Tooltip>
      ) : null}
    </Stack>
  );
}

/**
 * @param {{
 * tickets: Ticket[];
 * onMenu: (Ticket) => void;
 * showKtp: (ktp: string) => void;
 * showLogs: (Ticket) => void;
 * sort: 'asc' | 'desc';
 * sortBy: string;
 * onChangeSort: (sortBy: string, sort: 'asc' | 'desc') => void;
 * dynamicStatus: boolean
 * onChangeStatus: (ticket: Ticket, status: string) => void;
 * onChangeEngineer: (ticket: Ticket) => void;
 * }} props
 */
export default function ({
  tickets,
  onMenu,
  showKtp,
  showLogs,
  sort,
  sortBy,
  onChangeSort,
  dynamicStatus = false,
  onChangeStatus,
  onChangeEngineer,
}) {
  const headers = [
    {
      label: 'Pelanggan',
      sortable: false,
    },
    {
      label: 'Ticket',
      sortable: false,
    },
    {
      label: 'Status',
      sortable: false,
      sortKey: 'status',
    },
    {
      label: 'Teknisi',
      sortable: false,
    },
    {
      label: 'Dibuat',
      sortable: true,
      sortKey: 'createdAt',
    },
    {
      label: 'Logs',
      sortable: false,
      sortKey: 'totalLogs',
    },
    {
      label: 'Running',
      sortable: true,
      sortKey: 'createdAt',
    },
    {
      label: '',
      sortable: false,
    },
  ];

  const statusList = [
    {
      label: 'Pending',
      value: 'pending',
      disabled: false,
    },
    {
      label: 'Processed',
      value: 'processed',
      disabled: false,
    },
    {
      label: 'Request Finish',
      value: 'waiting_finishing',
      disabled: true,
    },
    {
      label: 'Finish',
      value: 'finish',
      disabled: false,
    },
  ];

  function handlerChangeSort(key) {
    if (sortBy === key) {
      const newSort = sort === 'asc' ? 'desc' : 'asc';
      onChangeSort(key, newSort);
    } else {
      onChangeSort(key, 'asc');
    }
  }

  function replaceTicketType(ticketType) {
    const ticketTypeMapping =
      {
        maintenance: 'Perbaikan',
        installation_request: 'Pemasangan',
        other: 'Lainnya',
        problem: 'Kendala Lain',
        internet_trouble: 'Gangguan Internet',
        upgrade_request: 'Upgrade Internet',
        dismaintenance: 'Dismantle',
      }[ticketType] ?? ticketType;

    return ticketTypeMapping;
  }

  function replaceLabel(status) {
    const statusMapping =
      {
        pending: 'Pending',
        processed: 'Processed',
        waiting_finishing: 'Req Finish',
        finish: 'Finish',
      }[status] ?? status;

    return statusMapping;
  }

  function replaceLabelColor(status) {
    const statusColorMapping =
      {
        pending: 'warning',
        processed: 'primary',
        waiting_finishing: 'violet',
        finish: 'success',
      }[status] ?? 'default';

    return statusColorMapping;
  }

  return (
    <Table>
      <TableHead>
        <TableRow>
          {headers.map((h, i) => (
            <TableCell key={i}>
              {h.sortable ? (
                <TableSortLabel
                  direction={sortBy === h.sortKey ? sort : 'asc'}
                  onClick={() => handlerChangeSort(h.sortKey)}
                  className="tw-gap-2"
                  IconComponent={() => (
                    <Iconify
                      icon={
                        sortBy === h.sortKey
                          ? sort === 'asc'
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
        {tickets.map((ticket, i) => (
          <TableRow key={i}>
            <TableCell>
              <div className="tw-flex tw-flex-row tw-gap-2">
                {ticket.customerKtp ? (
                  <button
                    className="tw-w-16 tw-flex-none tw-aspect-square tw-rounded-full tw-object-cover tw-object-center"
                    type="button"
                    onClick={() => showKtp(ticket.customerKtp)}
                  >
                    <img
                      src={`/public/uploads/${ticket.customerKtp.replaceAll('/public/uploads', '')}`}
                      className="tw-w-16 tw-h-16 tw-flex-none tw-aspect-square tw-rounded-full tw-object-cover tw-object-center"
                      alt="KTP"
                      onError={({ currentTarget }) => {
                        currentTarget.onerror = null;
                        currentTarget.src = '/assets/avatar-25.webp';
                      }}
                    />
                  </button>
                ) : (
                  <img
                    src="/assets/avatar-25.webp"
                    className="tw-w-16 tw-h-16 tw-flex-none tw-aspect-square tw-rounded-full tw-object-cover tw-object-center"
                    alt="KTP"
                  />
                )}
                <div className="tw-flex tw-flex-col">
                  <span className="tw-text-xs tw-uppercase tw-font-medium">
                    {ticket.customerFullname} |{' '}
                    <span className="tw-text-xs tw-uppercase tw-text-gray-500">
                      {ticket.customerId}
                    </span>
                  </span>
                  <span className="tw-text-xs tw-uppercase tw-text-gray-500">
                    {ticket.customerPhone}
                  </span>
                  <span className="tw-text-xs tw-uppercase tw-text-gray-500">
                    {ticket.customerIpAddress}
                  </span>
                  <span className="tw-text-xs tw-uppercase tw-text-gray-500">
                    {ticket.customerAddress}
                  </span>
                </div>
              </div>
            </TableCell>
            <TableCell width="20%">
              <div className="tw-flex tw-flex-col">
                <span className="tw-text-xs tw-uppercase tw-font-medium">
                  {ticket.ticketId} - {replaceTicketType(ticket.ticketType)}
                </span>
                <span className="tw-text-xs tw-uppercase tw-text-gray-500">
                  {ticket.description}
                </span>
              </div>
            </TableCell>
            <TableCell>
              {dynamicStatus && !!ticket.status ? (
                <TextField
                  value={ticket.status}
                  onChange={(e) => onChangeStatus(ticket, e.target.value)}
                  size="small"
                  select
                  disabled={ticket.ticketType === 'installation_request'}
                  color={replaceLabelColor(ticket.status)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        border: 'none', // Default
                      },
                      '&:hover fieldset': {
                        border: 'none',
                      },
                      '&.Mui-focused fieldset': {
                        border: 'none', // Removes border on focus
                        boxShadow: 'none',
                      },
                    },
                  }}
                  SelectProps={{
                    // Hide the dropdown arrow
                    IconComponent: () => null,
                    // Optional: disable pointer events if you want to prevent clicking the area
                    sx: {
                      '& .MuiSelect-icon': {
                        display: 'none',
                      },
                    },
                    renderValue: (selected) => (
                      <Chip
                        label={
                          <span className="tw-flex tw-items-center tw-gap-1">
                            {replaceLabel(selected)} <Iconify icon="mdi:menu-down" />
                          </span>
                        }
                        color={replaceLabelColor(selected)}
                        variant="soft"
                        className="tw-w-min"
                        sx={
                          selected === 'waiting_finishing'
                            ? {
                                backgroundColor: '#d5d9fd',
                                color: '#2939AF',
                              }
                            : {}
                        }
                      />
                    ),
                  }}
                >
                  {statusList.map((item) => (
                    <MenuItem key={item.value} value={item.value} disabled={item.disabled}>
                      <Chip
                        label={replaceLabel(item.value)}
                        color={replaceLabelColor(item.value)}
                        size="small"
                        variant="soft"
                        className="tw-w-min"
                        sx={
                          item.value === 'waiting_finishing'
                            ? {
                                backgroundColor: '#d5d9fd',
                                color: '#2939AF',
                              }
                            : {}
                        }
                      />
                    </MenuItem>
                  ))}
                </TextField>
              ) : (
                <Chip
                  label={replaceLabel(ticket.status)}
                  color={replaceLabelColor(ticket.status)}
                  size="small"
                  variant="soft"
                  className="tw-w-min"
                />
              )}
            </TableCell>
            <TableCell>
              <div className="tw-flex tw-flex-col">
                {ticket.engineers?.length <= 0 ? (
                  <Button
                    size="small"
                    color="primary"
                    variant="soft"
                    className="tw-gap-2 tw-max-w-min tw-self-center"
                    onClick={() => onChangeEngineer(ticket)}
                  >
                    <Iconify icon="mdi:plus" /> Teknisi
                  </Button>
                ) : (
                  <EngineerColumn ticket={ticket} />
                )}
              </div>
            </TableCell>
            <TableCell>
              <div className="tw-flex tw-flex-col">
                <span className="tw-text-xs tw-uppercase tw-font-medium tw-whitespace-nowrap">
                  {ticket.createdAt.toDate().format('dd MMM yyyy HH:mm')}
                </span>
                <span className="tw-text-xs tw-uppercase tw-font-medium tw-text-gray-500 tw-whitespace-nowrap">
                  {ticket.createdUserFullname}
                </span>
              </div>
            </TableCell>
            <TableCell>
              <div className="tw-flex tw-flex-col">
                <Chip
                  color="success"
                  variant="soft"
                  label={ticket.totalLogs}
                  onClick={() => showLogs(ticket)}
                  className="tw-w-min"
                />
              </div>
            </TableCell>
            <TableCell>
              <div className="tw-flex tw-flex-col">
                <span className="tw-text-xs tw-uppercase tw-font-medium">
                  {ticket.createdAt.toDate().getDistanceShortFormat()}
                </span>
              </div>
            </TableCell>

            <TableCell>
              <Button
                size="small"
                color="primary"
                variant="contained"
                className="tw-gap-2"
                onClick={(e) => onMenu(e, ticket)}
              >
                <Iconify icon="mdi:menu" />
                Actions
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
