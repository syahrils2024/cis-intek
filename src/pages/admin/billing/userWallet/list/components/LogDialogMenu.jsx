import { useMemo } from 'react';

import { Grid, Menu } from '@mui/material';

/**
 * Log Dialog Menu
 * @param {object} param0
 * @param {HTMLDivElement} param0.anchorEl
 * @param {import('src/repositories/userWallet').UserWalletLog} param0.selectedWalletLog
 * @param {function} param0.closeEvidence
 * @param {function} param0.onPreviewImage
 * @returns {JSX.Element}
 */
export default function LogDialogMenu({
  anchorEl,
  selectedWalletLog,
  closeEvidence,
  onPreviewImage,
}) {
  const open = Boolean(anchorEl);

  const images = useMemo(() => {
    if (!selectedWalletLog) return [];
    return selectedWalletLog.evidences?.map((evidence) => `/public/uploads/${evidence}`) ?? [];
  }, [selectedWalletLog]);

  return (
    <Menu
      id="basic-menu"
      anchorEl={anchorEl}
      open={open}
      onClose={closeEvidence}
      slotProps={{
        list: {
          'aria-labelledby': 'basic-button',
        },
      }}
    >
      <Grid container spacing={1}>
        {images.map((img, i) => (
          <Grid item xs={12} sm={6} md={4} key={i}>
            <button type="button" onClick={() => onPreviewImage(img)}>
              <img src={img} alt={`evidence-${i}`} className="tw-rounded tw-w-52 tw-aspect-square" />
            </button>
          </Grid>
        ))}
      </Grid>
    </Menu>
  );
}
