import { useRef, useMemo, createContext } from 'react';

import MultipleAreaPicker from './MultipleAreaPicker';

export const MultipleAreaPickerContext = createContext();

export const MultipleAreaPickerProvider = ({ children }) => {
  const componentRef = useRef();
  const valueContext = useMemo(
    () => ({
      open: (ids) => componentRef.current.open(ids),
    }),
    []
  );

  return (
    <MultipleAreaPickerContext.Provider value={valueContext}>
      {children}
      <MultipleAreaPicker ref={componentRef} />
    </MultipleAreaPickerContext.Provider>
  );
};
