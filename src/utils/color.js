export function generateRandomColors(arrayLength) {
  const colors = [];

  for (let i = 0; i < arrayLength; i++) {
    const randomColor = `#${Math.floor(Math.random() * 16777215)
      .toString(16)
      .padStart(6, '0')}`;
    colors.push(randomColor);
  }

  return colors;
}
