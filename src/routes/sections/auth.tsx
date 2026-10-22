import { lazy, Suspense } from 'react';
import { Outlet } from 'react-router-dom';

import { AuthSplitLayout } from 'src/layouts/auth-split';

import { SplashScreen } from 'src/components/loading-screen';

import { GuestGuard } from 'src/auth/guard';

const Jwt = {
  SignInPage: lazy(() => import('src/pages/auth/jwt/sign-in')),
  SignUpPage: lazy(() => import('src/pages/auth/jwt/sign-up')),
};

export const authRoutes = [{
  path: 'auth',
  // Legacy components currently expose required props through inferred JS types.
  // @ts-expect-error legacy component props will be typed during component migration.
  element: <Suspense fallback={<SplashScreen />}><Outlet /></Suspense>,
  children: [{ path: 'jwt', children: [
    // @ts-expect-error legacy component props will be typed during component migration.
    { path: 'sign-in', element: <GuestGuard><AuthSplitLayout section={{ title: 'Hi, Welcome back' }}><Jwt.SignInPage /></AuthSplitLayout></GuestGuard> },
    // @ts-expect-error legacy component props will be typed during component migration.
    { path: 'sign-up', element: <GuestGuard><AuthSplitLayout><Jwt.SignUpPage /></AuthSplitLayout></GuestGuard> },
  ] }],
}];
