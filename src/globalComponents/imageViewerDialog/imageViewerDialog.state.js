import Viewer from 'viewerjs';
import { useRef, useState } from 'react';
import { useBoolean } from '@hooks/use-boolean';

export const useImageViewerDialogState = () => {
  const isShow = useBoolean(false);
  const [images, setImages] = useState([]);
  const [title, setTitle] = useState('Preview');
  const viewerRef = useRef(null);

  const closeDialog = () => {
    isShow.onFalse();
    setTitle('Preview');
    setImages([]);
    if (viewerRef.current) {
      viewerRef.current.destroy();
      viewerRef.current = null;
    }
  };

  /**
   * @param {string[]} imgs
   * @param {string} [titleData]
   */
  const showImage = (imgs, titleData) => {
    isShow.onTrue();
    const reformatedUrl = imgs.map((i) => {
      if (i.startsWith('/public/uploads')) return i;
      return `/public/uploads/${i}`;
    });

    setImages(reformatedUrl);
    if (titleData) setTitle(titleData);
    setTimeout(() => {
      const tag = document.querySelector('#viewerImage');
      viewerRef.current = new Viewer(tag, {
        hide: () => {
          closeDialog();
        },
      });
      tag.click();
    }, 300);
  };

  return {
    state: {
      isShow,
      images,
      title,
    },
    handlers: {
      closeDialog,
      showImage,
    },
  };
};
