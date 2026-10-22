import { forwardRef, useImperativeHandle } from 'react';

import { LoadingButton } from '@mui/lab';
import { Button, Dialog, Divider, DialogTitle, DialogActions, DialogContent } from '@mui/material';

import { useFormDialogState } from './formDialog.state';
import FormDialogWhatsappNotification from './FormDialogWhatsappNotification';
import FormDialogMainDevice, { ChildDeviceActions } from './FormDialogMainDevice';

const FormDialog = forwardRef(({ groupId }, ref) => {
  const { handlers, state } = useFormDialogState();

  useImperativeHandle(ref, () => ({
    open: (options) => handlers.openDialog({ ...options, groupId: groupId ?? options.groupId }),
  }));

  return (
    <Dialog open={state.open.value} onClose={() => handlers.close()} maxWidth="md" fullWidth>
      <DialogTitle sx={{ px: { xs: 1.5, sm: 3 } }}>Form Network Monitoring Device</DialogTitle>
      <DialogContent sx={{ px: { xs: 1.5, sm: 3 } }}>
        <div className="tw-flex tw-flex-col tw-gap-4 tw-py-2 tw-w-full">
          <div className="tw-flex tw-flex-col sm:tw-flex-row tw-gap-2">
            <div className="tw-flex-1 tw-min-w-0">
              <FormDialogMainDevice
                alias={state.deviceName}
                ipAddress={state.ipAddress}
                category={state.category}
                description={state.description}
                iconName={state.iconName}
                onChangeIconName={handlers.setIconName}
                onChangeAlias={handlers.setDeviceName}
                onChangeIpAddress={handlers.setIpAddress}
                onChangeCategory={handlers.setCategory}
                onChangeDescription={handlers.setDescription}
                parentId={state.parentId}
                onChangeParentId={handlers.setParentId}
                devices={state.devices}
                secondaryIpAddresses={state.secondaryIpAddresses}
                onAddSecondaryIp={handlers.secondaryIp.add}
                onRemoveSecondaryIp={handlers.secondaryIp.remove}
                onUpdateSecondaryIp={handlers.secondaryIp.update}
              />
            </div>
            <div className="tw-flex tw-flex-row tw-justify-end sm:tw-items-start">
              <ChildDeviceActions
                onAddSecondaryIp={() => handlers.secondaryIp.add({ ip_address: '', label: '' })}
              />
            </div>
          </div>

          <Divider />
          <FormDialogWhatsappNotification
            notifications={state.whatsappNotifications}
            whatsappNodes={state.whatsappNodes}
            loading={state.loadingData.value}
            ipAddress={state.ipAddress}
            category={state.category}
            onAdd={handlers.whatsappNotification.add}
            onRemove={handlers.whatsappNotification.remove}
            onUpdate={handlers.whatsappNotification.update}
          />
          <Divider />
          {/* Children */}
          <div className="tw-relative tw-py-3 tw-pt-4 tw-ring-1 tw-rounded-lg tw-ring-gray-200">
            <span className="tw-absolute tw-text-xs tw-px-2 tw-ml-2 tw-bg-white -tw-top-2">
              Perangkat Terhubung
            </span>
            {state.children.map((child, index) => (
              <div className="tw-flex tw-flex-col tw-px-3" key={index}>
                <div className="tw-flex tw-flex-col sm:tw-flex-row tw-w-full tw-gap-2 tw-mt-4 tw-items-stretch sm:tw-items-start">
                  <div className="tw-flex-1 tw-min-w-0">
                    <FormDialogMainDevice
                      alias={child.alias}
                      ipAddress={child.ip_address}
                      category={child.category}
                      description={child.description}
                      showParentSelector={false}
                      onChangeCategory={(value) =>
                        handlers.child.update(index, { category: value })
                      }
                      onChangeAlias={(value) => handlers.child.update(index, { alias: value })}
                      onChangeIpAddress={(value) =>
                        handlers.child.update(index, { ip_address: value })
                      }
                      onChangeDescription={(value) => {
                        handlers.child.update(index, { description: value });
                      }}
                      secondaryIpAddresses={child.secondary_ip_addresses ?? []}
                      onAddSecondaryIp={() =>
                        handlers.child.update(index, {
                          secondary_ip_addresses: [
                            ...(child.secondary_ip_addresses ?? []),
                            { ip_address: '', label: '' },
                          ],
                        })
                      }
                      onRemoveSecondaryIp={(secIndex) =>
                        handlers.child.update(index, {
                          secondary_ip_addresses: (child.secondary_ip_addresses ?? []).filter(
                            (_, i) => i !== secIndex
                          ),
                        })
                      }
                      onUpdateSecondaryIp={(secIndex, data) => {
                        const copy = [...(child.secondary_ip_addresses ?? [])];
                        copy[secIndex] = { ...copy[secIndex], ...data };
                        handlers.child.update(index, { secondary_ip_addresses: copy });
                      }}
                    />
                  </div>
                  <div className="tw-flex tw-flex-row tw-justify-end sm:tw-items-start">
                    <ChildDeviceActions
                      onDelete={() => handlers.child.remove(index)}
                      onAddSecondaryIp={() =>
                        handlers.child.update(index, {
                          secondary_ip_addresses: [
                            ...(child.secondary_ip_addresses ?? []),
                            { ip_address: '', label: '' },
                          ],
                        })
                      }
                    />
                  </div>
                </div>
                <div className="tw-w-full tw-h-[1px] tw-mt-2 tw-bg-slate-400" />
                {/* <Divider className="tw-pt-2" /> */}
              </div>
            ))}
            <div className="tw-flex tw-flex-col sm:tw-flex-row tw-items-stretch sm:tw-items-center tw-justify-end tw-mt-4 tw-gap-2 tw-px-3">
              <Button
                variant="text"
                size="small"
                color="primary"
                onClick={() => handlers.child.add()}
                fullWidth
              >
                Tambah
              </Button>
              <Button
                variant="soft"
                size="small"
                color="warning"
                onClick={() => handlers.pickArea()}
                fullWidth
              >
                Tambah dari POP
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
      <DialogActions
        sx={{ flexDirection: { xs: 'column-reverse', sm: 'row' }, gap: 1, px: { xs: 1.5, sm: 3 } }}
      >
        <Button variant="text" color="error" onClick={() => handlers.close()} fullWidth={false}>
          Tutup
        </Button>
        <LoadingButton
          variant="soft"
          color="primary"
          loading={state.loading.value}
          onClick={() => handlers.submit()}
          fullWidth={false}
          sx={{ width: { xs: '100%', sm: 'auto' } }}
        >
          Simpan
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
});

export default FormDialog;
