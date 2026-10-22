import { useState } from 'react';
import { Iconify } from '@components/iconify';

import {
  Menu,
  MenuItem,
  TextField,
  IconButton,
  Autocomplete,
  ListItemIcon,
  ListItemText,
} from '@mui/material';

import IconPicker from './IconPicker';
import SecondaryIpAddressField from './SecondaryIpAddressField';

/**
 * @param {Object} props
 * @param {function} props.onDelete
 * @param {function} props.onAddSecondaryIp
 */
export function ChildDeviceActions({ onDelete, onAddSecondaryIp }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleOpen = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  return (
    <div>
      <IconButton className="tw-w-fit" color="error" onClick={handleOpen}>
        <Iconify icon="mdi:dots-vertical" />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        {onDelete ? (
          <MenuItem
            onClick={() => {
              handleClose();
              onDelete();
            }}
          >
            <ListItemIcon>
              <Iconify icon="mdi:delete" color="error" />
            </ListItemIcon>
            <ListItemText>Delete</ListItemText>
          </MenuItem>
        ) : null}
        <MenuItem
          onClick={() => {
            handleClose();
            onAddSecondaryIp();
          }}
        >
          <ListItemIcon>
            <Iconify icon="mdi:plus-network" />
          </ListItemIcon>
          <ListItemText>Tambahkan Secondary IP</ListItemText>
        </MenuItem>
      </Menu>
    </div>
  );
}

/**
 * @param {Object} props
 * @param {string} props.alias
 * @param {string} props.ipAddress
 * @param {string} props.category
 * @param {string} [props.description]
 * @param {boolean} [props.readonlyIp]
 * @param {function(string)} props.onChangeAlias
 * @param {function(string)} props.onChangeIpAddress
 * @param {function(string)} props.onChangeCategory
 * @param {function(string)} [props.onChangeDescription]
 * @param {string|null} [props.parentId]
 * @param {function(string|null)} [props.onChangeParentId]
 * @param {Array} [props.devices]
 * @param {string} [props.iconName]
 * @param {function(string)} [props.onChangeIconName]
 * @param {Array} [props.secondaryIpAddresses]
 * @param {function} [props.onAddSecondaryIp]
 * @param {function(number)} [props.onRemoveSecondaryIp]
 * @param {function(number, Object)} [props.onUpdateSecondaryIp]
 */
export default function FormDialogMainDevice({
  alias,
  ipAddress,
  category,
  description,
  readonlyIp = false,
  onChangeAlias,
  onChangeIpAddress,
  onChangeCategory,
  onChangeDescription,
  parentId,
  onChangeParentId,
  devices = [],
  showParentSelector = true,
  iconName = 'mikrotik',
  onChangeIconName,
  secondaryIpAddresses = [],
  onAddSecondaryIp,
  onRemoveSecondaryIp,
  onUpdateSecondaryIp,
}) {
  const categories = {
    device: 'Device',
    ODP: 'ODP',
    regency: 'Provinsi',
    district: 'Kota',
  };

  const categoryOptions = Object.entries(categories).map(([value, label]) => ({ value, label }));

  return (
    <div className="tw-flex tw-flex-col tw-gap-2 tw-w-full">
      <div className="tw-flex tw-flex-col sm:tw-flex-row tw-gap-2 sm:tw-items-start tw-w-full">
        <div className="tw-flex tw-flex-row tw-gap-2 tw-items-center tw-w-full sm:tw-w-auto">
          <TextField
            label="Kategori"
            value={category}
            onChange={(e) => onChangeCategory(e.target.value)}
            size="small"
            select
            className="tw-flex-1 sm:tw-flex-none sm:tw-w-24"
          >
            {categoryOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
          <div className="tw-flex-none">
            <IconPicker iconName={iconName} onChangeIconName={onChangeIconName} />
          </div>
        </div>
        <div className="tw-flex tw-flex-col tw-gap-2 tw-w-full tw-min-w-0">
          <TextField
            label="Nama Perangkat"
            value={alias}
            onChange={(e) => onChangeAlias(e.target.value)}
            size="small"
            fullWidth
          />
          {category === 'device' ? (
            <div className="tw-grid tw-grid-cols-1 sm:tw-grid-cols-2 tw-gap-2 tw-w-full">
              <TextField
                label="Alamat IP"
                value={ipAddress}
                onChange={(e) => onChangeIpAddress(e.target.value)}
                size="small"
                fullWidth
                disabled={readonlyIp}
              />
              {onChangeDescription ? (
                <TextField
                  label="Deskripsi"
                  value={description}
                  onChange={(e) => onChangeDescription(e.target.value)}
                  size="small"
                  fullWidth
                  multiline
                  minRows={1}
                  maxRows={2}
                  inputProps={{ maxLength: 255 }}
                />
              ) : null}
              {secondaryIpAddresses.map((secIp, index) => (
                <SecondaryIpAddressField
                  key={index}
                  secIp={secIp}
                  index={index}
                  readonlyIp={readonlyIp}
                  onRemoveSecondaryIp={onRemoveSecondaryIp}
                  onUpdateSecondaryIp={onUpdateSecondaryIp}
                />
              ))}
            </div>
          ) : null}
        </div>
      </div>

      {showParentSelector && onChangeParentId ? (
        <Autocomplete
          options={devices}
          getOptionLabel={(option) => option.alias || option.ip_address}
          value={devices.find((d) => d.id === parentId) || null}
          onChange={(_, newValue) => onChangeParentId(newValue?.id || null)}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          renderInput={(params) => <TextField {...params} label="Parent Device" size="small" />}
          fullWidth
        />
      ) : null}
    </div>
  );
}
