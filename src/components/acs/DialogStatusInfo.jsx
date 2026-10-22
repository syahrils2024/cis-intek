/**
 * @typedef {import("@/repositories/acs").AcsStatus} AcsStatus
 */

import { Iconify } from '@components/iconify';

import { Chip, Tooltip } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';

/**
 * @param {{acsStatus: AcsStatus, currentRouterSerialNumber, onUpdateSerialNumber: function}} props
 */
export default function AcsDialogStatusInfo({ acsStatus, currentRouterSerialNumber, onUpdateSerialNumber }) {
  return (
    <Grid container gap={1}>
      <Grid xs={12} md={6}>
        <div className="tw-flex tw-flex-col">
          <span className="tw-text-xs tw-text-gray-500">Product</span>
          <span className="tw-text-xs tw-font-semibold">{acsStatus?.manufacture ?? '-'}</span>
        </div>
      </Grid>
      <Grid xs={12} md={5.5}>
        <div className="tw-flex tw-flex-col">
          <span className="tw-text-xs tw-text-gray-500">PON</span>
          <span className="tw-text-xs tw-font-semibold">{acsStatus?.linkType ?? '-'}</span>
        </div>
      </Grid>
      <Grid xs={12} md={6}>
        <div className="tw-flex tw-flex-col">
          <span className="tw-text-xs tw-text-gray-500">Last RX</span>
          <span className="tw-text-xs tw-font-semibold">{acsStatus?.opticRxPower ?? '-'}</span>
        </div>
      </Grid>
      <Grid xs={12} md={5.5}>
        <div className="tw-flex tw-flex-col">
          <span className="tw-text-xs tw-text-gray-500">Temperature</span>
          <span className="tw-text-xs tw-font-semibold">{acsStatus?.temperature ?? '-'}</span>
        </div>
      </Grid>
      <Grid xs={12} md={6}>
        <div className="tw-flex tw-flex-col">
          <span className="tw-text-xs tw-text-gray-500">UpTime</span>
          <span className="tw-text-xs tw-font-semibold">{acsStatus?.uptime ?? '-'}</span>
        </div>
      </Grid>
      <Grid xs={12} md={5.5}>
        <div className="tw-flex tw-flex-col">
          <span className="tw-text-xs tw-text-gray-500">IP Address</span>
          <span className="tw-text-xs tw-font-semibold">{acsStatus?.pppoeIp ?? '-'}</span>
        </div>
      </Grid>
      <Grid xs={12} md={5.5}>
        <div className="tw-flex tw-flex-col">
          <span className="tw-text-xs tw-text-gray-500">Serial Number</span>
          <ChipSerialNumber
            currentSerialNumber={currentRouterSerialNumber}
            acsSerialNumber={acsStatus?.serialNumber}
            onClick={onUpdateSerialNumber}
          />
        </div>
      </Grid>
    </Grid>
  );
}

/**
 * @param {Object} props
 * @param {string} props.currentSerialNumber
 * @param {string} props.acsSerialNumber
 * @param {function} props.onClick
 */
const ChipSerialNumber = ({ currentSerialNumber, acsSerialNumber, onClick }) => {
  const isSame = acsSerialNumber === currentSerialNumber;
  const label = isSame ? (
    <span className="tw-text-xs">{acsSerialNumber}</span>
  ) : (
    <>
      <span className="tw-text-xs">{acsSerialNumber}</span>{' '}
      <Iconify icon="mdi:alert-circle" className="tw-ml-0.5" color="error" />
    </>
  );
  return (
    <Tooltip
      title={isSame ? undefined : "SN berbeda di ACS, klik untuk update"}
      onClick={() => {
        if (isSame) return;
        onClick?.();
      }}
    >
      <Chip
        label={label ?? '-'}
        variant="soft"
        size="small"
        className="tw-w-fit"
        color={isSame ? 'success' : 'error'}
      />
    </Tooltip>
  );
};
