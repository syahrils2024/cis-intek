import { Icon } from '@iconify/react';
import { createSlice } from '@reduxjs/toolkit';
import { WHATSAPP_PANEL_DOMAIN } from '@commons/constant';

/**
 * @typedef {object} MenuItem
 * @property {string} title
 * @property {string} path
 * @property {string} icon
 * @property {string[]} allowPrivilege
 * @property {MenuItem[]} children
 */

/**
 * @typedef {Object} MenuStore
 * @property {string} subheader
 * @property {MenuItem[]} items
 */
const initialMenu = [
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
        title: 'Service List',
        path: '/v2/service-list',
        icon: <Icon icon="ion:pricetags-outline" />,
        allowPrivilege: ['admin', 'liaison_officer', 'network_operation_center'],
      },
      // {
      //   title: 'Service List',
      //   path: '/v2/package',
      //   icon: <Icon icon="ion:pricetags-outline" />,
      //   allowPrivilege: ['admin', 'liaison_officer', 'network_operation_center'],
      // },
      // {
      //   title: 'addons',
      //   path: '/v2/addons',
      //   icon: <Icon icon="ic:baseline-connected-tv" />,
      //   allowPrivilege: ['admin'],
      // },
      {
        title: 'Area Config',
        path: '/v2/area-configuration',
        icon: <Icon icon="lets-icons:map-light" />,
        allowPrivilege: ['admin', 'liaison_officer', 'network_operation_center'],
      },
      // {
      //   title: 'Maps',
      //   path: '/v2/geolocation',
      //   icon: <Icon icon="gravity-ui:geo" />,
      //   allowPrivilege: ['admin', 'liaison_officer', 'engineer', 'network_operation_center'],
      // },
      {
        title: 'Billing',
        path: '/v2/billing',
        icon: <Icon icon="token:idrt" />,
        allowPrivilege: ['admin', 'liaison_officer'],
      },
      // {
      //   title: 'Pengajuan Pembayaran',
      //   path: '/v2/invoice-temp',
      //   icon: <Icon icon="mdi:account-payment-outline" />,
      //   allowPrivilege: ['admin', 'liaison_officer'],
      // },
      // {
      //   title: 'Cek Koneksi',
      //   path: '/v2/customer-check-connection',
      //   icon: <Icon icon="ph:seal-check-bold" />,
      //   allowPrivilege: ['admin', 'liaison_officer', 'network_operation_center'],
      // },
      // {
      //   title: 'E-Tiket',
      //   path: '/v2/ticket',
      //   icon: <Icon icon="icon-park-outline:ticket" />,
      //   allowPrivilege: ['admin', 'liaison_officer', 'network_operation_center'],
      // },
      {
        title: 'Network Status',
        path: '/v2/customer',
        icon: <Icon icon="mdi:ticket-user" />,
        allowPrivilege: ['admin', 'liaison_officer', 'network_operation_center', 'engineer'],
      },
      {
        title: 'Ticket Support',
        path: '/v2/ticket-main',
        icon: <Icon icon="mdi:customer-service" />,
        allowPrivilege: ['admin'],
      },
      // {
      //   title: 'Mikrotik Log',
      //   path: '/v2/mikrotik-log',
      //   icon: <Icon icon="mynaui:terminal" />,
      //   allowPrivilege: ['admin', 'network_operation_center'],
      // },
      // {
      //   title: 'Job Queue',
      //   path: '/v2/job-queue',
      //   icon: <Icon icon="ic:outline-schedule-send" />,
      //   allowPrivilege: ['admin'],
      // },
      {
        title: 'Stok',
        path: '/v2/stock',
        icon: <Icon icon="ic:outline-inventory" />,
        allowPrivilege: ['admin', 'network_operation_center'],
      },
      // {
      //   title: 'Metode Pembayaran',
      //   path: '/v2/payment-method',
      //   icon: <Icon icon="ic:baseline-payment" />,
      //   allowPrivilege: ['admin', 'liaison_officer'],
      // },
      {
        title: 'PSB',
        path: '/v2/psb',
        icon: <Icon icon="fa-solid:users-cog" />,
        allowPrivilege: ['admin', 'liaison_officer', 'network_operation_center'],
      },
      // {
      //   title: 'PSB',
      //   icon: <Icon icon="fa-solid:users-cog" />,
      //   path: '/v2',
      //   allowPrivilege: ['admin', 'liaison_officer', 'marketing', 'engineer'],
      //   children: [
      //     {
      //       title: 'Antrian Pemasangan',
      //       path: '/v2/customer-queue',
      //       icon: <Icon icon="fluent:people-queue-20-regular" />,
      //       allowPrivilege: ['admin', 'liaison_officer', 'engineer'],
      //     },
      //     {
      //       title: 'Registrasi',
      //       path: '/v2/installation-request',
      //       icon: <Icon icon="mdi:user-multiple-add-outline" />,
      //       allowPrivilege: ['admin', 'liaison_officer', 'marketing', 'engineer'],
      //     },
      //   ],
      // },
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
      // {
      //   title: 'Openclaw Settings',
      //   path: '/v2/openclaw',
      //   icon: <Icon icon="hugeicons:artificial-intelligence-01" />,
      //   allowPrivilege: ['admin'],
      // },
      {
        title: 'Payment Gateway',
        icon: <Icon icon="arcticons:eset-payment-protection" />,
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

const dashboardMenuSlice = createSlice({
  name: 'dashboard',
  initialState: initialMenu,
});

export default dashboardMenuSlice.reducer;
