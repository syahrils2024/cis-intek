/**
 * @typedef {import("src/repositories/user").User} User
 */

import { useContext } from 'react';

import { AcsDialogContext } from 'src/globalComponents/acsDialog/AcsDialogProvider';
import { EngineerPickerContext } from 'src/globalComponents/engineerPicker/EngineerPickerDialog';
import { CustomerPickerContext } from 'src/globalComponents/customerPicker/CustomerPickerProvider';
import { AreaPickerFilterContext } from 'src/globalComponents/areaPickerFilter/areaPickerFilterProvider';
import { BroadcastPickerContext } from 'src/globalComponents/broadcastProfilePicker/BroadcastProfilePicker';
import { ImageViewerDialogContext } from 'src/globalComponents/imageViewerDialog/ImageViewerDialogProvider';
import { MultipleAreaPickerContext } from 'src/globalComponents/multipleAreaPicker/MultipleAreaPickerProvider';

/**
 * @typedef {object} openOptions
 * @property {string[]} [currentEngineerId]
 * @property {string} [areaId]
 */

export function useAppPicker() {
  /**
   * @type {{
   * open: (isMultiple: boolean, options: openOptions) => Promise<User | User[]>
   * }}
   */
  const engineerPickerContext = useContext(EngineerPickerContext);

  /**
   * @type {{
   * open: (selectedArea: string, showAll: boolean) => Promise<{_id: string, name: string, title: string, ipRemote: string}>,
   * getArea: (id: string) => Promise<{_id: string, name: string, title: string}>,
   * }}
   */
  const areaPickerContext = useContext(AreaPickerFilterContext);

  /**
   * @type {{
   * open: () => Promise<import('src/repositories/customer').CustomerListFromEngineer>
   * }}
   */
  const customerPickerContext = useContext(CustomerPickerContext);

  /**
   * @type {{
   * open: (selectedArea: string[]) => Promise<{_id: string, name: string, title: string}[]>
   * }}
   */
  const multipleAreaPickerContext = useContext(MultipleAreaPickerContext);

  /**
   * @type {{
   * open: () => Promise<import('src/repositories/broadcastOptionTemplate').BroadcastOptionTemplate>
   * }}
   */
  const broadcastProfilePickerContext = useContext(BroadcastPickerContext);

  /**
   * @type {{
   * open: (imgs: string[], title: string) => void
   * }}
   */
  const imageViewerDialogContext = useContext(ImageViewerDialogContext);

  /**
   * @type {{
   * open: (customerId: string) => void
   * }}
   */
  const acsDialogContext = useContext(AcsDialogContext);

  return {
    acs: {
      open: acsDialogContext.open,
    },
    engineer: {
      open: engineerPickerContext.open,
    },
    area: {
      open: areaPickerContext.open,
      getArea: areaPickerContext.getArea,
      openMultiple: multipleAreaPickerContext.open,
    },
    customer: {
      pick: customerPickerContext.open,
    },
    broadcastProfilePicker: {
      open: broadcastProfilePickerContext.open,
    },
    imageViewerDialog: {
      open: imageViewerDialogContext.open,
    },
  };
}
