/**
 * @typedef {import("src/stores/mapsArea").MapsAreaStore} MapsAreaStore
 * @typedef {import('src/repositories/customer').Customer} Customer
 * @typedef {import('src/repositories/area').Odp} ODP
 */
import 'leaflet/dist/leaflet.css';
import 'src/assets/leafletmod.css';

import L from 'leaflet';
import { toast } from 'sonner';
import { Iconify } from '@components/iconify';
import { useBoolean } from '@hooks/use-boolean';
import { goToGoogleMaps } from '@utils/goToMaps';
import { connect, useDispatch } from 'react-redux';
import { useMemo, useState, useEffect } from 'react';
import { Popup, Marker, useMap, Tooltip, TileLayer, MapContainer, useMapEvents } from 'react-leaflet';

import { Menu, Stack, Button, MenuItem, Checkbox, IconButton } from '@mui/material';

import { setCenter, setMapsAreaStore } from 'src/stores/mapsArea';

import MapsAreaLocationPicker from 'src/components/mapsArea/locationPicker';

/**
 * @callback OnPickMap
 * @param {[lat: number, lng: number]} location
 *
 * @param {{onPick: OnPickMap; show: boolean; onClose: void}} props
 * @returns
 */

function LocationMarker({ onPick }) {
  const [position, setPosition] = useState(null);
  const m = useMap();
  m.addEventListener('click', (e) => {
    setPosition(e.latlng);
    onPick(e.latlng);
  });

  return position === null ? null : (
    <Marker
      position={position}
      icon={
        // eslint-disable-next-line new-cap
        new L.icon({
          iconUrl: '/leaflet/images/marker-red2.png',
          iconRetinaUrl: '/leaflet/images/marker-icon.png',
          iconSize: [32, 45],
          popupAnchor: [-0, -0],
        })
      }
    >
      <Popup>Tujuan</Popup>
    </Marker>
  );
}

function MapPosition({ lat, lng, zoomLevel }) {
  const map = useMap();

  useEffect(() => {
    map.flyTo([lat, lng], zoomLevel);
  }, [lat, lng]);
  return (!lat || !lng) === null ? null : (
    <Marker
      position={[lat, lng]}
      icon={
        // eslint-disable-next-line new-cap
        new L.icon({
          iconUrl: '/leaflet/images/marker-icon.png',
          iconRetinaUrl: '/leaflet/images/marker-icon.png',
          iconSize: [32, 45],
          popupAnchor: [-0, -0],
        })
      }
    >
      <Popup>Posisi Anda</Popup>
    </Marker>
  );
}

/**
 * @param {{lat: number; lng: number; odp: ODP; mapType: 'satelite' | 'road'; showLabel: boolean}} props
 * @returns {React.JSX}
 */
function MapOdp({ lat, lng, odp, mapType, showLabel }) {
  if (lat && lng)
    return (
      <Marker
        position={[lat, lng]}
        icon={
          // eslint-disable-next-line new-cap
          new L.icon({
            iconUrl: '/leaflet/images/odp-red.png',
            iconRetinaUrl: '/leaflet/images/odp-red.png',
            iconSize: [32, 32],
            popupAnchor: [-0, -0],
          })
        }
      >
        <Popup>
          <Stack>
            <span className="tw-font-semibold">{odp.name}</span>
            <span>{odp.port ?? '?'} Port</span>
            <span>{odp.availablePort ?? '?'} Free</span>
            <span>{odp.description ?? '?'}</span>
            <Button
              color="primary"
              size="small"
              className="tw-w-min tw-whitespace-nowrap tw-mx-auto tw-flex-row tw-gap-1 tw-items-center"
              onClick={() => {
                goToGoogleMaps(lat, lng);
              }}
            >
              <Iconify icon="gis:route-start" />
              Buka di Google Maps
            </Button>
          </Stack>
        </Popup>
        {showLabel && (
          <Tooltip permanent opacity={1} offset={[10, 0]} direction="right">
            <Stack>
              <span
                className={`tw-font-extrabold tw-text-lg tw-font-InterStatic ${mapType === 'satelite' ? ' tw-text-outline-md tw-text-white ' : 'tw-text-outline-white tw-text-slate-800'}`}
              >
                {odp.name}
              </span>
            </Stack>
          </Tooltip>
        )}
      </Marker>
    );

  return null;
}

/**
 * @param {{lat: number; lng: number; customer: Customer; showLabel: boolean; mapType: 'satelite' | 'road'}} props
 * @returns {React.JSX}
 */
function MapCustomer({ lat, lng, customer, mapType, showLabel }) {
  return (!lat || !lng) === null ? null : (
    <Marker
      position={[lat, lng]}
      icon={
        // eslint-disable-next-line new-cap
        new L.icon({
          iconUrl: '/leaflet/images/customer.png',
          iconRetinaUrl: '/leaflet/images/customer.png',
          iconSize: [32, 32],
          popupAnchor: [-0, -0],
        })
      }
    >
      <Popup>
        <Stack>
          <span className="tw-font-semibold">{customer.fullname}</span>
          <span>{customer.phone}</span>
          <span>{customer.address}</span>
          <span className="tw-mt-2">{customer.odpName}</span>
          <Button
            color="primary"
            size="small"
            className="tw-w-min tw-whitespace-nowrap tw-mx-auto tw-flex-row tw-gap-1 tw-items-center"
            onClick={() => {
              goToGoogleMaps(lat, lng);
            }}
          >
            <Iconify icon="gis:route-start" />
            Buka di Google Maps
          </Button>
        </Stack>
      </Popup>
      {showLabel && (
        <Tooltip permanent opacity={1} offset={[10, 0]} direction="right">
          <Stack>
            <span
              className={`tw-font-extrabold tw-text-lg tw-font-InterStatic ${mapType === 'satelite' ? ' tw-text-outline-md tw-text-white' : 'tw-text-outline-white tw-text-slate-800'}`}
            >
              {customer.fullname}
            </span>
            <span className={mapType === 'satelite' ? 'tw-text-white' : 'tw-text-slate-800'}>
              {customer.customerId}
            </span>
          </Stack>
        </Tooltip>
      )}
    </Marker>
  );
}

function ZoomWatcher({ onZoomChange }) {
  useMapEvents({
    zoomend: (e) => {
      onZoomChange(e.target.getZoom());
    },
  });
  return null;
}

function Dragable() {
  const dispatch = useDispatch();

  const map = useMap();
  map.on('dragend', () => {
    const center = map.getCenter();
    dispatch(setCenter([center.lat, center.lng]));
    // console.log(map.getCenter());
  });
  return null;
}

/**
 * @param {[number, number]} props
 * @returns {React.JSX}
 */
function WatcherCenter({ location }) {
  const map = useMap();
  const update = () => {
    if (!location) return;
    map.setView(location);
  };

  useEffect(() => {
    update();
  }, [location]);

  return null;
}

/**
 * @param {MapsAreaStore} props
 */
function MapsArea({
  areas,
  odps,
  customers,
  center,
  showCustomer,
  showOdp,
  searchType,
  showLabel,
}) {
  const dispatch = useDispatch();
  const loading = useBoolean(false);
  const [defaultCenter] = useState([0.910918361007407, 103.67933921137752]);
  const [position, setPosition] = useState(null);
  const [zoom, setZoom] = useState(13);
  const { protocol } = window.location;
  const [selectedMap, setSelectedMap] = useState(0);
  const [lat, setLat] = useState(0.910918361007407);
  const [lng, setLng] = useState(103.67933921137752);
  const [markerLatLng, setMarkerLatLng] = useState(null);
  const [userPosition, setUserPosition] = useState(null);
  const [targetPosition, setTargetPosition] = useState(null);

  const showPicker = useBoolean(false);

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  /** @type {[number, number]} -- [lat lng] */
  const onPickSome = (location) => {
    showPicker.onFalse();
    if (location.type === 'location-marker') {
      setTargetPosition(location.center);
    }
    if (location.type === 'center') {
      setPosition(location.center);
    }
  };

  /** @param {L.LatLng} location */
  const onSetMarker = (location) => {
    setMarkerLatLng([location.lat, location.lng]);
  };

  /**
   * @param {GeolocationPosition} data
   */
  const onCurrentLocation = (data) => {
    const location = [data.coords.latitude, data.coords.longitude];
    setUserPosition(location);
    setZoom(18);
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      const location = navigator.geolocation.getCurrentPosition(onCurrentLocation);
    } else {
      toast.error('Gagal mendapatkan lokasi');
    }
  };

  const removeCredit = () => {
    const selector = document.querySelector('.leaflet-control-attribution.leaflet-control');
    if (!selector) return;
    selector.remove();
  };

  const mapStyles = [
    {
      label: 'Satellite',
      url: `${protocol}//{s}.google.com/vt/lyrs=s,m&x={x}&y={y}&z={z}`,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      maxZoom: 20,
      changeToIndex: 1,
    },
    {
      label: 'Street',
      url: `${protocol}//{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}`,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      maxZoom: 20,
      changeToIndex: 0,
    },
  ];

  const mapStyle = useMemo(() => mapStyles[selectedMap]);

  const getRenderLimit = (zoomLevel) => {
    if (zoomLevel >= 20) return Infinity;
    if (zoomLevel >= 19) return 250;
    if (zoomLevel >= 18) return 100;
    return 10;
  };

  const renderLimit = getRenderLimit(zoom);

  const onNavigate = async () => {
    const clipboard = await navigator.clipboard.readText();
    const regex = /([-+]?\d{1,2}\.\d+),\s*([-+]?\d{1,3}\.\d+)/;

    const match = clipboard.match(regex);
    if (match) {
      const latitude = parseFloat(match[1]);
      const longitude = parseFloat(match[2]);
      setTargetPosition([latitude, longitude]);
      // console.log(`Latitude: ${latitude}, Longitude: ${longitude}`);
      return;
    }

    toast.warning(`Invalid lat lng ${clipboard}`);
  };

  useEffect(() => {
    setTimeout(() => {
      removeCredit();
    }, 1000);
  }, []);

  return (
    <>
      <div className="tw-w-full tw-relative tw-h-full">
        <div className="tw-absolute tw-top-5 tw-right-5 tw-z-[1000] tw-group tw-flex tw-flex-col tw-items-end tw-justify-end tw-gap-3">
          <div className="tw-flex tw-flex-col tw-items-end tw-justify-end tw-gap-3">
            {['mikrotik', 'area_category'].includes(searchType) && (
              <button
                type="button"
                className="tw-w-min tw-h-12 tw-flex tw-items-center tw-justify-center tw-bg-white tw-rounded-full tw-group tw-overflow-hidden"
                onClick={handleClick}
              >
                <IconButton color="info">
                  <Iconify icon="icon-park-outline:list-checkbox" width={30} />
                </IconButton>
                <div className="group-hover:tw-max-w-md tw-w-min tw-max-w-0 tw-overflow-hidden tw-duration-500">
                  <span className="tw-font-medium tw-text-sm tw-pr-3 tw-whitespace-nowrap">
                    filter
                  </span>
                </div>
              </button>
            )}
            <button
              type="button"
              className="tw-w-min tw-h-12 tw-flex tw-items-center tw-justify-center tw-bg-white tw-rounded-full tw-group tw-overflow-hidden"
              onClick={() => showPicker.onTrue()}
            >
              <IconButton color="info">
                <Iconify icon="mdi:search" width={30} />
              </IconButton>
              <div className="group-hover:tw-max-w-md tw-w-min tw-max-w-0 tw-overflow-hidden tw-duration-500">
                <span className="tw-font-medium tw-text-sm tw-pr-3 tw-whitespace-nowrap ">
                  Pencarian
                </span>
              </div>
            </button>
            <button
              type="button"
              className="tw-w-min tw-h-12 tw-flex tw-items-center tw-justify-center tw-bg-white tw-rounded-full tw-group tw-overflow-hidden"
              onClick={getCurrentLocation}
            >
              <IconButton color="info">
                <Iconify icon="mage:location-fill" width={30} />
              </IconButton>
              <div className="group-hover:tw-max-w-md tw-w-min tw-max-w-0 tw-overflow-hidden tw-duration-300">
                <span className="tw-font-medium tw-text-sm tw-pr-3 tw-whitespace-nowrap">
                  My Location
                </span>
              </div>
            </button>
          </div>
          <div className="tw-group tw-peer">
            <div className="tw-bg-white tw-w-12 tw-flex tw-items-center tw-justify-center tw-aspect-square tw-rounded-full">
              <Iconify icon="uim:layer-group" width={30} />
            </div>
            <div className="tw-relative">
              <div className="tw-top-3 tw-right-0 tw-h-min tw-max-h-0 group-hover:tw-max-h-44 tw-overflow-hidden tw-group tw-w-[9rem] tw-text-primary tw-absolute tw-duration-500">
                <div className="tw-flex tw-flex-row tw-gap-2 tw-p-2 tw-bg-white tw-rounded-lg ">
                  <button
                    type="button"
                    className={`tw-flex tw-flex-col tw-relative tw-duration-300 tw-rounded-lg ${
                      selectedMap === 0 ? 'tw-ring-2 tw-ring-primary' : 'tw-ring-1 tw-ring-gray-400'
                    }`}
                    onClick={() => {
                      setSelectedMap(0);
                    }}
                  >
                    <img
                      src="/assets/satelite.webp"
                      className="tw-w-16 tw-aspect-square tw-object-cover tw-object-center tw-rounded-md"
                      alt="satelite"
                    />
                    <div className="tw-inset-x-0 tw-bottom-1 tw-w-full tw-h-10 tw-bg-gradient-to-b tw-from-transparent tw-to-black tw-text-white tw-absolute tw-text-xs tw-flex tw-items-end tw-justify-center">
                      Satelite
                    </div>
                  </button>
                  <button
                    type="button"
                    className={`tw-flex tw-flex-col tw-relative tw-duration-300 tw-rounded-lg ${
                      selectedMap === 1 ? 'tw-ring-2 tw-ring-primary' : 'tw-ring-1 tw-ring-gray-400'
                    }`}
                    onClick={() => {
                      setSelectedMap(1);
                    }}
                  >
                    <img
                      src="/assets/road.png"
                      className="tw-w-16 tw-aspect-square tw-object-cover tw-object-center tw-rounded-md"
                      alt="Peta"
                    />
                    <div className="tw-inset-x-0 tw-bottom-1 tw-w-full tw-h-10 tw-bg-gradient-to-b tw-from-transparent tw-to-black tw-text-white tw-absolute tw-text-xs tw-flex tw-items-end tw-justify-center">
                      Peta
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <MapContainer center={center ?? defaultCenter} zoom={zoom} style={{ height: '90vh' }}>
          <WatcherCenter location={position} />
          <ZoomWatcher onZoomChange={setZoom} />
          <Dragable />
          {userPosition && (
            <MapPosition lat={userPosition[0]} lng={userPosition[1]} zoomLevel={zoom} />
          )}
          {targetPosition && (
            <MapPosition lat={targetPosition[0]} lng={targetPosition[1]} zoomLevel={zoom} />
          )}
          <TileLayer
            url={mapStyle.url}
            subdomains={mapStyle.subdomains}
            maxZoom={mapStyle.maxZoom}
          />
          {/* <LocationMarker onPick={onSetMarker} /> */}
          {/* ODP DATA */}
          {(['mikrotik', 'area_category'].includes(searchType) ? showOdp : true) &&
            odps.slice(0, renderLimit === Infinity ? undefined : renderLimit).map((o, i) => (
              <MapOdp
                key={i}
                lat={o.lat}
                lng={o.lng}
                odp={o}
                showLabel={showLabel}
                mapType={selectedMap === 0 ? 'satelite' : 'road'}
              />
            ))}
          {/* Network Status */}
          {(['mikrotik', 'area_category'].includes(searchType) ? showCustomer : true) &&
            customers.slice(0, renderLimit === Infinity ? undefined : renderLimit).map((c, i) => (
              <MapCustomer
                lat={c.location?.lat ?? 0}
                lng={c.location?.lng ?? 0}
                customer={c}
                key={i}
                showLabel={showLabel}
                mapType={selectedMap === 0 ? 'satelite' : 'road'}
              />
            ))}
        </MapContainer>
        <Menu
          id="basic-menu"
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          MenuListProps={{
            'aria-labelledby': 'basic-button',
          }}
        >
          <MenuItem onClick={handleClose}>
            <div className="tw-flex tw-flex-row tw-justify-end tw-w-full">
              <Button color="error">
                <Iconify icon="mdi:close" /> Tutup
              </Button>
            </div>
          </MenuItem>
          <MenuItem
            onClick={() => {
              dispatch(setMapsAreaStore({ key: 'showLabel', value: !showLabel }));
            }}
          >
            <Checkbox checked={showLabel} /> Label
          </MenuItem>
          <MenuItem
            onClick={() => {
              dispatch(setMapsAreaStore({ key: 'showCustomer', value: !showCustomer }));
            }}
          >
            <Checkbox checked={showCustomer} /> Pelanggan
          </MenuItem>
          <MenuItem
            onClick={() => {
              dispatch(setMapsAreaStore({ key: 'showOdp', value: !showOdp }));
            }}
          >
            <Checkbox checked={showOdp} /> ODP
          </MenuItem>
        </Menu>
      </div>
      <MapsAreaLocationPicker show={showPicker.value} onClose={onPickSome} />
    </>
  );
}

const mapStoreToProps = (state) => state.mapsAreaStore;

export default connect(mapStoreToProps)(MapsArea);
