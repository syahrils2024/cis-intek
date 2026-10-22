/**
 * @typedef {import("src/repositories/package").IPackageFindResult} IPackageFindResult
 */

import { Fragment } from 'react';
import { Iconify } from '@components/iconify';
import { useExpansionToggle } from '@hooks/use-expansion-toggle';

import {
  Chip,
  Table,
  Stack,
  Tooltip,
  Divider,
  TableRow,
  Collapse,
  TableCell,
  TableHead,
  TableBody,
  Accordion,
  IconButton,
  AccordionSummary,
  AccordionDetails,
  AccordionActions,
} from '@mui/material';

import 'src/extension/string';
import 'src/extension/number';

/**
 * @typedef {Object} PackageDataProps
 * @property {IPackageFindResult[]} data - The package data to be displayed in the table.
 * @property {Function} onEdit - Callback function to handle edit action.
 * @property {Function} onDelete - Callback function to handle delete action.
 * @property {Function} onDuplicate - Callback function to handle duplicate action.
 */

export const PackageData = {
  Table: PackageDataTable,
  Mobile: PackageDataMobile,
};

/**
 * @param {PackageDataProps} param0
 */
function PackageDataTable({ data, onDelete, onEdit, onDuplicate }) {
  const headers = ['Paket Internet', 'Status', 'Customer Active', 'Customer Inactive', ''];
  const childHeaders = ['Area', 'POP', 'Harga', 'Customer Active', 'Customer Inactive'];
  const expansion = useExpansionToggle();

  return (
    <Table>
      <TableHead>
        <TableRow>
          {headers.map((header, index) => (
            <TableCell key={index}>{header}</TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {data.map((item, index) => (
          <Fragment key={index}>
            <TableRow>
              <TableCell>
                <Stack direction="row" spacing={1} alignItems="center">
                  <IconButton
                    onClick={() => expansion.toggle(item._id)}
                    className={`tw-duration-300 ${
                      expansion.isIncludes(item._id) ? 'tw-rotate-90' : 'tw-rotate-0'
                    }`}
                  >
                    <Iconify icon="ic:sharp-arrow-right" />
                  </IconButton>
                  <span className="tw-text-xs">{item.title}</span>
                </Stack>
              </TableCell>
              <TableCell>
                <Chip
                  label={item.status.toUpperCase()}
                  size="small"
                  color={item.status === 'active' ? 'success' : 'error'}
                  variant="soft"
                />
              </TableCell>
              <TableCell>
                <span className="tw-text-xs">{item.totalCustomerActive}</span>
              </TableCell>
              <TableCell>
                <span className="tw-text-xs">{item.totalCustomerInactive}</span>
              </TableCell>
              <TableCell width={110}>
                <Stack direction="row" spacing={1}>
                  <Tooltip title="Edit">
                    <IconButton color="success" onClick={() => onEdit(item)}>
                      <Iconify icon="mdi:edit" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Hapus">
                    <IconButton color="error" onClick={() => onDelete(item)}>
                      <Iconify icon="mdi:delete" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Duplicate">
                    <IconButton color="info" onClick={() => onDuplicate(item)}>
                      <Iconify icon="mdi:content-duplicate" />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ paddingY: 0, paddingX: 6 }} colSpan={headers.length}>
                <Collapse in={expansion.isIncludes(item._id)}>
                  <div className="tw-py-5">
                    <Table>
                      <TableHead>
                        <TableRow>
                          {childHeaders.map((header, j) => (
                            <TableCell key={j}>{header}</TableCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {item.areaStats.map((area, j) => (
                          <TableRow key={j}>
                            <TableCell>
                              <span className="tw-text-xs">{area.areaCategoryName}</span>
                            </TableCell>
                            <TableCell>
                              <span className="tw-text-xs">{area.areaName}</span>
                            </TableCell>
                            <TableCell>
                              <span className="tw-text-xs">
                                Rp. {area.price?.toString().toNumber().formatCurrency()}
                              </span>
                            </TableCell>
                            <TableCell>
                              <span className="tw-text-xs">{area.totalCustomerActive}</span>
                            </TableCell>
                            <TableCell>
                              <span className="tw-text-xs">{area.totalCustomerInactive}</span>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
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

/**
 * @param {PackageDataProps} param0
 */
function PackageDataMobile({ data, onDelete, onEdit, onDuplicate }) {
  return data.map((item, index) => (
    <div key={index} className="tw-rounded-lg tw-ring-1 tw-ring-gray-400">
      <Accordion className="tw-w-full">
        <AccordionSummary className="tw-w-full">
          <Stack spacing={1} className="tw-w-full">
            <div className="tw-flex tw-flex-row tw-w-full tw-items-center tw-justify-between tw-gap-2">
              <span>{item.title}</span>

              <Chip
                label={item.status.toUpperCase()}
                size="small"
                color={item.status === 'active' ? 'success' : 'error'}
                variant="soft"
                className="tw-w-min"
              />
            </div>
          </Stack>
        </AccordionSummary>
        <AccordionDetails>
          <Stack spacing={1.5}>
            <Stack direction="row" spacing={1}>
              <Chip
                label={`${item.totalCustomerActive} Active`}
                size="small"
                variant="soft"
                color="success"
              />
              <Chip
                label={`${item.totalCustomerInactive} Inactive`}
                size="small"
                variant="soft"
                color="error"
              />
            </Stack>

            <Divider />
            <span className="tw-text-xs tw-text-gray-500">Detail</span>
            <ul className="tw-list-disc tw-pl-5">
              {item.areaStats.map((area, j) => (
                <li key={j}>
                  <Stack spacing={0.5}>
                    <span className="tw-text-xs">
                      {area.areaCategoryName} - {area.areaName}
                    </span>
                    <span className="tw-text-xs">
                      Rp. {area.price?.toString().toNumber().formatCurrency()}
                    </span>
                    <div className="tw-flex tw-flex-wrap tw-gap-2">
                      <Chip
                        label={`${area.totalCustomerActive} Active`}
                        size="small"
                        variant="soft"
                        color="success"
                      />
                      <Chip
                        label={`${area.totalCustomerInactive} Inactive`}
                        size="small"
                        variant="soft"
                        color="error"
                      />
                    </div>
                    <Divider />
                  </Stack>
                </li>
              ))}
            </ul>
          </Stack>
        </AccordionDetails>
        <AccordionActions>
          <IconButton color="success" onClick={() => onEdit(item)}>
            <Iconify icon="mdi:edit" />
          </IconButton>
          <IconButton color="error" onClick={() => onDelete(item)}>
            <Iconify icon="mdi:delete" />
          </IconButton>
          <Tooltip title="Duplicate">
            <IconButton color="info" onClick={() => onDuplicate(item)}>
              <Iconify icon="mdi:content-duplicate" />
            </IconButton>
          </Tooltip>
        </AccordionActions>
      </Accordion>
    </div>
  ));
}
