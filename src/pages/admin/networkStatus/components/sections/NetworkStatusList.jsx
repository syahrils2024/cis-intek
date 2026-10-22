import Overloading from '@components/overloading';

import { TablePagination } from '@mui/material';

import Tablev2 from 'src/components/customerEngineer/tablev2';
import MobileV2 from 'src/components/customerEngineer/mobilev2';

/**
 * Renders the customer list (mobile cards or desktop table) plus pagination.
 *
 * @param {object} props
 * @param {boolean} props.isMobile
 * @param {{ value: boolean }} props.loading
 * @param {any[]} props.subscription
 * @param {string} props.order
 * @param {string} props.orderBy
 * @param {number} props.total
 * @param {number} props.page
 * @param {number} props.limit
 * @param {(event: any, data: any) => void} props.onShowMenu
 * @param {(event: any, data: any) => void} props.onShowTopology
 * @param {object} props.acsDialog
 * @param {object} props.refs
 * @param {(event: any, value: number) => void} props.onPageChange
 * @param {(event: any) => void} props.onRowsPerPageChange
 * @param {object} props.actions
 */
export default function NetworkStatusList({
  isMobile,
  loading,
  subscription,
  order,
  orderBy,
  total,
  page,
  limit,
  onShowMenu,
  onShowTopology,
  acsDialog,
  refs,
  onPageChange,
  onRowsPerPageChange,
  actions,
}) {
  return (
    <>
      <Overloading loading={loading.value} />
      {isMobile ? (
        subscription.map((s, i) => (
          <MobileV2
            key={i}
            subscription={s}
            onShowMenu={onShowMenu}
            clickTopology={(e, sub) => onShowTopology(sub)}
            clickHistory={() => {
              refs.historyLogMikrotikDialogRef.current?.open(s._id);
            }}
            clickAcs={(e, sub) => acsDialog.open(sub._id)}
            onRefreshConnection={(e, variant) => actions.onRefreshConnection(s, variant)}
            onOdpClick={(sub) => actions.onOdpClick(sub)}
            onHybridRefreshConnection={() => {
              actions.onRefreshConnection(s, 'onu');
              actions.onRefreshConnection(s, 'pppoe');
            }}
            onShowHistoryDataOLT={() => {
              refs.onuChartRef.current?.open(s._id);
            }}
            onShowHistoryLastdown={() => {
              refs.historyLastdownRef.current?.open(s._id);
            }}
            onRebootOnu={() => actions.onRebootOnu(s)}
          />
        ))
      ) : (
        <Tablev2
          subscription={subscription}
          onAction={onShowMenu}
          overlayOrder={order}
          overlayOrderBy={orderBy}
          clickTopology={(e, s) => onShowTopology(s)}
          clickHistory={(e, s) => {
            refs.historyLogMikrotikDialogRef.current?.open(s._id);
          }}
          clickAcs={(e, s) => acsDialog.open(s._id)}
          onRefreshConnection={(s, variant) => actions.onRefreshConnection(s, variant)}
          onOdpClick={(s) => actions.onOdpClick(s)}
          onChangeSort={actions.onChangeSort}
          onHybridRefreshConnection={(s) => {
            actions.onRefreshConnection(s, 'onu');
            actions.onRefreshConnection(s, 'pppoe');
          }}
          onShowHistoryDataOLT={(s) => {
            refs.onuChartRef.current?.open(s._id);
          }}
          onShowHistoryLastdown={(s) => {
            refs.historyLastdownRef.current?.open(s._id);
          }}
          onChangeSerialNumber={(s) => actions.onChangeSerialNumber(s)}
          onRebootOnu={(s) => actions.onRebootOnu(s)}
        />
      )}

      <TablePagination
        component="div"
        count={total}
        page={page}
        onPageChange={onPageChange}
        rowsPerPage={limit}
        onRowsPerPageChange={onRowsPerPageChange}
      />
    </>
  );
}
