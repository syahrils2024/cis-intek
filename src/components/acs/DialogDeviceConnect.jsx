import {
  Table,
  TableRow,
  useTheme,
  TableCell,
  TableHead,
  TableBody,
  Accordion,
  useMediaQuery,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';

/**
 * @typedef {import("@/repositories/acs").AcsDeviceConnect} AcsDeviceConnect
 * @param {{devices: AcsDeviceConnect[]}} param0
 */
export default function AcsDialogDeviceConnect({ devices }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  return (
    <div className="tw-flex tw-flex-col tw-gap-4">
      {isMobile ? (
        devices.map((device, i) => <DeviceConnectAccordion key={i} device={device} />)
      ) : (
        <DeviceConnectTable devices={devices} />
      )}
    </div>
  );
}

/**
 *
 * @param {{device: AcsDeviceConnect}} param0
 */
function DeviceConnectAccordion({ device }) {
  return (
    <div className="tw-ring-1 tw-ring-gray-300 tw-rounded-lg tw-uppercase">
      <Accordion>
        <AccordionSummary>
          <div className="tw-flex tw-flex-col">
            <span className="tw-text-xs tw-text-gray-500">{device.ipAddress}</span>
            <span className="tw-text-xs tw-font-semibold">{device.hostName}</span>
          </div>
        </AccordionSummary>
        <AccordionDetails>
          <div className="tw-flex tw-flex-col tw-gap-2">
            <div className="tw-flex tw-flex-col">
              <span className="tw-text-xs tw-text-gray-500">MAC Address</span>
              <span className="tw-text-xs tw-font-semibold">{device.macAddress}</span>
            </div>
            <div className="tw-flex tw-flex-col">
              <span className="tw-text-xs tw-text-gray-500">Type</span>
              <span className="tw-text-xs tw-font-semibold">{device.interfaceType}</span>
            </div>
          </div>
        </AccordionDetails>
      </Accordion>
    </div>
  );
}

/**
 * @param {{devices: AcsDeviceConnect[]}} param0
 */
function DeviceConnectTable({ devices }) {
  const headers = ['No', 'Hostname', 'IP Address', 'Mac Address', 'Type'];

  return (
    <Table className="tw-uppercase">
      <TableHead>
        <TableRow>
          {headers.map((h) => (
            <TableCell key={h}>{h}</TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {devices.map((device, i) => (
          <TableRow key={i}>
            <TableCell>{i + 1}</TableCell>
            <TableCell>{device.hostName}</TableCell>
            <TableCell>{device.ipAddress}</TableCell>
            <TableCell>{device.macAddress}</TableCell>
            <TableCell>{device.interfaceType}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
