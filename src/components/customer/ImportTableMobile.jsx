import { Chip, Stack, Divider, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';

import 'src/extension/number';
import 'src/extension/string';

/**
 * @typedef {import("src/repositories/xlsx").CustomerTemplateValidation} CustomerTemplateValidation
 */

/**
 *
 * @param {{data: CustomerTemplateValidation[]}} param0
 */
export default function CustomerImportMobile({ data }) {
  return data.map((d, i) => (
    <div className="tw-ring-1 tw-ring-gray-400 tw-rounded-lg" key={i}>
      <Accordion>
        <AccordionSummary className="tw-w-full">
          <Stack gap={1} className="tw-w-full">
            <div className="tw-flex tw-flex-row tw-items-start tw-justify-between">
              <Chip label={d.odpTitle} color="success" variant="outlined" size="small" />
              <Chip label={d.areaTitle} color="primary" variant="outlined" size="small" />
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
              <span className="tw-text-xs">Paket Internet</span>
              <span className="tw-text-xs tw-font-semibold">{d.package}</span>
            </Stack>
            <Stack>
              <span className="tw-text-xs">Biaya Bulanan</span>
              <span className="tw-text-xs tw-font-semibold">
                Rp. {d.packagePrice.toString().toNumber().formatCurrency()}
              </span>
            </Stack>
            <Stack>
              <span className="tw-text-xs">VLAN</span>
              <span className="tw-text-xs tw-font-semibold">{d.vlan}</span>
            </Stack>
            <Stack>
              <span className="tw-text-xs">PPPoE Name</span>
              <span className="tw-text-xs tw-font-semibold">{d.pppoeName}</span>
            </Stack>
            <Stack>
              <span className="tw-text-xs">PPPoE Password</span>
              <span className="tw-text-xs tw-font-semibold">{d.pppoePassword}</span>
            </Stack>
            <Stack>
              <span className="tw-text-xs">IP Remote</span>
              <span className="tw-text-xs tw-font-semibold">{d.ipRemote}</span>
            </Stack>
            <Stack>
              <span className="tw-text-xs">Serial Number</span>
              <span className="tw-text-xs tw-font-semibold">{d.routerSerialNumber}</span>
            </Stack>
            <Stack>
              <span className="tw-text-xs">Router SSID</span>
              <span className="tw-text-xs tw-font-semibold">{d.routerSsid}</span>
            </Stack>
            <Stack>
              <span className="tw-text-xs">Router Password</span>
              <span className="tw-text-xs tw-font-semibold">{d.routerPassword}</span>
            </Stack>
          </Stack>
        </AccordionDetails>
      </Accordion>
    </div>
  ));
}
