import { useRef, useMemo, createContext } from 'react';

import CustomerPickerDialog from './CustomerPicker';

export const CustomerPickerContext = createContext();

export const CustomerPickerProvider = ({ children }) => {
  const customerPickerRef = useRef();

  const contextValue = useMemo(
    () => ({
      open: () => customerPickerRef.current.open(),
    }),
    []
  );

  return (
    <CustomerPickerContext.Provider value={contextValue}>
      {children}
      <CustomerPickerDialog ref={customerPickerRef} />
    </CustomerPickerContext.Provider>
  );
};
