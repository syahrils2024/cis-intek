/**
 * @typedef {import("src/stores/installationRequest").InstallationRequestStore} InstallationRequestStore
 * @typedef {import('src/repositories/installation').InstallationRequest} InstallationRequest
 * @typedef {import('src/repositories/user').User} User
 * @typedef {import('@/repositories/installationRequest').InstallationRequestList} InstallationRequestList
 * @typedef {import('src/stores/areaStore').AreaStore} AreaStore
 */

import { toast } from 'sonner';
import { changeSorter } from '@utils/sort';
import { Iconify } from '@components/iconify';
import { useBoolean } from '@hooks/use-boolean';
import { useConfirm } from 'material-ui-confirm';
import { connect, useDispatch } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { usePrivilege } from '@auth/hooks/privileges';
import { ViewerImageDialog } from '@components/viewerImageDialog';
import AreaPickerFilter from '@components/billing/areaPickerFilter';
import { useRef, useMemo, useState, Fragment, useEffect } from 'react';
import InstallationMobileItem from '@components/installationRequest/MobileItem';
import CustomerFormDialog from '@components/areaConfiguration/customerFormDialog';
import InstallationRequestEngineerPicker from '@components/installationRequest/engineerPicker';

import Grid from '@mui/material/Unstable_Grid2';
import {
  Menu,
  Chip,
  Table,
  Stack,
  Button,
  Divider,
  useTheme,
  TableRow,
  MenuItem,
  Collapse,
  TableHead,
  TableCell,
  TableBody,
  TextField,
  IconButton,
  Typography,
  ListItemIcon,
  ListItemText,
  useMediaQuery,
  TableSortLabel,
} from '@mui/material';

import 'src/extension/date';
import 'src/extension/string';
import { setArea } from 'src/stores/areaStore';
import {
  setInstallationRequest,
  setInstallationRequestState,
} from 'src/stores/installationRequest';
import {
  areaRepository,
  installationRepository,
  installationRequestRepository,
} from 'src/repositories';

/**
 * @param {InstallationRequestStore & AreaStore} props -- react props
 */
function InstallationRequest({ requests, all, sort, sortBy }) {
  const headers = [
    { label: 'Pelanggan', id: 'customer', sortable: true },
    { label: 'Area', id: 'area', sortable: true },
    { label: 'Pengajuan Oleh', id: 'requestBy', sortable: true },
    { label: 'Status', id: 'status', sortable: true },
    { label: 'Actions', id: 'actions', sortable: true },
  ];
  const dispatch = useDispatch();
  const loading = useBoolean(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const showCustomerForm = useBoolean(false);
  const confirm = useConfirm();
  const showEngineerPicker = useBoolean(false);
  const [search, setSearch] = useState('');
  const [query, setQuery] = useSearchParams();
  const [searchArea, setSearchArea] = useState('');
  const [searchAreaName, setSearchAreaName] = useState('Semua');
  const [modemHasSet, setModemHasSet] = useState(null);

  const { isAdmin, isEngineer, userId, isNoc } = usePrivilege();
  const allowModify = useMemo(() => isAdmin || isNoc);

  const canRemove = useMemo(() => {
    if (allowModify) return true;
    if (isEngineer) {
      return requests.some((r) => r._id === selectedItem?._id && r.requestedById === userId);
    }
    return false;
  });

  const viewerImageDialogRef = useRef();
  const areaPickerRef = useRef();

  const searchRequest = useMemo(() => {
    const s = search.toLowerCase();
    return (
      requests?.filter(
        (r) => r.fullname.toLowerCase().includes(s) || r.address.toLowerCase().includes(s)
      ) ?? []
    );
  });

  const doSearchArea = (value) => {
    setSearchArea(value);
    setQuery({ qArea: value });
  };

  const mapAreas = useMemo(() => {
    const result = [];
    all.map((area) => {
      result.push(area.title);
      const currentAreas = area.area;
      result.push(...currentAreas);
      return;
    });
    return result;
  });

  /** @type {[InstallationRequestList, void]} */
  const [selectedItem, setSelectedItem] = useState(null);

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event, item) => {
    setAnchorEl(event.currentTarget);
    setSelectedItem(item);
  };
  const handleClose = () => {
    setAnchorEl(null);
    setSelectedItem(null);
  };

  const [statusForm, setStatusForm] = useState('pending');

  async function pickArea() {
    const result = await areaPickerRef.current.open(searchArea);
    if (!result) return;
    doSearchArea(result._id);
    setSearchAreaName(result.name);
  }

  const prefetch = async () => {
    loading.onTrue();
    try {
      if (all.length <= 0) {
        const snapshotArea = await areaRepository.getAllArea();
        dispatch(setArea(snapshotArea));
      }

      const snapshot = await installationRepository.getInstallationRequest({
        area: searchArea === '' ? undefined : searchArea,
        orderBy: sortBy,
        order: sort,
      });
      dispatch(setInstallationRequest(snapshot));
    } catch (error) {
      toast.error(error.message);
    } finally {
      loading.onFalse();
    }
  };

  /**
   * @param {User} engineer
   */
  const onApprove = async (engineer) => {
    try {
      showEngineerPicker.onFalse();
      await confirm({
        title: 'Setujui & Proses',
        content: `Apakah anda ingin menyetujui permintaan dan proses pemasangan ${selectedItem.fullname}`,
        confirmationText: 'Setujui & Proses',
        confirmationButtonProps: { color: 'primary', variant: 'contained' },
        cancellationText: 'Batal',
      });

      await installationRequestRepository.approve({ id: selectedItem._id, engineers: engineer });
      prefetch();
      toast.success('Berhasil menyetujui');
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
    } finally {
      handleClose();
    }
  };

  const onReject = async () => {
    try {
      await confirm({
        title: 'Batalkan Pemasangan',
        content: `Apakah anda ingin membatalkan permintaan pemasangan oleh ${selectedItem.fullname}`,
        confirmationText: 'Batalkan',
        confirmationButtonProps: { color: 'error' },
        cancellationText: 'Batal',
      });

      await installationRequestRepository.reject(selectedItem._id);
      toast.info('Berhasil membatalkan');
      prefetch();
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
    } finally {
      handleClose();
    }
  };

  const onRemove = async () => {
    try {
      setModemHasSet(false);
      await confirm({
        title: 'Hapus',
        content: `Apakah anda ingin menghapus data permintaan pemasangan oleh ${selectedItem.fullname}`,
        confirmationText: 'Hapus',
        confirmationButtonProps: { color: 'error' },
        cancellationText: 'Batal',
      });

      await installationRequestRepository.remove(selectedItem._id);
      toast.info('Berhasil menghapus');
      prefetch();
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
    } finally {
      handleClose();
    }
  };

  const onSendNotification = async () => {
    try {
      await confirm({
        title: 'Ajukan',
        content: `Apakah anda ingin mengajukan registrasi pemasangan ${selectedItem.fullname}`,
        confirmationText: 'Ajukan',
        confirmationButtonProps: { color: 'primary' },
        cancellationText: 'Batal',
      });

      let statusModemHasSet = false;

      try {
        await confirm({
          title: 'Status Modem/Router',
          content: `Status Modem/Router sudah terpasang?`,
          confirmationText: 'Sudah Terpasang',
          confirmationButtonProps: { color: 'primary' },
          cancellationText: 'Belum Terpasang',
        });
        statusModemHasSet = true;
      } catch (error) {
        statusModemHasSet = false;
      }

      await installationRequestRepository.notifRequest(selectedItem._id, {
        modemHasSet: statusModemHasSet,
      });
      toast.info('Mengirim Notifikasi');
      prefetch();
    } catch (error) {
      if (error instanceof Error) toast.error('');
    } finally {
      handleClose();
    }
  };

  const onCloseForm = (isPrefetch) => {
    showCustomerForm.onFalse();
    handleClose();
    if (isPrefetch) prefetch();
  };

  useEffect(() => {
    // if (requests.length >= 1) return;
    prefetch();
    const q = query.get('q');
    const qArea = query.get('qArea');
    if (q) {
      setSearch(q);
    }
    if (qArea) {
      setSearchArea(qArea);
    }
  }, []);

  useEffect(() => {
    prefetch();
  }, [searchArea, sort, sortBy]);

  function changeSortedField(key) {
    const sortTarget = key === sortBy ? changeSorter(sort) : 'asc';
    if (key !== sortBy) {
      dispatch(setInstallationRequestState({ key: 'sortBy', value: key }));
    }
    dispatch(setInstallationRequestState({ key: 'sort', value: sortTarget }));
  }

  function showKtp(ktpPath) {
    const imageUrl = ktpPath.replaceAll('/public/uploads/', '');
    viewerImageDialogRef.current.showImage([imageUrl], 'KTP');
  }

  return (
    <>
      <Grid container className="tw-w-full tw-px-5" spacing={2}>
        <Grid xs={9} md={6}>
          <Typography variant={isMobile ? 'h6' : 'h4'}>Registrasi</Typography>
        </Grid>
        <Grid xs={3} md={2}>
          <Button
            color="primary"
            variant="contained"
            fullWidth
            onClick={() => {
              setStatusForm('pending');
              showCustomerForm.onTrue();
            }}
          >
            <Iconify icon="mdi:plus" /> {isMobile ? '' : '  Registrasi'}
          </Button>
        </Grid>
        <Grid xs={12} md={2}>
          <TextField
            label="Area"
            value={searchAreaName}
            fullWidth
            size="small"
            InputProps={{ readOnly: true }}
            onClick={() => pickArea()}
          />
          {/* <TextField
            select
            name="area"
            label="Area"
            value={searchArea}
            onChange={(e) => doSearchArea(e.target.value)}
            fullWidth
            size="small"
          >
            <MenuItem value="">Semua</MenuItem>
            {mapAreas.map((a, i) =>
              typeof a === 'string' ? (
                <MenuItem disabled key={i}>
                  {a}
                </MenuItem>
              ) : (
                <MenuItem key={i} value={a._id}>
                  <div>{a.title}</div>
                </MenuItem>
              )
            )}
          </TextField> */}
        </Grid>
        <Grid xs={12} md={2}>
          <TextField
            fullWidth
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            label="Cari"
            size="small"
          />
        </Grid>
        <Grid xs={12} className="w-full tw-flex">
          {/* Content */}
          {isMobile ? (
            <InstallationMobileItem
              requests={searchRequest}
              onAction={(e, item) => handleClick(e, item)}
              showActions
              showKtp={(ktp) => showKtp(ktp)}
            />
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  {headers.map((h) => (
                    <TableCell key={h.id} sortDirection={h.id === sortBy ? sort : false}>
                      {h.sortable ? (
                        <TableSortLabel
                          direction={sortBy === h.id ? sort : 'asc'}
                          onClick={() => changeSortedField(h.id)}
                          className="tw-gap-2"
                          IconComponent={() => (
                            <Iconify
                              icon={
                                sortBy === h.id
                                  ? sort === 'asc'
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
              <TableBodyData
                requests={searchRequest}
                onAction={(e, item) => handleClick(e, item)}
                showActions
                showKtp={(ktp) => showKtp(ktp)}
              />
            </Table>
          )}

          {/* End Content */}
        </Grid>
      </Grid>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
      >
        {allowModify && (
          <MenuItem
            onClick={() => {
              setStatusForm('pending-process');
              showCustomerForm.onTrue();
            }}
          >
            <ListItemIcon>
              <Iconify icon="mdi:check" />
            </ListItemIcon>
            <ListItemText>Setujui & Proses</ListItemText>
          </MenuItem>
        )}
        {allowModify && (
          <MenuItem onClick={onReject}>
            <ListItemIcon>
              <Iconify icon="mdi:close" />
            </ListItemIcon>
            <ListItemText>Tolak</ListItemText>
          </MenuItem>
        )}
        <Divider />
        <MenuItem
          onClick={() => {
            setStatusForm('pending');
            showCustomerForm.onTrue();
          }}
        >
          <ListItemIcon>
            <Iconify icon="mdi:edit" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>

        <MenuItem onClick={() => onSendNotification()}>
          <ListItemIcon>
            <Iconify icon="mdi:send-outline" />
          </ListItemIcon>
          <ListItemText>Ajukan</ListItemText>
        </MenuItem>

        {canRemove && (
          <MenuItem onClick={onRemove}>
            <ListItemIcon>
              <Iconify icon="mdi:trash" />
            </ListItemIcon>
            <ListItemText>Hapus</ListItemText>
          </MenuItem>
        )}
      </Menu>
      {/* Dialog */}
      <CustomerFormDialog
        show={showCustomerForm.value}
        onClose={onCloseForm}
        statusMode={statusForm}
        selectedCustomer={selectedItem}
      />
      <InstallationRequestEngineerPicker
        show={showEngineerPicker.value}
        onPick={onApprove}
        selectedItem={selectedItem}
        onClose={() => {
          showEngineerPicker.onFalse();
          handleClose();
        }}
      />
      <ViewerImageDialog ref={viewerImageDialogRef} />
      <AreaPickerFilter ref={areaPickerRef} />
    </>
  );
}

/**
 * @param {{requests: InstallationRequestList[]; onAction: void; showActions: boolean; showKtp: (ktp: string) => void}} props
 */
function TableBodyData({ requests, onAction, showActions, showKtp }) {
  /** @type {[string, void]} */
  const [expandId, setExpandId] = useState([]);

  const toggleExpand = (id) => {
    const index = expandId.indexOf(id);
    const temp = [...expandId];
    if (index === -1) {
      temp.push(id);
    } else {
      temp.splice(index, 1);
    }

    setExpandId(temp);
  };

  const colorStatus = (status) => {
    switch (status) {
      case 'unconfirmed':
        return 'warning';
      case 'pending':
        return 'primary';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const replaceStatus = (status) => {
    switch (status) {
      case 'pending':
        return 'Request';
      case 'unconfirmed':
        return 'unprocessed';
      default:
        return status;
    }
  };

  return (
    <TableBody>
      {requests.map((request, i) => (
        <Fragment key={i}>
          <TableRow>
            <TableCell width={430}>
              <div className="tw-flex tw-flex-row tw-gap-2 tw-items-center">
                <IconButton onClick={() => toggleExpand(request._id)}>
                  <Iconify icon="mdi:menu-down" />
                </IconButton>
                {request.isSpecial && (
                  <Chip
                    size="small"
                    color="primary"
                    label="Pelanggan Spesial"
                    variant="outlined"
                    className="tw-w-min"
                  />
                )}
                {request.ktp ? (
                  <button
                    type="button"
                    onClick={() => showKtp(request.ktp)}
                    className="tw-flex-none"
                  >
                    <img
                      src={`/public/uploads/${request.ktp.replaceAll('/public/uploads', '')}`}
                      className="tw-w-16 tw-aspect-square tw-rounded-full tw-object-cover tw-object-center"
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
                    className="tw-w-16 tw-aspect-square tw-rounded-full tw-object-cover tw-object-center"
                    alt="KTP"
                  />
                )}
                <Stack>
                  <span className="tw-text-xs tw-font-semibold tw-uppercase">
                    {request.fullname}
                  </span>
                  <span className="tw-text-xs">{request.phone ?? '-'}</span>
                  <span className="tw-text-xs">{request.address ?? '-'}</span>
                </Stack>
              </div>
            </TableCell>
            <TableCell>
              <p className="tw-text-xs tw-font-medium">{request.areaDetail?.title ?? '-'}</p>
            </TableCell>
            <TableCell>
              <Stack>
                <span className="tw-text-xs">{request.requestedBy}</span>
                <span className="tw-text-xs">{request.createdAt.toDate().formatSummaryDate()}</span>
              </Stack>
            </TableCell>
            <TableCell>
              <Chip
                label={replaceStatus(request.status).toCapitalCase()}
                size="small"
                className="tw-w-min tw-flex-none"
                variant="outlined"
                color={colorStatus(request.status)}
              />
            </TableCell>
            <TableCell>
              {showActions && (
                <Button color="primary" variant="contained" onClick={(e) => onAction(e, request)}>
                  Action
                </Button>
              )}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell sx={{ padding: 0 }} colSpan={4}>
              <Collapse in={expandId.includes(request._id)}>
                <Grid container className="tw-p-4" spacing={0.5}>
                  <Grid xs={6}>
                    <p className="tw-text-xs tw-text-gray-500">
                      Serial Number: {request.routerSerialNumber ?? '-'}
                    </p>
                  </Grid>
                  <Grid xs={6}>
                    <p className="tw-text-xs tw-text-gray-500">SSID: {request.routerSsid ?? '-'}</p>
                  </Grid>
                  <Grid xs={6}>
                    <p className="tw-text-xs tw-text-gray-500">{request.package?.title ?? '-'}</p>
                  </Grid>
                  <Grid xs={6}>
                    <p className="tw-text-xs tw-text-gray-500">
                      Password: {request.routerPassword ?? '-'}
                    </p>
                  </Grid>
                  <Grid xs={6}>
                    <p className="tw-text-xs tw-text-gray-500">{request.odpDetail?.name ?? '-'}</p>
                  </Grid>
                </Grid>
              </Collapse>
            </TableCell>
          </TableRow>
        </Fragment>
      ))}
    </TableBody>
  );
}

const mapStateToProps = (state) => ({
  requests: state.installationRequestStore.requests,
  all: state.areaStore.all,
  sortBy: state.installationRequestStore.sortBy,
  sort: state.installationRequestStore.sort,
});
export default connect(mapStateToProps)(InstallationRequest);
