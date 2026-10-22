/**
 * @typedef {import("src/repositories/customer").Customer} Customer
 * @typedef {import('src/repositories/area').Odp} Odp
 */

import { toast } from 'sonner';
import { useMemo } from 'react';
import { Icon } from '@iconify/react';
import { copyText } from '@utils/clipboard';
import { Iconify } from '@components/iconify';
import { goToGoogleMaps } from '@utils/goToMaps';
import { usePrivilege } from '@auth/hooks/privileges';
import { useExpansionToggle } from '@hooks/use-expansion-toggle';

import {
  Chip,
  Stack,
  Button,
  Divider,
  Accordion,
  Typography,
  IconButton,
  AccordionDetails,
  AccordionSummary,
  AccordionActions,
} from '@mui/material';

import 'src/extension/date';
import 'src/extension/string';

/**
 * @callback baseCallback
 * @param {Customer} subscription
 */

/**
 * @param {{
 * customer: Customer;
 * onShowMenu: void;
 * iteration: number;
 * onShowKtp: (image: string) => void
 * }} props
 */
export default function CustomerQueueMobileCard({
  customer,
  onShowMenu,
  onOpenMap,
  iteration,
  onShowKtp,
}) {
  const { userId, isEngineer, isAdmin, isNoc, isLo, isDeveloper } = usePrivilege();
  const allowModify = useMemo(() => isAdmin || isNoc || isLo || isDeveloper);
  const showPassword = useExpansionToggle();

  /**
   * Menentukan apakah baris customer dapat dimodifikasi.
   * - Untuk engineer: hanya bila customer ditugaskan ke engineer tsb.
   * - Untuk selain engineer: bila punya izin modifikasi (admin/noc/lo).
   * @param {Customer} customer
   */
  const canModify = (c) => {
    const engineerRule = isEngineer && (c.engineers ?? []).includes(userId);
    return allowModify || engineerRule;
  };

  const chipColor = {
    unconfirmed: 'default',
    processed: 'primary',
    active: 'success',
  };

  const replaceColor = (label) => {
    switch (label) {
      case 'processed':
        return 'primary';
        break;
      case 'active':
        return 'success';
        break;
      case 'unconfirmed':
        return 'warning';
        break;
      case 'waiting_approval':
        return 'error';
        break;
      case 'cancel':
        return 'error';
        break;
      default:
        return 'inherit';
        break;
    }
  };

  const replaceLabel = (label) => {
    switch (label) {
      case 'warning':
        return 'Belum diproses';
        break;
      case 'processed':
        return 'Progress';
        break;
      case 'waiting_approval':
        return 'Menunggu Penyelesaian';
        break;
      default:
        return label;
        break;
    }
  };

  /**
   * @param {Odp} odp
   */
  const onLocationODP = (odp) => {
    if (!odp.lat || !odp.lng) {
      toast.info('Lokasi ODP belum ditentukan');
      return;
    }

    goToGoogleMaps(odp.lat, odp.lng);
  };

  return (
    <div className="tw-ring-1 tw-ring-gray-300 tw-rounded-lg">
      <Accordion>
        <AccordionSummary>
          <div className="tw-flex tw-flex-col tw-gap-2 tw-w-full">
            <div className="tw-flex tw-flex-row tw-items-center tw-justify-between tw-w-full tw-gap-2">
              <div className="tw-flex tw-flex-col">
                <span className="tw-text-xs tw-text-gray-500">POP</span>
                <span className="tw-text-xs tw-font-medium">{customer.areaName ?? '-'}</span>
              </div>
              {canModify(customer) ? (
                <Button
                  onClick={onShowMenu}
                  size="small"
                  color={replaceColor(customer.status)}
                  variant="outlined"
                  className="tw-w-min tw-whitespace-nowrap tw-gap-2"
                >
                  {replaceLabel(customer.status)}
                  {/* <Icon icon="ic:baseline-menu" className="tw-mr-2" width={20} /> */}
                </Button>
              ) : null}
            </div>
            <Divider />
            <div className="tw-flex tw-flex-row tw-justify-between tw-items-start tw-w-full">
              <div className="tw-flex tw-flex-row tw-items-center tw-gap-2">
                <Chip label={iteration} />
                {customer.ktp ? (
                  <button type="button" onClick={() => onShowKtp(customer.ktp)}>
                    <img
                      src={`/public/uploads/${customer.ktp.replaceAll('/public/uploads', '')}`}
                      className="tw-w-16 tw-flex-none tw-aspect-square tw-rounded-full tw-object-cover tw-object-center"
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
                    className="tw-w-16 tw-flex-none tw-aspect-square tw-rounded-full tw-object-cover tw-object-center"
                    alt="KTP"
                  />
                )}
                <div className="tw-flex tw-w-full">
                  <Stack>
                    <Typography variant="overline">{customer.fullname}</Typography>
                    <Typography variant="caption">{customer.customerId}</Typography>
                  </Stack>
                </div>
              </div>
            </div>
          </div>
        </AccordionSummary>
        <AccordionDetails>
          <Stack spacing={1}>
            <div className="tw-flex tw-flex-col">
              <span className="tw-text-xs tw-text-gray-500">Alamat</span>
              <span className="tw-text-xs tw-font-medium">{customer.address ?? '-'}</span>
            </div>
            <div className="tw-flex tw-flex-col">
              <span className="tw-text-xs tw-text-gray-500">Nomor</span>
              <span className="tw-text-xs tw-font-medium">{customer.phone ?? '-'}</span>
            </div>
            <div className="tw-flex tw-flex-col">
              <span className="tw-text-xs tw-text-gray-500">Running Time</span>
              <span className="tw-text-xs tw-font-medium">
                {customer.createdAt?.toDate().formatSummaryDate() ?? '-'}
              </span>
              <span className="tw-text-xs tw-font-medium">
                {customer.createdAt?.toDate().getDistanceFormat() ?? '-'}
              </span>
            </div>
            <div className="tw-flex tw-flex-col">
              <span className="tw-text-xs tw-text-gray-500">Input By</span>
              <span className="tw-text-xs tw-font-medium">{customer.marketingFullname ?? '-'}</span>
            </div>
            <Divider />
            <div className="tw-flex tw-flex-col">
              <span className="tw-text-xs tw-text-gray-500">GPON SN</span>
              <span className="tw-text-xs tw-font-medium">
                {customer.routerSerialNumber ?? '-'}
              </span>
            </div>
            <div className="tw-flex tw-flex-col">
              <span className="tw-text-xs tw-text-gray-500">ONU MAC</span>
              <span className="tw-text-xs tw-font-medium">{customer.routerMac ?? '-'}</span>
            </div>
            <div className="tw-flex tw-flex-col">
              <span className="tw-text-xs tw-text-gray-500">SSID</span>
              <span className="tw-text-xs tw-font-medium">{customer.routerSsid ?? '-'}</span>
            </div>
            <div className="tw-flex tw-flex-row tw-items-center">
              <div className="tw-flex tw-flex-col">
                <span className="tw-text-xs tw-text-gray-500">Password</span>
                <span className="tw-text-xs tw-font-medium">
                  {showPassword.isIncludes(customer._id)
                    ? customer.routerPassword ?? '-'
                    : '******'}
                </span>
              </div>
              <IconButton onClick={() => showPassword.toggle(customer._id)}>
                <Iconify
                  icon={showPassword.isIncludes(customer._id) ? 'mdi:eye' : 'mdi:eye-off-outline'}
                />
              </IconButton>
            </div>

            <Divider />

            <div className="tw-flex tw-flex-row tw-items-end tw-gap-2">
              <div className="tw-flex tw-flex-col">
                <span className="tw-text-xs tw-text-gray-500">ODP</span>
                <span className="tw-text-xs tw-font-medium">{customer.odpName ?? '-'}</span>
              </div>
              <Button
                variant="text"
                size="small"
                color="primary"
                onClick={() => {
                  onLocationODP(customer.ODPDetail);
                }}
              >
                Lokasi
              </Button>
            </div>
            <div className="tw-flex tw-flex-col">
              <span className="tw-text-xs tw-text-gray-500">VLAN</span>
              <span className="tw-text-xs tw-font-medium">{customer.vlan ?? '-'}</span>
            </div>
            <div className="tw-flex tw-flex-col">
              <span className="tw-text-xs tw-text-gray-500">IP Remote</span>
              <span className="tw-text-xs tw-font-medium">{customer.ipRemote ?? '-'}</span>
            </div>
            <div className="tw-flex tw-flex-row tw-items-center">
              <div className="tw-flex tw-flex-col">
                <span className="tw-text-xs tw-text-gray-500">PPPoEName</span>
                <span className="tw-text-xs tw-font-medium">{customer.pppoeName ?? '-'}</span>
              </div>
              <Button
                variant="text"
                size="small"
                color="primary"
                onClick={() => {
                  copyText(customer.pppoeName, 'PPPoE Name disalin');
                }}
              >
                Salin
              </Button>
            </div>
            <div className="tw-flex tw-flex-row tw-items-center">
              <div className="tw-flex tw-flex-col">
                <span className="tw-text-xs tw-text-gray-500">PPPoEPassword</span>
                <span className="tw-text-xs tw-font-medium">{customer.pppoePassword}</span>
              </div>
              <Button
                variant="text"
                size="small"
                color="primary"
                onClick={() => {
                  copyText(customer.pppoePassword, 'PPPoE Password disalin');
                }}
              >
                Salin
              </Button>
            </div>
            {customer.status === 'processed' && (
              <div className="tw-flex tw-flex-col">
                <span className="tw-text-xs tw-text-gray-500">Teknisi</span>
                <p className="tw-text-xs tw-font-medium">
                  {customer.engineersData?.map((e) => e.fullname).join(', ') ??
                    customer.engineerName}
                </p>
              </div>
            )}
          </Stack>
        </AccordionDetails>
        <AccordionActions>
          <Button onClick={() => onShowKtp(customer.ktp)} size="small" variant="outlined">
            <Icon icon="mdi:id-card-outline" fontSize={16} className="tw-mr-2" />{' '}
            <span className="tw-text-gray-500">KTP</span>
          </Button>
          <Button onClick={() => onOpenMap(customer)} size="small" variant="outlined">
            <Icon icon="logos:google-maps" fontSize={16} className="tw-mr-2" />{' '}
            <span className="tw-text-gray-500">Lokasi</span>
          </Button>
          {/* {(isEngineer
            ? (customer.engineers ?? []).includes(userId) || customer.engineer === userId
            : isAdmin) && (
            <Button onClick={onShowMenu} size="small" color="primary" variant="outlined">
              <Icon icon="ic:baseline-menu" fontSize={16} className="tw-mr-2" /> Action
            </Button>
          )} */}
        </AccordionActions>
      </Accordion>
    </div>
  );
}
