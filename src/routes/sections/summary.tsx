import { lazy } from 'react';
import { Outlet } from 'react-router';
import BillingPublic from '@pages/public/billing';

const InstallationReport = lazy(() => import('src/pages/public/installation-report'));
const PsbReport = lazy(() => import('@pages/public/psb-report'));

export const summaryRoutes = [{
  path: 'summary', element: <Outlet />, children: [
    { path: 'installation-report/:id', element: <InstallationReport /> },
    { path: 'psb-report/:id', element: <PsbReport /> },
    { path: 'billing/:customer', element: <BillingPublic /> },
  ],
}];