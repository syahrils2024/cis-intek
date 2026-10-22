/**
 * @typedef {import("./DialogDeviceConnect").AcsDeviceConnect} AcsDeviceConnect
 */

import {
  Grid,
  Table,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  Accordion,
  AccordionDetails,
  AccordionSummary,
} from '@mui/material';

/**
 * @typedef {Object} Props
 * @property {AcsDeviceConnect[]} items
 */

export const ConnectedDeviceData = {
  Table: ConnectedDeviceDataTable,
  Mobile: ConnectedDeviceMobile,
};

/**
 * @param {Props} props
 */
function ConnectedDeviceMobile({ items }) {
  /** @type {Record<keyof AcsDeviceConnect, string>} */
  const keyOfDetails = {
    macAddress: 'MAC Address',
    rssi: 'RSSI',
    frequencyWidth: 'Frequency Width',
    noise: 'Noise',
    quality: 'Quality',
  };

  return items.map((item, index) => (
    <div className="tw-ring-1 tw-ring-gray-400 tw-rounded-lg" key={index}>
      <Accordion>
        <AccordionSummary>
          <div className="tw-flex tw-flex-col">
            <span className="tw-text-xs tw-text-gray-500">{item.ipAddress}</span>
            <span className="tw-text-xs tw-font-semibold">{item.hostname}</span>
          </div>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            {Object.keys(keyOfDetails).map((key) => (
              <Grid xs={6} key={key} item>
                <div className="tw-flex tw-flex-col">
                  <span className="tw-text-xs tw-text-gray-500">{keyOfDetails[key]}</span>
                  <span className="tw-text-xs tw-font-semibold">{item[key]}</span>
                </div>
              </Grid>
            ))}
          </Grid>
        </AccordionDetails>
      </Accordion>
    </div>
  ));
}

/**
 * @param {Props} props
 */
function ConnectedDeviceDataTable({ items }) {
  /** @type {Record<keyof AcsDeviceConnect, string>} */
  const keyOfHeaders = {
    ipAddress: 'IP Address',
    macAddress: 'MAC Address',
    hostname: 'Host Name',
    rssi: 'RSSI',
    frequencyWidth: 'Frequency Width',
    noise: 'Noise',
    quality: 'Quality',
  };

  const headers = Object.values(keyOfHeaders);

  return (
    <Table>
      <TableHead>
        <TableRow>
          {headers.map((header) => (
            <TableCell key={header}>{header}</TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {items.map((item, index) => (
          <TableRow key={index}>
            {Object.keys(keyOfHeaders).map((key) => (
              <TableCell key={key}>
                <span className="tw-text-xs">{item[key]}</span>
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
