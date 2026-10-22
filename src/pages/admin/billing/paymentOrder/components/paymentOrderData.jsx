/**
 * @typedef {import("src/repositories/paymetOrder").PaymentGatewayOrder} PaymentGatewayOrder
 */

import { Iconify } from '@components/iconify';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Box,
  Stack,
  Table,
  Tooltip,
  TableRow,
  Accordion,
  TableBody,
  TableCell,
  TableHead,
  IconButton,
  Typography,
  AccordionActions,
  AccordionDetails,
  AccordionSummary,
} from '@mui/material';

import 'src/extension/number';
import 'src/extension/string';
import 'src/extension/date';

/**
 * @typedef {Object} PaymentOrderDataProps
 * @property {Array<PaymentGatewayOrder>} data - The array of payment gateway orders to display.
 * @property {(d: PaymentGatewayOrder) => void} onDetail
 */

export const PaymentOrderData = {
  Table: TableData,
  Mobile: MobileData,
};

/** @param {PaymentOrderDataProps} props */
function TableData({ data, onDetail }) {
  const headers = ['Pelanggan', 'Metode', 'Tanggal', 'Jumlah', 'Fee', 'Total', ''];

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
        {data.map((item, i) => (
          <TableRow key={i}>
            <TableCell>
              <Stack>
                <span className="tw-text-xs">{item.customerFullname}</span>
                <span className="tw-text-xs">{item.customer_id}</span>
              </Stack>
            </TableCell>
            <TableCell>
              <Stack direction="row" spacing={2}>
                <img
                  src={item.paymentImageUrl}
                  alt={item.paymentName}
                  className="tw-w-16 tw-object-contain"
                />
                <Stack>
                  <span className="tw-text-xs">{item.paymentName}</span>
                  <span className="tw-text-xs">
                    {item.paymentCode} - {item.gateway}
                  </span>
                </Stack>
              </Stack>
            </TableCell>
            <TableCell>
              <span className="tw-text-xs">
                {item.payAt?.toDate().format('dd MMM yyyy HH:mm') ??
                  item.createdAt?.toDate().format('dd MMM yyyy HH:mm')}
              </span>
            </TableCell>
            <TableCell>
              <span className="tw-text-xs">Rp. {item.amount.formatCurrency()}</span>
            </TableCell>
            <TableCell>
              <span className="tw-text-xs">Rp. {Math.ceil(item.fee).formatCurrency()}</span>
            </TableCell>
            <TableCell>
              <span className="tw-text-xs">
                Rp. {Math.ceil(item.amount + item.fee).formatCurrency()}
              </span>
            </TableCell>
            <TableCell>
              <Tooltip title="Detail">
                <IconButton
                  disabled={!onDetail}
                  color="success"
                  onClick={() => onDetail && onDetail(item)}
                >
                  <Iconify icon="fluent:receipt-20-filled" />
                </IconButton>
              </Tooltip>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

/** @param {PaymentOrderDataProps} props */
function MobileData({ data, onDetail }) {
  return (
    <Box className="tw-space-y-4">
      {data.map((item, i) => (
        <Accordion key={i} className="tw-ring-1 tw-ring-gray-500 tw-rounded">
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls={`panel${i}-content`}
            id={`panel${i}-header`}
          >
            <Box className="tw-flex tw-flex-col tw-w-full">
              <Typography variant="body2" className="tw-font-medium">
                {item.customerFullname}
              </Typography>
              <Box className="tw-flex tw-items-center tw-gap-2 tw-mt-1">
                <img
                  src={item.paymentImageUrl}
                  alt={item.paymentName}
                  className="tw-w-8 tw-h-6 tw-object-contain"
                />
                <Typography variant="caption" className="tw-text-gray-600">
                  {item.paymentName} ({item.paymentCode} - {item.gateway})
                </Typography>
              </Box>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Box className="tw-space-y-2">
              <Box className="tw-flex tw-justify-between">
                <Typography variant="body2" className="tw-text-gray-600">
                  Jumlah:
                </Typography>
                <Typography variant="body2" className="tw-font-medium">
                  Rp. {item.amount.formatCurrency()}
                </Typography>
              </Box>
              <Box className="tw-flex tw-justify-between">
                <Typography variant="body2" className="tw-text-gray-600">
                  Fee:
                </Typography>
                <Typography variant="body2" className="tw-font-medium">
                  Rp. {Math.ceil(item.fee).formatCurrency()}
                </Typography>
              </Box>
              <Box className="tw-flex tw-justify-between tw-border-t tw-pt-2">
                <Typography variant="body2" className="tw-font-semibold">
                  Total:
                </Typography>
                <Typography variant="body2" className="tw-font-semibold">
                  Rp. {Math.ceil(item.amount + item.fee).formatCurrency()}
                </Typography>
              </Box>
            </Box>
          </AccordionDetails>
          <AccordionActions>
            <Tooltip title="Detail">
              <IconButton
                disabled={!onDetail}
                color="success"
                onClick={() => onDetail && onDetail(item)}
              >
                <Iconify icon="fluent:receipt-20-filled" />
              </IconButton>
            </Tooltip>
          </AccordionActions>
        </Accordion>
      ))}
    </Box>
  );
}
