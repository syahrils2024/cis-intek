import storage from 'redux-persist/lib/storage';
import { persistStore, persistReducer } from 'redux-persist';
import { configureStore, combineReducers } from '@reduxjs/toolkit';

import meStore from './meStore';
import odpStore from './odpStore';
import menuStore from './menuStore';
import areaStore from './areaStore';
import userStore from './userStore';
import mapsAreaStore from './mapsArea';
import ticketStore from './ticketStore';
import packageStore from './packageStore';
import billingStore from './billingStore';
import profileStore from './profileStore';
import popListStore from './popListStore';
import invoiceStore from './invoiceStore';
import broadcastStore from './broadcastStore';
import inventoryStore from './inventoryStore';
import invoiceTempStore from './invoiceTempStore';
import userProfileStore from './userProfileStore';
import subscriptionStore from './subscriptionStore';
import customerFormStore from './customerFormStore';
import customerQueueStore from './customerQueueStore';
import paymentMethodStore from './paymentMethodStore';
import duoDateChargeStore from './duoDateChargeStore';
import customerFinishStore from './customerFinishStore';
import areaConfigurationStore from './areaConfiguration';
import customerEngineerStore from './customerEngineerStore';
import installationRequestStore from './installationRequest';
import customerEngineerStoreV2 from './customerEngineerStoreV2';

const persistRoot = {
  key: 'stores',
  storage,
};

const rootReducer = combineReducers({
  areaStore,
  packageStore,
  broadcastStore,
  subscriptionStore,
  userStore,
  areaConfigurationStore,
  customerFormStore,
  billingStore,
  customerQueueStore,
  inventoryStore,
  paymentMethodStore,
  profileStore,
  installationRequestStore,
  duoDateChargeStore,
  odpStore,
  mapsAreaStore,
  customerEngineerStore,
  customerEngineerStoreV2,
  invoiceTempStore,
  ticketStore,
  popListStore,
  invoiceStore,
  customerFinishStore,
  meStore,
  userProfileStore,
  menuStore,
});

// export const stores = configureStore({
//   middleware: (getDefaultMiddleware) =>
//     getDefaultMiddleware({
//       serializableCheck: false,
//     }),
//   reducer: {
//     areaStore,
//     dashboardStore,
//     packageStore,
//     broadcastStore,
//     subscriptionStore,
//     userStore,
//     areaConfigurationStore,
//     menuStore,
//   },
// });

const persistedReducer = persistReducer(
  {
    key: 'stores',
    storage,
    blacklist: [
      'areaStore',
      'packageStore',
      'broadcastStore',
      'subscriptionStore',
      'userStore',
      'billingStore',
      'customerQueueStore',
      'inventoryStore',
      'paymentMethodStore',
      'profileStore',
      'installationRequestStore',
      'areaConfigurationStore',
      'areaConfiguration',
      'duoDateChargeStore',
      'odpStore',
      'mapsAreaStore',
      'customerEngineerStore',
      'invoiceTempStore',
      'popListStore',
      'menuStore',
      'ticketStore',
      'invoiceStore',
      'customerFinishStore',
      'meStore',
      'userProfileStore',
      'customerEngineerStoreV2',
    ],
  },
  rootReducer
);
export const stores = configureStore({
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
      immutableCheck: false,
    }),
  reducer: persistedReducer,
});
export const persistor = persistStore(stores);
