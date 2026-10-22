/**
 * @typedef {import("src/repositories/customer").CustomerTicket} CustomerTicket
 * @typedef {import('src/repositories/customer').Customer} Customer
 */

import { toast } from 'sonner';
import { useBoolean } from '@hooks/use-boolean';
import { useMemo, useState, useEffect } from 'react';

import { Stack, Button, Dialog, DialogTitle, DialogActions, DialogContent } from '@mui/material';

import 'src/extension/date';
import 'src/extension/string';
import { customerRepository } from 'src/repositories';

import TicketLog from './log';

/**
 * @param {{customerId: string; onClose: void}} props -- React props
 */
export default function TicketHistory({ customerId, onClose }) {
  const showDialog = useMemo(() => !!customerId);
  const loading = useBoolean(false);

  /** @type {[CustomerTicket, () => void]} */
  const [selectedTicket, setSelectedTicket] = useState(undefined);

  /** @type {[Customer, void]} */
  const [customer, setCustomer] = useState(null);

  /** @type {[CustomerTicket[], void]} */
  const [histories, setHistories] = useState([]);

  const ticketTypeLabel = {
    installation_request: 'Alur Pemasangan',
    maintenance: 'Perbaikan',
  };

  /**
   * @param {CustomerTicket} ticket
   */
  const showTicketLog = (ticket) => {
    setSelectedTicket(ticket);
  };

  const prefetch = async () => {
    loading.onTrue();
    try {
      const snapshotCustomer = await customerRepository.getCustomer(customerId);
      const snapshot = await customerRepository.getCustomerTicketHistory(customerId);
      setHistories(snapshot);
      setCustomer(snapshotCustomer);
    } catch (error) {
      toast.error(error.message);
    } finally {
      loading.onFalse();
    }
  };

  useEffect(() => {
    if (!customerId) {
      setCustomer(null);
      setHistories([]);
      return;
    }
    prefetch();
  }, [customerId]);

  return (
    <Dialog open={showDialog} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        <Stack>
          <span>Riwayat Ticket</span>
          <span className="tw-text-sm  tw-font-normal">{customer?.fullname}</span>
          <span className="tw-text-xs tw-font-normal">{customer?.customerId}</span>
        </Stack>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} className="tw-py-2">
          {histories.map((h, i) => (
            <button
              key={i}
              className="tw-p-3 tw-ring-2 tw-ring-gray-300 tw-rounded-lg hover:tw-ring-transparent hover:tw-shadow-lg tw-duration-500 tw-flex tw-flex-col"
              onClick={() => showTicketLog(h)}
              type="button"
            >
              <span>{ticketTypeLabel[h.ticketType]}</span>
              <span className="tw-text-xs">{h.createdAt.toDate().formatSummaryDate()}</span>
            </button>
          ))}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button color="error" onClick={onClose}>
          Tutup
        </Button>
      </DialogActions>
      <TicketLog
        onClose={() => setSelectedTicket(undefined)}
        customerId={customerId}
        selectedTicket={selectedTicket}
        ticketId={selectedTicket?._id}
      />
    </Dialog>
  );
}
