/**
 * @typedef {import("src/repositories/duitkuFeeProfile").DuitkuFeeProfile} DuitkuFeeProfile
 */

import { Fragment } from 'react';
import { Iconify } from '@components/iconify';
import { useExpansionToggle } from '@hooks/use-expansion-toggle';

import {
  Table,
  Stack,
  Tooltip,
  TableRow,
  Collapse,
  TableCell,
  TableHead,
  TableBody,
  Accordion,
  IconButton,
  AccordionSummary,
  AccordionActions,
  AccordionDetails,
} from '@mui/material';

import { FeeData } from '../../fee/FeeData';

/**
 * @typedef {Object} PropsData
 * @property {DuitkuFeeProfile[]} items
 * @property {(item: DuitkuFeeProfile) => void} onEdit
 * @property {(item: DuitkuFeeProfile) => void} onRemove
 * @property {(item: DuitkuFeeProfile) => void} onDuplicated
 */

export const DuitkuFeeProfileData = {
  Table: TableData,
  Mobile: MobileData,
};

/** @param {PropsData} props */
function TableData({ items, onEdit, onRemove, onDuplicated }) {
  const expandItem = useExpansionToggle();
  const headers = ['Profile', 'Area', ''];

  return (
    <Table>
      <TableHead>
        <TableRow>
          {headers.map((header, i) => (
            <TableCell key={i}>{header}</TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {items.map((item, i) => (
          <Fragment key={i}>
            <TableRow>
              <TableCell>
                <IconButton
                  onClick={() => expandItem.toggle(item._id)}
                  className={`${expandItem.isIncludes(item._id) ? 'tw-rotate-90' : ''} tw-duration-500`}
                >
                  <Iconify icon="mdi:menu-right" />
                </IconButton>
                <span className="tw-text-xs">{item.name}</span>
              </TableCell>
              <TableCell>
                <ol className="tw-list-disc tw-pl-4">
                  {item.area.map((a, j) => (
                    <li className="tw-text-xs" key={j}>
                      {a.title}
                    </li>
                  ))}
                </ol>
              </TableCell>
              <TableCell width={130}>
                <Tooltip title="Edit">
                  <IconButton disabled={!onEdit} color="success" onClick={() => onEdit(item)}>
                    <Iconify icon="mdi:edit" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Hapus">
                  <IconButton disabled={!onRemove} color="error" onClick={() => onRemove(item)}>
                    <Iconify icon="mdi:delete" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Duplicate">
                  <IconButton
                    disabled={!onDuplicated}
                    color="primary"
                    onClick={() => onDuplicated(item)}
                  >
                    <Iconify icon="mdi:content-duplicate" />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell colSpan={headers.length} sx={{ paddingY: 0 }}>
                <Collapse in={expandItem.isIncludes(item._id)}>
                  <div className="tw-py-2">
                    <FeeData.Table data={item.fees} hideActions />
                  </div>
                </Collapse>
              </TableCell>
            </TableRow>
          </Fragment>
        ))}
      </TableBody>
    </Table>
  );
}

/** @param {PropsData} props */
function MobileData({ items, onEdit, onRemove, onDuplicated }) {
  return items.map((item, i) => (
    <div key={i} className="tw-ring-1 tw-ring-gray-400 tw-rounded">
      <Accordion>
        <AccordionSummary>
          <span className="tw-text-xs">{item.name}</span>
        </AccordionSummary>
        <AccordionDetails>
          <Stack spacing={2}>
            <Stack>
              <span className="tw-text-xs">Area</span>
              <ol className="tw-list-disc tw-pl-4">
                {item.area.map((a, j) => (
                  <li className="tw-text-xs" key={j}>
                    {a.title}
                  </li>
                ))}
              </ol>
            </Stack>
            <Stack spacing={1}>
              <FeeData.Mobile data={item.fees} hideActions />
            </Stack>
          </Stack>
        </AccordionDetails>
        <AccordionActions>
          <Tooltip title="Edit">
            <IconButton disabled={!onEdit} color="success" onClick={() => onEdit(item)}>
              <Iconify icon="mdi:edit" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Hapus">
            <IconButton disabled={!onRemove} color="error" onClick={() => onRemove(item)}>
              <Iconify icon="mdi:delete" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Duplicate">
            <IconButton disabled={!onDuplicated} color="primary" onClick={() => onDuplicated(item)}>
              <Iconify icon="mdi:content-duplicate" />
            </IconButton>
          </Tooltip>
        </AccordionActions>
      </Accordion>
    </div>
  ));
}
