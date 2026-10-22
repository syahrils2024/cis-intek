import 'src/global.css';

// ----------------------------------------------------------------------

import AuthGuard from '@components/authGuard';
import ProfileForm from '@components/profileForm';

import { Router } from 'src/routes/sections';

import { useScrollToTop } from 'src/hooks/use-scroll-to-top';

import { ThemeProvider } from 'src/theme/theme-provider';

import { ProgressBar } from 'src/components/progress-bar';
import { MotionLazy } from 'src/components/animate/motion-lazy';
import { SettingsDrawer, defaultSettings, SettingsProvider } from 'src/components/settings';
// ----------------------------------------------------------------------

export default function App() {
  useScrollToTop();

  return (
    // <AuthProvider>
    <AuthGuard>
      <SettingsProvider settings={defaultSettings}>
        <ThemeProvider>
          <MotionLazy>
            <ProgressBar />
            <SettingsDrawer />
            <Router />
            <ProfileForm />
          </MotionLazy>
        </ThemeProvider>
      </SettingsProvider>
    </AuthGuard>

    // </AuthProvider>
  );
}
