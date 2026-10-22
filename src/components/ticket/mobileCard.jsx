/**
 * @typedef {import("src/repositories/ticket").Ticket} Ticket
 */

import { Iconify } from '@components/iconify';

import {
  Chip,
  Button,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  AccordionActions,
} from '@mui/material';

import 'src/extension/date';
import 'src/extension/string';

/**
 * @param {{tickets: Ticket[]; onMenu: (Ticket) => void; showKtp: (ktp: string) => void}} props
 */
export default function ({ tickets, onMenu, showKtp }) {
  const headers = ['Pelanggan', 'Ticket ID', 'Status', 'Teknisi', ''];

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
        waiting_finishing: 'error',
        finish: 'success',
      }[status] ?? 'default';

    return statusColorMapping;
  }

  return tickets.map((ticket, i) => (
    <div key={i} className="tw-ring-1 tw-ring-gray-300 tw-rounded-lg">
      <Accordion>
        <AccordionSummary>
          <div className="tw-flex tw-flex-col tw-gap-2 tw-w-full">
            <div className="tw-flex tw-flex-row tw-items-center tw-justify-between tw-w-full">
              <div className="tw-flex tw-flex-col">
                <span className="tw-font-medium tw-text-xs tw-uppercase">{ticket.areaTitle}</span>
              </div>
              <Chip
                label={replaceLabel(ticket.status)}
                color={replaceLabelColor(ticket.status)}
                size="small"
                variant="soft"
              />
            </div>
            <Divider />
            <div className="tw-flex tw-flex-row tw-items-center tw-gap-2 tw-w-full">
              {ticket.customerKtp ? (
                <button
                  type="button"
                  onClick={() => showKtp(ticket.customerKtp)}
                  className="tw-flex-none"
                >
                  <img
                    src={`/public/uploads/${ticket.customerKtp.replaceAll('/public/uploads', '')}`}
                    className="tw-w-12 tw-flex-none tw-aspect-square tw-rounded-full tw-object-cover tw-object-center"
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
                  className="tw-w-12 tw-flex-none tw-aspect-square tw-rounded-full tw-object-cover tw-object-center"
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
          </div>
        </AccordionSummary>
        <AccordionDetails>
          <div className="tw-flex tw-flex-col tw-gap-2">
            <div className="tw-flex tw-flex-col">
              <span className="tw-text-gray-500 tw-text-xs tw-uppercase">ID Ticket</span>
              <span className="tw-font-medium tw-text-xs tw-uppercase">
                {ticket.ticketId ?? '-'}
              </span>
            </div>
            <div className="tw-flex tw-flex-col">
              <span className="tw-text-gray-500 tw-text-xs tw-uppercase">Created Agent</span>
              <span className="tw-font-medium tw-text-xs tw-uppercase">
                {ticket.createdUserFullname ?? '-'}
              </span>
            </div>
            <div className="tw-flex tw-flex-col">
              <span className="tw-text-gray-500 tw-text-xs tw-uppercase">Jenis Ticket</span>
              <span className="tw-font-medium tw-text-xs tw-uppercase">
                {replaceTicketType(ticket.ticketType)}
              </span>
            </div>
            <div className="tw-flex tw-flex-col">
              <span className="tw-text-gray-500 tw-text-xs tw-uppercase">Telepon</span>
              <span className="tw-font-medium tw-text-xs tw-uppercase">{ticket.customerPhone}</span>
            </div>
            <div className="tw-flex tw-flex-col">
              <span className="tw-text-gray-500 tw-text-xs tw-uppercase">Dibuat</span>
              <span className="tw-font-medium tw-text-xs tw-uppercase">
                {ticket.createdAt?.toDate().format('dd MMM yyyy HH:mm')}
              </span>
            </div>
            <div className="tw-flex tw-flex-col">
              <span className="tw-text-gray-500 tw-text-xs tw-uppercase">Running Time</span>
              <span className="tw-font-medium tw-text-xs tw-uppercase">
                {ticket.createdAt?.toDate().getDistanceFormat()}
              </span>
            </div>
            <div className="tw-flex tw-flex-col">
              <span className="tw-text-gray-500 tw-text-xs tw-uppercase">Keluhan</span>
              <span className="tw-font-medium tw-text-xs tw-uppercase">
                {ticket.description ?? '-'}
              </span>
            </div>
          </div>
        </AccordionDetails>
        <AccordionActions>
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
        </AccordionActions>
      </Accordion>
    </div>
  ));
}
