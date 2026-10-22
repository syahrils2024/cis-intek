import {
  Chip,
  Stack,
  Button,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  AccordionActions,
} from '@mui/material';

import 'src/extension/string';
import 'src/extension/date';

/**
 * @typedef {import("src/stores/installationRequest").InstallationRequestStore} InstallationRequestStore
 * @typedef {import('src/repositories/installation').InstallationRequest} InstallationRequest
 */

/**
 * @param {{requests: InstallationRequest[]; onAction: void; showActions: boolean; showKtp: (ktp: string) => void}} props
 */
export default function InstallationMobileItem({ requests, onAction, showActions, showKtp }) {
  const colorStatus = (status) => {
    switch (status) {
      case 'unconfirmed':
        return 'warning';
      case 'pending':
        return 'primary';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const replaceStatus = (status) => {
    switch (status) {
      case 'pending':
        return 'Request';
      case 'unconfirmed':
        return 'unprocessed';
      default:
        return status;
    }
  };

  return (
    <Stack spacing={1} className="tw-w-full">
      {requests.map((request, i) => (
        <div key={i} className="tw-w-full tw-ring-2 tw-ring-gray-300 tw-rounded-lg">
          <Accordion className="tw-w-full">
            <AccordionSummary>
              <div className="tw-flex tw-flex-col tw-w-full tw-gap-2">
                <div className="tw-flex tw-flex-row tw-items-center tw-justify-between">
                  <div className="tw-flex tw-flex-col">
                    <span className="tw-text-xs tw-text-gray-500">POP - {request.requestedBy}</span>
                    <p className="tw-text-xs tw-font-medium">{request.areaDetail?.title ?? '-'}</p>
                  </div>
                  <Chip
                    label={replaceStatus(request.status).toCapitalCase()}
                    size="small"
                    className="tw-w-min tw-flex-none"
                    variant="outlined"
                    color={colorStatus(request.status)}
                  />
                </div>
                <Divider />
                <div className="tw-flex tw-flex-row tw-items-start tw-justify-between tw-w-full tw-gap-2">
                  {request.ktp ? (
                    <button type="button" onClick={() => showKtp(request.ktp)}>
                      <img
                        src={`/public/uploads/${request.ktp.replaceAll('/public/uploads', '')}`}
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
                  <Stack className="tw-w-full">
                    <span className="tw-text-xs tw-font-semibold tw-uppercase">
                      {request.fullname}
                    </span>
                    <span className="tw-text-xs tw-text-gray-500">{request.phone ?? '-'}</span>
                    <span className="tw-text-xs tw-text-gray-500">{request.address ?? '-'}</span>
                  </Stack>
                </div>
              </div>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={1}>
                <div className="tw-flex tw-flex-col">
                  <span className="tw-text-xs tw-text-gray-500">Paket</span>
                  <p className="tw-text-xs tw-font-medium">{request.package?.title ?? '-'}</p>
                </div>
                <div className="tw-flex tw-flex-col">
                  <span className="tw-text-xs tw-text-gray-500">ODP</span>
                  <p className="tw-text-xs tw-font-medium">{request.odpDetail?.name ?? '-'}</p>
                </div>
                <div className="tw-flex tw-flex-col">
                  <span className="tw-text-xs tw-text-gray-500">Serial Number</span>
                  <p className="tw-text-xs tw-font-medium">{request.routerSerialNumber ?? '-'}</p>
                </div>
                <div className="tw-flex tw-flex-col">
                  <span className="tw-text-xs tw-text-gray-500">SSID</span>
                  <p className="tw-text-xs tw-font-medium">{request.routerSsid ?? '-'}</p>
                </div>
                <div className="tw-flex tw-flex-col">
                  <span className="tw-text-xs tw-text-gray-500">Password</span>
                  <p className="tw-text-xs tw-font-medium">{request.routerPassword ?? '-'}</p>
                </div>
                <Divider />
                {/* <div className="tw-flex tw-flex-col">
                  <span className="tw-text-xs tw-text-gray-500">Permintaan oleh:</span>
                  <span className="tw-text-xs tw-font-medium">{request.requestedBy}</span>
                </div> */}
                <div className="tw-flex tw-flex-col">
                  <span className="tw-text-xs tw-text-gray-500">Tanggal :</span>
                  <span className="tw-text-xs tw-font-medium">
                    {request.createdAt.toDate().formatSummaryDate()}
                  </span>
                </div>
              </Stack>
            </AccordionDetails>
            {showActions && (
              <AccordionActions>
                <Button color="primary" variant="contained" onClick={(e) => onAction(e, request)}>
                  Action
                </Button>
              </AccordionActions>
            )}
          </Accordion>
        </div>
      ))}
    </Stack>
  );
}
