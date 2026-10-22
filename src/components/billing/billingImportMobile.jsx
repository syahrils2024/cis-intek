import { Chip, Stack, Divider, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';

import 'src/extension/number';
import 'src/extension/string';

/**
 *
 * @param {{data: import('src/repositories/xlsx').BillingTemplateValidation[]}} param0
 */
export default function BillingImportMobile({ data }) {
  return data.map((d, i) => (
    <div className="tw-ring-1 tw-ring-gray-400 tw-rounded-lg" key={i}>
      <Accordion>
        <AccordionSummary className="tw-w-full">
          <Stack gap={1} className="tw-w-full">
            <div className="tw-flex tw-flex-row tw-items-start tw-justify-between">
              <Chip label={d.summaryPeriode} color="success" variant="outlined" size="small" />
            </div>
            <Divider />
            <Stack>
              <span className="tw-text-xs">
                <span className="tw-font-semibold">{d.customerFullname}</span> - {d.customerPhone}
              </span>
              <span className="tw-text-xs">{d.customerId}</span>
              <span className="tw-text-xs">{d.customerAddress}</span>
            </Stack>
          </Stack>
        </AccordionSummary>
        <AccordionDetails>
          <Stack gap={1.5}>
            <Stack>
              <span className="tw-text-xs">Tagihan</span>
              <span className="tw-text-xs tw-font-semibold">
                {d.amount.toString().toNumber().formatCurrency()}
              </span>
            </Stack>
            <Stack>
              <span className="tw-text-xs">Bayar</span>
              <span className="tw-text-xs tw-font-semibold">
                {d.pay.toString().toNumber().formatCurrency()}
              </span>
            </Stack>
            <Stack>
              <span className="tw-text-xs">Dibayar Pada</span>
              <span className="tw-text-xs tw-font-semibold">{d.payAt?.toDate().format('dd MMM yyyy')}</span>
            </Stack>
            <Stack>
              <span className="tw-text-xs">Area</span>
              <span className="tw-text-xs tw-font-semibold">{d.areaTitle}</span>
            </Stack>
            <Stack>
              <span className="tw-text-xs">Paket</span>
              <span className="tw-text-xs tw-font-semibold">{d.services}</span>
            </Stack>
            <Stack>
              <span className="tw-text-xs">Jatuh Tempo</span>
              <span className="tw-text-xs tw-font-semibold">{d.duoDate?.toDate().format('dd MMM yyyy')}</span>
            </Stack>
          </Stack>
        </AccordionDetails>
      </Accordion>
    </div>
  ));
}
