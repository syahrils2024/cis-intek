export function goToGoogleMaps(lat, lng) {
  const url = `https://maps.google.com/?q=${lat},${lng}`;
  window.open(url, '_blank');
}
