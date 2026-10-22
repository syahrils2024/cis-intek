/**
 * @callback OnPickMap
 * @param {[lat: number, lng: number]} location
 *
 * @param {{onPick: OnPickMap; onShow: boolean}} param0
 */

import 'leaflet/dist/leaflet.css';

import L from 'leaflet';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { Iconify } from '@components/iconify';
import { Popup, Marker, useMap, TileLayer, MapContainer } from 'react-leaflet';

import { Dialog, IconButton, DialogContent } from '@mui/material';

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

export default function MapsPickerDialog({ onPick, show, onClose }) {
  const [center, setCenter] = useState([0.910918361007407, 103.67933921137752]);
  const [position, setPosition] = useState(null);
  const [zoom, setZoom] = useState(13);
  const { protocol } = window.location;
  const [selectedMap, setSelectedMap] = useState(0);
  const [lat, setLat] = useState(0.910918361007407);
  const [lng, setLng] = useState(103.67933921137752);
  const [markerLatLng, setMarkerLatLng] = useState(null);

  /** @param {L.LatLng} location */
  const onSetMarker = (location) => {
    setMarkerLatLng([location.lat, location.lng]);
  };

  /**
   * @param {GeolocationPosition} data
   */
  const onCurrentLocation = (data) => {
    setLat(data.coords.latitude);
    setLng(data.coords.longitude);
    setMarkerLatLng([data.coords.latitude, data.coords.longitude]);
    setZoom(18);
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      const location = navigator.geolocation.getCurrentPosition(onCurrentLocation);
    } else {
      toast.error('Gagal mendapatkan lokasi');
    }
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

  const mapStyle = mapStyles[selectedMap];

  useEffect(() => {
    if (!show) {
      setMarkerLatLng(null);
      return;
    }
  }, [show]);

  return (
    <Dialog fullScreen open={show}>
      <DialogContent sx={{ padding: 0 }}>
        <div className="tw-w-full tw-h-[100svh] tw-relative">
          <div className="tw-absolute tw-top-5 tw-right-5 tw-z-[1000] tw-flex tw-flex-row tw-gap-2">
            {markerLatLng !== null && (
              <div className="tw-w-12 tw-h-12 tw-flex tw-items-center tw-justify-center tw-bg-white tw-rounded-full">
                <IconButton color="success" onClick={() => onPick(markerLatLng)}>
                  <Iconify icon="mdi:check" width={30} />
                </IconButton>
              </div>
            )}

            <div className="tw-w-12 tw-h-12 tw-flex tw-items-center tw-justify-center tw-bg-white tw-rounded-full">
              <IconButton color="error" onClick={onClose}>
                <Iconify icon="mdi:close" width={30} />
              </IconButton>
            </div>

            <div className="tw-w-12 tw-h-12 tw-flex tw-items-center tw-justify-center tw-bg-white tw-rounded-full">
              <IconButton color="info" onClick={getCurrentLocation}>
                <Iconify icon="mdi:location" width={30} />
              </IconButton>
            </div>
          </div>

          {/* Leaflet */}
          <MapContainer center={center} zoom={zoom} className="tw-w-full tw-h-[100svh]">
            <MapPosition lat={lat} lng={lng} zoomLevel={zoom} />
            <TileLayer
              url={mapStyle.url}
              subdomains={mapStyle.subdomains}
              maxZoom={mapStyle.maxZoom}
            />
            <LocationMarker onPick={onSetMarker} />
          </MapContainer>
          {/* End Leaflet */}
          <div className="tw-absolute tw-bottom-0 tw-right-0" />
        </div>
      </DialogContent>
    </Dialog>
  );
}
