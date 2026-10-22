/**
 * @typedef {import("src/repositories/userProfile").UserProfile} UserProfile
 */

import { Iconify } from '@components/iconify';

import {
  Button,
  Accordion,
  AccordionActions,
  AccordionDetails,
  AccordionSummary,
} from '@mui/material';

/**
 *
 * @param {{
 * profiles: UserProfile[];
 * onEdit: (p: UserProfile) => void;
 * onDelete: (p: UserProfile) => void
 * onDuplicate: (p: UserProfile) => void;
 * disabledAction: boolean
 * }} param0
 */
export default function UserProfileMobile({
  profiles,
  onEdit,
  onDelete,
  onDuplicate,
  disabledAction = false,
}) {
  return (
    <div className="tw-flex tw-flex-col tw-gap-2">
      {profiles.map((profile, i) => (
        <div key={i} className="tw-ring-1 tw-ring-gray-400 tw-rounded-lg">
          <Accordion>
            <AccordionSummary>
              <span className="tw-text-xs">{profile.title}</span>
            </AccordionSummary>
            <AccordionDetails>
              <div className="tw-flex tw-flex-col">
                <span className="tw-text-xs tw-text-gray-500">POP / Area</span>
                <div className="tw-flex tw-flex-col tw-gap-2 tw-mt-1">
                  <ul className="tw-list-disc tw-pl-6">
                    {profile.areas.map((area, j) => (
                      <li key={j}>
                        <span className="tw-text-xs">{area.title}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </AccordionDetails>
            <AccordionActions>
              <div className="tw-gap-2 tw-flex tw-flex-row">
                <Button
                  color="success"
                  variant="outlined"
                  size="small"
                  disabled={disabledAction}
                  onClick={() => onEdit(profile)}
                >
                  <Iconify icon="mdi:pencil-outline" /> Edit
                </Button>
                <Button
                  color="error"
                  variant="outlined"
                  size="small"
                  disabled={disabledAction}
                  onClick={() => onDelete(profile)}
                >
                  <Iconify icon="mdi:delete-outline" /> Hapus
                </Button>
                <Button
                  color="primary"
                  variant="outlined"
                  size="small"
                  disabled={disabledAction}
                  onClick={() => onDuplicate(profile)}
                >
                  <Iconify icon="mdi:content-duplicate" /> Duplicate
                </Button>
              </div>
            </AccordionActions>
          </Accordion>
        </div>
      ))}
    </div>
  );
}
