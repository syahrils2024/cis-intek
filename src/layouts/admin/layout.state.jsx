import { useMemo } from 'react';
import { Iconify as Icon } from '@components/iconify';
import { usePermission } from '@auth/hooks/permission';
import { WHATSAPP_PANEL_DOMAIN } from '@commons/constant';

import { Chip } from '@mui/material';

import { useInfoStore } from 'src/stores/info';

/**
 * @typedef {import("src/stores/info").InfoStore} InfoStore
 */

export function useLayoutState() {
  /** @type {InfoStore} */
  const infoStore = useInfoStore();

  const permission = usePermission();

  const menu = useMemo(() => {
    const totalCustomerPending = infoStore.customerPending;
    const totalInstallation = infoStore.installationRequest;
    const totalTicket =
      (infoStore.ticketPending ?? 0) +
      (infoStore.ticketProcessed ?? 0) +
      (infoStore.ticketWaitingFinishing ?? 0);

    const totalBilling =
      (infoStore.invoiceTempPending ?? 0) + (infoStore.customerTransactionPending ?? 0);

    const totalPsb = totalCustomerPending + totalInstallation;

    const menuList = [
      {
        subheader: 'Menu',
        items: [
          {
            title: 'Dashboard',
            path: '/v2',
            icon: <Icon icon="ic:baseline-dashboard" />,
            allowPrivilege: ['admin', 'liaison_officer', 'marketing'],
          },
          {
            title: 'Home',
            path: '/v2',
            icon: <Icon icon="ic:baseline-dashboard" />,
            allowPrivilege: ['engineer'],
          },
          {
            title: 'Area Config',
            path: '/v2/area-configuration',
            icon: <Icon icon="lets-icons:map-light" />,
            allowPrivilege: ['admin', 'liaison_officer', 'network_operation_center'],
          },
          {
            title: 'Network Map',
            path: '/v2/network-map',
            icon: <Icon icon="carbon:network-2" />,
            allowPrivilege: ['admin', 'liaison_officer', 'network_operation_center'],
          },
          {
            title: 'Maps',
            path: '/v2/geolocation',
            icon: <Icon icon="entypo:location" />,
            allowPrivilege: ['admin', 'liaison_officer', 'network_operation_center'],
          },
          {
            title: 'Service List',
            path: '/v2/service-list',
            icon: <Icon icon="ion:pricetags-outline" />,
            allowPrivilege: ['admin', 'liaison_officer', 'network_operation_center'],
          },

          {
            title: 'Billing',
            path: '/v2/billing',
            icon: <Icon icon="token:idrt" />,
            allowPrivilege: ['admin', 'liaison_officer'],
            badge: totalBilling ? (
              <Chip size="small" label={totalBilling} color="warning" variant="soft" />
            ) : null,
          },
          {
            title: 'Network Status',
            path: '/v2/customer',
            icon: <Icon icon="icon-park-outline:connection-point" />,
            allowPrivilege: ['admin', 'liaison_officer', 'network_operation_center', 'engineer'],
          },
          {
            title: 'Ticket Support',
            path: '/v2/ticket-main',
            icon: <Icon icon="mdi:customer-service" />,
            allowPrivilege: ['admin'],
            badge: totalTicket ? (
              <Chip size="small" label={totalTicket} color="warning" variant="soft" />
            ) : null,
          },
          {
            title: 'Stok',
            path: '/v2/stock',
            icon: <Icon icon="ic:outline-inventory" />,
            allowPrivilege: ['admin', 'network_operation_center'],
          },
          {
            title: 'PSB',
            path: '/v2/psb',
            icon: <Icon icon="fa-solid:users-cog" />,
            allowPrivilege: ['admin', 'liaison_officer', 'network_operation_center'],
            badge: totalPsb ? (
              <Chip size="small" label={totalPsb} color="warning" variant="soft" />
            ) : null,
          },
          {
            title: 'Tools',
            path: '/v2/tools',
            icon: <Icon icon="ep:tools" />,
            allowPrivilege: ['admin'],
          },
          {
            title: 'Whatsapp Panel',
            path: WHATSAPP_PANEL_DOMAIN,
            icon: <Icon icon="bx:chat" />,
            allowPrivilege: ['admin'],
          },
          {
            title: 'Pengaturan Whatsapp',
            path: '/v2/whatsapp-setting',
            icon: <Icon icon="ic:baseline-whatsapp" />,
            allowPrivilege: ['admin'],
          },
          {
            title: 'AI Settings',
            path: '/v2/openclaw',
            icon: <Icon icon="hugeicons:artificial-intelligence-01" />,
            allowPrivilege: ['admin'],
          },
          {
            title: 'Payment Gateway',
            icon: <Icon icon="uil:transaction" />,
            path: '/v2',
            allowPrivilege: ['admin'],
            children: [
              {
                title: 'Duitku',
                path: '/v2/payment-gateway/duitku',
                icon: <Icon icon="temaki:money-hand" />,
                allowPrivilege: ['admin'],
              },
            ],
          },
          {
            title: 'Pengaturan',
            icon: <Icon icon="uil:setting" />,
            path: '/v2',
            allowPrivilege: ['admin', 'liaison_officer', 'network_operation_center'],
            children: [
              {
                title: 'Metode Pembayaran',
                path: '/v2/payment-method',
                icon: <Icon icon="ic:baseline-payment" />,
                allowPrivilege: ['admin'],
              },
              {
                title: 'Broadcast Template',
                path: '/v2/broadcast-template',
                icon: <Icon icon="ic:baseline-chat" />,
                allowPrivilege: ['admin', 'liaison_officer', 'network_operation_center'],
              },
              {
                title: 'User Profile',
                path: '/v2/user-profile',
                icon: <Icon icon="flowbite:profile-card-outline" />,
                allowPrivilege: ['admin', 'liaison_officer'],
              },
              {
                title: 'User Management',
                path: '/v2/user-management',
                icon: <Icon icon="mdi:users-outline" />,
                allowPrivilege: ['admin', 'network_operation_center', 'liaison_officer'],
              },
              {
                title: 'Denda',
                path: '/v2/duo-date-charge',
                icon: <Icon icon="tabler:tax" />,
                allowPrivilege: ['admin', 'network_operation_center'],
              },
              {
                title: 'Lainnya',
                path: '/v2/commons',
                icon: <Icon icon="streamline-ultimate:common-file-module-1-bold" />,
                allowPrivilege: ['admin'],
              },
            ],
          },
        ],
      },
    ];

    return menuList.map((m) => {
      const allowedWhatsappAccess = permission.allowAccessWhatsappPanel;
      const allowedNetworkMonitoringAccess = permission.allowAccessNetworkMonitoring;

      const items = m.items.filter((item) => {
        const itemAllowWhatsappAccess =
          item.path !== WHATSAPP_PANEL_DOMAIN || allowedWhatsappAccess;
        const itemAllowNetworkMonitoring =
          item.path !== '/v2/network-map' || allowedNetworkMonitoringAccess;
        return itemAllowWhatsappAccess && itemAllowNetworkMonitoring;
      });

      m.items = items;
      return m;
    });
  });

  return { menu };
}
