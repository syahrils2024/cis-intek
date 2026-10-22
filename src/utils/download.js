export function download(blobData, filename) {
  const a = document.createElement('a');
  const url = URL.createObjectURL(blobData);
  a.href = url;
  a.download = filename;
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
