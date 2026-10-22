// @ts-nocheck

/**
 * @typedef {import("@/repositories/customer").CustomerListFromEngineer} CustomerListFromEngineer
 */

import { toast } from 'sonner';
import { copyText } from '@utils/clipboard';
import { goToGoogleMaps } from '@utils/goToMaps';
import { useExpansionToggle } from '@hooks/use-expansion-toggle';

import {
  Chip,
  Button,
  Divider,
  Accordion,
  AccordionDetails,
  AccordionSummary,
} from '@mui/material';

import 'src/extension/date';
import 'src/extension/string';
import 'src/extension/number';

/**
 * @param {{customers: CustomerListFromEngineer[], onClick: (data: CustomerListFromEngineer) => void; showKtp: (ktp: string) => void}} param0
 */
export default function CustomerTicketList({ customers, onClick }) {
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

  const expansionPassword = useExpansionToggle();

  return (
    <div className="tw-flex tw-flex-col tw-gap-2">
      {customers.map((c, i) => (
        <button key={i} type="button" onClick={() => onClick(c)} className="tw-w-full tw-text-left">
          <div className="tw-ring-1 tw-ring-gray-300 tw-rounded-lg">
            <Accordion>
              <AccordionSummary>
                <div className="tw-flex tw-flex-col tw-w-full tw-gap-2">
                  <div className="tw-flex tw-flex-row tw-items-center tw-justify-between tw-w-full">
                    <div className="tw-flex tw-flex-col tw-w-full tw-text-left">
                      <span className="tw-text-xs tw-uppercase tw-text-gray-500">POP / Area</span>
                      <span className="tw-text-xs tw-uppercase tw-font-medium">
                        {c.areaData?.title ?? '-'}
                      </span>
                    </div>
                    <Chip
                      variant="outlined"
                      label={c.isolated ? 'Isolir' : 'Non Isolir'}
                      color={c.isolated ? 'error' : 'success'}
                      size="small"
                      className="tw-w-min tw-mt-2"
                    />
                  </div>
                  <Divider />
                  <div className="tw-flex tw-flex-row tw-items-center tw-gap-2 tw-w-full">
                    {c.ktp ? (
                      <button type="button">
                        <img
                          src={`/public/uploads/${c.ktp.replaceAll('/public/uploads', '')}`}
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
                    <div className="tw-flex tw-flex-col">
                      <span className="tw-text-xs tw-uppercase tw-font-medium">{c.fullname}</span>
                      <span className="tw-text-xs tw-uppercase tw-text-gray-500">
                        {c.customerId}
                      </span>
                      <span className="tw-text-xs tw-uppercase tw-text-gray-500">{c.phone}</span>
                      <span className="tw-text-xs tw-uppercase tw-font-medium">
                        {c.address ?? '-'}
                      </span>
                    </div>
                  </div>
                </div>
              </AccordionSummary>
              <AccordionDetails>
                <div className="tw-flex tw-flex-col tw-gap-2">
                  <div className="tw-flex tw-flex-col">
                    <span className="tw-text-xs tw-uppercase tw-text-gray-500">Alamat</span>
                    <span className="tw-text-xs tw-uppercase tw-font-medium">
                      {c.address ?? '-'}
                    </span>
                  </div>
                  <Divider />
                  <div className="tw-flex tw-flex-col tw-w-full">
                    <span className="tw-text-xs tw-uppercase tw-text-gray-500">SSID</span>
                    <span className="tw-text-xs tw-uppercase tw-font-medium">
                      {c.routerSsid ?? '-'}
                    </span>
                  </div>
                  <div className="tw-flex tw-flex-col tw-w-full">
                    <span className="tw-text-xs tw-uppercase tw-text-gray-500">Password</span>
                    <span className="tw-text-xs tw-uppercase tw-font-medium">
                      {c.routerPassword}
                    </span>
                  </div>
                  <div className="tw-flex tw-flex-col tw-w-full">
                    <span className="tw-text-xs tw-uppercase tw-text-gray-500">Serial Number</span>
                    <span className="tw-text-xs tw-uppercase tw-font-medium">
                      {c.routerSerialNumber}
                    </span>
                  </div>
                  <div className="tw-flex tw-flex-row tw-items-end">
                    <div className="tw-flex tw-flex-col">
                      <span className="tw-text-xs tw-uppercase tw-text-gray-500">ODP</span>
                      <span className="tw-text-xs tw-uppercase tw-font-medium">
                        {c.odpName ?? '-'}
                      </span>
                    </div>
                    {c.odpData && (
                      <Button
                        variant="text"
                        size="small"
                        color="primary"
                        onClick={() => {
                          onLocationODP(c.odpData);
                        }}
                      >
                        Lokasi
                      </Button>
                    )}
                  </div>
                  <div className="tw-flex tw-flex-col">
                    <span className="tw-text-xs tw-uppercase tw-text-gray-500">VLAN</span>
                    <span className="tw-text-xs tw-uppercase tw-font-medium">{c.vlan ?? '-'}</span>
                  </div>
                  <div className="tw-flex tw-flex-col">
                    <span className="tw-text-xs tw-uppercase tw-text-gray-500">IP Remote</span>
                    <span className="tw-text-xs tw-uppercase tw-font-medium">
                      {c.ipRemote ?? '-'}
                    </span>
                  </div>
                  <div className="tw-flex tw-flex-row tw-items-center">
                    <div className="tw-flex tw-flex-col">
                      <span className="tw-text-xs tw-uppercase tw-text-gray-500">PPPoEName</span>
                      <span className="tw-text-xs tw-uppercase tw-font-medium">
                        {c.pppoeName ?? '-'}
                      </span>
                    </div>
                    <Button
                      variant="text"
                      size="small"
                      color="primary"
                      onClick={() => {
                        copyText(c.pppoeName, 'PPPoE Name disalin');
                      }}
                    >
                      Salin
                    </Button>
                  </div>
                  <div className="tw-flex tw-flex-row tw-items-center">
                    <div className="tw-flex tw-flex-col">
                      <span className="tw-text-xs tw-uppercase tw-text-gray-500">
                        PPPoEPassword
                      </span>
                      <span className="tw-text-xs tw-uppercase tw-font-medium">
                        {c.pppoePassword}
                      </span>
                    </div>
                    <Button
                      variant="text"
                      size="small"
                      color="primary"
                      onClick={() => {
                        copyText(c.pppoePassword, 'PPPoE Password disalin');
                      }}
                    >
                      Salin
                    </Button>
                  </div>
                  <div className="tw-flex tw-flex-col">
                    <span className="tw-text-xs tw-uppercase tw-text-gray-500">Paket</span>
                    <span className="tw-text-xs tw-uppercase tw-font-medium">
                      {c.packageData?.title}
                    </span>
                  </div>
                  <Divider />
                  {c.billingData ? (
                    <div className="tw-flex tw-flex-col tw-mt-2">
                      <span className="tw-text-xs tw-uppercase tw-font-medium">
                        {new Date(
                          c.billingData.year,
                          c.billingData.month
                        ).formatSummaryDateMonthYear()}
                        - Rp. {c.activePackage?.price.formatCurrency()}
                      </span>
                      <span className="tw-text-xs tw-uppercase">
                        {c.billingData.status === 'Paid' ? 'Dibayar' : 'Belum Dibayar'}
                      </span>
                    </div>
                  ) : (
                    <span>Pembayaran Terakhir tidak ditemukan</span>
                  )}
                </div>
              </AccordionDetails>
            </Accordion>
          </div>
        </button>
      ))}
    </div>
  );
}
