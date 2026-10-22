import { useMemo, useState, useEffect } from 'react';
import Overloading from '@components/overloading';
import { usePermission } from '@auth/hooks/permission';
import { useComputedHeight } from '@hooks/use-computed-height';

import { Box, Tab, Tabs } from '@mui/material';

import { useMeStore } from 'src/stores/meStore';

import TreeView from './components/TreeView';
import SlaDialog from './components/SlaDialog';
import FormDialog from './components/FormDialog';
import NotificationTemplate from './notificationTemplate';
import NetworkTopologyMap from './components/NetworkTopologyMap';
import { useNetworkMonitoringState } from './networkMonitoring.state';
import { useNetworkMonitoringSocket } from './networkMonitoringSocket';
import NetworkMonitoringFilter from './components/NetworkMonitoringFilter';
import NetworkMonitoringGroupFormDialog from './components/NetworkMonitoringGroupFormDialog';

const TABS = ['Network Map', 'Jaringan', 'Template Notifikasi'];

export default function NetworkMonitoring() {
  const [selectedTab, setSelectedTab] = useState(0);
  const { state, refs, handlers } = useNetworkMonitoringState();
  const height = useComputedHeight({
    xs: 120,
    md: 128,
  })

  const {
    treeData,
    loading,
    fullscreen,
    groups,
    devices,
    selectedGroupId,
    containerRef,
    treeViewKey,
    expandedNodeIds,
    highlightedNodeId,
  } = state;
  const connection = useNetworkMonitoringSocket();
  const permission = usePermission();
  const { me, profile } = useMeStore();

  const canEdit = permission.allowEditNetworkMonitoring;

  const filteredGroups = useMemo(() => {
    const whitelist = profile?.networkMonitoringGroupId ?? [];
    if (whitelist.length === 0) return groups;
    return groups.filter((g) => whitelist.includes(g.id));
  }, [groups, profile]);

  // Daftarkan listener sekali (bukan tiap render). appendDevice sudah berbasis
  // setDevices(prev => …) sehingga tidak bergantung closure yang basi.
  useEffect(() => {
    connection.onDeviceUpdate((update) => handlers.appendDevice(update));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connection.status]);

  return (
    <>
      <div className="tw-w-full tw-mb-2">
        <Tabs value={selectedTab} onChange={(e, val) => setSelectedTab(val)} sx={{ px: 2, pt: 1 }}>
          {TABS.map((t, i) => (
            <Tab value={i} key={i} label={t} />
          ))}
        </Tabs>
      </div>

      {selectedTab === 0 && (
        <>
          <Box ref={containerRef} sx={{ position: 'relative', bgcolor: 'background.paper' }}>
            {/* Filter */}
            <NetworkMonitoringFilter
              groups={filteredGroups}
              selectedGroupId={selectedGroupId}
              onSelectGroup={handlers.setSelectedGroupId}
              onAddGroup={() => handlers.openGroupFormDialog()}
              onEditGroup={() => {
                const currentGroup = filteredGroups.find((g) => g.id === selectedGroupId);
                handlers.openGroupFormDialog(currentGroup);
              }}
              onDeleteGroup={() => handlers.handleDeleteGroup()}
              connectionStatus={connection.status}
              loading={loading.value}
              isFullscreen={fullscreen.value}
              onRefresh={() => handlers.refreshTreeView()}
              onToggleFullscreen={() => handlers.toggleFullscreen()}
              isEmpty={treeData.length === 0}
              onAddNode={() => handlers.openFormDialog()}
              canEdit={canEdit}
              devices={devices}
              highlightedNodeId={highlightedNodeId}
              onSelectHighlightNode={handlers.handleHighlightNode}
            />
            {/* Filter */}
            {/* Tree View */}
            <div className="tw-relative">
              <Overloading loading={loading.value} />
              {treeData.length > 0 ? (
                <TreeView
                  key={treeViewKey}
                  data={treeData}
                  height={fullscreen.value ? '100vh' : height}
                  canEdit={canEdit}
                  onEdit={(device) => {
                    if (device.id === 'root') {
                      return handlers.openFormDialog();
                    }
                    return handlers.openFormDialog(device);
                  }}
                  onDelete={(device) => handlers.handleDelete(device)}
                  onViewSla={(device) => {
                    const fullDevice = devices.find((d) => d.id === device.id) ?? device;
                    refs.sla.current?.open({ device: fullDevice });
                  }}
                  onNodeExpand={(nodeId) => handlers.handleNodeExpand(nodeId)}
                  onNodeCollapse={(nodeId) => handlers.handleNodeCollapse(nodeId)}
                  expandedNodeIds={expandedNodeIds}
                  highlightedNodeId={highlightedNodeId}
                />
              ) : null}
            </div>
            {/* End Tree View */}
          </Box>
          <FormDialog ref={refs.form} groupId={selectedGroupId} />
          <NetworkMonitoringGroupFormDialog ref={refs.groupForm} />
          <SlaDialog ref={refs.sla} />
        </>
      )}

      {selectedTab === 1 && <NetworkTopologyMap />}
      {selectedTab === 2 && <NotificationTemplate />}
    </>
  );
}
