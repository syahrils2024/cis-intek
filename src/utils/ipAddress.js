/**
 * Increments an IP address by a specified number, ensuring that each segment of the IP address stays within the range of 1 to 254.
 * @param {string} ip
 * @param {number} increment
 * @returns {string}
 */
export function incrementIP(ip, increment) {
  // Split the IP address into its segments and convert them to numbers
  const segments = ip.split('.').map(Number);
  if (segments.length <= 3) return '';

  // Convert the segments to a single 32-bit-like number
  const total =
    (segments[0] - 1) * 254 ** 3 + // Start segments from 1, not 0
    (segments[1] - 1) * 254 ** 2 +
    (segments[2] - 1) * 254 +
    (segments[3] - 1) +
    increment;

  // Recalculate the new segments, keeping each between 1 and 254
  const newSegments = [
    (Math.floor(total / 254 ** 3) % 254) + 1, // First segment (1-254)
    (Math.floor(total / 254 ** 2) % 254) + 1, // Second segment (1-254)
    (Math.floor(total / 254) % 254) + 1, // Third segment (1-254)
    (total % 254) + 1, // Fourth segment (1-254)
  ];

  // Join the new segments back into an IP address string
  return newSegments.join('.');
}
