import { createContext } from 'react';

export default createContext({
  mapsBase() {
    throw new Error('Missing maps provider');
  },
  closeOnParentUnmount() {},
});
