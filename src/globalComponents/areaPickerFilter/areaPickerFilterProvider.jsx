import { useRef, useMemo, createContext } from 'react';
import AreaPickerFilter from '@components/billing/areaPickerFilter';

export const AreaPickerFilterContext = createContext(null);

export default function AreaPickerFilterProvider({ children }) {
  const areaPickerFilterRef = useRef();

  const value = useMemo(
    () => ({
      open: (selectedArea, showAll) => areaPickerFilterRef.current.open(selectedArea, showAll),
      getArea: (id) => areaPickerFilterRef.current.getArea(id),
    }),
    []
  );

  return (
    <AreaPickerFilterContext.Provider value={value}>
      {children}
      <AreaPickerFilter ref={areaPickerFilterRef} />
    </AreaPickerFilterContext.Provider>
  );
}
