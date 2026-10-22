/**
 * @typedef {import("@/repositories/subscription").PaymentHistorySummaryByAreaCategory} PaymentHistorySummaryByAreaCategory
 */

import { Stack, Divider, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';

import 'src/extension/number';

/**
 * @param {{data: PaymentHistorySummaryByAreaCategory}}
 */
export default function HistoryPaymentSummaryByAreaMobileCard({ data }) {
  return (
    <div className="tw-ring-1 tw-ring-gray-400 tw-rounded-lg">
      <Accordion>
        <AccordionSummary>
          <Stack spacing={1}>
            <Stack>
              <span className="tw-text-xs tw-text-gray-600">Wilayah</span>
              <span className="tw-text-xs tw-font-semibold">{data.areaCategory}</span>
            </Stack>
            <Stack>
              <span className="tw-text-xs tw-text-gray-600">Total</span>
              <span className="tw-text-xs tw-font-semibold">Rp. {data.total.formatCurrency()}</span>
            </Stack>
          </Stack>
        </AccordionSummary>
        <AccordionDetails>
          <ul className="tw-list-disc tw-px-8">
            {data.items.map((item, j) => (
              <li key={j}>
                <div className="tw-flex tw-flex-col gap-2">
                  <div className="tw-flex tw-flex-col tw-items-start tw-gap-1 tw-my-2">
                    <span className="tw-text-xs">{item.areaTitle}</span>
                    <span className="tw-text-xs tw-font-semibold">
                      Rp. {item.total.formatCurrency()}
                    </span>
                  </div>
                  <Divider />
                </div>
              </li>
            ))}
          </ul>
        </AccordionDetails>
      </Accordion>
    </div>
  );
}
