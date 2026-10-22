/**
 * @typedef {import("src/repositories/subscription").Subscription} Subscription
 */

import { Icon } from '@iconify/react';
import { Iconify } from '@components/iconify';
import { goToGoogleMaps } from '@utils/goToMaps';

import Grid2 from '@mui/material/Unstable_Grid2';
import {
  Chip,
  Stack,
  Alert,
  Button,
  Divider,
  Tooltip,
  Accordion,
  IconButton,
  AccordionDetails,
  AccordionSummary,
  AccordionActions,
} from '@mui/material';

/**
 * @callback baseCallback
 * @param {Event} event
 * @param {Subscription} subscription
 */

/**
 * @param {{
 * subscription: Subscription,
 * onShowMenu: baseCallback
 * onPrint: baseCallback
 * showPrint: boolean
 * showKtp: (ktpPath: string) => void
 * editNote: () => void
 * onRemoveNote: () => void
 * onInvoiceTempClick: (value: string) => void
 * onCancelSystemNote: (subscription) => void
 * }} props
 */
export default function BillingMoileCard({
  subscription,
  onShowMenu,
  onPrint,
  showPrint = true,
  showKtp,
  editNote,
  onRemoveNote,
  onInvoiceTempClick,
  onCancelSystemNote,
}) {
  const isLunas = subscription.billingStatus.toLowerCase() === 'paid';

  return (
    <div className="tw-ring-1 tw-ring-gray-300 tw-rounded-lg">
      <Accordion>
        <AccordionSummary>
          <div className="tw-flex tw-flex-col tw-gap-2 tw-w-full">
            {/* Top Accordion Summary */}
            <div className="tw-flex tw-flex-row tw-items-center tw-justify-between tw-w-full tw-gap-2">
              <div className="tw-flex tw-flex-col">
                <span className="tw-text-xs tw-uppercase tw-font-medium tw-whitespace-nowrap">
                  {subscription.area ?? '-'}
                </span>
              </div>
              <Stack direction="row" spacing={1}>
                {!subscription.note && (
                  <Tooltip title="Catatan">
                    <IconButton variant="soft" size="small" onClick={() => editNote()}>
                      <Iconify icon="ci:note-edit" />
                    </IconButton>
                  </Tooltip>
                )}

                <Button onClick={onShowMenu} color="primary" variant="soft" size="small">
                  <Icon icon="ic:baseline-menu" className="tw-mr-2" />
                  Lain
                </Button>
              </Stack>
            </div>
            {/* End Top Accordion Summary */}
            <Divider />

            <div className="tw-flex tw-flex-row tw-justify-between tw-items-start tw-w-full tw-gap-3">
              {subscription.isSpecial && (
                <Chip
                  size="small"
                  color="primary"
                  label="Pelanggan Spesial"
                  variant="soft"
                  className="tw-w-min"
                />
              )}
              {subscription.customerKtp ? (
                <button type="button" onClick={() => showKtp(subscription.customerKtp)}>
                  <img
                    src={`/public/uploads/${subscription.customerKtp.replaceAll('/public/uploads', '')}`}
                    className="tw-w-16 tw-aspect-square tw-rounded-full tw-object-cover tw-object-center"
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
                  className="tw-w-16 tw-aspect-square tw-rounded-full tw-object-cover tw-object-center"
                  alt="KTP"
                />
              )}
              <div className="tw-flex tw-w-full">
                <Stack spacing={0.3}>
                  <span className="tw-text-xs tw-uppercase tw-font-semibold">
                    {subscription.fullname}
                  </span>
                  <span className="tw-text-xs tw-uppercase tw-text-gray-500">
                    {subscription.customerId}
                  </span>
                  <span className="tw-text-xs tw-uppercase tw-text-gray-500">
                    {subscription.phone}
                  </span>
                  <span className="tw-text-xs tw-uppercase tw-text-gray-500">
                    {subscription.address}
                  </span>
                </Stack>
              </div>
            </div>
            <Divider />
            {!!subscription.note && (
              <Alert
                icon={false}
                severity="warning"
                action={
                  <div className="tw-w-full tw-flex tw-flex-row tw-items-center tw-gap-2">
                    <IconButton
                      type="button"
                      onClick={() => editNote()}
                      size="small"
                      color="success"
                    >
                      <Iconify icon="mdi:pencil" />
                    </IconButton>
                    <IconButton
                      type="button"
                      onClick={() => onRemoveNote()}
                      size="small"
                      color="error"
                    >
                      <Iconify icon="mdi:close" />
                    </IconButton>
                  </div>
                }
              >
                <div className="tw-w-full tw-flex tw-flex-row tw-items-center tw-gap-2">
                  <span className="tw-text-xs tw-w-full">{subscription.note}</span>
                </div>
              </Alert>
            )}
            {!!subscription.systemNote && (
              <Alert
                severity="info"
                className="tw-mt-2"
                action={
                  <IconButton type="button" onClick={onCancelSystemNote} size="small" color="error">
                    <Iconify icon="mdi:close" />
                  </IconButton>
                }
              >
                <Stack>
                  <div className="tw-w-full tw-flex tw-flex-row tw-items-center tw-gap-2">
                    <span className="tw-text-xs tw-w-full">{subscription.systemNote}</span>
                  </div>
                  <span className="tw-text-xs tw-w-full">{subscription.systemNoteBy}</span>
                </Stack>
              </Alert>
            )}
            <Divider />
            <div className="tw-flex tw-flex-wrap tw-items-center tw-justify-between tw-w-full tw-gap-2">
              <div className="tw-flex tw-flex-row tw-gap-2">
                <Chip
                  size="small"
                  color={subscription.billingDebt <= 0 ? 'success' : 'error'}
                  label={subscription.billingDebt <= 0 ? 'Paid' : 'Unpaid'}
                  variant="soft"
                />
                {subscription.duoDate != null &&
                subscription.billingDebt > 0 &&
                new Date().getTime() > subscription.duoDate.toDate().getTime() ? (
                  <Chip
                    label="Jatuh Tempo"
                    color="error"
                    variant="soft"
                    className="tw-w-min"
                    size="small"
                  />
                ) : null}
              </div>
              <div className="tw-flex tw-flex-row tw-gap-2">
                <Chip
                  label={subscription.status.toCapitalCase()}
                  color={subscription.status.toLowerCase() === 'active' ? 'success' : 'error'}
                  className="tw-w-min"
                  size="small"
                  variant="soft"
                />
                <Stack spacing={0.5}>
                  <Tooltip
                    title={
                      subscription.isolatedCode === 'M'
                        ? 'Manual'
                        : subscription.isolatedCode === 'S'
                          ? 'System'
                          : 'Unknown'
                    }
                  >
                    <Chip
                      variant="soft"
                      color={subscription.isolated ? 'error' : 'success'}
                      label={subscription.isolated ? `Isolir` : 'Open'}
                      size="small"
                      className="tw-w-min"
                    />
                  </Tooltip>
                  {subscription.isolatedCode === 'scheduled' ? (
                    <Chip
                      variant="soft"
                      color="warning"
                      label="Schedule Isolir"
                      size="small"
                      className="tw-w-min"
                    />
                  ) : null}
                </Stack>
                {/* {subscription.isolatedCode === 'scheduled' ? (
                  <Chip
                    variant="soft"
                    color="warning"
                    label="Schedule Isolir"
                    size="small"
                    className="tw-w-min"
                  />
                ) : (
                  <Stack spacing={0.5}>
                    <Tooltip
                      title={
                        subscription.isolatedCode === 'M'
                          ? 'Manual'
                          : subscription.isolatedCode === 'S'
                            ? 'System'
                            : 'Unknown'
                      }
                    >
                      <Chip
                        variant="soft"
                        color={subscription.isolated ? 'error' : 'success'}
                        label={subscription.isolated ? `Isolir` : 'Open'}
                        size="small"
                        className="tw-w-min"
                      />
                    </Tooltip>

                    {/* <span className="tw-text-xs tw-uppercase tw-text-gray-500">
                      {subscription.isolatedAt?.toDate().formatSummaryDate()}
                    </span>
                  </Stack>
                )} */}
              </div>
            </div>
          </div>
        </AccordionSummary>
        <AccordionDetails>
          <Stack spacing={2}>
            <Divider />
            <Stack spacing={1}>
              {!!subscription.invoiceTemp ? (
                <button
                  type="button"
                  className="tw-w-min"
                  onClick={() => onInvoiceTempClick(subscription.invoiceTemp)}
                >
                  <Chip
                    size="small"
                    color="warning"
                    label="Req Payment"
                    variant="soft"
                    className="tw-w-min"
                  />
                </button>
              ) : null}
              <div className="tw-flex tw-flex-col">
                <span className="tw-text-xs tw-uppercase tw-text-gray-500">Last Payment</span>
                {subscription.lastInvoiceDate != null && subscription.lastInvoiceAmount != null ? (
                  <Stack>
                    <span className="tw-text-xs tw-uppercase tw-font-medium">
                      Rp. {subscription.lastInvoiceAmount.toString().toNumber().formatCurrency()}
                    </span>
                    <span className="tw-text-xs tw-uppercase tw-font-medium">
                      {subscription.lastInvoiceDate.toDate().formatSummaryDate()}
                    </span>
                  </Stack>
                ) : (
                  <span className="tw-text-xs tw-uppercase tw-text-gray-500">Tidak Ada</span>
                )}
              </div>
              <div className="tw-flex tw-flex-col">
                <span className="tw-text-xs tw-uppercase tw-text-gray-500">Jatuh Tempo</span>
                <span className="tw-text-xs tw-uppercase tw-font-medium">
                  {subscription.duoDate?.toDate().format('EEEE, dd MMM yyyy') ?? '-'}
                </span>
              </div>
              <div className="tw-flex tw-flex-col">
                <span className="tw-text-xs tw-uppercase tw-text-gray-500">Mulai Aktif</span>
                <span className="tw-text-xs tw-uppercase tw-font-medium">
                  {subscription.customerStart?.toDate().formatSummaryDate() ?? '-'}
                </span>
              </div>
              <div className="tw-flex tw-flex-col">
                <span className="tw-text-xs tw-uppercase tw-text-gray-500">SSID</span>
                <span className="tw-text-xs tw-uppercase tw-font-medium">
                  {subscription.routerSsid ?? '-'}
                </span>
              </div>
              <div className="tw-flex tw-flex-col">
                <span className="tw-text-xs tw-uppercase tw-text-gray-500">Password</span>
                <span className="tw-text-xs tw-uppercase tw-font-medium">
                  {subscription.routerPassword ?? '-'}
                </span>
              </div>
              <div className="tw-flex tw-flex-col">
                <span className="tw-text-xs tw-uppercase tw-text-gray-500">Serial Number</span>
                <span className="tw-text-xs tw-uppercase tw-font-medium">
                  {subscription.routerSerialNumber ?? '-'}
                </span>
              </div>
              <div className="tw-flex tw-flex-col">
                <span className="tw-text-xs tw-uppercase tw-text-gray-500">POP</span>
                <span className="tw-text-xs tw-uppercase tw-font-medium">
                  {subscription.area ?? '-'}
                </span>
              </div>
              <div className="tw-flex tw-flex-col">
                <span className="tw-text-xs tw-uppercase tw-text-gray-500">ODP</span>
                <span className="tw-text-xs tw-uppercase tw-font-medium">
                  {subscription.odp ?? '-'}
                </span>
              </div>
              <div className="tw-flex tw-flex-col">
                <span className="tw-text-xs tw-uppercase tw-text-gray-500">VLAN</span>
                <span className="tw-text-xs tw-uppercase tw-font-medium">
                  {subscription.vlan ?? '-'}
                </span>
              </div>
            </Stack>
            <Divider />
            <div className="tw-flex tw-flex-col">
              <span className="tw-text-xs tw-uppercase tw-text-gray-500">Tanggal Isolir</span>
              <span className="tw-text-xs tw-uppercase tw-font-medium">
                {subscription.isolatedAt?.toDate().formatSummaryDate() ?? '-'}
              </span>
            </div>

            <Stack>
              <span className="tw-text-xs tw-uppercase tw-font-medium">{subscription.package}</span>
              <span className="tw-text-xs tw-uppercase tw-text-gray-500">
                Rp. {subscription.price?.formatCurrency()}
              </span>
            </Stack>

            <Stack spacing={1}>
              <Grid2 container spacing={2}>
                <Grid2>
                  <Chip label="Tunggakan" className="tw-w-min" size="small" />
                </Grid2>
                <Grid2>
                  <span className="tw-text-xs tw-uppercase tw-text-gray-500">
                    Rp. {subscription.billingDebt.formatCurrency()}
                  </span>
                </Grid2>
              </Grid2>
            </Stack>
            <Divider />
          </Stack>
        </AccordionDetails>
        <AccordionActions>
          {subscription.location && (
            <Button
              size="small"
              variant="text"
              color="primary"
              className="tw-w-min"
              onClick={() => {
                goToGoogleMaps(subscription.location.lat, subscription.location.lng);
              }}
            >
              Lokasi
            </Button>
          )}

          {showPrint && (
            <Button
              onClick={() => onPrint(subscription)}
              color="primary"
              variant="soft"
              size="small"
            >
              <Icon icon="ph:printer" className="tw-mr-2" />
              Cetak
            </Button>
          )}

          {/* <Button color="error" variant="contained" size="small">
            <Icon icon="ic:baseline-delete" />
            Hapus
          </Button> */}
        </AccordionActions>
      </Accordion>
    </div>
  );
}
