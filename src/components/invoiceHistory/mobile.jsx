import {
  Stack,
  Button,
  Divider,
  Accordion,
  AccordionDetails,
  AccordionSummary,
  AccordionActions,
} from '@mui/material';

/**
 *
 * @param {{data: import("src/repositories/subscription").InvoiceHistory[]; showEvidence: () => void}} props
 */
export default function InvoiceHistoryMobileCard({ data, showEvidence }) {
  return data.map((d, i) => (
    <div className="tw-ring-1 tw-ring-gray-400 tw-rounded-lg" key={i}>
      <Accordion>
        <AccordionSummary>
          <Stack>
            <span className="tw-text-xs tw-font-semibold">{d.customerFullname}</span>
            <span className="tw-text-xs tw-text-gray-500">{d.customerId}</span>
            <span className="tw-text-xs tw-text-gray-500">{d.customerPhone}</span>
            <span className="tw-text-xs tw-text-gray-500">{d.customerAddress}</span>
          </Stack>
        </AccordionSummary>
        <AccordionDetails>
          <div className="tw-flex tw-flex-col tw-gap-2">
            <Stack>
              <span className="tw-text-xs tw-text-gray-500">Paket</span>
              <span className="tw-text-xs tw-font-semibold">{d.customerPackage}</span>
            </Stack>
            <Stack>
              <span className="tw-text-xs tw-text-gray-500">Harga</span>
              <span className="tw-text-xs tw-font-semibold">
                Rp. {d.customerPackagePrice?.toString().toNumber().formatCurrency() ?? '-'}
              </span>
            </Stack>
            <Divider />
            <Stack>
              <span className="tw-text-xs tw-text-gray-500">Jumlah Pembayaran</span>
              <span className="tw-text-xs tw-font-semibold">
                Rp. {d.amount?.toString().toNumber().formatCurrency() ?? '-'}
              </span>
            </Stack>
            <Stack>
              <span className="tw-text-xs tw-text-gray-500">Tujuan Pembayaran</span>
              <span className="tw-text-xs tw-font-semibold">
                {d.paymentMethod} - {d.depositMethod}
              </span>
            </Stack>
            <Stack>
              <span className="tw-text-xs tw-text-gray-500">Tanggal</span>
              <span className="tw-text-xs tw-font-semibold">
                {d.date?.toDate().formatDateTime() ?? '-'}
              </span>
            </Stack>
            <Stack>
              <span className="tw-text-xs tw-text-gray-500">Admin</span>
              <span className="tw-text-xs tw-font-semibold">{d.recipientName}</span>
            </Stack>
            <Stack>
              <span className="tw-text-xs tw-text-gray-500">Catatan</span>
              <span className="tw-text-xs tw-font-semibold">{d.note ?? 'Tidak ada catatan'}</span>
            </Stack>
          </div>
        </AccordionDetails>
        <AccordionActions>
          <Button
            variant="outlined"
            disabled={(d.paymentEvidences?.length ?? 0) <= 0}
            size="small"
            color="primary"
            onClick={() => showEvidence(d)}
          >
            Resi
          </Button>
        </AccordionActions>
      </Accordion>
    </div>
  ));
}
