import React from 'react';

import type { QRCodeDisplayProps } from '../openclaw.types';

export default function QRCodeDisplay({ qrDataUrl }: QRCodeDisplayProps) {
  return (
    <div className="tw-flex tw-justify-center tw-items-center tw-p-4">
      <img
        src={qrDataUrl}
        alt="WhatsApp QR Code"
        className="tw-w-64 tw-h-64 tw-object-contain"
      />
    </div>
  );
}
