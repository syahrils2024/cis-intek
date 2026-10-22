import { useState } from 'react';
import { Iconify } from '@components/iconify';

import {
  List,
  Dialog,
  Tooltip,
  useTheme,
  IconButton,
  DialogTitle,
  ListItemText,
  useMediaQuery,
  ListItemButton,
} from '@mui/material';

/**
 * @param {Object} props
 * @param {Array<{id: string, name: string}>} props.groups
 * @param {string} props.selectedGroupId
 * @param {function(string): void} props.onSelectGroup
 * @param {function(): void} props.onAddGroup
 * @param {function(): void} props.onEditGroup
 * @param {function(): void} props.onDeleteGroup
 * @param {boolean} [props.canEdit]
 */
export default function GroupTabs({
  groups,
  selectedGroupId,
  onSelectGroup,
  onAddGroup,
  onEditGroup,
  onDeleteGroup,
  canEdit = false,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [dialogOpen, setDialogOpen] = useState(false);

  const selectedGroup = groups.find((g) => g.id === selectedGroupId);

  const handleSelect = (id) => {
    onSelectGroup(id);
    setDialogOpen(false);
  };

  return (
    <div className="tw-flex tw-flex-row tw-items-center tw-gap-2 tw-w-full">
      {isMobile ? (
        <>
          <button
            type="button"
            onClick={() => setDialogOpen(true)}
            className="tw-px-3 tw-py-1.5 tw-rounded-lg tw-text-sm tw-font-medium tw-bg-blue-600 tw-text-white tw-whitespace-nowrap tw-flex tw-items-center tw-gap-1"
          >
            {selectedGroup ? selectedGroup.name.toUpperCase() : 'PILIH GROUP'}
            <Iconify icon="mdi:chevron-down" width={16} />
          </button>

          <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="xs">
            <DialogTitle>Pilih Group</DialogTitle>
            <List>
              {groups.map((group) => (
                <ListItemButton
                  key={group.id}
                  selected={group.id === selectedGroupId}
                  onClick={() => handleSelect(group.id)}
                >
                  <ListItemText
                    primary={group.name.toUpperCase()}
                    primaryTypographyProps={{
                      fontWeight: group.id === selectedGroupId ? 600 : 400,
                    }}
                  />
                </ListItemButton>
              ))}
            </List>
          </Dialog>
        </>
      ) : (
        <div className="tw-flex tw-flex-wrap tw-items-center tw-gap-1 tw-min-w-0">
          {groups.map((group) => (
            <button
              key={group.id}
              type="button"
              onClick={() => onSelectGroup(group.id)}
              className={[
                'tw-px-3 tw-py-1.5 tw-rounded-lg tw-text-sm tw-font-medium tw-whitespace-nowrap tw-transition-colors',
                group.id === selectedGroupId
                  ? 'tw-bg-blue-600 tw-text-white'
                  : 'tw-text-gray-600 hover:tw-bg-gray-100',
              ].join(' ')}
            >
              {group.name.toUpperCase()}
            </button>
          ))}
        </div>
      )}
      {canEdit && (
        <div className="tw-flex tw-items-center tw-gap-1 tw-shrink-0">
          <Tooltip title="Tambah Group">
            <span>
              <IconButton onClick={onAddGroup} size="small">
                <Iconify icon="mdi:plus-circle-outline" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Edit Group">
            <span>
              <IconButton onClick={onEditGroup} disabled={!selectedGroupId} size="small">
                <Iconify icon="mdi:pencil-outline" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Hapus Group">
            <span>
              <IconButton onClick={onDeleteGroup} disabled={!selectedGroupId} size="small" color="error">
                <Iconify icon="mdi:trash-can-outline" />
              </IconButton>
            </span>
          </Tooltip>
        </div>
      )}
    </div>
  );
}
