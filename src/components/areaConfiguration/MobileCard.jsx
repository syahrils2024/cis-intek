/**
 * @typedef {import("src/repositories/customer").Customer} Customer
 */

import { Icon } from '@iconify/react';
import { goToGoogleMaps } from '@utils/goToMaps';
import { usePrivilege } from '@auth/hooks/privileges';

import {
  Chip,
  Button,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionActions,
  AccordionDetails,
} from '@mui/material';
/**
 * @param {{customer: Customer, onEdit: void, onRemove: void; onShowTopology: void; onClickBilling: void; readOnly: boolean;
 * showKtp: (ktp: string) => void; rewritePPPoE: CallbackCustomer
 * }} props
 */

export function AreaConfigurationMobileCard({
  customer,
  onEdit,
  onRemove,
  onShowTopology,
  onClickBilling,
  readOnly = false,
  showKtp,
  rewritePPPoE,
}) {
  const { isAdmin, isLo } = usePrivilege();

  return (
    <div className="tw-ring-1 tw-ring-gray-300 tw-rounded-lg">
      <Accordion>
        <AccordionSummary>
          <div className="tw-flex tw-flex-row tw-gap-2 tw-items-start tw-justify-between tw-w-full">
            {customer.ktp ? (
              <button type="button" onClick={() => showKtp(customer.ktp)}>
                <img
                  src={`/public/uploads/${customer.ktp.replaceAll('/public/uploads', '')}`}
                  className="tw-w-12 tw-aspect-square tw-rounded-full tw-object-cover tw-object-center"
                  alt="KTP"
                  onError={(c) => {
                    c.currentTarget.onerror = null;
                    c.currentTarget.src = '/assets/avatar-25.webp';
                  }}
                />
              </button>
            ) : (
              <img
                src="/assets/avatar-25.webp"
                className="tw-w-12 tw-aspect-square tw-rounded-full tw-object-cover tw-object-center"
                alt="KTP"
              />
            )}
            <div className="tw-flex tw-flex-col tw-w-full">
              <p className="tw-text-sm tw-font-semibold tw-uppercase">{customer.fullname}</p>
              <p className="tw-text-xs tw-text-gray-500 tw-uppercase">{customer.customerId}</p>
              <p className="tw-text-xs tw-text-gray-500 tw-uppercase">{customer.phone}</p>
              {/* <p className="tw-text-xs tw-text-gray-500">{customer.address}</p> */}
            </div>
            {customer.isSpecial && (
              <Chip size="small" label="Spesial" variant="outlined" color="success" />
            )}
          </div>
        </AccordionSummary>
        <AccordionDetails>
          {customer.isSpecial && (
            <Chip
              size="small"
              color="primary"
              label="Pelanggan Spesial"
              variant="outlined"
              className="tw-w-min"
            />
          )}
          <Divider sx={{ marginBottom: 1 }} />
          <div className="tw-flex tw-flex-col tw-gap-3">
            <div className="tw-flex tw-flex-col">
              <p className="tw-text-xs tw-text-gray-500">GPON SN</p>
              <p className="tw-text-xs tw-font-medium">{customer.routerSerialNumber}</p>
            </div>
            <div className="tw-flex tw-flex-col">
              <p className="tw-text-xs tw-text-gray-500">GPON MAC</p>
              <p className="tw-text-xs tw-font-medium">{customer.routerMac}</p>
            </div>
            <div className="tw-flex tw-flex-col">
              <p className="tw-text-xs tw-text-gray-500">SSID</p>
              <p className="tw-text-xs tw-font-medium">{customer.routerSsid}</p>
            </div>
            <div className="tw-flex tw-flex-col">
              <p className="tw-text-xs tw-text-gray-500">Password</p>
              <p className="tw-text-xs tw-font-medium">{customer.routerPassword}</p>
            </div>
            <div className="tw-flex tw-flex-col">
              <p className="tw-text-xs tw-text-gray-500">Area / POP</p>
              <p className="tw-text-xs tw-font-medium">{customer.area?.title ?? '-'}</p>
            </div>
          </div>

          <Divider
            sx={{
              marginY: 1,
            }}
          />
          <div className="tw-flex tw-flex-col tw-gap-0.5">
            <p className="tw-text-xs">{customer.activePackage.package}</p>
            <p className="tw-text-xs tw-text-gray-500">
              Rp. {customer.activePackage?.price.formatCurrency()}
            </p>
            {customer.location?.lat && customer.location?.lng && (
              <Chip
                title="Lokasi"
                label="Lokasi"
                size="small"
                className="tw-w-min"
                onClick={() => {
                  goToGoogleMaps(customer.location.lat, customer.location.lng);
                }}
              />
            )}
          </div>
          <Divider
            sx={{
              marginY: 2,
            }}
          />
          <div className="tw-flex tw-flex-col">
            <p className="tw-text-xs">{customer.ipRemote}</p>
            <Chip
              // color={customer.isolated ? 'primary' : 'error'}
              label={customer.isolated ? 'Isolated' : 'Not Isolated'}
              size="small"
              className="tw-w-min tw-mt-0.5"
            />
          </div>
          <Divider
            sx={{
              marginY: 2,
            }}
          />
          <div className="tw-flex tw-flex-col tw-gap-1.5">
            <p className="tw-text-xs tw-text-gray-500">{customer?.ODPDetail?.name ?? '-'}</p>
            <p className="tw-text-xs tw-text-gray-500">{customer?.vlan ?? '-'}</p>
          </div>
        </AccordionDetails>
        <AccordionActions>
          <div className="tw-flex tw-flex-wrap tw-gap-3">
            {(isAdmin || isLo) && (
              <>
                <Button className="tw-w-min" onClick={onClickBilling}>
                  <Icon icon="token:idrt" fontSize={24} />
                </Button>
                <Button className="tw-w-min" onClick={() => rewritePPPoE(customer)}>
                  <Icon icon="codicon:vm-connect" fontSize={24} />
                </Button>
              </>
            )}
            <Button className="tw-w-min" onClick={onShowTopology}>
              <Icon icon="iconoir:network" style={{ fontSize: 18 }} />
            </Button>

            {!readOnly && (
              <>
                <Button className="tw-w-min" color="success" onClick={onEdit}>
                  <Icon icon="ic:baseline-edit" style={{ fontSize: 18 }} />
                </Button>
                <Button className="tw-w-min" color="error" onClick={onRemove}>
                  <Icon icon="uiw:stop-o" style={{ fontSize: 18 }} />
                </Button>
              </>
            )}
          </div>
        </AccordionActions>
      </Accordion>
    </div>
  );
}
