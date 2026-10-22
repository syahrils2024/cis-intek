/* eslint-disable react/jsx-filename-extension */
import 'src/assets/tailwind.css';

import 'dayjs/locale/id';
import { Provider } from 'react-redux';
import ReactDOM from 'react-dom/client';
import { Suspense, StrictMode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { ConfirmProvider } from 'material-ui-confirm';
import { PersistGate } from 'redux-persist/integration/react';

import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

import { CONFIG } from 'src/config-global';
import { stores, persistor } from 'src/stores';
import { ThemeProvider } from 'src/theme/theme-provider';

import { Snackbar } from 'src/components/snackbar';
import { MotionLazy } from 'src/components/animate/motion-lazy';
import { defaultSettings, SettingsProvider } from 'src/components/settings';

import App from './app';
import AppComponent from './globalComponents/AppComponents';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

ReactDOM.createRoot(rootElement).render(
  <StrictMode>
    <HelmetProvider>
      <Provider store={stores}>
        <PersistGate loading={null} persistor={persistor}>
          <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="id">
            <SettingsProvider settings={defaultSettings}>
              <ThemeProvider>
                <MotionLazy>
                  <BrowserRouter basename={CONFIG.site.basePath}>
                    <Suspense>
                      <ConfirmProvider>
                        <AppComponent>
                          <App />
                          <Snackbar />
                        </AppComponent>
                      </ConfirmProvider>
                    </Suspense>
                  </BrowserRouter>
                </MotionLazy>
              </ThemeProvider>
            </SettingsProvider>
          </LocalizationProvider>
        </PersistGate>
      </Provider>
    </HelmetProvider>
  </StrictMode>
);
