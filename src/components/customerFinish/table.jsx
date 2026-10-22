/**
 * @typedef {import("src/repositories/customer").Customer} Customer
 * @typedef {import('@components/areaConfigurationFilterDialog').Odp} Odp
 */

import { toast } from 'sonner';
import { Icon } from '@iconify/react';
import { useMemo, Fragment } from 'react';
import { changeSorter } from '@utils/sort';
import { copyText } from '@utils/clipboard';
import { Iconify } from '@components/iconify';
import { goToGoogleMaps } from '@utils/goToMaps';
import { connect, useDispatch } from 'react-redux';
import { usePrivilege } from '@auth/hooks/privileges';
import { useExpansionToggle } from '@hooks/use-expansion-toggle';

import Grid from '@mui/material/Unstable_Grid2';
import {
  Chip,
  List,
  Table,
  Stack,
  Button,
  TableRow,
  Collapse,
  ListItem,
  useTheme,
  TableCell,
  TableHead,
  TableBody,
  Typography,
  IconButton,
  ListItemText,
  TableSortLabel,
} from '@mui/material';

import { customerFinishStoreSetState } from 'src/stores/customerFinishStore';

/**
 * @param {{customers: Customer[], onShowMenu: void; orderBy: string; order: string; showKtp: (ktp: string) => void}} props - react props
 */
function CustomerFinishTable({ customers, onShowMenu, onOpenMap, order, orderBy, showKtp }) {
  const dispatch = useDispatch();
  const headers = [
    {
      label: 'Pelanggan',
      id: 'customer',
      sortable: true,
    },
    {
      label: 'Tujuan',
      id: 'address',
      sortable: true,
    },
    {
      label: 'Teknisi',
      id: 'engineer',
      sortable: true,
    },
    {
      label: 'Finish Time',
      id: 'finishProcessAt',
      sortable: true,
    },
    {
      label: 'Input By',
      id: 'inputBy',
      sortable: false,
    },
    {
      label: '',
      id: '_',
      sortable: false,
    },
  ];

  const { userId, isEngineer, isAdmin, isNoc, isLo, isDeveloper } = usePrivilege();
  const allowModify = useMemo(() => isAdmin || isNoc || isLo || isDeveloper);
  const theme = useTheme();
  const togglePassword = useExpansionToggle();

  /**
   * @param {Odp} odp
   */
  const onLocationODP = (odp) => {
    if (!odp.lat || !odp.lng) {
      toast.info('Lokasi ODP belum ditentukan');
      return;
    }

    goToGoogleMaps(odp.lat, odp.lng);
  };

  const expansionToggle = useExpansionToggle();

  /**
   * Menentukan apakah baris customer dapat dimodifikasi.
   * - Untuk engineer: hanya bila customer ditugaskan ke engineer tsb.
   * - Untuk selain engineer: bila punya izin modifikasi (admin/noc/lo).
   * @param {Customer} customer
   */
  const canModify = (customer) => {
    const engineerRule = isEngineer && (customer.engineers ?? []).includes(userId);
    return allowModify || engineerRule;
  };

  const replaceLabel = (label) => {
    switch (label) {
      case 'warning':
        return 'Belum diproses';
        break;
      case 'processed':
        return 'Progress';
        break;
      case 'waiting_approval':
        return 'Menunggu Penyelesaian';
        break;
      default:
        return label;
        break;
    }
  };

  const chipColor = {
    unconfirmed: 'warning',
    processed: 'primary',
    active: 'success',
  };

  const replaceColor = (label) => {
    switch (label) {
      case 'processed':
        return 'primary';
        break;
      case 'active':
        return 'success';
        break;
      case 'unconfirmed':
        return 'warning';
        break;
      case 'waiting_approval':
        return 'error';
        break;
      case 'cancel':
        return 'error';
        break;
      default:
        return 'default';
        break;
    }
  };

  function sort(key) {
    const sortBy = changeSorter(order);
    if (key !== orderBy) {
      dispatch(customerFinishStoreSetState({ key: 'orderBy', value: key }));
    }
    dispatch(customerFinishStoreSetState({ key: 'order', value: sortBy }));
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
        {customers?.map((c, i) => (
          <Fragment key={i}>
            <TableRow
              className={
                expansionToggle.isIncludes(c._id) &&
                'tw-bg-gray-200 tw-border-x tw-border-t tw-border-black'
              }
            >
              <TableCell>
                <div className="tw-flex tw-flex-row tw-gap-2 tw-items-center">
                  <IconButton onClick={() => expansionToggle.toggle(c._id)}>
                    <Iconify icon="mdi:menu-down" />
                  </IconButton>
                  {c.ktp ? (
                    <button type="button" onClick={() => showKtp(c.ktp)}>
                      <img
                        src={`/public/uploads/${c.ktp.replaceAll('/public/uploads', '')}`}
                        className="tw-w-16 tw-flex-none tw-aspect-square tw-rounded-full tw-object-cover tw-object-center"
                        alt="KTP"
                        onError={({ currentTarget }) => {
                          currentTarget.onerror = null;
                          currentTarget.src = '/assets/avatar-25.webp';
                        }}
                      />
                    </button>
                  ) : (
                    <img
                      src="/assets/avatar-25.webp"
                      className="tw-w-16 tw-flex-none tw-aspect-square tw-rounded-full tw-object-cover tw-object-center"
                      alt="KTP"
                    />
                  )}
                  <Stack>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <span className="tw-font-semibold tw-text-xs">{c.fullname}</span>
                      {c.isSimplePSB && (
                        <Chip
                          label="Simple PSB"
                          color="success"
                          variant="soft"
                          size="small"
                          className="tw-w-min"
                        />
                      )}
                    </Stack>
                    <span className="tw-text-xs">{c.customerId}</span>
                    <span className="tw-text-xs">{c.phone}</span>
                  </Stack>
                </div>
              </TableCell>
              <TableCell>
                <Stack spacing={0.5}>
                  <Typography variant="caption">{c.address}</Typography>
                  <div className="tw-flex tw-flex-wrap tw-gap-2">
                    <Chip
                      label={replaceLabel(c.status)}
                      color={replaceColor(c.status)}
                      className="tw-w-min"
                      variant="outlined"
                    />
                    <Button onClick={() => onOpenMap(c)} size="small" variant="outlined">
                      <Icon icon="logos:google-maps" fontSize={16} className="tw-mr-2" />{' '}
                      <span className="tw-text-gray-500">Lokasi</span>
                    </Button>
                  </div>
                </Stack>
              </TableCell>
              <TableCell>
                <List>
                  {c.engineersData?.map((e, j) => (
                    <ListItem key={j} dense sx={{ padding: 0, alignItems: 'start' }}>
                      <ListItemText>
                        <span className="tw-text-xs tw-font-normal">{e.fullname}</span>
                      </ListItemText>
                    </ListItem>
                  ))}
                </List>
              </TableCell>
              <TableCell>
                <Stack>
                  <Typography variant="caption">
                    {c.finishProcessAt?.toDate().format('dd MMM yyyy, hh:mm')}
                  </Typography>
                </Stack>
              </TableCell>
              <TableCell>
                <span className="tw-text-xs">{c.marketingFullname ?? '-'}</span>
              </TableCell>

              {canModify(c) ? (
                <TableCell>
                  <Button
                    onClick={(e) => onShowMenu(e, c)}
                    size="small"
                    color="primary"
                    variant="contained"
                  >
                    <Icon icon="ic:baseline-menu" fontSize={16} className="tw-mr-2" /> Action
                  </Button>
                </TableCell>
              ) : null}
            </TableRow>
            <TableRow
              className={
                expansionToggle.isIncludes(c._id) &&
                'tw-bg-gray-200 tw-border-x tw-border-b tw-border-black'
              }
            >
              <TableCell colspan={7} sx={{ padding: 0 }}>
                <Collapse in={expansionToggle.isIncludes(c._id)}>
                  <Grid container spacing={1} className="tw-py-3 tw-pl-24 tw-text-gray-500">
                    <Grid xs={6}>
                      <div className="tw-flex tw-flex-row tw-items-center tw-gap-1">
                        <p className="tw-text-xs tw-font-medium">
                          <Iconify icon="mdi:dot" /> GPON SN: {c.routerSerialNumber ?? '-'}
                        </p>
                      </div>
                    </Grid>
                    <Grid xs={6}>
                      <div className="tw-flex tw-flex-row tw-items-center tw-gap-1">
                        <p className="tw-text-xs tw-font-medium">
                          <Iconify icon="mdi:dot" /> ONU MAC: {c.routerMac ?? '-'}
                        </p>
                      </div>
                    </Grid>
                    <Grid xs={6}>
                      <div className="tw-flex tw-flex-row tw-items-center tw-gap-1">
                        <p className="tw-text-xs tw-font-medium">
                          <Iconify icon="mdi:dot" /> SSID: {c.routerSsid ?? '-'}
                        </p>
                      </div>
                    </Grid>

                    <Grid xs={6}>
                      <div className="tw-flex tw-flex-row tw-items-center tw-gap-1">
                        <p className="tw-text-xs tw-font-medium">
                          <Iconify icon="mdi:dot" /> {c.odpName ?? '-'}
                          <Button
                            variant="text"
                            size="small"
                            color="primary"
                            sx={{ height: '10px' }}
                            onClick={() => {
                              onLocationODP(c.ODPDetail);
                            }}
                          >
                            Lokasi
                          </Button>
                        </p>
                      </div>
                    </Grid>
                    <Grid xs={6}>
                      <div className="tw-flex tw-flex-row tw-items-center tw-gap-1">
                        <p className="tw-text-xs tw-font-medium">
                          <Iconify icon="mdi:dot" /> Password:{' '}
                          {togglePassword.isIncludes(c._id) ? c.routerPassword ?? '-' : '******'}
                        </p>
                        <IconButton onClick={() => togglePassword.toggle(c._id)}>
                          <Iconify
                            icon={
                              togglePassword.isIncludes(c._id) ? 'mdi:eye' : 'mdi:eye-off-outline'
                            }
                          />
                        </IconButton>
                      </div>
                    </Grid>
                    {allowModify && (
                      <Grid xs={6}>
                        <p className="tw-text-xs tw-font-medium">
                          <Iconify icon="mdi:dot" /> Area Server: {c.areaName ?? '-'}
                        </p>
                      </Grid>
                    )}
                    <Grid xs={6}>
                      <div className="tw-flex tw-flex-row tw-items-center tw-gap-1">
                        <Iconify icon="mdi:dot" />
                        <p className="tw-text-xs tw-font-medium">
                          PPPoE Name: {c.pppoeName ?? '-'}
                        </p>
                        <Button
                          variant="text"
                          size="small"
                          color="primary"
                          sx={{ height: '10px' }}
                          onClick={() => {
                            copyText(c.pppoeName, 'PPPoE Name disalin');
                          }}
                        >
                          Salin
                        </Button>
                      </div>
                    </Grid>
                    <Grid xs={6}>
                      <p className="tw-text-xs tw-font-medium">
                        <Iconify icon="mdi:dot" /> {c.vlan ?? '-'}
                      </p>
                    </Grid>
                    <Grid xs={6}>
                      <div className="tw-flex tw-flex-row tw-items-center tw-gap-1">
                        <Iconify icon="mdi:dot" />
                        <p className="tw-text-xs tw-font-medium">
                          PPPoE Password: {c.pppoePassword ?? '-'}
                        </p>
                        <Button
                          variant="text"
                          size="small"
                          color="primary"
                          sx={{ height: '10px' }}
                          onClick={() => {
                            copyText(c.pppoePassword, 'PPPoE Password disalin');
                          }}
                        >
                          Salin
                        </Button>
                      </div>
                    </Grid>
                    <Grid xs={6}>
                      <p className="tw-text-xs tw-font-medium">
                        <Iconify icon="mdi:dot" /> IP Remote: {c.ipRemote ?? '-'}
                      </p>
                    </Grid>
                    <Stack spacing={1}>
                      {/* {c.status === 'processed' && (
                        <p className="tw-text-xs tw-font-medium">
                          Teknisi:{' '}
                          {c.engineersData?.map((e) => e.fullname).join(', ') ?? c.engineerName}
                        </p>
                      )} */}
                    </Stack>
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
  const { order, orderBy } = state.customerFinishStore;
  return { order, orderBy };
};

export default connect(mapStateToProps)(CustomerFinishTable);
