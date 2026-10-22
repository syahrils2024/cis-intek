/**
 * @typedef {import("src/stores/customerEngineerStoreV2").CustomerEngineerV2Store} CustomerEngineerStoreV2
 */

import { useMemo } from 'react';
import { connect, useDispatch } from 'react-redux';
import { usePrivilege } from '@auth/hooks/privileges';

import { useTheme, useMediaQuery } from '@mui/material';

import { useAcsDialog } from 'src/globalComponents/acsDialog/useAcsDialog';
import { setCustomerEngineerV2Store } from 'src/stores/customerEngineerStoreV2';

import { useCustomerEngineerV2State } from './customerEngineerV2.state';
import NetworkStatusList from './components/sections/NetworkStatusList';
import NetworkStatusMenu from './components/sections/NetworkStatusMenu';
import NetworkStatusCards from './components/sections/NetworkStatusCards';
import NetworkStatusFilter from './components/sections/NetworkStatusFilter';
import NetworkStatusHeader from './components/sections/NetworkStatusHeader';
import NetworkStatusDialogs from './components/sections/NetworkStatusDialogs';

/**
 *
 * @param {CustomerEngineerStoreV2} props -- react props
 */
function CustomerEngineerV2(props) {
  const {
    limit,
    page,
    total,
    subscription,
    search,
    selectedAreaId,
    selectedAreaName,
    selectedUserStatus,
    isolated,
    order,
    orderBy,
    pppActive,
    pppInactive,
    totalIsolated,
    totalUnisolated,
    differenceNetworkConfiguration,
  } = props;

  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { isAdmin, isNoc } = usePrivilege();
  const allowModify = useMemo(() => isAdmin || isNoc);
  const acsDialog = useAcsDialog();

  const { state, handlers, refs } = useCustomerEngineerV2State(props, dispatch);

  const {
    loading,
    showTopologyCustomerId,
    showCustomerTicket,
    selectedCustomer,
    anchorEl,
    showCheckStatus,
    open,
  } = state;

  const {
    debounceFind,
    openFilterDialog,
    openCustomerOdp,
    handlerSetPage,
    handlerSetLimit,
    openTicketForm,
    refreshConnection,
    filterArea,
    openCustomerDeactivateDialog,
    handleChangeSerialNumber,
    rebootOnu,
    handleClick,
    handleClose,
    unbindSerialNumber,
    setShowTopologyCustomerId,
    setShowCustomerTicket,
  } = handlers;

  return (
    <div className="tw-flex tw-flex-col tw-p-5">
      <NetworkStatusHeader isMobile={isMobile} unbindSerialNumber={unbindSerialNumber} />

      <NetworkStatusCards
        theme={theme}
        pppActive={pppActive}
        pppInactive={pppInactive}
        totalUnisolated={totalUnisolated}
        totalIsolated={totalIsolated}
      />

      <NetworkStatusFilter
        isMobile={isMobile}
        selectedUserStatus={selectedUserStatus}
        isolated={isolated}
        selectedAreaName={selectedAreaName}
        differenceNetworkConfiguration={differenceNetworkConfiguration}
        search={search}
        dispatch={dispatch}
        onSearchChange={(value) => debounceFind(value)}
        onFilterArea={filterArea}
        onOpenFilterDialog={openFilterDialog}
        searchRef={refs.searchRef}
      />

      <div className="tw-flex tw-flex-col tw-gap-2 tw-relative">
        <NetworkStatusList
          isMobile={isMobile}
          loading={loading}
          subscription={subscription}
          order={order}
          orderBy={orderBy}
          total={total}
          page={page}
          limit={limit}
          onShowMenu={handleClick}
          onShowTopology={(sub) => setShowTopologyCustomerId(sub._id)}
          acsDialog={acsDialog}
          refs={refs}
          onPageChange={handlerSetPage}
          onRowsPerPageChange={handlerSetLimit}
          actions={{
            onRefreshConnection: (s, variant) => refreshConnection(s, variant),
            onOdpClick: (sub) => openCustomerOdp(sub),
            onRebootOnu: (s) => rebootOnu(s),
            onChangeSort: (valueOrder, valueOrderBy) => {
              dispatch(setCustomerEngineerV2Store({ key: 'order', value: valueOrder }));
              dispatch(setCustomerEngineerV2Store({ key: 'orderBy', value: valueOrderBy }));
            },
            onChangeSerialNumber: (s) => handleChangeSerialNumber(s._id),
          }}
        />

        <NetworkStatusMenu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          allowModify={allowModify}
          selectedCustomer={selectedCustomer}
          onOpenTicket={() => openTicketForm(selectedCustomer._id)}
          onDeactivate={() => openCustomerDeactivateDialog(selectedCustomer._id)}
          onHistoryLogMikrotik={() =>
            refs.historyLogMikrotikDialogRef.current?.open(selectedCustomer._id)
          }
        />
      </div>

      <NetworkStatusDialogs refs={refs} state={state} handlers={handlers} />
    </div>
  );
}

const mapStateToProps = (state) => ({
  ...state.customerEngineerStoreV2,
});

export default connect(mapStateToProps)(CustomerEngineerV2);
