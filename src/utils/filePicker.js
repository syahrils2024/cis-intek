/**
 * Opens a file picker dialog and returns the selected file.
 * @returns {Promise<File>} A promise that resolves to the selected file.
 */
export async function pickFile(accept = '*/*') {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = accept;

    input.onchange = (event) => {
      const file = event.target.files[0];
      if (file) {
        resolve(file);
      } else {
        resolve(null);
      }
    };

    input.onerror = () => {
      resolve(null);
    };

    input.click();
  });
}
