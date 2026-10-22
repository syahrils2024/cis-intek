import 'viewerjs/dist/viewer.css';

import Viewer from 'viewerjs';
import { useBoolean } from '@hooks/use-boolean';
import { useState, forwardRef, useImperativeHandle } from 'react';

import {
  Dialog,
  Button,
  useTheme,
  DialogTitle,
  DialogContent,
  DialogActions,
  useMediaQuery,
} from '@mui/material';

export const ViewerImageDialog = forwardRef((props, ref) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const isShow = useBoolean(false);
  const [images, setImages] = useState([]);
  const [title, setTitle] = useState('Preview');
  let viewer;

  const closeDialog = () => {
    isShow.onFalse();
    setTitle('Preview');
    setImages([]);
    if (viewer) {
      viewer.destroy();
    }
  };

  /**
   * @param {string[]} imgs
   */
  const showImage = (imgs, titleData) => {
    isShow.onTrue();
    setImages(imgs);
    if (titleData) setTitle(titleData);
    setTimeout(() => {
      const tag = document.querySelector('#viewerImage');
      // console.log(tag);
      viewer = new Viewer(tag, {
        hide: () => {
          closeDialog();
        },
      });
      tag.click();

      // console.log(viewer);
    }, 300);
  };

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
                <img key={i} src={`/public/uploads/${i}`} alt={i} />
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
