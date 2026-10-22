/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import { useState } from 'react';

export default function WaCustomerCard({ data }) {
  const [isShow, setIsShow] = useState(false);

  return (
    <div className="tw-p-1 tw-ring-1 tw-ring-gray-400 tw-rounded-lg">
      <div className="tw-flex tw-flex-col tw-gap-2 tw-p-5">
        <div>
          <div className="tw-flex tw-flex-row tw-justify-between tw-items-center tw-mb-2">
            <span className="tw-text-xs tw-font-semibold">
              {data.fromWhatsappNode.toUpperCase()}
            </span>
            <span className="tw-text-xs">{data.fromWhatsappNodePhone.toUpperCase()}</span>
          </div>
          <div className="tw-text-xs tw-mt-3" onClick={() => setIsShow(!isShow)}>
            <div className="tw-w-full tw-overflow-clip">
              {data.message.substring(0, isShow ? data.message.length : 50)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
