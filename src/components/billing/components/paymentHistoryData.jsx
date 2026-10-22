/**
 * @typedef {Object} PaymentHistoryDataProps
 * @property {import("src/repositories/subscription").PaymentHistory[]} items
 * @property {Function} onCancel
 * @property {Function} onShowEvidence
 * @property {Function} onPrint
 * @property {boolean} allowAction
 */

import {
  Stack,
  Table,
  Button,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  Accordion,
  Typography,
  AccordionSummary,
  AccordionDetails,
  AccordionActions,
} from '@mui/material';

import 'src/extension/date';
import 'src/extension/string';
import 'src/extension/number';

export const PaymentHistoryData = {
  Table: PaymentHistoryDataTable,
  Mobile: PaymentHistoryMobile,
};

/** @param {PaymentHistoryDataProps} */
function PaymentHistoryDataTable({ items, onCancel, onShowEvidence, onPrint, allowAction }) {
  const headers = [
    'Detail Pembayaran',
    'Item',
    'Penerima',
    'Tanggal',
    'Catatan',
    ' Pembayaran',
    'Actions',
  ];

  return (
    <Table>
      <TableHead>
        <TableRow>
          {headers.map((header) => (
            <TableCell key={header}>{header}</TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {items.length <= 0 ? (
          <TableRow>
            <TableCell colspan={headers.length}>
              <div className="tw-w-full tw-items-center tw-justify-center tw-text-center tw-flex tw-h-96">
                <span className="tw-text-xs">Tidak ada Riwayat Pembayaran</span>
              </div>
            </TableCell>
          </TableRow>
        ) : null}
        {items.map((h, i) => (
          <TableRow key={i}>
            <TableCell sx={{ py: 0 }}>
              <div className="tw-flex tw-flex-col">
                <div className="tw-flex tw-flex-row tw-items-center tw-gap-1">
                  {h.paymentEvidences?.length >= 1 ? (
                    <Button
                      color="primary"
                      variant="text"
                      size="small"
                      onClick={() => onShowEvidence(h)}
                    >
                      <img
                        className="tw-aspect-square tw-h-14 tw-object-cover tw-object-center tw-rounded tw-ring-1 tw-ring-gray-300"
                        src={`/public/uploads/${h.paymentEvidences[0].replaceAll(
                          '/public/uploads/',
                          ''
                        )}`}
                        alt="Bukti Pembayaran"
                      />
                    </Button>
                  ) : (
                    <img
                      className="tw-aspect-square tw-h-14 tw-object-cover tw-object-center tw-rounded  tw-ring-1 tw-ring-gray-300"
                      src="/images/placeholder.png"
                      alt="Bukti Pembayaran"
                    />
                  )}
                  <Stack>
                    <span className="tw-text-xs">{new Date(h.date).formatSummaryDate()}</span>
                    <span className="tw-text-xs">
                      Rp. {h.amount?.toString().toNumber().formatCurrency()}
                    </span>
                  </Stack>
                </div>
              </div>
            </TableCell>
            <TableCell sx={{ py: 0 }} width={200}>
              <ul className="tw-list-disc tw-pl-5">
                {h.items?.map((item, j) => (
                  <li key={j}>
                    <Stack>
                      <span className="tw-text-xs">{item.service}</span>
                      <span className="tw-text-xs">
                        {billingCategoryLabel(item.billingCategory)}
                      </span>
                      {!!item.summaryPeriode && (
                        <span className="tw-text-xs">{item.summaryPeriode}</span>
                      )}
                      <span className="tw-text-xs tw-text-gray-500">
                        ({new Date(item.year, item.month - 1).format('MMMM yyyy')})
                      </span>
                    </Stack>
                  </li>
                ))}
              </ul>
            </TableCell>
            <TableCell sx={{ py: 0 }}>
              <span className="tw-text-xs">{h?.recipient?.toCapitalCase()}</span>
            </TableCell>
            <TableCell sx={{ py: 0 }}>
              <span className="tw-text-xs">
                {h?.date?.toDate().format('dd MMM yyyy HH:mm') ?? '-'}
              </span>
            </TableCell>
            <TableCell sx={{ py: 0 }}>
              <span className="tw-text-xs tw-font-semibold">{h?.note ?? 'Tidak ada catatan'}</span>
            </TableCell>
            <TableCell sx={{ py: 0 }}>
              <Stack>
                <span className="tw-text-xs">{h?.paymentMethod?.toCapitalCase() ?? '-'}</span>
                <span className="tw-text-xs">{h?.depositMethod?.toCapitalCase() ?? '-'}</span>
              </Stack>
            </TableCell>
            <TableCell sx={{ py: 0 }}>
              <div className="tw-flex tw-flex-row tw-gap-2">
                {i === 0 && !!onCancel && allowAction ? (
                  <Button onClick={() => onCancel(h)} variant="outlined" color="error">
                    Batal
                  </Button>
                ) : null}
                <Button onClick={() => onPrint(h)} variant="outlined" color="primary">
                  Cetak
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

/** @param {PaymentHistoryDataProps} */
function PaymentHistoryMobile({ allowAction, items, onCancel, onPrint, onShowEvidence }) {
  return items.map((h, i) => (
    <Accordion key={i}>
      <AccordionSummary>
        <Stack>
          <Typography variant="body2">{new Date(h.date).formatSummaryDate()}</Typography>
          <Typography variant="body2">Rp. {h.amount?.toString().toNumber().formatCurrency()}</Typography>
        </Stack>
      </AccordionSummary>
      <AccordionDetails>
        <Stack spacing={2}>
          <Stack>
            <span className="tw-text-xs tw-text-gray-500">Penerima</span>
            <span className="tw-text-xs tw-font-semibold">{h?.recipient?.toCapitalCase()}</span>
          </Stack>
          <Stack>
            <span className="tw-text-xs tw-text-gray-500">Metode Pembayaran</span>
            <span className="tw-text-xs tw-font-semibold">
              {h?.paymentMethod?.toCapitalCase() ?? '-'} -{' '}
              {h?.depositMethod?.toCapitalCase() ?? '-'}
            </span>
          </Stack>
          <Stack>
            <span className="tw-text-xs tw-text-gray-500">Bukti Pembayaran</span>
            {h.paymentEvidences?.length >= 1 && (
              <button type="button" onClick={() => onShowEvidence(h)} className="tw-mt-2">
                <img
                  className="tw-aspect-square tw-h-20 tw-object-cover tw-object-center tw-rounded"
                  src={`/public/uploads/${h.paymentEvidences[0].replaceAll(
                    '/public/uploads/',
                    ''
                  )}`}
                  alt="Bukti Pembayaran"
                />
              </button>
            )}
          </Stack>
          <Stack>
            <span className="tw-text-xs tw-text-gray-500">Item</span>
            <ul className="tw-list-disc tw-pl-5">
              {h.items?.map((item, j) => (
                <li key={j}>
                  <Stack>
                    <span className="tw-text-xs">{item.service}</span>
                    <span className="tw-text-xs">{billingCategoryLabel(item.billingCategory)}</span>
                    {!!item.summaryPeriode && (
                      <span className="tw-text-xs">{item.summaryPeriode}</span>
                    )}
                    <span className="tw-text-xs tw-text-gray-500">
                      ({new Date(item.year, item.month - 1).format('MMMM yyyy')})
                    </span>
                  </Stack>
                </li>
              ))}
            </ul>
          </Stack>
          <Stack className="tw-mt-4">
            <span className="tw-text-xs tw-text-gray-500">Catatan</span>
            <span className="tw-text-xs tw-font-semibold">{h?.note ?? 'Tidak ada catatan'}</span>
          </Stack>
        </Stack>
      </AccordionDetails>
      <AccordionActions>
        <div className="tw-flex tw-flex-row tw-gap-2">
          {i === 0 && !!onCancel && allowAction ? (
            <Button onClick={() => onCancel(h)} variant="outlined" color="error">
              Batal
            </Button>
          ) : null}

          <Button onClick={() => onPrint(h)} variant="outlined" color="primary">
            Cetak
          </Button>
        </div>
      </AccordionActions>
    </Accordion>
  ));
}

const billingCategoryLabel = (category) => {
  switch (category) {
    case 'internet':
      return 'Internet';
    case 'addons':
      return 'Addons';
    case 'upgrade_plan':
      return 'Upgrade Plan';
    case 'half_internet':
      return 'Pembayaran Awal Internet';
    case 'installation_charge':
      return 'Biaya Instalasi';
    default:
      return category;
  }
};
