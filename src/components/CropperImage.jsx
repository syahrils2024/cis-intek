/**
 * @typedef {Cropper} Cropper
 */
import 'cropperjs/dist/cropper.min.css';

import Cropper from 'cropperjs';
import { useBoolean } from '@hooks/use-boolean';
import { Icon as Iconify } from '@iconify/react';
import { useRef, useState, forwardRef, useImperativeHandle } from 'react';

import {
  Menu,
  Dialog,
  Button,
  MenuItem,
  IconButton,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';

const CropperImage = forwardRef((props, ref) => {
  /** @type {{current: HTMLImageElement}} */
  const imageComponent = useRef();

  /**
   * @type {{current: Cropper}}
   */
  const cropperRef = useRef();

  const showDialog = useBoolean(false);

  /** @type {{current: (image: File) => void}} */
  const resolver = useRef();

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  function generateCroppedImageFile(
    cropper,
    fileName = 'cropped-image.png',
    fileType = 'image/png'
  ) {
    return new Promise((resolve, reject) => {
      cropperRef.current.getCroppedCanvas().toBlob((blob) => {
        if (blob) {
          // Create a File from the Blob
          const file = new File([blob], fileName, {
            type: fileType,
            lastModified: Date.now(),
          });
          resolve(file);
        } else {
          reject(new Error('Failed to create a Blob from the cropped canvas.'));
        }
      }, fileType);
    });
  }

  /**
   * @param {File} image
   * @returns
   */
  function cropImage(image) {
    showDialog.onTrue();
    setTimeout(() => {
      // const url = URL.createObjectURL(image);
      imageComponent.current.setAttribute('src', image);
      cropperRef.current = new Cropper(imageComponent.current, {
        aspectRatio: 16 / 9,
      });
    }, 1000);

    return new Promise((resolve) => {
      resolver.current = resolve;
    });
  }

  function clear() {
    cropperRef.current.destroy();
  }

  async function save() {
    const result = await generateCroppedImageFile('ktp.png');
    showDialog.onFalse();
    resolver.current(result);
    clear();
  }

  function close() {
    showDialog.onFalse();
    resolver.current();
    clear();
  }

  useImperativeHandle(ref, () => ({ cropImage }));

  /**
   * Cropper Methods
   */

  function setAspectRatio(ratio) {
    cropperRef.current.setAspectRatio(ratio);
    handleClose();
  }

  function zoom(n) {
    cropperRef.current.zoom(n);
  }

  function dragMode() {
    cropperRef.current.setDragMode('move');
  }

  function rotateRight() {
    cropperRef.current.rotate(45);
  }

  function rotateLeft() {
    cropperRef.current.rotate(-45);
  }

  function cropClear() {
    cropperRef.current.clear();
    dragMode();
  }

  function crop() {
    cropperRef.current.crop();
  }

  return (
    <Dialog open={showDialog.value} fullScreen>
      <DialogTitle>Crop Foto</DialogTitle>
      <DialogContent>
        <div className="tw-relative tw-w-full tw-h-full">
          <img ref={imageComponent} alt="img" className="tw-block tw-max-w-full tw-opacity-0" />
          {/* Navigation */}
          <div className="tw-inset-x-0 tw-bottom-2 tw-absolute tw-flex tw-items-center tw-justify-center">
            <div className=" tw-flex tw-flex-row tw-p-1 tw-bg-black/50 tw-ring-1 tw-ring-gray-500 tw-backdrop-blur-md tw-rounded-md tw-items-center tw-justify-center tw-w-min tw-gap-2">
              <IconButton onClick={handleClick}>
                <Iconify icon="material-symbols:aspect-ratio-outline" color="white" />
              </IconButton>
              <IconButton onClick={() => dragMode()}>
                <Iconify icon="mingcute:move-line" color="white" />
              </IconButton>
              <IconButton onClick={() => zoom(0.1)}>
                <Iconify icon="mdi:magnify-plus" color="white" />
              </IconButton>
              <IconButton onClick={() => zoom(-0.1)}>
                <Iconify icon="mdi:magnify-minus" color="white" />
              </IconButton>
              <IconButton onClick={() => rotateLeft()}>
                <Iconify icon="mdi:rotate-left" color="white" />
              </IconButton>
              <IconButton onClick={() => rotateRight()}>
                <Iconify icon="mdi:rotate-right" color="white" />
              </IconButton>
              <IconButton onClick={() => crop()}>
                <Iconify icon="mdi:crop" color="white" />
              </IconButton>
              <IconButton onClick={() => cropClear()}>
                <Iconify icon="mdi:close" color="white" />
              </IconButton>
            </div>
          </div>
          {/* Anchor / Menu */}
          <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
            <MenuItem onClick={() => setAspectRatio(16 / 9)}>16:9</MenuItem>
            <MenuItem onClick={() => setAspectRatio(4 / 3)}>4:3</MenuItem>
            <MenuItem onClick={() => setAspectRatio(1 / 1)}>1:1</MenuItem>
            <MenuItem onClick={() => setAspectRatio(2 / 3)}>2:3</MenuItem>
            <MenuItem onClick={() => setAspectRatio(NaN)}>Free</MenuItem>
          </Menu>
        </div>
      </DialogContent>
      <DialogActions>
        <Button color="error" onClick={() => close()}>
          Batal
        </Button>
        <Button color="success" variant="contained" onClick={() => save()}>
          Simpan
        </Button>
      </DialogActions>
    </Dialog>
  );
});

export default CropperImage;
