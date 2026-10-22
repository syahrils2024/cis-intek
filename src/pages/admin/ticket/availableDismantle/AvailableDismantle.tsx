// @ts-nocheck
import Overloading from '@components/overloading';
import PaymentDialog from '@components/billing/components/paymentDialog';
import CustomerDeactivateDialog from '@components/customer/DeactivateDialog';

import { Stack, TablePagination } from '@mui/material';

import AvailableDismantleFilter from './components/Filter';
import { AvailableDismantleData } from './components/Data';
import { useAvailableDismantleState } from './availableDismantle.state';

export default function AvailableDismantle() {
  const { handler, state, ref } = useAvailableDismantleState();

  return (
    <Stack className="tw-w-full" spacing={1}>
      <AvailableDismantleFilter
        areaTitle={state.areaTitle}
        onPickArea={handler.pickArea}
        search={state.search}
        onChangeSearch={(value) => handler.setStore({ search: value })}
        packages={state.packageId}
        onChangePackage={(value) => handler.setStore({ packageId: value })}
        minimumAmount={state.minimumAmount}
        setMinimumAmount={(value) => handler.setStore({ minimumAmount: value })}
      />
      {/* Data Content */}
      <div className="tw-relative">
        <Overloading loading={state.loading.value} />
        {state.mobile ? (
          <AvailableDismantleData.Mobile
            items={state.data}
            onBillingForm={handler.openPaymentDialog}
            onDismantleForm={handler.deactivate}
          />
        ) : (
          <AvailableDismantleData.Table
            items={state.data}
            onBillingForm={handler.openPaymentDialog}
            onDismantleForm={handler.deactivate}
          />
        )}
      </div>
      {/* End Data Content */}
      <TablePagination
        component="div"
        count={state.total}
        page={state.page}
        onPageChange={(e, n) => handler.setStore({ page: n })}
        rowsPerPage={state.limit}
        onRowsPerPageChange={(e) => handler.setStore({ limit: parseInt(e.target.value) })}
      />
      {/* Other Component */}
      <PaymentDialog ref={ref.paymentDialogRef} />
      <CustomerDeactivateDialog ref={ref.deactivateDialogRef} />
      {/* End Other Component */}
    </Stack>
  );
}
