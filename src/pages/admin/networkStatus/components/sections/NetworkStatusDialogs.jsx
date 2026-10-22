import { ViewerImageDialog } from '@components/viewerImageDialog';
import CustomerDeactivateDialog from '@components/customer/DeactivateDialog';
import HistoryLogMikrotik from '@components/customerEngineer/historyLogMikrotik';
import CustomerTopologyDialog from '@components/areaConfiguration/CustomerTopology';

import TicketFormDialog from 'src/pages/admin/ticket/components/FormDialog';

import TicketHistory from 'src/components/ticket/history';
import AreaPickerFilter from 'src/components/billing/areaPickerFilter';
import CheckStatusMikrotik from 'src/components/customerEngineer/CheckStatusMikrotik';

import OnuChart from '../OnuChart';
import CustomerEngineerFilterDialog from '../FilterDialog';
import HistoryLastdownDialog from '../HistoryLastdownDialog';
import NetworkStatusCustomerDialog from '../CustomerListODPDialog';
import ChangeCustomerSerialNumberDialog from '../ChangeCustomerSerialNumberDialog';
import { UnbindSerialNumberDialog } from '../../unbindSerialNumber/UnbindSerialNumberDialog';

/**
 * Renders all dialogs / overlays used by the page.
 *
 * @param {object} props
 * @param {object} props.refs
 * @param {object} props.state
 * @param {object} props.handlers
 */
export default function NetworkStatusDialogs({ refs, state, handlers }) {
  const {
    showCustomerTicket,
    selectedCustomer,
    showCheckStatus,
    showTopologyCustomerId,
  } = state;
  const { handleClose, setShowCustomerTicket, setShowTopologyCustomerId } = handlers;

  return (
    <>
      <TicketHistory
        customerId={showCustomerTicket}
        onClose={() => {
          setShowCustomerTicket(null);
          handleClose();
        }}
      />
      <CheckStatusMikrotik
        customer={selectedCustomer}
        show={showCheckStatus.value}
        onClose={() => {
          showCheckStatus.onFalse();
          handleClose();
        }}
      />
      <CustomerTopologyDialog
        customerId={showTopologyCustomerId}
        onClose={() => {
          setShowTopologyCustomerId(null);
          handleClose();
        }}
      />
      <TicketFormDialog disabledPickCustomer ref={refs.ticketFormDialogRef} />
      <ViewerImageDialog ref={refs.viewerImageDialogRef} />
      <HistoryLogMikrotik ref={refs.historyLogMikrotikDialogRef} />
      <AreaPickerFilter ref={refs.areaPickerFilterRef} />
      <NetworkStatusCustomerDialog ref={refs.networkStatusCustomerDialog} />
      <CustomerDeactivateDialog ref={refs.deactivateDialogRef} />
      <OnuChart ref={refs.onuChartRef} />
      <HistoryLastdownDialog ref={refs.historyLastdownRef} />
      <ChangeCustomerSerialNumberDialog ref={refs.changeCustomerSerialNumberRef} />
      <UnbindSerialNumberDialog ref={refs.unbindSerialNumberDialogRef} />
      <CustomerEngineerFilterDialog ref={refs.filterDialogRef} />
    </>
  );
}
