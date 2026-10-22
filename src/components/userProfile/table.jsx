/**
 * @typedef {import("src/repositories/userProfile").UserProfile} UserProfile
 */

import { Iconify } from '@components/iconify';

import { Table, Button, TableRow, TableBody, TableCell, TableHead } from '@mui/material';

/**
 *
 * @param {{
 * profiles: UserProfile[];
 * onEdit: (p: UserProfile) => void;
 * onDelete: (p: UserProfile) => void;
 * onDuplicate: (p: UserProfile) => void;
 * disabledAction: boolean;
 * }} param0
 */
export default function UserProfileTable({
  profiles,
  onEdit,
  onDelete,
  onDuplicate,
  disabledAction = false,
}) {
  const headers = [
    {
      label: 'title',
      value: 'title',
    },
    {
      label: 'area',
      value: 'area',
    },
    {
      label: 'action',
      value: 'action',
    },
  ];

  return (
    <Table>
      <TableHead>
        <TableRow>
          {headers.map((h, i) => (
            <TableCell key={i}>{h.label}</TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {profiles.map((profile, i) => (
          <TableRow key={i}>
            <TableCell>
              <span className="tw-text-xs tw-font-medium">{profile.title}</span>
            </TableCell>
            <TableCell>
              <div className="tw-flex tw-flex-col tw-gap-2">
                <ul className="tw-list-disc tw-pl-6">
                  {profile.areas.map((area, j) => (
                    <li key={j}>
                      <span className="tw-text-xs">{area.title}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </TableCell>
            <TableCell width={200}>
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
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
