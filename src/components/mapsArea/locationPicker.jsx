/**
 * @typedef {import("@/stores/mapsArea").MapsAreaStore} MapsAreaStore
 * @typedef {import('src/repositories/customer').Customer} Customer
 * @typedef {import('src/repositories/area').Odp} Odp
 * @typedef {import('src/repositories/area').Area} Area
 * @typedef {import('src/repositories/area').AreaCategory} AreaCategory
 */

import { toast } from 'sonner';
import { useDebounce } from 'use-debounce';
import { useBoolean } from '@hooks/use-boolean';
import { connect, useDispatch } from 'react-redux';
import { useMemo, useState, useEffect } from 'react';

import { LoadingButton } from '@mui/lab';
import {
  Chip,
  Stack,
  Dialog,
  useTheme,
  MenuItem,
  TextField,
  DialogTitle,
  DialogActions,
  useMediaQuery,
  DialogContent,
} from '@mui/material';

import { setMapsAreaStore } from 'src/stores/mapsArea';
import { geoRepository, areaRepository } from 'src/repositories';

/**
 * @param {MapsAreaStore & {show: boolean; onClose: void}} props -- react props
 */
function MapsAreaLocationPicker({
  searchAreas,
  searchOdps,
  searchCustomers,
  searchType,
  searchAreaCategories,
  show,
  onClose,
  allAreas,
  selectedAreaId,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const dispatch = useDispatch();
  const loading = useBoolean(false);
  const [latLngField, setLatLngField] = useState('');

  const searchTypes = [
    { label: 'by Area', value: 'area_category' },
    // { label: 'by Server Area', value: 'mikrotik' },
    { label: 'by ODP', value: 'odp' },
    {
      label: 'by Customer/ID/Phone',
      value: 'customer',
    },
  ];

  const [search, setSearch] = useState('');
  const [debounceSearch] = useDebounce(search, 500);

  const areaList = useMemo(() => {
    const maping = [];

    allAreas.forEach((a) => {
      maping.push({
        title: a.title,
        _id: a._id,
        category: 'area_category',
      });
      a.area.forEach((area) => {
        maping.push({ ...area, category: 'area' });
      });
    });

    return maping;
  });

  /**
   * @param {AreaCategory} areaCategory
   */
  const pickAreaCategory = async (areaCategory) => {
    loading.onTrue();
    try {
      let center =
        areaCategory.lat && areaCategory.lng ? [areaCategory.lat, areaCategory.lng] : undefined;

      const areaMikrotik = await areaRepository.getAllArea({
        parentArea: areaCategory._id ?? areaCategory.id,
      });
      const customers = await areaRepository.getCustomerArea(areaCategory._id ?? areaCategory.id, {
        page: 0,
        status: 'active',
      });
      const odps = await geoRepository.searchODPByAreaCategory(areaCategory.id ?? areaCategory._id);

      const locationArea = areaMikrotik.find((a) => a.lat && a.lng);
      const locationOdps = odps.find((o) => o.lat && o.lng);
      const locationCustomer = customers.customers.find((c) => c.location?.lat && c.location?.lng);

      if (!center) {
        toast.warning('Area tidak memiliki titik lokasi');
        if (locationArea) {
          center = [locationArea.lat, locationArea.lng];
        } else if (locationOdps) {
          center = [locationOdps.lat, locationOdps.lng];
        } else if (locationCustomer) {
          center = [locationCustomer.location.lat, locationCustomer.location.lng];
        }
      }

      const filteredCustomers = customers.customers.filter(
        (c) => c.location?.lat && c.location?.lng
      );
      const filteredAreas = areaMikrotik.filter((m) => m.lat && m.lng);
      const filteredOdps = odps.filter((o) => o.lat && o.lng);

      // console.log({ areaMikrotik, filteredOdps });

      // dispatch(setMapsAreaStore({ key: 'showLabel', value: true }));
      dispatch(setMapsAreaStore({ key: 'showOdp', value: true }));
      dispatch(setMapsAreaStore({ key: 'showCustomer', value: false }));
      dispatch(setMapsAreaStore({ key: 'customers', value: filteredCustomers }));
      dispatch(setMapsAreaStore({ key: 'areas', value: filteredAreas }));
      dispatch(setMapsAreaStore({ key: 'odps', value: filteredOdps }));

      onClose({ type: 'center', center });
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    } finally {
      loading.onFalse();
    }
  };

  /**
   * @param {Customer} customer
   */
  const pickCustomer = (customer) => {
    loading.onTrue();
    try {
      if (!customer.location?.lat || !customer.location?.lng) {
        toast.error('Data Pelanggan tidak memiliki lokasi');
        return;
      }

      // dispatch(setMapsAreaStore({ key: 'showLabel', value: true }));
      dispatch(setMapsAreaStore({ key: 'showOdp', value: false }));
      dispatch(setMapsAreaStore({ key: 'showCustomer', value: true }));
      dispatch(setMapsAreaStore({ key: 'customers', value: [customer] }));
      onClose({ type: 'center', center: [customer.location.lat, customer.location.lng] });
    } catch (error) {
      toast.error(error.message);
    } finally {
      loading.onFalse();
    }
  };

  /**
   * @param {Odp} odp
   */
  const pickOdp = async (odp) => {
    loading.onTrue();
    try {
      const snapshotCustomer = await geoRepository.searchCustomerByODP(odp._id);

      dispatch(setMapsAreaStore({ key: 'customers', value: snapshotCustomer }));

      if (!odp.lat || !odp.lng) {
        toast.warning('Data odp tidak memiliki lokasi');
        const customer = snapshotCustomer.find((c) => c.location?.lat && c.location?.lng);
        const location = customer ? [customer.location.lat, customer.location.lng] : undefined;
        dispatch(setMapsAreaStore({ key: 'odps', value: [] }));
        onClose({ type: 'center', center: location });
        return;
      }

      dispatch(setMapsAreaStore({ key: 'odps', value: [odp] }));
      onClose({ type: 'center', center: [odp.lat, odp.lng] });
    } catch (err) {
      toast.error(err.message);
    } finally {
      loading.onFalse();
    }
  };

  /**
   * @param {Area} area
   */
  const pickArea = async (area) => {
    loading.onTrue();
    try {
      const snapshotCustomer = await areaRepository.getCustomerArea(area._id ?? area.id, {
        page: 0,
      });
      const snapshotOdp = await areaRepository.getOdpList(area._id ?? area.id);

      // dispatch(setMapsAreaStore({ key: 'showLabel', value: true }));
      dispatch(setMapsAreaStore({ key: 'showOdp', value: true }));
      dispatch(setMapsAreaStore({ key: 'showCustomer', value: false }));
      dispatch(setMapsAreaStore({ key: 'customers', value: snapshotCustomer.customers }));
      dispatch(setMapsAreaStore({ key: 'odps', value: snapshotOdp }));
      dispatch(setMapsAreaStore({ key: 'areas', value: [area] }));

      if (area.lat && area.lng) {
        onClose({ type: 'center', center: [area.lat, area.lng] });
      }

      toast.warning('Mikrotik belum memiliki lokasi');

      const customerLocation = snapshotCustomer.customers.find(
        (c) => c.location?.lat && c.location?.lng
      );

      const odpLocation = snapshotOdp.find((o) => o.lat && o.lng);

      const location =
        area.lat && area.lng
          ? [area.lat, area.lng]
          : customerLocation.location
            ? [customerLocation.location.lat, customerLocation.location.lng]
            : odpLocation
              ? [odpLocation.lat, odpLocation.lng]
              : undefined;

      onClose({ type: 'center', center: location });
    } catch (error) {
      toast.error(error.message);
    } finally {
      loading.onFalse();
    }
  };

  const prefetch = async () => {
    loading.onTrue();
    try {
      if (allAreas.length <= 0) {
        const snapshotAllAreas = await areaRepository.getAllArea();
        dispatch(setMapsAreaStore({ key: 'allAreas', value: snapshotAllAreas }));
      }
      if (search === '') return;

      const snapshot = await geoRepository.search(searchType, search);
      dispatch(setMapsAreaStore({ key: 'searchAreas', value: snapshot.areas }));
      dispatch(setMapsAreaStore({ key: 'searchCustomers', value: snapshot.customers }));
      dispatch(setMapsAreaStore({ key: 'searchOdps', value: snapshot.odps }));
      dispatch(setMapsAreaStore({ key: 'searchAreaCategories', value: snapshot.areaCategories }));
    } catch (err) {
      toast.error(err.message);
    } finally {
      loading.onFalse();
    }
  };

  const separateLatLng = useMemo(() => {
    const value = latLngField;
    if (value.includes(',')) {
      const [lat, lng] = value.split(',').map((e) => parseFloat(e.trim()));
      return [lat, lng];
    }
    return [0, 0];
  });

  const validatePosition = () => {
    const isAllEmpty = separateLatLng.filter((l) => l === 0).length >= 2;
    if (isAllEmpty) {
      toast.error('Tikor tidak valid');
      return;
    }

    onClose({ type: 'location-marker', center: separateLatLng });
  };

  const pickAreaOrAreaCategory = (id) => {
    const someArea = areaList.find((a) => a._id === id);
    if (!someArea) {
      toast.error('Mohon memuat ulang');
      return;
    }

    dispatch(setMapsAreaStore({ key: 'selectedAreaId', value: id }));

    loading.onTrue();
    try {
      if (someArea.category === 'area_category') {
        pickAreaCategory({ _id: id });
      } else {
        pickArea(someArea);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      loading.onFalse();
    }
  };

  useEffect(() => {
    prefetch();
  }, [debounceSearch, searchType]);

  return (
    <Dialog open={show} fullWidth maxWidth="sm" fullScreen={isMobile}>
      <DialogTitle>Cari</DialogTitle>
      <DialogContent>
        <Stack className="tw-py-3" spacing={3}>
          <div className="tw-w-full tw-flex tw-flex-col md:tw-flex-row tw-gap-2">
            <TextField
              select
              fullWidth
              label="Jenis Pencarian"
              size="small"
              value={searchType}
              onChange={(e) =>
                dispatch(setMapsAreaStore({ key: 'searchType', value: e.target.value }))
              }
            >
              {searchTypes.map((s, i) => (
                <MenuItem key={i} value={s.value}>
                  {s.label}
                </MenuItem>
              ))}
            </TextField>
            {searchType === 'area_category' ? (
              <TextField
                fullWidth
                select
                size="small"
                label="Area"
                value={selectedAreaId}
                onChange={(e) => pickAreaOrAreaCategory(e.target.value)}
              >
                {areaList.map((area, i) => (
                  <MenuItem key={i} value={area._id}>
                    <div
                      className={`tw-pl-2 tw-text-xs ${area.category === 'area' ? 'tw-pl-5' : 'tw-font-semibold'}`}
                    >
                      {area.title}
                    </div>
                  </MenuItem>
                ))}
              </TextField>
            ) : (
              <TextField
                fullWidth
                label="Cari"
                size="small"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            )}
          </div>
          <div className="tw-w-full tw-flex tw-flex-col md:tw-flex-row tw-gap-2">
            <TextField
              fullWidth
              label="Pasti Tikor"
              size="small"
              value={latLngField}
              onChange={(e) => setLatLngField(e.target.value)}
            />
            <TextField
              fullWidth
              label="Lat"
              size="small"
              value={separateLatLng[0]}
              inputProps={{ readOnly: true }}
            />
            <TextField
              fullWidth
              label="Lng"
              size="small"
              value={separateLatLng[1]}
              inputProps={{ readOnly: true }}
            />
          </div>
          {searchAreaCategories.map((c, i) => (
            <button
              key={i}
              type="button"
              className="tw-p-3 tw-flex tw-flex-row tw-items-center tw-justify-between tw-ring-1 tw-ring-gray-300 hover:tw-ring-primary hover:tw-ring-2 tw-text-left tw-rounded-lg tw-duration-300"
              onClick={() => pickAreaCategory(c)}
            >
              <div className="tw-flex tw-flex-col">
                <span className="tw-text-sm tw-font-medium">{c.title}</span>
                <span className="tw-text-xs tw-text-gray-500">{c.description}</span>
              </div>
            </button>
          ))}
          {searchCustomers.map((c, i) => (
            <button
              type="button"
              key={i}
              className="tw-p-3 tw-flex tw-flex-row tw-items-center tw-justify-between tw-ring-1 tw-ring-gray-300 hover:tw-ring-primary hover:tw-ring-2 tw-text-left tw-rounded-lg tw-duration-300"
              onClick={() => pickCustomer(c)}
            >
              <div className="tw-flex tw-flex-col">
                <span className="tw-text-sm tw-font-medium">{c.fullname}</span>
                <span className="tw-text-xs tw-text-gray-500">{c.customerId}</span>
                <span className="tw-text-xs tw-text-gray-500">{c.phone}</span>
                <span className="tw-text-xs tw-text-gray-500">{c.address}</span>
                <span className="tw-text-xs tw-text-gray-500">{c.pppoeName}</span>
                <span className="tw-text-xs tw-text-gray-500">{c.pppoePassword}</span>
                <div className="tw-flex tw-flex-wrap tw-gap-2 tw-mt-2">
                  {c.odpName && (
                    <Chip
                      label={c.odpName}
                      size="small"
                      sx={{ fontSize: '12px' }}
                      className="tw-w-min"
                    />
                  )}
                  {c.areaName && (
                    <Chip
                      label={c.areaName}
                      size="small"
                      sx={{ fontSize: '12px' }}
                      className="tw-w-min"
                    />
                  )}
                </div>
              </div>
            </button>
          ))}
          {searchOdps.map((o, i) => (
            <button
              key={i}
              type="button"
              className="tw-p-3 tw-flex tw-flex-row tw-items-center tw-justify-between tw-ring-1 tw-ring-gray-300 hover:tw-ring-primary hover:tw-ring-2 tw-text-left tw-rounded-lg tw-duration-300"
              onClick={() => pickOdp(o)}
            >
              <div className="tw-flex tw-flex-col tw-gap-0.5">
                <span className="tw-text-sm tw-font-medium">{o.name}</span>
                <span className="tw-text-xs tw-text-gray-500">{o.port ?? 0} PORT</span>
                <span className="tw-text-xs tw-text-gray-500">
                  {o.availablePort ?? 0} Free Port
                </span>
                <span className="tw-text-xs tw-text-gray-500">{o.description}</span>
                {o.areaName && (
                  <Chip
                    label={o.areaName}
                    size="small"
                    sx={{ fontSize: '12px' }}
                    className="tw-w-min"
                  />
                )}
              </div>
            </button>
          ))}
          {searchAreas.map((a, i) => (
            <button
              key={i}
              type="button"
              className="tw-p-3 tw-flex tw-flex-row tw-items-center tw-justify-between tw-ring-1 tw-ring-gray-300 hover:tw-ring-primary hover:tw-ring-2 tw-text-left tw-rounded-lg tw-duration-300"
              onClick={() => pickArea(a)}
            >
              <div className="tw-flex tw-flex-col">
                <span className="tw-text-sm tw-font-medium">{a.title}</span>
                <span className="tw-text-xs tw-text-gray-500">{a.routerConfig.address}</span>
              </div>
            </button>
          ))}
        </Stack>
      </DialogContent>
      <DialogActions>
        <LoadingButton loading={loading.value} color="error" onClick={() => onClose()}>
          Tutup
        </LoadingButton>
        <LoadingButton loading={loading.value} color="primary" onClick={() => validatePosition()}>
          Ke Lokasi Tikor
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}

const mapsStateToProps = (state) => state.mapsAreaStore;
export default connect(mapsStateToProps)(MapsAreaLocationPicker);
