/**
 *
 * @param {string} name
 */
export function getBankImagePath(name) {
  name = name.toLowerCase();
  if (name.includes('bca')) return 'bca.png';
  if (name.includes('bsi')) return 'bsi.png';
  if (name.includes('bri')) return 'bri.png';
  if (name.includes('mandiri')) return 'mandiri.png';
  if (name.includes('bni')) return 'bni.png';
  if (name.includes('muamalat')) return 'muamalat.png';
  if (name.includes('cimb')) return 'cimb.png';
  if (name.includes('sinarmas')) return 'sinarmas.png';
  if (name.includes('mega')) return 'mega.png';
  if (name.includes('bjb')) return 'bjb.png';
  if (name.includes('permata')) return 'permata.png';
  if (name.includes('dana')) return 'dana.png';
  if (name.includes('link') && name.includes('aja')) return 'linkaja.png';
  if (name.includes('gopay') && name.includes('gopay')) return 'gopay.png';
  if (name.includes('shopeepay') && name.includes('shopeepay')) return 'shopeepay.png';
  if (name.includes('panin')) return 'panin.png';
  return '';
}
