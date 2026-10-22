/**
 * @typedef {import("src/repositories/customer").Customer} Customer
 */

import { Fragment, useState } from 'react';
import { changeSorter } from '@utils/sort';
import { Iconify } from '@components/iconify';
import { goToGoogleMaps } from '@utils/goToMaps';
import { connect, useDispatch } from 'react-redux';
import CustomerAreaConfigurationTableAction from '@components/areaConfiguration/TableAction';

import Grid from '@mui/material/Unstable_Grid2';
import {
  Chip,
  Table,
  Stack,
  TableRow,
  Collapse,
  TableBody,
  TableCell,
  TableHead,
  IconButton,
  TableSortLabel,
} from '@mui/material';

import { setAreaConfigurationState } from 'src/stores/areaConfiguration';

/**
 * @callback CallbackCustomer
 * @param {Customer} customer
 */

/**
 * @param {{customers: Customer[], onEdit: CallbackCustomer, onRemove: CallbackCustomer, onShowTopology: CallbackCustomer; onClickBilling: CallbackCustomer; customerOrderBy: string; customerOrder: string; readOnly: boolean; showKtp: (ktpUrl) => void; rewritePPPoE: CallbackCustomer }} param0
 */
function CustomerAreaConfigurationTable({
  customers,
  onEdit,
  onRemove,
  onShowTopology,
  onClickBilling,
  customerOrder,
  customerOrderBy,
  readOnly = false,
  showKtp,
  rewritePPPoE,
}) {
  const dispatch = useDispatch();
  const headers = [
    {
      label: 'Pelanggan',
      id: 'fullname',
      sortable: true,
    },
    {
      label: 'Odp',
      id: 'odp',
      sortable: true,
    },
    {
      label: 'Serial Number',
      id: 'network',
      sortable: true,
    },
    {
      label: 'IP Address',
      id: 'ip',
      sortable: false,
    },
    {
      label: 'Actions',
      id: '_',
      sortable: false,
    },
  ];

  const [expandIndex, setExpandIndex] = useState([]);

  const toggleExpand = (index) => {
    const items = [...expandIndex];
    const indexItem = items.findIndex((i) => i === index);
    if (indexItem !== -1) {
      items.splice(indexItem, 1);
    } else {
      items.push(index);
    }

    setExpandIndex(items);
  };

  function sort(key) {
    const sortBy = changeSorter(customerOrder);
    if (key !== customerOrderBy) {
      dispatch(setAreaConfigurationState({ key: 'customerOrderBy', value: key }));
    }
    dispatch(setAreaConfigurationState({ key: 'customerOrder', value: sortBy }));
  }

  return (
    <Table>
      <TableHead>
        <TableRow>
          {headers.map((h) => (
            <TableCell key={h.id} sortDirection={h.id === customerOrderBy ? customerOrder : false}>
              {h.sortable ? (
                <TableSortLabel
                  direction={customerOrderBy === h.id ? customerOrder : 'asc'}
                  onClick={() => sort(h.id)}
                  className="tw-gap-2"
                  IconComponent={() => (
                    <Iconify
                      icon={
                        customerOrderBy === h.id
                          ? customerOrder === 'asc'
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
        {customers.map((customer, i) => (
          <Fragment key={i}>
            <TableRow
              sx={{
                backgroundColor: expandIndex.includes(i) ? 'rgba(0, 0, 0, 0.05)' : 'white',
                borderCollapse: 'collapse',
                borderTop: expandIndex.includes(i) ? 'solid 1px' : 'transparent',
                borderRight: expandIndex.includes(i) ? 'solid 1px' : 'transparent',
                borderLeft: expandIndex.includes(i) ? 'solid 1px' : 'transparent',
              }}
            >
              <TableCell>
                <div className="tw-flex tw-flex-row tw-gap-2 tw-items-center">
                  <IconButton aria-label="expand row" size="small" onClick={() => toggleExpand(i)}>
                    {expandIndex.includes(i) ? (
                      <Iconify icon="ic:baseline-keyboard-arrow-up" />
                    ) : (
                      <Iconify icon="ic:baseline-keyboard-arrow-down" />
                    )}
                  </IconButton>
                  {customer.ktp ? (
                    <button
                      type="button"
                      onClick={() => showKtp(customer.ktp)}
                      className="tw-flex-none"
                    >
                      <img
                        src={`/public/uploads/${customer.ktp.replaceAll('/public/uploads', '')}`}
                        className="tw-w-12 tw-aspect-square tw-rounded-full tw-object-cover tw-object-center tw-flex-none"
                        alt="KTP"
                        onError={(c) => {
                          c.currentTarget.onerror = null;
                          c.currentTarget.src = '/assets/avatar-25.webp';
                        }}
                      />
                    </button>
                  ) : (
                    <img
                      src="/assets/avatar-25.webp"
                      className="tw-w-12 tw-aspect-square tw-rounded-full tw-object-cover tw-object-center"
                      alt="KTP"
                    />
                  )}
                  <div className="tw-flex tw-flex-col ">
                    <span className="tw-text-xs tw-font-semibold">{customer.fullname}</span>
                    <p className="tw-text-xs tw-text-gray-500">{customer.customerId}</p>
                    {customer.isSpecial ? <Chip size='small' label="Pelanggan Spesial" className='tw-text-xs' color="primary" variant="soft" /> : null}
                    {/* <p className="tw-text-xs tw-text-gray-500">{customer.address}</p> */}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="tw-flex tw-flex-col tw-gap-1">
                  <span className="tw-text-xs">- {customer.ODPDetail?.name}</span>
                  <span className="tw-text-xs">- {customer.vlan}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="tw-flex tw-flex-col">
                  <span className="tw-text-xs">{customer.routerSerialNumber}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="tw-flex tw-flex-col">
                  <span className="tw-text-xs">{customer.ipRemote}</span>
                </div>
              </TableCell>
              <TableCell>
                <CustomerAreaConfigurationTableAction
                  customer={customer}
                  onClickBilling={onClickBilling}
                  rewritePPPoE={rewritePPPoE}
                  onShowTopology={onShowTopology}
                  onEdit={onEdit}
                  onRemove={onRemove}
                  readOnly={readOnly}
                />
              </TableCell>
            </TableRow>
            <TableRow
              sx={{
                backgroundColor: expandIndex.includes(i) ? 'rgba(0, 0, 0, 0.05)' : 'white',
                borderCollapse: 'collapse',
                borderBottom: expandIndex.includes(i) ? 'solid 1px' : 'transparent',
                borderRight: expandIndex.includes(i) ? 'solid 1px' : 'transparent',
                borderLeft: expandIndex.includes(i) ? 'solid 1px' : 'transparent',
              }}
            >
              <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={headers.length}>
                <Collapse in={expandIndex.includes(i)}>
                  <Grid container spacing={0.5} className="tw-py-3 tw-px-10">
                    <Grid xs={6}>
                      <Stack spacing={1}>
                        <p className="tw-text-xs tw-text-gray-500">Telepon: {customer.phone}</p>
                        <p className="tw-text-xs tw-text-gray-500">
                          Harga Paket: Rp. {customer.activePackage?.price.formatCurrency()}
                        </p>
                        <p className="tw-text-xs tw-text-gray-500">
                          {customer.activePackage.package}
                        </p>
                        <p className="tw-text-xs tw-text-gray-500">SSID: {customer.routerSsid}</p>
                        <p className="tw-text-xs tw-text-gray-500">
                          Password: {customer.routerPassword}
                        </p>
                      </Stack>
                    </Grid>
                    <Grid xs={6}>
                      <Stack spacing={1}>
                        <Chip
                          label={customer.isolated ? 'Isolated' : 'Not Isolated'}
                          size="small"
                          className="tw-w-min tw-mt-0.5 tw-text-primary"
                        />
                        {customer.location?.lat && customer.location?.lng ? (
                          <Chip
                            title="Lokasi"
                            label="Lokasi"
                            size="small"
                            className="tw-w-min"
                            onClick={() => {
                              goToGoogleMaps(customer.location.lat, customer.location.lng);
                            }}
                          />
                        ) : null}
                        {customer.isSpecial && (
                          <Chip
                            size="small"
                            color="primary"
                            label="Pelanggan Spesial"
                            variant="outlined"
                            className="tw-w-min"
                          />
                        )}
                        <p className="tw-text-xs tw-text-gray-500">
                          Area: {customer.area?.title ?? '-'}
                        </p>
                        <p className="tw-text-xs tw-text-gray-500">
                          PPPoE Name: {customer.pppoeName}
                        </p>
                        <p className="tw-text-xs tw-text-gray-500">
                          PPPoE Password: {customer.pppoePassword}
                        </p>
                        <p className="tw-text-xs tw-text-gray-500">
                          GPON MAC: {customer.routerMac ?? '-'}
                        </p>
                        <p className="tw-text-xs tw-text-gray-500">
                          GPON SN: {customer.routerSerialNumber ?? '-'}
                        </p>
                      </Stack>
                    </Grid>
                  </Grid>
                </Collapse>
              </TableCell>
            </TableRow>
          </Fragment>
        ))}
      </TableBody>
    </Table>
  );
}

const mapStateToProps = (state) => {
  const { customerOrder, customerOrderBy } = state.areaConfigurationStore;
  return { customerOrder, customerOrderBy };
};

export default connect(mapStateToProps)(CustomerAreaConfigurationTable);
