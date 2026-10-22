import 'viewerjs/dist/viewer.css';

import { forwardRef, useImperativeHandle } from 'react';

import {
  Dialog,
  Button,
  useTheme,
  DialogTitle,
  DialogContent,
  DialogActions,
  useMediaQuery,
} from '@mui/material';

import { useImageViewerDialogState } from './imageViewerDialog.state';

export const ImageViewerDialog = forwardRef((props, ref) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const { state, handlers } = useImageViewerDialogState();
  const { isShow, images, title } = state;
  const { closeDialog, showImage } = handlers;

  useImperativeHandle(ref, () => ({ showImage }));

  return (
    <Dialog
      open={isShow.value}
      onClose={() => closeDialog}
      maxWidth="sm"
      fullWidth
      fullScreen={isMobile}
    >
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <div className="tw-flex tw-flex-col tw-w-full tw-h-full tw-items-center tw-justify-center">
          {images.length >= 1 && (
            <div id="viewerImage">
              {images.map((i) => (
                <img key={i} src={i} alt={i} />
              ))}
            </div>
          )}
        </div>
      </DialogContent>
      <DialogActions>
        <Button color="error" onClick={closeDialog}>
          Tutup
        </Button>
      </DialogActions>
    </Dialog>
  );
});
