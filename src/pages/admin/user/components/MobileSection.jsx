/**
 * @typedef {import('src/repositories/user').User} User
 */
import { Icon } from '@iconify/react';

import {
  Chip,
  Stack,
  Button,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionActions,
  AccordionDetails,
} from '@mui/material';

import { formatPrivilege } from '../user.helper';

/**
 * @param {Object} props
 * @param {User} props.user
 * @param {() => void} props.onEdit
 * @param {boolean} props.allowEdit
 * @param {() => void} props.onRemove
 * @param {boolean} props.allowRemove
 * @param {() => void} props.onToggleLock
 * @param {boolean} props.isDeveloper
 */
export default function MobileSection({
  user: { fullname, email, phone, status, privilege, profileTitle, parentUser, locked },
  onEdit,
  allowEdit,
  onRemove,
  allowRemove = true,
  onToggleLock,
  isDeveloper,
}) {
  return (
    <div className="tw-ring-1 tw-ring-gray-300 tw-rounded-lg">
      <Accordion>
        <AccordionSummary>
          <div className="tw-flex tw-flex-col tw-gap-2 tw-w-full">
            <div className="tw-flex tw-flex-wrap tw-items-center tw-justify-end tw-w-full tw-gap-2">
              <Chip
                label={status}
                variant="outlined"
                size="small"
                className="tw-w-min"
              />
              {privilege.map((p, k) => (
                <Chip
                  key={k}
                  variant="outlined"
                  label={formatPrivilege(p)}
                  size="small"
                />
              ))}
            </div>
            <Divider />
            <div className="tw-flex tw-flex-row tw-items-start tw-justify-between tw-w-full">
              <Stack spacing={2} direction="row" alignItems="center" className="tw-w-full">
                <Stack sx={{ typography: 'body2', flex: '1 1 auto', alignItems: 'flex-start' }}>
                  <span className="tw-text-xs tw-font-medium">{fullname}</span>
                  <span className="tw-text-xs tw-text-gray-500">{email}</span>
                  <span className="tw-text-xs tw-text-gray-500">{phone}</span>
                </Stack>
              </Stack>
            </div>
          </div>
        </AccordionSummary>
        <AccordionDetails>
          <div className="tw-flex tw-flex-col tw-gap-2">
            <Stack>
              <span className="tw-text-xs tw-text-gray-500">Area</span>
              <span className="tw-text-xs tw-font-medium">{profileTitle ?? 'Non Profile'}</span>
            </Stack>
            <Stack>
              <span className="tw-text-xs tw-text-gray-500">Parent User</span>
              <span className="tw-text-xs tw-font-medium">{parentUser ?? '-'}</span>
            </Stack>
          </div>
        </AccordionDetails>
        <AccordionActions>
          {isDeveloper ? (
            <Button
              variant="soft"
              color={!locked ? 'error' : 'success'}
              onClick={onToggleLock}
            >
              <Icon
                icon={!locked ? 'material-symbols:lock-outline' : 'material-symbols:lock-open-outline'}
                className="tw-mr-2"
              />
              {!locked ? 'Lock' : 'Unlock'}
            </Button>
          ) : null}
          <Button disabled={!allowRemove} variant="soft" color="error" onClick={onRemove}>
            <Icon icon="material-symbols:remove-outline" className="tw-mr-2" />
            Hapus
          </Button>
          <Button disabled={!allowEdit} variant="soft" color="info" onClick={onEdit}>
            <Icon icon="material-symbols:edit-outline" className="tw-mr-2" />
            Edit
          </Button>
        </AccordionActions>
      </Accordion>
    </div>
  );
}
