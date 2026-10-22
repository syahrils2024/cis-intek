import { Iconify } from '@components/iconify';

import { TextField, IconButton } from '@mui/material';

/**
 * @param {Object} props
 * @param {Object} props.secIp
 * @param {number} props.index
 * @param {boolean} [props.readonlyIp]
 * @param {function} [props.onRemoveSecondaryIp]
 * @param {function} [props.onUpdateSecondaryIp]
 */
export default function SecondaryIpAddressField({
  secIp,
  index,
  readonlyIp = false,
  onRemoveSecondaryIp,
  onUpdateSecondaryIp,
}) {
  return (
    <div className="sm:tw-contents tw-flex tw-flex-col tw-gap-2">
      <div className="tw-flex tw-flex-row tw-gap-2 tw-items-center tw-w-full">
        <TextField
          label="Alamat IP"
          value={secIp.ip_address}
          onChange={(e) => onUpdateSecondaryIp?.(index, { ip_address: e.target.value })}
          size="small"
          fullWidth
          disabled={readonlyIp}
          InputProps={{
            endAdornment:
              !readonlyIp && onRemoveSecondaryIp ? (
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => onRemoveSecondaryIp(index)}
                  edge="end"
                >
                  <Iconify icon="mdi:close" />
                </IconButton>
              ) : undefined,
          }}
        />
      </div>
      <TextField
        label="deskripsi"
        value={secIp.label ?? ''}
        onChange={(e) => onUpdateSecondaryIp?.(index, { label: e.target.value })}
        size="small"
        fullWidth
        inputProps={{ maxLength: 255 }}
        disabled={readonlyIp}
      />
    </div>
  );
}
