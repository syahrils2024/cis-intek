import { useState, useEffect } from 'react';

import { useMeStore } from 'src/stores/meStore';

import LockedDialog from './LockedDialog';
import AcsDialogProvider from './acsDialog/AcsDialogProvider';
import { EngineerPickerProvider } from './engineerPicker/EngineerPickerDialog';
import { CustomerPickerProvider } from './customerPicker/CustomerPickerProvider';
import AreaPickerFilterProvider from './areaPickerFilter/areaPickerFilterProvider';
import ImageViewerDialogProvider from './imageViewerDialog/ImageViewerDialogProvider';
import { BroadcastPickerProvider } from './broadcastProfilePicker/BroadcastProfilePicker';
import { MultipleAreaPickerProvider } from './multipleAreaPicker/MultipleAreaPickerProvider';
import { MassBillingGenerateProvider } from './massBillingGenerate/MassBillingGenerateProvider';

export default function AppComponent({ children }) {
  const locked = useMeStore((s) => s.locked());
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(locked);
  }, [locked]);

  return (
    <>
      <LockedDialog open={open} />
      <MultipleAreaPickerProvider>
        <AreaPickerFilterProvider>
          <EngineerPickerProvider>
            <BroadcastPickerProvider>
              <ImageViewerDialogProvider>
                <AcsDialogProvider>
                  <CustomerPickerProvider>
                    <MassBillingGenerateProvider>{children}</MassBillingGenerateProvider>
                  </CustomerPickerProvider>
                </AcsDialogProvider>
              </ImageViewerDialogProvider>
            </BroadcastPickerProvider>
          </EngineerPickerProvider>
        </AreaPickerFilterProvider>
      </MultipleAreaPickerProvider>
    </>
  );
}
