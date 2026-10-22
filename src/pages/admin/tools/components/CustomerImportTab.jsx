/**
 * @typedef {import("src/repositories/xlsx").CustomerTemplateValidationV2} CustomerTemplateValidationV2
 * @typedef {import('src/repositories/xlsx').CustomerData} CustomerData
 */

import { useMemo } from 'react';
import { proxyMapper } from '@utils/proxyMapper';

import { DataGrid } from '@mui/x-data-grid';
import { ExpandMore } from '@mui/icons-material';
import {
  Grid,
  Stack,
  useTheme,
  Accordion,
  Typography,
  useMediaQuery,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';

import 'src/extension/date';
import 'src/extension/string';
import 'src/extension/number';
import { datagridStyle } from 'src/helpers/style.helper';

/**
 * @param {Object} param0
 * @param {CustomerData[]} param0.items
 */
export function CustomerImportData({ items }) {
  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down('md'));

  if (mobile) {
    return <CustomerImportAccordion items={items} />;
  }
  return <CustomerImportDataTable items={items} />;
}

function CustomerImportDataTable({ items }) {
  const mappedItems = useMemo(() => items.map((item, i) => ({ ...item, id: i })), [items]);

  /** @type {CustomerData} */
  const item = proxyMapper();

  /** @type {import("@mui/x-data-grid").GridColDef<CustomerData>} */
  const columns = [
    {
      field: item.customerId,
      headerName: 'Pelanggan',
      flex: 1,
      renderCell: ({ row }) => (
        <Stack>
          <span className="tw-text-xs tw-font-semibold">
            {row[item.customerId]} - {row[item.phone]}
          </span>
          <span className="tw-text-xs">{row[item.customerFullname]}</span>
          <span className="tw-text-xs">{row[item.customerAddress]}</span>
        </Stack>
      ),
    },
    {
      field: item.package,
      headerName: 'Paket',
      flex: 1,
      renderCell: ({ row }) => (
        <Stack>
          <span className="tw-text-xs">{row[item.package]}</span>
          <span className="tw-text-xs">
            Rp. {row[item.packagePrice].toString().toNumber().formatCurrency()}
          </span>
        </Stack>
      ),
    },
    {
      field: item.addonsId,
      headerName: 'Addon',
      flex: 1,
      renderCell: ({ row }) => (
        <Stack>
          <span className="tw-text-xs">{row[item.addonsName] ?? '-'}</span>
          <span className="tw-text-xs">
            Rp. {row[item.addonsPrice]?.toString().toNumber().formatCurrency() ?? '-'}
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
          <span className="tw-text-xs">
            {row[item.odpTitle]} - {row[item.vlan]}
          </span>
        </Stack>
      ),
    },
    {
      field: item.pppoeName,
      headerName: 'PPPoE',
      flex: 1,
      renderCell: ({ row }) => (
        <Stack>
          <span className="tw-text-xs">PPPoE Name: {row[item.pppoeName]}</span>
          <span className="tw-text-xs">PPPoE Password: {row[item.pppoePassword]}</span>
          <span className="tw-text-xs">IP Remote: {row[item.ipRemote]}</span>
        </Stack>
      ),
    },
    {
      field: item.routerSsid,
      headerName: 'Router',
      flex: 1,
      renderCell: ({ row }) => (
        <Stack>
          <span className="tw-text-xs">Router SSID: {row[item.routerSsid]}</span>
          <span className="tw-text-xs">Router Password: {row[item.routerPassword]}</span>
          <span className="tw-text-xs">SN: {row[item.routerSerialNumber]}</span>
          <span className="tw-text-xs">MAC: {row[item.routerMacAddress]}</span>
        </Stack>
      ),
    },
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

export function CustomerImportAccordion({ items }) {
  /** @type {CustomerData} */
  const item = proxyMapper();

  return (
    <div className="tw-space-y-2">
      {items.map((row, index) => (
        <Accordion key={index} className="tw-shadow-sm">
          <AccordionSummary expandIcon={<ExpandMore />} className="tw-bg-gray-50">
            <Stack className="tw-w-full">
              <span className="tw-text-sm tw-font-semibold">
                {row[item.customerId]} - {row[item.phone]}
              </span>
              <span className="tw-text-sm">{row[item.customerFullname]}</span>
              <span className="tw-text-xs tw-text-gray-600">{row[item.customerAddress]}</span>
            </Stack>
          </AccordionSummary>
          <AccordionDetails className="tw-bg-white">
            <Grid container spacing={3}>
              {/* Package */}
              <Grid item xs={12} md={6} lg={4}>
                <Typography variant="subtitle2" className="tw-font-semibold tw-mb-1">
                  Paket
                </Typography>
                <Stack>
                  <span className="tw-text-sm">{row[item.package]}</span>
                  <span className="tw-text-sm tw-text-green-600">
                    Rp. {row[item.packagePrice].toString().toNumber().formatCurrency()}
                  </span>
                </Stack>
              </Grid>

              {/* Addon */}
              <Grid item xs={12} md={6} lg={4}>
                <Typography variant="subtitle2" className="tw-font-semibold tw-mb-1">
                  Addon
                </Typography>
                <Stack>
                  <span className="tw-text-sm">{row[item.addonsName] ?? '-'}</span>
                  <span className="tw-text-sm tw-text-green-600">
                    Rp. {row[item.addonsPrice]?.toString().toNumber().formatCurrency() ?? '-'}
                  </span>
                </Stack>
              </Grid>

              {/* Area */}
              <Grid item xs={12} md={6} lg={4}>
                <Typography variant="subtitle2" className="tw-font-semibold tw-mb-1">
                  Area
                </Typography>
                <Stack>
                  <span className="tw-text-sm">{row[item.areaTitle]}</span>
                  <span className="tw-text-sm tw-text-gray-600">
                    {row[item.odpTitle]} - {row[item.vlan]}
                  </span>
                </Stack>
              </Grid>

              {/* PPPoE */}
              <Grid item xs={12} md={6} lg={4}>
                <Typography variant="subtitle2" className="tw-font-semibold tw-mb-1">
                  PPPoE
                </Typography>
                <Stack>
                  <span className="tw-text-sm">Name: {row[item.pppoeName]}</span>
                  <span className="tw-text-sm">Password: {row[item.pppoePassword]}</span>
                  <span className="tw-text-sm">IP Remote: {row[item.ipRemote]}</span>
                </Stack>
              </Grid>

              {/* Router */}
              <Grid item xs={12} md={6} lg={4}>
                <Typography variant="subtitle2" className="tw-font-semibold tw-mb-1">
                  Router
                </Typography>
                <Stack>
                  <span className="tw-text-sm">SSID: {row[item.routerSsid]}</span>
                  <span className="tw-text-sm">Password: {row[item.routerPassword]}</span>
                  <span className="tw-text-sm">SN: {row[item.routerSerialNumber]}</span>
                  <span className="tw-text-sm">MAC: {row[item.routerMacAddress]}</span>
                </Stack>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
      ))}
    </div>
  );
}
