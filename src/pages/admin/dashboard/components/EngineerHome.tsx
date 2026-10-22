// @ts-nocheck

import { NavLink } from 'react-router-dom';
import { Iconify } from '@components/iconify';

export default function EngineerHome() {
  const menus = [
    { label: 'PSB', iconName: 'fa-solid:users-cog', path: '/v2/psb' },
    // {
    //   label: 'Ticket',
    //   iconName: 'ion:ticket-outline',
    //   path: '/',
    // },
    {
      label: 'Maps',
      iconName: 'gravity-ui:geo',
      path: '/v2/geolocation',
    },
    {
      label: 'Customer',
      iconName: 'gg:list',
      path: '/v2/customer',
    },
    {
      label: 'Pembayaran',
      iconName: 'mdi:account-payment-outline',
      path: '/v2/invoice-temp',
    },
  ];

  return (
    <div className="tw-w-full tw-items-center tw-justify-center tw-grid tw-grid-cols-2 md:tw-grid-cols-3 lg:tw-grid-cols-5 tw-gap-3 tw-px-4">
      {menus.map((menu, i) => (
        <NavLink to={menu.path} key={i}>
          <div
            className="tw-flex tw-flex-col tw-items-center tw-justify-center tw-gap-1 tw-text-primary tw-bg-white tw-ring-1 tw-ring-gray-300 tw-p-5 tw-rounded-lg hover:tw-shadow-lg hover:tw-ring-transparent tw-duration-500"
            key={menu.label}
          >
            <Iconify icon={menu.iconName} width={40} />
            <span className="tw-text-base tw-font-semibold">{menu.label}</span>
          </div>
        </NavLink>
      ))}
    </div>
  );
}
