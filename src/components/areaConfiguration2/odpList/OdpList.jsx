/**
 * @typedef {import("src/stores/odpStore").OdpStore} OdpStore
 */
import { connect } from 'react-redux';
import DeviceFormDialog from '@components/areaConfiguration/DeviceFormDialog';
import BroadcastRoundrobin from '@components/areaConfiguration/BroadcastRoundrobin';
import { BroadcastMessageDialog } from '@components/areaConfiguration/broadcastMessage';

import { TablePagination } from '@mui/material';

import OdpTable from './components/OdpTable';
import { useOdpListState } from './odpList.state';
import OdpActionMenu from './components/OdpActionMenu';
import OdpMobileSection from './components/OdpMobileSection';
import AreaConfigurationV2CustomerDialog from '../CustomerDialog';

/**
 * @param {OdpStore & {readOnly: boolean}} props
 */
function OdpList({ currentPage, limit, orderBy, order, readOnly = false }) {
  const { state, handlers, refs } = useOdpListState({
    currentPage,
    limit,
    orderBy,
    order,
    readOnly,
  });

  const {
    items,
    totalItems,
    selectedOdp,
    action,
    open,
    anchorEl,
    showOdpForm,
    showCustomerDialog,
    showBroadcastForm,
    isMobile,
  } = state;

  return (
    <div className="tw-flex tw-flex-col tw-gap-2 tw-px-1">
      {isMobile ? (
        items.map((item, i) => (
          <OdpMobileSection
            key={i}
            item={item}
            readOnly={readOnly}
            onShowCustomer={handlers.showCustomer}
            onBroadcast={handlers.showBroadcastDialog}
            onEdit={handlers.onEditOdp}
            onRemove={handlers.onRemoveOdp}
          />
        ))
      ) : (
        <OdpTable
          items={items}
          orderBy={orderBy}
          order={order}
          onSort={handlers.sort}
          readOnly={readOnly}
          onShowCustomer={handlers.showCustomer}
          onBroadcast={handlers.showBroadcastDialog}
          onEdit={handlers.onEditOdp}
          onRemove={handlers.onRemoveOdp}
        />
      )}

      <TablePagination
        component="div"
        count={totalItems}
        page={currentPage}
        onPageChange={handlers.setPage}
        rowsPerPage={limit}
        onRowsPerPageChange={handlers.setLimit}
      />

      <OdpActionMenu
        open={open}
        anchorEl={anchorEl}
        onClose={handlers.closeMenu}
        readOnly={readOnly}
        selectedOdp={selectedOdp}
        onShowCustomer={handlers.showCustomer}
        onEdit={handlers.onEditOdp}
        onRemove={handlers.onRemoveOdp}
      />

      <DeviceFormDialog
        show={showOdpForm.value}
        onClose={handlers.closeOdpForm}
        selectedItem={action === 'edit' ? selectedOdp : undefined}
        onSubmit={handlers.onSubmitODP}
      />
      <AreaConfigurationV2CustomerDialog
        show={showCustomerDialog.value}
        onClose={handlers.closeCustomerDialog}
      />
      <BroadcastMessageDialog
        show={showBroadcastForm.value}
        onClose={handlers.closeBroadcastForm}
        onSubmit={(data) => handlers.onBroadcast(data)}
      />

      <BroadcastRoundrobin ref={refs.broadcastFormRef} />
    </div>
  );
}

const mapStateToProps = (state) => state.odpStore;

export default connect(mapStateToProps)(OdpList);
