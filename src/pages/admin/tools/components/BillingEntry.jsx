/**
 * @typedef {import("src/repositories/xlsx").BillingTemplateValidationV2} BillingTemplateValidationV2
 */

import { useMemo } from 'react';
import { proxyMapper } from '@utils/proxyMapper';

import { DataGrid } from '@mui/x-data-grid';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Box,
  Chip,
  Stack,
  Divider,
  useTheme,
  Accordion,
  Typography,
  useMediaQuery,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';

import 'src/extension/date';
import 'src/extension/string';
import 'src/extension/number';
import { datagridStyle } from 'src/helpers/style.helper';

export function BillingEntryTab({ items, error = false }) {
  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down('md'));
  return mobile ? (
    <BillingEntryAccordion items={items} error={error} />
  ) : (
    <BillingEntryDatatable items={items} error={error} />
  );
}

function BillingEntryDatatable({ items, error }) {
  const mappedItems = useMemo(() => items.map((item, i) => ({ ...item, id: i })), [items]);

  /** @type {BillingTemplateValidationV2} */
  const property = proxyMapper();

  /** @type {import('@mui/x-data-grid').GridColDef<BillingTemplateValidationV2>} */
  const columns = [
    {
      field: property.customerId,
      headerName: 'Pelanggan',
      flex: 1,
      renderCell: ({ row }) => (
        <Stack>
          <span className="tw-text-xs tw-font-semibold">
            {row[property.customerId]} - {row[property.phone]}
          </span>
          <span className="tw-text-xs">{row[property.customerFullname]}</span>
          <span className="tw-text-xs">{row[property.customerAddress]}</span>
        </Stack>
      ),
    },
    {
      field: property.amount,
      headerName: 'Billing',
      flex: 1,
      renderCell: ({ row }) => (
        <Stack>
          <span className="tw-text-xs tw-font-semibold">{row[property.summaryPeriode]}</span>
          <span className="tw-text-xs">
            {row[property.amount?.toString().toNumber().formatCurrency()]}
          </span>
          <span className="tw-text-xs tw-text-gray-400">
            {row[property.month]} / {row[property.year]}
          </span>
        </Stack>
      ),
    },
    {
      field: property.depositMethodTitle,
      headerName: 'Pembayaran',
      flex: 1,
      renderCell: ({ row }) => (
        <Stack>
          <span className="tw-text-xs tw-font-semibold">
            {row[property.depositMethodTitle] ?? '-'}
          </span>
          <span className="tw-text-xs">
            {row[property.pay]?.toString().toNumber().formatCurrency() ?? '-'}
          </span>
        </Stack>
      ),
    },
     {
      field: property.billingCategory,
      headerName: 'Kategori',
      flex: 1,
      renderCell: ({ row }) => (
        <Stack>
          <span className="tw-text-xs tw-font-semibold tw-uppercase">
            {row[property.billingCategory] ?? '-'}
          </span>
        </Stack>
      ),
    },
    error
      ? {
          field: property.error,
          headerName: 'Error',
          flex: 1,
          renderCell: ({ row }) => (
            <Chip label={row[property.error] ?? '-'} color="error" size="small" />
          ),
        }
      : {},
  ];

  return (
    <div style={{ width: '100%', height: 400 }}>
      <DataGrid
        columns={columns}
        rows={mappedItems}
        columnBufferPx={10}
        getRowClassName={() => 'tw-text-xs tw-bg-white'}
        pageSizeOptions={[10, 25, 50]}
        disableColumnMenu
        getRowHeight={() => 'auto'}
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: 10,
            },
          },
        }}
        sx={{
          ...datagridStyle.verticalCenter,
          ...datagridStyle.disabledHover,
          ...datagridStyle.disabledSelected,
        }}
      />
    </div>
  );
}

function BillingEntryAccordion({ items, error }) {
  const mappedItems = useMemo(() => items.map((item, i) => ({ ...item, id: i })), [items]);

  /** @type {BillingTemplateValidationV2} */
  const property = proxyMapper();

  return (
    <Box sx={{ width: '100%' }}>
      {mappedItems.map((row, index) => (
        <Accordion key={row.id} sx={{ mb: 1 }}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={{
              backgroundColor: 'grey.50',
              '&:hover': { backgroundColor: 'grey.100' }
            }}
          >
            <Stack sx={{ width: '100%' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                {row[property.customerId]} - {row[property.customerPhone]}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {row[property.customerFullname]}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {row[property.customerAddress]}
              </Typography>
            </Stack>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={2}>
              {/* Billing Information */}
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  Billing
                </Typography>
                <Stack spacing={0.5}>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {row[property.summaryPeriode]}
                  </Typography>
                  <Typography variant="body2">
                    {row[property.amount]?.toString().toNumber().formatCurrency()}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {row[property.month]} / {row[property.year]}
                  </Typography>
                </Stack>
              </Box>

              <Divider />

              {/* Payment Information */}
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  Pembayaran
                </Typography>
                <Stack spacing={0.5}>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {row[property.depositMethodTitle] ?? '-'}
                  </Typography>
                  <Typography variant="body2">
                    {row[property.pay]?.toString().toNumber().formatCurrency() ?? '-'}
                  </Typography>
                </Stack>
              </Box>

              {/* Error Information (if applicable) */}
              {error && row[property.error] && (
                <>
                  <Divider />
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                      Error
                    </Typography>
                    <Chip
                      label={row[property.error]}
                      color="error"
                      size="small"
                      sx={{ alignSelf: 'flex-start' }}
                    />
                  </Box>
                </>
              )}
            </Stack>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
}
