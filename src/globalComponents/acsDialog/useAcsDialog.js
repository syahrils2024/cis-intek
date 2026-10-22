import { useContext } from 'react';

import { AcsDialogContext } from './AcsDialogProvider';

export function useAcsDialog() {
  const context = useContext(AcsDialogContext);

  if (!context) {
    throw new Error('useAcsDialog must be used within an AcsDialogProvider');
  }

  return context;
}
