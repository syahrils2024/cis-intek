/**
 * @typedef {import("src/repositories/subscription").PaymentHistorySummary} PaymentHistorySummary
 */

import { Fragment } from 'react';

import {
  Stack,
  Avatar,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';

import 'src/extension/string';
import 'src/extension/number';

/**
 *
 * @param {{data: PaymentHistorySummary[]}} param0
 */
export default function HistoryPaymentSummaryMobile({ data }) {
  return data.map((d, i) => (
    <div key={i} className="tw-flex tw-flex-col tw-ring-gray-400 tw-ring-1 tw-rounded-md tw-gap-3">
      <Accordion>
        <AccordionSummary>
          <div className="tw-flex tw-flex-col tw-gap-3 tw-w-full">
            <Stack spacing={2} direction="row" alignItems="center" className="tw-w-full">
              <Avatar src="https://api-dev-minimal-v6.vercel.app/assets/images/avatar/avatar-17.webp" />
              <Stack sx={{ typography: 'body2', flex: '1 1 auto', alignItems: 'flex-start' }}>
                <span className="tw-text-xs tw-font-medium">{d.fullname}</span>
                <span className="tw-text-xs tw-text-gray-500">{d.email}</span>
                <span className="tw-text-xs tw-text-gray-500">{d.address}</span>
              </Stack>
            </Stack>
            <Divider />
            <div className="tw-flex tw-flex-row tw-items-center tw-justify-between">
              <span className="tw-text-xs">Jumlah</span>
              <span className="tw-text-xs tw-font-semibold tw-pr-1.5">
                Rp. {d.amount?.toString().toNumber().formatCurrency()}
              </span>
            </div>
          </div>
        </AccordionSummary>
        <AccordionDetails>
          <div className="tw-flex tw-flex-col tw-gap-1.5">
            {d.details.map((detail, j) => (
              <Fragment key={j}>
                <Divider />
                <div className="tw-grid tw-grid-cols-2">
                  <span className="tw-text-xs">{detail.depositMethod}</span>
                  <span className="tw-text-xs tw-text-right tw-font-medium">
                    Rp. {detail.amount?.toString().toNumber().formatCurrency()}
                  </span>
                </div>
              </Fragment>
            ))}
          </div>
        </AccordionDetails>
      </Accordion>
    </div>
  ));
}
