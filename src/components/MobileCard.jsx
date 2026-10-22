import React from 'react';

import { Card, CardActions } from '@mui/material';

/**
 * @typedef {object} MobileItems
 * @property {string} label - label of item
 * @property {any} value - value of item
 *
 * @param {{items: MobileItems[], children: React.JSX}} props - Props Component
 */
export default function MobileCard({ items, children }) {
  return (
    <Card>
      <div className="tw-flex tw-flex-col tw-gap-2 tw-w-full tw-p-5">
        {items.map((item, i) => (
          <div className="tw-flex tw-flex-col tw-text-sm md:tw-text-base" key={i}>
            <span className="tw-text-gray-400 tw-text-xs md:tw-text-sm">{item.label}</span>
            {item.value}
          </div>
        ))}
      </div>
      <CardActions className="tw-flex tw-flex-row tw-items-center tw-justify-end">
        {children}
      </CardActions>
    </Card>
  );
}
