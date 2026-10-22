import { toast } from 'sonner';
import { useParams } from 'react-router';
import { format, addMonths } from 'date-fns';
import { useBoolean } from '@hooks/use-boolean';
import { useMemo, useState, useEffect } from 'react';

import Grid2 from '@mui/material/Unstable_Grid2';
import {
  Card,
  Chip,
  Stack,
  Table,
  useTheme,
  TableRow,
  Accordion,
  TableHead,
  TableCell,
  TableBody,
  CardContent,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';

import 'src/extension/number';
import 'src/extension/string';
import { summaryRepository } from 'src/repositories';

/**
 * @typedef {import('src/repositories/summary').BillingAnonymous} BillingAnonymous
 */

export default function BillingPublic() {
  const params = useParams();
  const theme = useTheme();
  const isMobile = false;
  const headers = ['Periode', 'Paket', 'Status', 'Jumlah'];

  const isLoading = useBoolean(false);

  /** @type {[BillingAnonymous, void]} */
  const [data, setData] = useState(null);

  async function prefetch() {
    isLoading.onTrue();
    try {
      const snapshot = await summaryRepository.getBillingAnonymous(params.customer);
      setData(snapshot);
    } catch (error) {
      toast.error(error.message);
    } finally {
      isLoading.onFalse();
    }
  }

  const summaryCustomer = useMemo(() => [
    {
      label: 'ID',
      value: data?.customer?.customerId ?? '-',
    },
    {
      label: 'Pelanggan',
      value: data?.customer?.fullname ?? '-',
    },
    {
      label: 'Layanan',
      value: !data
        ? '-'
        : data?.customer?.isPrepaid
          ? 'Prabayar / Bayar depan'
          : 'Pascabayar / Bayar belakang',
    },
    {
      label: 'Telepon',
      value: data?.customer?.phone ?? '-',
    },
    {
      label: 'Area / POP',
      value: data?.customer?.areaTitle ?? '-',
    },
    {
      label: 'Status Isolir',
      value: !data ? (
        '-'
      ) : (
        <Chip
          label={data?.customer.isolir ? 'Isolir' : 'Open'}
          color={data?.customer?.isolir ? 'error' : 'success'}
          variant="soft"
          size="small"
        />
      ),
    },
  ]);

  const toSummaryPeriode = (billing) => {
    if (billing.services[0].toLowerCase().includes('pemasangan')) return '';
    const dateMonth = new Date(billing.startSubscribe).getDate();
    const periode = new Date(billing.year, billing.month, dateMonth);
    const start = format(addMonths(periode, -1), 'MMMM');
    const end = format(periode, 'MMMM');
    return `${start}`;
  };

  useEffect(() => {
    prefetch();
  }, []);

  return (
    <div className="tw-w-full tw-min-h-[100svh] tw-flex tw-flex-col tw-items-center tw-justify-center tw-bg-gray-200 tw-p-5">
      <Card className="tw-w-full tw-max-w-2xl">
        <CardContent>
          <Stack spacing={2}>
            <div className="tw-flex tw-flex-col">
              <span className="tw-font-semibold tw-uppercase">List Tagihan</span>
            </div>
            <Grid2 container gap={2}>
              {summaryCustomer.map((c, i) => (
                <Grid2 key={i} xs={11.8} sm={11.8} md={5.8}>
                  <Stack>
                    <span className="tw-text-xs">{c.label}</span>
                    <span className="tw-text-xs tw-font-semibold">{c.value}</span>
                  </Stack>
                </Grid2>
              ))}
            </Grid2>
            <Stack>
              {isMobile ? (
                <Stack spacing={2}>
                  {data?.billings.map((b, i) => (
                    <MobileItem billing={b} key={i} />
                  ))}
                </Stack>
              ) : (
                <Table className="tw-bg-white">
                  <TableHead>
                    <TableRow>
                      {headers.map((h, i) => (
                        <TableCell key={i}>{h}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data?.billings.length <= 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} align="center">
                          <span className="tw-text-xs tw-whitespace-nowrap">
                            Tidak ada list tagihan
                          </span>
                        </TableCell>
                      </TableRow>
                    ) : null}
                    {data?.billings.map((b, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          {b.summaryPeriode ? (
                            <span className="tw-text-xs">{b.summaryPeriode}</span>
                          ) : (
                            <span className="tw-text-xs">{toSummaryPeriode(b)}</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="tw-flex tw-flex-wrap tw-gap-2 tw-items-center">
                            {b.services.map((s, j) => (
                              <span className="tw-text-xs" key={j}>
                                {s}
                              </span>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="tw-text-xs tw-whitespace-nowrap">
                            {b.status?.toCapitalCase()}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="tw-text-xs tw-whitespace-nowrap">
                            Rp. {b.amount?.formatCurrency() ?? '-'}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * @param {{billing: Billing; onToggleCheck: void; onCancel: void; onRestore: void; onEdit: void; onCopy: (text: string) => void}} props -- react props
 */
const MobileItem = ({ billing }) => {
  const toSummaryPeriode = () => {
    const periode = new Date(billing.year, billing.month);
    if (billing.services[0].toLowerCase().includes('pemasangan'))
      return billing.services.join(' - ');

    const start = format(addMonths(periode, -1), 'dd MMMM');
    const end = format(periode, 'dd MMMM');
    return `${start} - ${end}`;
  };

  return (
    <div className="tw-ring-2 tw-ring-gray-300 tw-rounded-lg">
      <Accordion expanded>
        <AccordionSummary sx={{ height: 0 }}>
          <div className="tw-flex flex-row tw-items-center tw-w-full tw-justify-between">
            <div className="tw-flex flex-row tw-items-center">
              <span className="tw-text-xs tw-font-medium">
                {billing.summaryPeriode ? billing.summaryPeriode : toSummaryPeriode()}
              </span>
            </div>
          </div>
        </AccordionSummary>
        <AccordionDetails sx={{ paddingTop: 0, paddingBottom: 1 }}>
          <div className="tw-w-full tw-h-[0.5px] tw-bg-gray-300 tw-mb-2" />
          <Stack>
            <Grid2 container>
              <Grid2 xs={4}>
                <span className="tw-text-xs tw-font-medium">Paket :</span>
              </Grid2>
              <Grid2 xs={8}>
                <ul className="tw-list-disc">
                  {billing.services.map((s, j) => (
                    <li label={s} key={j} className="tw-text-xs tw-font-medium">
                      {s}
                    </li>
                  ))}
                </ul>
              </Grid2>
              <Grid2 xs={4}>
                <span className="tw-text-xs tw-font-medium">Status :</span>
              </Grid2>
              <Grid2 xs={8}>
                <span className="tw-text-xs tw-font-medium">{billing.status}</span>
              </Grid2>
              <Grid2 xs={4}>
                <span className="tw-text-xs tw-font-medium">Jumlah :</span>
              </Grid2>
              <Grid2 xs={8}>
                <span className="tw-text-xs tw-font-medium">
                  Rp. {billing.amount.formatCurrency()}
                </span>
              </Grid2>
            </Grid2>
          </Stack>
        </AccordionDetails>
      </Accordion>
    </div>
  );
};
