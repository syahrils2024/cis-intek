import axios from '@commons/axios';

/**
 * @typedef {object} KtpOcrResult
 * @property {string} province
 * @property {string} district
 * @property {string} nik
 * @property {string} name
 * @property {string} place_dob
 * @property {string} gender
 * @property {string} address_1
 * @property {string} address_2
 * @property {string} address_3
 * @property {string} address_4
 * @property {string} religion
 * @property {string} married_status
 * @property {string} occupation
 * @property {string} nationality
 * @property {string} valid_until
 * @property {string} [placeDob] result from parser
 * @property {string} [dateOfBirth] result from parser
 */

/**
 *
 * @param {File} file
 * @returns {Promise<KtpOcrResult>}
 */
export async function ocrKtp(file) {
  const fd = new FormData();
  fd.append('file', file);

  const { data } = await axios.post('/api/ktp/ocr', fd, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  if (data.error !== 0) throw new Error(data.message);
  return data.data;
}
