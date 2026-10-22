import { lazy } from 'react';
import { Navigate, useRoutes } from 'react-router-dom';

import LoginPage from 'src/pages/loginV2/LoginV2';
import { AuthCenteredLayout } from 'src/layouts/auth-centered';

import { adminRoutes } from './admin';
import { summaryRoutes } from './summary.tsx';
// ----------------------------------------------------------------------

const CustomerTransaction = lazy(() => import('@pages/customerTransaction'));
export function Router() {
  return useRoutes([
    {
      path: '/',
      element: <Navigate to="/v2" replace />,
    },
    {
      path: '/login',
      element: (
        <AuthCenteredLayout>
          <LoginPage />
        </AuthCenteredLayout>
      ),
    },
    // Admin
    ...adminRoutes,
    // Auth
    // ...authRoutes,

    // Dashboard
    // ...dashboardRoutes,

    // Main
    // ...mainRoutes,

    // summary
    ...summaryRoutes,

    {
      path: '/pay',
      element: <CustomerTransaction />,
    },
    // No match
    { path: '*', element: <Navigate to="/404" replace /> },
  ]);
}
