export function parserPlaceDob(input) {
  const regex = /^([A-Za-z\s]+),?\s?(\d{2})[- ]?(\d{2})[- ]?(\d{4})$/;
  const match = input.match(regex);

  return new Promise((resolve, reject) => {
    if (match) {
      const place = match[1].trim(); // Capture place and trim any trailing spaces
      const day = match[2];
      const month = match[3];
      const year = match[4];

      const formattedDate = `${year}-${month}-${day}`;

      resolve({
        placeDob: place.charAt(0).toUpperCase() + place.slice(1).toLowerCase(),
        dateOfBirth: formattedDate,
      });
    } else {
      reject(new Error('Invalid input format'));
    }
  });
}
