import { useState, useEffect } from 'react';
import { Iconify } from '@components/iconify';
import { testSend } from '@repositories/networkMonitoringNotification';
import { getNotificationTemplates } from '@repositories/networkMonitoringNotificationTemplate';

import {
  Button,
  Divider,
  Tooltip,
  MenuItem,
  Skeleton,
  TextField,
  IconButton,
  Autocomplete,
} from '@mui/material';

/**
 * @param {Object} props
 * @param {Array} props.notifications
 * @param {Array} props.whatsappNodes
 * @param {boolean} props.loading
 * @param {string} props.ipAddress
 * @param {string} props.category
 * @param {function} props.onAdd
 * @param {function(number)} props.onRemove
 * @param {function(number, Object)} props.onUpdate
 */
export default function FormDialogWhatsappNotification({
  notifications = [],
  whatsappNodes = [],
  loading = false,
  ipAddress = '',
  category = '',
  onAdd,
  onRemove,
  onUpdate,
}) {
  const [templates, setTemplates] = useState([]);

  useEffect(() => {
    getNotificationTemplates().then(setTemplates).catch(() => {});
  }, []);

  return (
    <div className="tw-relative tw-p-3 tw-pt-4 tw-ring-1 tw-rounded-lg tw-ring-gray-200">
      <span className="tw-absolute tw-text-xs tw-px-2 tw-ml-2 tw-bg-white -tw-top-2">
        Whatsapp Notification
      </span>
      {loading ? (
        <div className="tw-flex tw-flex-col tw-gap-4 tw-mt-2">
          <Skeleton variant="rectangular" height={40} className="tw-rounded-md" />
          <Skeleton variant="rectangular" height={40} className="tw-rounded-md" />
        </div>
      ) : (
        <>
          {notifications.map((notif, index) => (
            <div className="tw-flex tw-flex-col" key={index}>
              <div className="tw-flex tw-flex-col sm:tw-flex-row tw-w-full tw-gap-2 tw-mt-4 tw-items-stretch sm:tw-items-start">
                <div className="tw-grid tw-grid-cols-1 sm:tw-grid-cols-4 tw-gap-2 tw-flex-1 tw-min-w-0">
                  <TextField
                    label="Kategori"
                    value={notif.category}
                    onChange={(e) => onUpdate(index, { category: e.target.value })}
                    size="small"
                    fullWidth
                    select
                  >
                    <MenuItem value="self" disabled={!ipAddress || category !== 'device'}>
                      <div className="tw-flex tw-flex-col">
                        <span>This Device</span>
                        {!ipAddress || category !== 'device' ? (
                          <span className="tw-text-xs tw-text-gray-500">
                            dapat dipilih jika device ini memiliki IP Address dan kategori device
                          </span>
                        ) : (
                          notif.category !== 'self' && (
                            <span className="tw-text-xs tw-text-gray-500">
                              mengirimkan notifikasi ketika terjadi perubahan up atau down hanya
                              berlaku device ini
                            </span>
                          )
                        )}
                      </div>
                    </MenuItem>
                    <MenuItem value="children">
                      <div className="tw-flex tw-flex-col">
                        <span>All Sub Device</span>
                        {notif.category !== 'children' ? (
                          <span className="tw-text-xs tw-text-gray-500">
                            mengirimkan notifikasi ketika seluruh device yang terhubung terjadi up
                            atau down
                          </span>
                        ) : null}
                      </div>
                    </MenuItem>
                  </TextField>
                  <TextField
                    label="Whatsapp Node"
                    value={notif.whatsappNode}
                    onChange={(e) => onUpdate(index, { whatsappNode: e.target.value })}
                    size="small"
                    fullWidth
                    select
                  >
                    {whatsappNodes.map((node) => (
                      <MenuItem key={node._id} value={node._id}>
                        {node.title} ({node.phone})
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    label="Tujuan"
                    value={notif.to}
                    onChange={(e) => onUpdate(index, { to: e.target.value })}
                    size="small"
                    fullWidth
                    helperText="Nomor Whatsapp atau Group ID"
                  />
                  <Autocomplete
                    size="small"
                    options={templates}
                    value={templates.find((t) => t._id === notif.notificationTemplate) ?? null}
                    onChange={(_event, newValue) =>
                      onUpdate(index, {
                        notificationTemplate: newValue?._id ?? null,
                      })
                    }
                    getOptionLabel={(option) => option.templateName}
                    isOptionEqualToValue={(option, value) => option._id === value._id}
                    renderInput={(params) => (
                      <TextField {...params} label="Template" placeholder="Pilih template" />
                    )}
                    disableClearable={false}
                    clearOnBlur
                  />
                </div>
                <div className="tw-flex tw-flex-row tw-items-center tw-gap-1 tw-self-end sm:tw-self-start">
                  <Tooltip title="Test Send Whatsapp Notification">
                    <IconButton
                      color="success"
                      onClick={() => testSend({ to: notif.to, whatsappNode: notif.whatsappNode })}
                    >
                      <Iconify icon="mdi:whatsapp" />
                    </IconButton>
                  </Tooltip>

                  <IconButton color="error" onClick={() => onRemove(index)}>
                    <Iconify icon="mdi:delete" />
                  </IconButton>
                </div>
              </div>
              {index < notifications.length - 1 && <Divider className="tw-pt-2" />}
            </div>
          ))}
          <div className="tw-flex tw-flex-row tw-items-center tw-justify-end tw-mt-4 tw-gap-2">
            <Button variant="text" size="small" color="primary" onClick={onAdd}>
              Tambah
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
