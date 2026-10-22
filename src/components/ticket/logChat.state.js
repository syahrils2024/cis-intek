import { toast } from 'sonner';
import { useMemo, useState } from 'react';
import { useBoolean } from '@hooks/use-boolean';

import 'src/extension/number';
import 'src/extension/string';
import { customerRepository } from 'src/repositories';

/**
 * @typedef {import('src/repositories/customer').Customer} Customer
 * @typedef {import('src/repositories/customer').CustomerTicketLog} CustomerTicketLog
 * @typedef {import('src/repositories/customer').CustomerDetail} CustomerDetail
 * @typedef {import('src/repositories/ticket').Ticket} CustomerTicket
 */

export function useTicketLogChatState() {
  /** @type {[CustomerDetail, Function]} */
  const [customer, setCustomer] = useState(null);

  /** @type {[CustomerTicket, Function]} */
  const [ticketDetail, setTicketDetail] = useState(null);

  /** @type {[CustomerTicketLog[], Function]} */
  const [logs, setLogs] = useState([]);

  const show = useBoolean(false);
  const loading = useBoolean(false);

  const customerLabel = useMemo(
    () => ({
      "Ticket ID": ticketDetail?.ticketId ?? '-',
      ID: customer?.customerId ?? '-',
      Pelangan: customer?.fullname ?? '-',
      Whatsapp: customer?.phone ?? '-',
      Alamat: customer?.address ?? '-',
      'Area / POP': customer?.areaName ?? '-',
      ODP: customer?.ODPName ?? '-',
      'Paket Saat ini': customer?.packageData?.title ?? '-',
      'Biaya Bulanan': customer?.activePackage?.price.formatCurrency() ?? '-',
    }),
    [customer]
  );

  /**
   * Load ticket log data
   * @param {string} customerId
   * @param {CustomerTicket} ticket
   */
  async function load(ticket, customerId) {
    loading.onTrue();
    try {
      const snapshotCustomerPromise = customerRepository.getCustomer(customerId);
      const snapshotTicketLogPromise = customerRepository.getCustomerTicketLog(
        customerId,
        ticket._id
      );
      const [snapshotCustomer, snapshotTicketLog] = await Promise.all([
        snapshotCustomerPromise,
        snapshotTicketLogPromise,
      ]);

      setCustomer(snapshotCustomer);
      setTicketDetail(ticket);
      setLogs(snapshotTicketLog);
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
    } finally {
      loading.onFalse();
    }
  }

  function open(customerId, ticket) {
    load(customerId, ticket);
    show.onTrue();
  }

  return {
    state: {
      customer,
      ticketDetail,
      logs,
      show,
      customerLabel,
      loading
    },
    handlers: {
      load,
      open,
    },
  };
}
