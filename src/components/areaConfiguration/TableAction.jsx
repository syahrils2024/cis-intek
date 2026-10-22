/**
 * @typedef {import("src/repositories/customer").Customer} Customer
 */

import { Iconify } from '@components/iconify';
import { usePrivilege } from '@auth/hooks/privileges';

import { Tooltip, IconButton } from '@mui/material';

/**
 * @callback CallbackCustomer
 * @param {Customer} customer
 */

/**
 * @param {{customer: Customer; onEdit: CallbackCustomer; onRemove: CallbackCustomer; onShowTopology: CallbackCustomer; onClickBilling: CallbackCustomer; readOnly: boolean; rewritePPPoE: CallbackCustomer }} param0
 */
export default function CustomerAreaConfigurationTableAction({
  customer,
  onEdit,
  onRemove,
  onShowTopology,
  onClickBilling,
  readOnly = false,
  rewritePPPoE,
}) {
  const { isAdmin, isLo } = usePrivilege();

  return (
    <div className="tw-grid tw-grid-cols-3 tw-whitespace-nowrap tw-gap-1">
      {isAdmin || isLo ? (
        <>
          <Tooltip title="Billing">
            <IconButton className="tw-w-min" onClick={() => onClickBilling(customer)}>
              <Iconify icon="token:idrt" fontSize={24} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Rewrite PPPoE">
            <IconButton className="tw-w-min" onClick={() => rewritePPPoE(customer)}>
              <Iconify icon="codicon:vm-connect" fontSize={24} />
            </IconButton>
          </Tooltip>
        </>
      ) : null}
      <Tooltip title="Topology">
        <IconButton className="tw-w-min" onClick={() => onShowTopology(customer)}>
          <Iconify icon="iconoir:network" fontSize={24} />
        </IconButton>
      </Tooltip>
      {!readOnly ? (
        <>
          <Tooltip title="Edit">
            <IconButton className="tw-w-min" color="success" onClick={() => onEdit(customer)}>
              <Iconify icon="ic:baseline-edit" fontSize={24} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Dismantle">
            <IconButton className="tw-w-min" color="error" onClick={() => onRemove(customer)}>
              <Iconify icon="uiw:stop-o" fontSize={24} />
            </IconButton>
          </Tooltip>
        </>
      ) : null}
    </div>
  );
}
