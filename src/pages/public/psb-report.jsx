/**
 * @typedef {import('src/repositories/summary').PublicSummaryReportPSB} PublicSummaryReportPSB
 */

import { toast } from 'sonner';
import { useParams } from 'react-router';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

import {
  Table,
  TableRow,
  useTheme,
  TableCell,
  TableHead,
  TableBody,
  useMediaQuery,
} from '@mui/material';

import { summaryRepository } from 'src/repositories';

export default function PsbReportSummary() {
  const params = useParams();
  const [query] = useSearchParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const headers = ['Pelanggan', 'Status', 'Area'];

  /** @type {[PublicSummaryReportPSB[], (d: PublicSummaryReportPSB[]) => void]} */
  const [data, setData] = useState([]);

  async function prefetch() {
    try {
      const snapshot = await summaryRepository.getReportPsb(params.id, query.get('date'));
      setData(snapshot);
    } catch (error) {
      toast.error('Gagal get Data');
    }
  }

  useEffect(() => {
    prefetch();
  }, []);

  return (
    <div className="tw-mx-auto tw-container tw-w-full tw-justify-center tw-flex tw-flex-col tw-px-5 tw-py-10">
      <div className="tw-flex tw-flex-row tw-w-full tw-mb-4">
        <h1 className="md:tw-text-xl tw-font-medium">Laporan PSB</h1>
      </div>
      {/* Content */}
      {isMobile ? (
        <div className="tw-flex tw-flex-col tw-gap-4">
          {data?.map((d, i) => (
            <div
              key={i}
              className="tw-flex tw-flex-col tw-gap-2 tw-p-3 tw-ring-1 tw-ring-gray-400 tw-rounded-lg"
            >
              <div className="tw-flex tw-flex-col">
                <span className="tw-text-xs tw-text-gray-500">Pelanggan</span>
                <span className="tw-text-xs tw-font-medium">{d.fullname}</span>
              </div>
              <div className="tw-flex tw-flex-col">
                <span className="tw-text-xs tw-text-gray-500">Status</span>
                <span className="tw-text-xs tw-font-medium">{d.status}</span>
              </div>
              <div className="tw-flex tw-flex-col">
                <span className="tw-text-xs tw-text-gray-500">Area / POP</span>
                <span className="tw-text-xs tw-font-medium">{d.area}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              {headers.map((h, i) => (
                <TableCell key={i}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data?.map((d, i) => (
              <TableRow key={i}>
                <TableCell>
                  <span className="tw-text-xs">{d.fullname}</span>
                </TableCell>
                <TableCell>
                  <span className="tw-text-xs">{d.status}</span>
                </TableCell>
                <TableCell>
                  <span className="tw-text-xs">{d.area}</span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
