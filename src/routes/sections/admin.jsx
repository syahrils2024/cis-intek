import { lazy } from 'react';
import { Outlet } from 'react-router';

import { DashboardLayout } from 'src/layouts/admin';

const AdminDashboardPage = lazy(() => import('src/pages/admin/dashboard'));
const PackagePage = lazy(() => import('@pages/admin/package/package'));
const BroadcastTemplatePage = lazy(() => import('@pages/admin/broadcast/broadcast'));
const UserManagementPage = lazy(() => import('@pages/admin/user/User'));
const AreaConfigurationpage = lazy(() => import('@pages/admin/areaConfiguration2'));
const BillingPage = lazy(() => import('@pages/admin/billing/billing'));
const CustomerQueue = lazy(() => import('@pages/admin/customerQueue'));
const InventoryPage = lazy(() => import('@pages/admin/inventory'));
const PaymentMethodPage = lazy(() => import('@pages/admin/paymentMethod'));
const InstallationRequestPage = lazy(() => import('@pages/admin/installationRequest'));
const DuoDateChargePage = lazy(() => import('@pages/admin/duoDateCharge'));
const MapsAreaPage = lazy(() => import('@pages/admin/mapsArea'));
const PsbPage = lazy(() => import('@pages/admin/psb'));
const CustomerEngineer = lazy(() => import('@pages/admin/customerEngineer'));
const CustomerEngineerV2 = lazy(() => import('@pages/admin/networkStatus/customerEngineerV2'));
const NetworkStatusPage = lazy(() => import('@pages/admin/networkStatus/NetworkStatus'));
const InvoiceTempPage = lazy(() => import('@pages/admin/billing/invoiceTemp'));
const BillingAndInvoiceTempPage = lazy(() => import('@pages/admin/billing/billingAndInvoiceTemp'));
const TicketPage = lazy(() => import('@pages/admin/ticket/ticket'));
const AreaConfigurationParent = lazy(() => import('@pages/areaConfiguration/AreaConfigurationParent'));
const BillingParent = lazy(() => import('@pages/admin/billing/billingParent'));
const CustomerParent = lazy(() => import('@pages/admin/customerParent'));
const UserProfile = lazy(() => import('@pages/admin/userProfile/userProfile'));
const MikrotikLog = lazy(() => import('@pages/admin/tools/mikrotikLog'));
const MainTicketPage = lazy(() => import('@pages/admin/ticket/TicketPage'));
const JobQueuePage = lazy(() => import('@pages/admin/tools/JobQueuePage'));
const ToolsPage = lazy(() => import('@pages/admin/tools/ToolsPage'));
const AddonsPage = lazy(() => import('@pages/admin/addonsParent'));
const ServiceListParentPage = lazy(() => import('@pages/admin/package/ServiceListParent'));
const WhatsAppSettingPage = lazy(() => import('@pages/admin/whatsappSetting/whatsappSetting'));
const CommonsPage = lazy(() => import('@pages/admin/commons/index'));
const DuitkuPanelPage = lazy(() => import('@pages/admin/paymentGateway/duitku/DuitkuPanel'));
const NetworkMonitoringPage = lazy(() => import("@pages/admin/networkMonitoring/NetworkMonitoring"));
const OpenclawPage = lazy(() => import("@pages/admin/openclaw"));

const layoutContent = (
  <DashboardLayout>
    <div className="tw-pb-14">
      <Outlet />
    </div>
  </DashboardLayout>
);

export const adminRoutes = [
  {
    path: 'v2',
    element: <>{layoutContent}</>,
    children: [
      { element: <AdminDashboardPage />, index: true },
      { path: 'package', element: <PackagePage /> },
      { path: 'broadcast-template', element: <BroadcastTemplatePage /> },
      { path: 'user-management', element: <UserManagementPage /> },
      { path: 'area-configuration', element: <AreaConfigurationParent /> },
      { path: 'billing', element: <BillingParent /> },
      { path: 'customer-queue', element: <CustomerQueue /> },
      { path: 'stock', element: <InventoryPage /> },
      { path: 'payment-method', element: <PaymentMethodPage /> },
      { path: 'installation-request', element: <InstallationRequestPage /> },
      { path: 'duo-date-charge', element: <DuoDateChargePage /> },
      { path: 'geolocation', element: <MapsAreaPage /> },
      { path: 'psb', element: <PsbPage /> },
      { path: 'customer-engineer', element: <CustomerEngineer /> },
      { path: 'customer-check-connection', element: <CustomerEngineer /> },
      { path: 'invoice-temp', element: <BillingAndInvoiceTempPage /> },
      { path: 'ticket', element: <TicketPage /> },
      { path: 'customer', element: <NetworkStatusPage /> },
      { path: 'user-profile', element: <UserProfile /> },
      { path: 'mikrotik-log', element: <MikrotikLog /> },
      { path: 'ticket-main', element: <MainTicketPage /> },
      { path: 'job-queue', element: <JobQueuePage /> },
      { path: 'tools', element: <ToolsPage /> },
      { path: 'addons', element: <AddonsPage /> },
      { path: 'service-list', element: <ServiceListParentPage /> },
      { path: 'whatsapp-setting', element: <WhatsAppSettingPage /> },
      { path: 'commons', element: <CommonsPage /> },
      { path: 'payment-gateway/duitku', element: <DuitkuPanelPage /> },
      { path: 'network-map', element: <NetworkMonitoringPage /> },
      { path: 'openclaw', element: <OpenclawPage /> },
    ],
  },
];
