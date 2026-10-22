import { useRef, useMemo, createContext } from 'react';

import AcsDialog from 'src/components/acs/Dialog';

export const AcsDialogContext = createContext();

export default function AcsDialogProvider({ children }) {
  const acsDialogRef = useRef();

  const value = useMemo(
    () => ({
      open: (customerId) => acsDialogRef.current?.open(customerId),
    }),
    []
  );

  return (
    <AcsDialogContext.Provider value={value}>
      {children}
      <AcsDialog ref={acsDialogRef} />
    </AcsDialogContext.Provider>
  );
}
