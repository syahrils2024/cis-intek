// @ts-nocheck
/**
 * @typedef {import("src/repositories/area").GetAllAreaWithCategory} Area
 */

import { Fragment } from 'react';
import { changeSorter } from '@utils/sort';
import { Iconify } from '@components/iconify';
import { connect, useDispatch } from 'react-redux';
import { useExpansionToggle } from '@hooks/use-expansion-toggle';

import {
  Table,
  Stack,
  TableRow,
  Collapse,
  TableCell,
  TableHead,
  TableBody,
  Accordion,
  IconButton,
  TableSortLabel,
  AccordionDetails,
  AccordionSummary,
  AccordionActions,
} from '@mui/material';

import 'src/extension/number';
import 'src/extension/string';
import { setPopListStore } from 'src/stores/popListStore';

import { NetIndicator } from './NetIndicator';
import { PopListStepper } from './PopListStepper';

export { NetIndicator } from './NetIndicator';

/**
 * DataTable component - Desktop view for POP list
 * @param {{areas: Area[]; onMenu: void; orderBy: string; order: string; readOnly: boolean}} props
 */
function DataTable({ areas, onMenu, orderBy, order, readOnly = false }) {
  const dispatch = useDispatch();
  const headers = [
    {
      label: 'POP DATA',
      id: 'title',
      sortable: true,
    },
    {
      label: 'Router Config',
      id: 'config',
      sortable: true,
    },
    {
      label: 'Last IP',
      id: 'lastIP',
      sortable: true,
    },
    {
      label: 'Client Config',
      id: 'clientConfig',
      sortable: false,
    },
    {
      label: '',
      id: 'act',
      sortable: false,
    },
  ];
  const expansion = useExpansionToggle();
  const expansionPassword = useExpansionToggle();

  function sort(key) {
    const sortBy = changeSorter(order);
    if (key !== orderBy) {
      dispatch(setPopListStore({ key: 'orderBy', value: key }));
    }
    dispatch(setPopListStore({ key: 'order', value: sortBy }));
  }

  return (
    <Table>
      <TableHead>
        <TableRow>
          {headers.map((h) => (
            <TableCell key={h.id}>
              {h.sortable ? (
                <TableSortLabel
                  direction={orderBy === h.id ? order : 'asc'}
                  onClick={() => sort(h.id)}
                  className="tw-gap-2"
                  IconComponent={() => (
                    <Iconify
                      icon={
                        orderBy === h.id
                          ? order === 'asc'
                            ? 'mdi:menu-up'
                            : 'mdi:menu-down'
                          : 'mdi:menu-up'
                      }
                    />
                  )}
                >
                  {h.label}
                </TableSortLabel>
              ) : (
                h.label
              )}
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {areas.map((area, i) => (
          <Fragment key={i}>
            <TableRow
              className={
                expansion.isIncludes(area._id) &&
                'tw-bg-gray-200 tw-border-t tw-border-x tw-border-gray-400'
              }
            >
              <TableCell>
                <div className="tw-flex tw-flex-row">
                  <IconButton onClick={() => expansion.toggle(area._id)}>
                    <Iconify icon="mdi:menu-down" />
                  </IconButton>
                  <div className='tw-my-auto tw-mr-4'>
                    <NetIndicator
                      status={area?.netStatus?.status}
                      timestamp={area?.netStatus?.lastChecked}
                    />
                  </div>
                  <Stack className={!(area.active ?? true) && 'tw-text-red-500'}>
                    <span className="tw-text-xs tw-font-medium tw-whitespace-nowrap tw-uppercase">
                      {area.title}
                    </span>
                    <span className="tw-text-xs tw-text-gray-500">{area.categoryName}</span>
                    <div className="tw-flex tw-flex-col tw-w-full tw-mt-3">
                      <span className="tw-text-xs tw-text-gray-500">IP / PORT</span>
                      <span className="tw-text-xs tw-text-gray-500">
                        {area.routerConfig.address ?? '-'} / {area.routerConfig.port ?? '-'}
                      </span>
                      <span className="tw-text-xs tw-text-gray-500 tw-uppercase">
                        {area.active ?? true ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <span className="tw-text-xs tw-text-gray-500" />
                  </Stack>
                </div>
              </TableCell>
              <TableCell>
                {/* POP Setting */}
                <div className="tw-flex tw-flex-col tw-items-start tw-gap-2">
                  <div className="tw-flex tw-flex-col tw-w-full">
                    <span className="tw-text-xs tw-text-gray-500">Username</span>
                    <span className="tw-text-xs tw-font-medium">
                      {area.routerConfig.username ?? '-'}
                    </span>
                  </div>
                  <div className="tw-flex-row tw-flex">
                    <div className="tw-flex tw-flex-col tw-w-full">
                      <span className="tw-text-xs tw-text-gray-500">Password</span>
                      <span className="tw-text-xs tw-font-medium">
                        {expansionPassword.isIncludes(area._id)
                          ? area.routerConfig.password
                          : '******'}
                      </span>
                    </div>
                    <IconButton onClick={() => expansionPassword.toggle(area._id)}>
                      <Iconify
                        icon={
                          expansionPassword.isIncludes(area._id) ? 'mdi:eye' : 'mdi:eye-off-outline'
                        }
                      />
                    </IconButton>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <span className="tw-text-xs tw-font-medium">{area.routerConfig?.lastIP}</span>
              </TableCell>

              {/* Client Setting */}
              <TableCell>
                <div className="tw-grid tw-grid-cols-2 tw-items-start tw-gap-2">
                  <div className="tw-flex tw-flex-col tw-w-full">
                    <span className="tw-text-xs tw-text-gray-500">Biaya Pasang</span>
                    <span className="tw-text-xs tw-font-medium">
                      Rp. {area.installationCharge?.toString().toNumber().formatCurrency() ?? 0}
                    </span>
                  </div>
                  <div className="tw-flex tw-flex-col  tw-w-full">
                    <span className="tw-text-xs tw-text-gray-500">Prefix PPPoE</span>
                    <span className="tw-text-xs tw-font-medium">{area.prefixCustomer ?? '-'}</span>
                  </div>
                  <div className="tw-flex tw-flex-col  tw-w-full">
                    <span className="tw-text-xs tw-text-gray-500">Jatuh Tempo</span>
                    <span className="tw-text-xs tw-font-medium">Tanggal {area.duoDate ?? '-'}</span>
                  </div>
                  <div className="tw-flex tw-flex-col tw-w-full">
                    <span className="tw-text-xs tw-text-gray-500">Jenis</span>
                    <span className="tw-text-xs tw-font-medium">
                      {area.isPrePaid
                        ? 'Prepaid/Prabayar/bayar didepan'
                        : 'Postpaid/Pascabayar/bayar dibelakang'}
                    </span>
                  </div>
                </div>
              </TableCell>
              {!!onMenu && (
                <TableCell>
                  <div className="tw-flex tw-flex-row">
                    <IconButton
                      color="primary"
                      size="small"
                      variant="contained"
                      onClick={(e) => onMenu(e, area)}
                    >
                      <Iconify icon="mdi:menu" />
                    </IconButton>
                  </div>
                </TableCell>
              )}
            </TableRow>
            <TableRow
              className={
                expansion.isIncludes(area._id) &&
                'tw-bg-gray-200 tw-border-b tw-border-x tw-border-gray-400'
              }
            >
              <TableCell colSpan={5} sx={{ paddingY: 0 }}>
                <Collapse in={expansion.isIncludes(area._id)}>
                  <div className="tw-p-5">
                    <PopListStepper
                      title={area.title}
                      parentCategoryData={area.parentCategoryData}
                    />
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
 * DataMobile component - Mobile view for POP list
 * @param {{areas: Area[]; onMenu: void; readOnly: boolean}} props
 */
function DataMobile({ areas, onMenu, readOnly = false }) {
  const expansionPassword = useExpansionToggle();

  return areas.map((area, i) => (
    <div key={i} className="tw-ring-1 tw-ring-gray-300 tw-rounded-lg">
      <Accordion>
        <AccordionSummary>
          <Stack>
            <span
              className={`tw-text-xs tw-font-medium tw-whitespace-nowrap ${!(area.active ?? true) && 'tw-text-red-500'}`}
            >
              {area.title}
            </span>
            <span className="tw-text-xs tw-text-gray-500">{area.categoryName}</span>
            <div className="tw-flex tw-flex-col tw-w-full tw-mt-3">
              <span className="tw-text-xs tw-text-gray-500">IP / PORT</span>
              <span className="tw-text-xs tw-text-gray-500">
                {area.routerConfig.address ?? '-'} / {area.routerConfig.port ?? '-'}
              </span>
            </div>
            <span className="tw-text-xs tw-text-gray-500 tw-uppercase">
              {area.active ?? true ? 'Active' : 'Inactive'}
            </span>
            <span className="tw-text-xs tw-text-gray-500" />
          </Stack>
        </AccordionSummary>
        <AccordionDetails>
          <Stack>
            <div className="tw-flex tw-flex-col tw-w-full tw-mb-2">
              <span className="tw-text-xs tw-text-gray-500">Username</span>
              <span className="tw-text-xs tw-font-medium">{area.routerConfig.username ?? '-'}</span>
            </div>
            <div className="tw-flex-row tw-flex tw-mb-3">
              <div className="tw-flex tw-flex-col tw-w-min">
                <span className="tw-text-xs tw-text-gray-500">Password</span>
                <span className="tw-text-xs tw-font-medium">
                  {expansionPassword.isIncludes(area._id) ? area.routerConfig.password : '******'}
                </span>
              </div>
              <IconButton onClick={() => expansionPassword.toggle(area._id)}>
                <Iconify
                  icon={expansionPassword.isIncludes(area._id) ? 'mdi:eye' : 'mdi:eye-off-outline'}
                />
              </IconButton>
            </div>
            {/* Client Setting */}
            <div className="tw-flex tw-flex-col tw-items-start tw-gap-2 tw-mb-3">
              <div className="tw-flex tw-flex-col tw-w-full">
                <span className="tw-text-xs tw-text-gray-500">Biaya Pasang</span>
                <span className="tw-text-xs tw-font-medium">
                  Rp. {area.installationCharge?.toString().toNumber().formatCurrency() ?? 0}
                </span>
              </div>
              <div className="tw-flex tw-flex-col  tw-w-full">
                <span className="tw-text-xs tw-text-gray-500">Prefix PPPoE</span>
                <span className="tw-text-xs tw-font-medium">{area.prefixCustomer ?? '-'}</span>
              </div>
              <div className="tw-flex tw-flex-col  tw-w-full">
                <span className="tw-text-xs tw-text-gray-500">Jatuh Tempo</span>
                <span className="tw-text-xs tw-font-medium">Tanggal {area.duoDate ?? '-'}</span>
              </div>
              <div className="tw-flex tw-flex-col tw-w-full">
                <span className="tw-text-xs tw-text-gray-500">Jenis</span>
                <span className="tw-text-xs tw-font-medium">
                  {area.isPrePaid
                    ? 'Prepaid/Prabayar/bayar didepan'
                    : 'Postpaid/Pascabayar/bayar dibelakang'}
                </span>
              </div>
            </div>
            <PopListStepper
              title={area.title}
              parentCategoryData={area.parentCategoryData}
              orientation="vertical"
            />
          </Stack>
        </AccordionDetails>
        <AccordionActions>
          {!!onMenu && (
            <IconButton
              color="primary"
              size="small"
              variant="contained"
              onClick={(e) => onMenu(e, area)}
            >
              <Iconify icon="mdi:menu" />
            </IconButton>
          )}
        </AccordionActions>
      </Accordion>
    </div>
  ));
}

// Connect DataTable to Redux for order and orderBy
const ConnectedDataTable = connect((state) => {
  const { order, orderBy } = state.popListStore;
  return { order, orderBy };
})(DataTable);

// Export with aliases
export { DataMobile as Mobile, ConnectedDataTable as Table };
