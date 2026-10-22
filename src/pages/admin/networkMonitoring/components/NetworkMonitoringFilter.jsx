import { useState } from 'react';
import { Iconify } from '@components/iconify';

import {
  Menu,
  Tooltip,
  useTheme,
  TextField,
  IconButton,
  Autocomplete,
  useMediaQuery,
} from '@mui/material';

import GroupTabs from './GroupTabs';
import SocketConnection from './SocketConnection';

/**
 * @param {Object} props
 * @param {Array<{id: string, name: string}>} props.groups
 * @param {string} props.selectedGroupId
 * @param {function(string): void} props.onSelectGroup
 * @param {function(): void} props.onAddGroup
 * @param {function(): void} props.onEditGroup
 * @param {function(): void} props.onDeleteGroup
 * @param {object} props.connectionStatus
 * @param {boolean} props.loading
 * @param {boolean} props.isFullscreen
 * @param {function(): void} props.onRefresh
 * @param {function(): void} props.onToggleFullscreen
 * @param {boolean} props.isEmpty
 * @param {function(): void} props.onAddNode
 * @param {boolean} [props.canEdit]
 * @param {Array<{id: string, alias: string, ip_address: string}>} [props.devices]
 * @param {string|null} [props.highlightedNodeId]
 * @param {function(string|null): void} [props.onSelectHighlightNode]
 */
export default function NetworkMonitoringFilter({
  groups,
  selectedGroupId,
  onSelectGroup,
  onAddGroup,
  onEditGroup,
  onDeleteGroup,
  connectionStatus,
  loading,
  isFullscreen,
  onRefresh,
  onToggleFullscreen,
  isEmpty,
  onAddNode,
  canEdit = false,
  devices = [],
  highlightedNodeId = null,
  onSelectHighlightNode,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [moreAnchor, setMoreAnchor] = useState(null);

  const actionButtons = (
    <>
      <Autocomplete
        size="small"
        options={devices}
        getOptionLabel={(opt) => `${opt.alias || opt.name || '?'} (${opt.ip_address || '-'})`}
        getOptionKey={(opt) => opt.id}
        isOptionEqualToValue={(opt, val) => opt.id === val.id}
        value={devices.find((d) => d.id === highlightedNodeId) ?? null}
        onChange={(_, selected) => onSelectHighlightNode?.(selected?.id ?? null)}
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder="Search device..."
          />
        )}
        sx={isMobile ? { width: '100%' } : { minWidth: 250 }}
      />
      <SocketConnection status={connectionStatus} />
      <Tooltip title="Refresh" className="tw-w-fit">
        <span>
          <IconButton
            onClick={() => {
              onRefresh();
              setMoreAnchor(null);
            }}
            disabled={loading}
          >
            <Iconify icon="solar:refresh-bold" />
          </IconButton>
        </span>
      </Tooltip>
      <Tooltip title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'} className="tw-w-fit">
        <IconButton
          onClick={() => {
            onToggleFullscreen();
            setMoreAnchor(null);
          }}
        >
          <Iconify
            icon={isFullscreen ? 'solar:minimize-square-bold' : 'solar:maximize-square-bold'}
          />
        </IconButton>
      </Tooltip>
    </>
  );

  return (
    <div className="tw-absolute tw-px-2 tw-top-0 tw-z-10 tw-flex tw-flex-col tw-w-full tw-bg-white">
      <div className="tw-flex tw-flex-row tw-w-full tw-items-center tw-justify-between tw-gap-1">
        <div className="tw-flex tw-items-center tw-gap-2 tw-min-w-0">
          {isEmpty && canEdit && (
            <Tooltip title="Add Node" className="tw-w-fit">
              <IconButton onClick={onAddNode} color="primary">
                <Iconify icon="mdi:plus-network-outline" />
              </IconButton>
            </Tooltip>
          )}
          <GroupTabs
            groups={groups}
            selectedGroupId={selectedGroupId}
            onSelectGroup={onSelectGroup}
            onAddGroup={onAddGroup}
            onEditGroup={onEditGroup}
            onDeleteGroup={onDeleteGroup}
            canEdit={canEdit}
          />
        </div>

        {isMobile ? (
          <>
            <IconButton onClick={(e) => setMoreAnchor(e.currentTarget)}>
              <Iconify icon="mdi:dots-vertical" />
            </IconButton>
            <Menu
              anchorEl={moreAnchor}
              open={Boolean(moreAnchor)}
              onClose={() => setMoreAnchor(null)}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
              <div className="tw-flex tw-flex-col tw-gap-2 tw-px-4 tw-py-2 tw-min-w-[260px]">
                {actionButtons}
              </div>
            </Menu>
          </>
        ) : (
          <div className="tw-flex tw-items-center tw-gap-2 tw-shrink-0">
            {actionButtons}
          </div>
        )}
      </div>
    </div>
  );
}
