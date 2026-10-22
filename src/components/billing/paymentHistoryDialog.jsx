/**
 * @typedef {import("src/repositories/subscription").Subscription} Subscription
 * @typedef {import('src/repositories/subscription').PaymentHistory} PaymentHistory
 */

import { toast } from 'sonner';
import { useBoolean } from '@hooks/use-boolean';
import { useConfirm } from 'material-ui-confirm';
import { useRef, useState, useEffect } from 'react';
import { usePrivilege } from '@auth/hooks/privileges';
import { ViewerImageDialog } from '@components/viewerImageDialog';

import {
  Table,
  Stack,
  Button,
  Dialog,
  TableRow,
  useTheme,
  TableCell,
  TableHead,
  TableBody,
  Accordion,
  Typography,
  DialogTitle,
  DialogActions,
  DialogContent,
  useMediaQuery,
  AccordionSummary,
  AccordionDetails,
  AccordionActions,
} from '@mui/material';

import 'src/extension/date';
import 'src/extension/number';
import 'src/extension/string';
import { subscriptionRepository } from 'src/repositories';

const PAYMENT_URL = import.meta.env.VITE_PAYMENT_URL;
/**
 *
 * @param {{subscription: Subscription | null; show: boolean; onClose: void}} props
 */
export function PaymentHistoryDialog({ subscription, show, onClose }) {
  /** @type {[PaymentHistory[], void]} */
  const [paymentHistory, setPaymentHistory] = useState([]);
  const loading = useBoolean(false);
  const headers = [
    'Detail Pembayaran',
    'Item',
    'Penerima',
    'Tanggal',
    'Catatan',
    'Metode Pembayaran',
    'Actions',
  ];
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const confirm = useConfirm();
  const viewerImageDialogRef = useRef();
  const { isAdmin } = usePrivilege();

  const prefetch = async () => {
    try {
      const snapshot = await subscriptionRepository.getPaymentHistory(subscription._id);
      snapshot.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setPaymentHistory(snapshot);
    } catch (error) {
      toast.error(error.message);
    }
  };

  /** @param {PaymentHistory} history */
  const onPrint = (history) => {
    console.log(PAYMENT_URL);
    const url = `${PAYMENT_URL}/${history._id}`;
    window.open(url, '_blank');
  };

  useEffect(() => {
    if (!show) return;
    prefetch();
  }, [show]);

  /**
   * @param {PaymentHistory} history
   */
  async function removeInvoice(history) {
    try {
      const formatDate = new Date(history.date).formatSummaryDate();
      await confirm({
        title: 'Batalkan Pembayaran',
        content: `Apakah anda ingin menghapus pembayaran ${history.customer} pada ${formatDate}`,
        cancellationText: 'Tidak',
        cancellationButtonProps: { color: 'primary' },
        confirmationText: 'Ya',
        confirmationButtonProps: { color: 'error' },
      });
      await subscriptionRepository.removeSomeInvoice(history._id);
      toast.success('Berhasil membatalkan');
      prefetch();
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
    }
  }

  /**
   * @param {InvoiceHistory} d
   */
  function showEvidence(d) {
    const imageUrl = d.paymentEvidences.map((e) => e.replaceAll('/public/uploads/', ''));
    viewerImageDialogRef.current.showImage(imageUrl, 'Resi');
  }

  return (
    <Dialog open={show} onClose={onClose} fullScreen={isMobile} fullWidth maxWidth="lg">
      <DialogTitle>Riwayat Pembayaran</DialogTitle>
      <DialogContent>
        {isMobile ? (
          <MobileData
            histories={paymentHistory}
            onPrint={onPrint}
            onRemove={isAdmin ? (h) => removeInvoice(h) : undefined}
            showEvidence={(h) => showEvidence(h)}
          />
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                {headers.map((h, i) => (
                  <TableCell key={i}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBodyData
              histories={paymentHistory}
              onPrint={onPrint}
              onRemove={isAdmin ? (h) => removeInvoice(h) : undefined}
              showEvidence={(h) => showEvidence(h)}
            />
          </Table>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="error">
          Tutup
        </Button>
      </DialogActions>
      <ViewerImageDialog ref={viewerImageDialogRef} />
    </Dialog>
  );
}

/**
 *
 * @param {{histories: PaymentHistory[]; onPrint: void; onRemove: void; showEvidence: (item) => void}} props
 */
function TableBodyData({ histories, onPrint, onRemove, showEvidence }) {
  const billingCategory = (category) => {
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

  return (
    <TableBody>
      {histories.map((h, i) => (
        <TableRow key={i}>
          <TableCell>
            <div className="tw-flex tw-flex-col">
              <div className="tw-flex tw-flex-row tw-items-center tw-gap-1">
                {h.paymentEvidences?.length >= 1 ? (
                  <Button
                    color="primary"
                    variant="text"
                    size="small"
                    onClick={() => showEvidence(h)}
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
          <TableCell width={200}>
            <ul className="tw-list-disc tw-pl-5">
              {h.items?.map((item, j) => (
                <li key={j}>
                  <Stack>
                    <span className="tw-text-xs">{item.service}</span>
                    <span className="tw-text-xs">{billingCategory(item.billingCategory)}</span>
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
          <TableCell>
            <span className="tw-text-xs">{h?.recipient?.toCapitalCase()}</span>
          </TableCell>
          <TableCell>
            <span className="tw-text-xs">
              {h?.date?.toDate().format('dd MMM yyyy HH:mm') ?? '-'}
            </span>
          </TableCell>
          <TableCell>
            <span className="tw-text-xs tw-font-semibold">{h?.note ?? 'Tidak ada catatan'}</span>
          </TableCell>
          <TableCell>
            <Stack>
              <span className="tw-text-xs">{h?.paymentMethod?.toCapitalCase() ?? '-'}</span>
              <span className="tw-text-xs">{h?.depositMethod?.toCapitalCase() ?? '-'}</span>
            </Stack>
          </TableCell>
          <TableCell>
            <div className="tw-flex tw-flex-row tw-gap-2">
              {i === 0 && !!onRemove && (
                <Button onClick={() => onRemove(h)} variant="outlined" color="error">
                  Batal
                </Button>
              )}
              <Button onClick={() => onPrint(h)} variant="outlined" color="primary">
                Cetak
              </Button>
            </div>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  );
}

/**
 *
 * @param {{histories: PaymentHistory[]; onPrint: void; onRemove: void; showRemove: boolean; showEvidence: (item) => void}} props
 */
function MobileData({ histories, onPrint, onRemove, showEvidence }) {
  const billingCategory = (category) => {
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

  return (
    <Stack spacing={1}>
      {histories.map((h, i) => (
        <Accordion key={i}>
          <AccordionSummary>
            <Stack>
              <Typography variant="body2">{new Date(h.date).formatSummaryDate()}</Typography>
              <Typography variant="body2">Rp. {h.amount.formatCurrency()}</Typography>
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
                  <button type="button" onClick={() => showEvidence(h)} className="tw-mt-2">
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
                        <span className="tw-text-xs">{billingCategory(item.billingCategory)}</span>
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
                <span className="tw-text-xs tw-font-semibold">
                  {h?.note ?? 'Tidak ada catatan'}
                </span>
              </Stack>
            </Stack>
          </AccordionDetails>
          <AccordionActions>
            <div className="tw-flex tw-flex-row tw-gap-2">
              {i === 0 && !!onRemove && (
                <Button onClick={() => onRemove(h)} variant="outlined" color="error">
                  Batal
                </Button>
              )}

              <Button onClick={() => onPrint(h)} variant="outlined" color="primary">
                Cetak
              </Button>
            </div>
          </AccordionActions>
        </Accordion>
      ))}
    </Stack>
  );
}
