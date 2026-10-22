import { useRef, useMemo, createContext } from 'react';

import { ImageViewerDialog } from './ImageViewerDialog';

export const ImageViewerDialogContext = createContext();

export default function ImageViewerDialogProvider({ children }) {
  const imageViewerDialogRef = useRef();
  const value = useMemo(
    () => ({ open: (imgs, title) => imageViewerDialogRef.current?.showImage(imgs, title) }),
    []
  );

  return (
    <ImageViewerDialogContext.Provider value={value}>
      {children}
      <ImageViewerDialog ref={imageViewerDialogRef} />
    </ImageViewerDialogContext.Provider>
  );
}
