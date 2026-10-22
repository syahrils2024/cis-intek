export function parseLatLng(input) {
  // Split the string by commas
  const parts = input.split(',');
  if (parts.length === 2) {
    // If exactly 2 parts, it's a simple case
    const lat = parseFloat(parts[0].trim().replace(',', '.'));
    const lng = parseFloat(parts[1].trim().replace(',', '.'));
    return { lat, lng };
  }
  if (parts.length > 2) {
    // If more than 2 parts, merge parts 1+2 for latitude, and parts 3+4 for longitude
    const lat = parseFloat(`${parts[0]}.${parts[1]}`.trim());
    const lng = parseFloat(`${parts[2]}.${parts[3]}`.trim());
    return { lat, lng };
  }

  // If input doesn't match expected patterns, return null
  return null;
}
