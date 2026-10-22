// @ts-nocheck

/**
 * @typedef {import("src/repositories/subscription").AvailableDismantleSubscription} AvailableDismantleSubscription
 */

import { Iconify } from '@components/iconify';
import { proxyMapper } from '@utils/proxyMapper';

import { DataGrid } from '@mui/x-data-grid';
import {
  Chip,
  Stack,
  Tooltip,
  Divider,
  Accordion,
  IconButton,
  AccordionSummary,
  AccordionDetails,
  AccordionActions,
} from '@mui/material';

import 'src/extension/string';
import 'src/extension/number';
import { datagridStyle } from 'src/helpers/style.helper';

export const AvailableDismantleData = {
  Table: AvailableDismantleDataTable,
  Mobile: AvailableDismantleMobile,
};

/**
 * @typedef {Object} Props
 * @property {AvailableDismantleSubscription[]} items
 * @property {(event: Event, item: AvailableDismantleSubscription) => void} [onMenu]
 * @property {(item: AvailableDismantleSubscription) => void} [onBillingForm]
 * @property {(item: AvailableDismantleSubscription) => void} [onDismantleForm]
 */

/**
 * @param {Props} param0
 * @returns
 */
function AvailableDismantleDataTable({ items, onMenu, onBillingForm, onDismantleForm }) {
  /** @type {AvailableDismantleSubscription} */
  const item = proxyMapper();

  const columns = [
    {
      field: item.customerId,
      headerName: 'Pelanggan',
      flex: 1,
      renderCell: ({ row }) => (
        <Stack>
          <span className="tw-text-xs tw-font-semibold">
            {row[item.fullname]} - {row[item.phone]}
          </span>
          <ol className="tw-list-disc tw-pl-6">
            <li>
              <span className="tw-text-xs">{row[item.customerId]}</span>
            </li>
            <li>
              <span className="tw-text-xs">{row[item.address]}</span>
            </li>
          </ol>
        </Stack>
      ),
    },
    {
      field: item.packageTitle,
      headerName: 'Paket',
      flex: 1,
      renderCell: ({ row }) => (
        <Stack alignContent="center">
          <span className="tw-text-xs">{row[item.packageTitle]}</span>
          <span className="tw-text-xs">
            Rp. {row[item.packagePrice].toString().toNumber().formatCurrency()}
          </span>
        </Stack>
      ),
    },
    {
      field: item.areaTitle,
      headerName: 'Area',
      flex: 1,
      renderCell: ({ row }) => (
        <Stack>
          <span className="tw-text-xs">{row[item.areaTitle]}</span>
          <span className="tw-text-xs">{row[item.odpTitle]}</span>
        </Stack>
      ),
    },
    {
      field: item.unpaidBillingAmount,
      headerName: 'Tagihan',
      flex: 1,
      renderCell: ({ row }) => (
        <Stack direction="row" spacing={1} alignContent="center" alignItems="center">
          <span className="tw-text-xs">
            Rp. {row[item.unpaidBillingAmount].toString().toNumber().formatCurrency()}
          </span>
          <Chip
            size="small"
            color={row[item.unpaidBillingCount] >= 3 ? 'error' : 'warning'}
            variant="filled"
            className="tw-w-min"
            label={<span className="tw-text-xs">{row[item.unpaidBillingCount]} Tagihan</span>}
          />
        </Stack>
      ),
    },
    {
      field: 'actions',
      headerName: '',
      renderCell: ({ row }) => (
        <Stack direction="row" spacing={1}>
          <Tooltip title="Form Pembayaran">
            <IconButton size="small" color="primary" onClick={() => onBillingForm?.(row)}>
              <Iconify icon="stash:billing-info-solid" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Dismantle">
            <IconButton size="small" color="error" onClick={() => onDismantleForm?.(row)}>
              <Iconify icon="tabler:power" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ];

  return (
    <DataGrid
      rows={items}
      columns={columns}
      autoHeight
      hideFooter
      hideFooterPagination
      disableAutosize
      disableColumnResize
      disableColumnMenu
      getRowId={(row) => row._id}
      getRowHeight={() => 'auto'}
      showCellVerticalBorder
      showColumnVerticalBorder
      getRowClassName={({ row }) =>
        row[item.unpaidBillingCount] >= 3 ? 'tw-bg-red-100 ' : 'tw-bg-orange-200'
      }
      disableRowSelectionOnClick
      sx={{
        ...datagridStyle.verticalCenter,
        '& .MuiDataGrid-row:hover': {
          backgroundColor: 'color',
        },

      }}
    />
  );
}

/**
 * @param {Props} param0
 */
function AvailableDismantleMobile({ items, onBillingForm, onDismantleForm }) {
  return items.map((item, i) => (
    <div
      key={i}
      className={`tw-w-full tw-ring-1 tw-ring-gray-300 tw-rounded-lg ${item.unpaidBillingCount >= 3 ? 'tw-bg-red-100 ' : ''}`}
    >
      <Accordion>
        <AccordionSummary>
          <Stack className="tw-w-full" spacing={1}>
            <Stack className="tw-w-full" direction="row" justifyContent="end" alignItems="center">
              <Chip
                size="small"
                color={item.unpaidBillingCount >= 3 ? 'error' : 'warning'}
                variant="filled"
                className="tw-w-min"
                label={<span className="tw-text-xs">{item.unpaidBillingCount} Tagihan</span>}
              />
            </Stack>
            <Divider />
            <Stack>
              <span className="tw-text-xs tw-font-semibold">
                {item.fullname} - {item.phone}
              </span>
              <ol className="tw-list-disc tw-pl-6">
                <li>
                  <span className="tw-text-xs">{item.customerId}</span>
                </li>
                <li>
                  <span className="tw-text-xs">{item.areaTitle}</span>
                </li>
                <li>
                  <span className="tw-text-xs">{item.address}</span>
                </li>
              </ol>
            </Stack>
          </Stack>
        </AccordionSummary>
        <AccordionDetails>
          <Stack>
            <ol className="tw-list-disc tw-pl-6">
              <li>
                <span className="tw-text-xs">ODP: {item.odpTitle}</span>
              </li>
              <li>
                <span className="tw-text-xs">
                  Total Tagihan: {item.unpaidBillingAmount?.formatCurrency()}
                </span>
              </li>
              <li>
                <span className="tw-text-xs">
                  Paket: {item.packageTitle} {item.packagePrice?.formatCurrency()}
                </span>
              </li>
            </ol>
          </Stack>
        </AccordionDetails>
        <AccordionActions>
          <Stack direction="row" spacing={1}>
            <Tooltip title="Dismantle">
              <IconButton size="small" color="error" onClick={() => onDismantleForm?.(item)}>
                <Iconify icon="tabler:power" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Form Pembayaran">
              <IconButton size="small" color="primary" onClick={() => onBillingForm?.(item)}>
                <Iconify icon="stash:billing-info-solid" />
              </IconButton>
            </Tooltip>
          </Stack>
        </AccordionActions>
      </Accordion>
    </div>
  ));
}
