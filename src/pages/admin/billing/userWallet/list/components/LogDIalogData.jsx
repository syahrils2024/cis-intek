import { Iconify } from '@components/iconify';
import { proxyMapper } from '@utils/proxyMapper';

import { DataGrid } from '@mui/x-data-grid';
import {
  Grid,
  Stack,
  Tooltip,
  Accordion,
  IconButton,
  AccordionActions,
  AccordionDetails,
  AccordionSummary,
} from '@mui/material';

import 'src/extension/date';
import 'src/extension/string';
import 'src/extension/number';
import { datagridStyle } from 'src/helpers/style.helper';

/**
 * @typedef {import("src/repositories/userWallet").UserWalletLog} UserWalletLog
 */

/**
 * @typedef {object} LogDialogDataProps
 * @property {UserWalletLog[]} items
 * @property {boolean} mobileLayout
 * @property {Function} onRollback
 * @property {Function} onViewEvidence
 * @property {Function} onPreviewImage
 */

/**
 * @param {LogDialogDataProps} props
 */
export default function LogDialogData(props) {
  const { mobileLayout } = props;

  if (mobileLayout) {
    return <MobileData {...props} />;
  }
  return <DataTable {...props} />;
}

/**
 * @param {LogDialogDataProps} options
 */
function DataTable({ items, onRollback, onViewEvidence }) {
  /** @type {UserWalletLog} */
  const item = proxyMapper();

  /** @type {import("@mui/x-data-grid").GridColDef<UserWalletLog>} */
  const columns = [
    {
      field: 'Tanggal',
      key: item.createdAt,
      flex: 1,
      /** @param {{row: UserWalletLog}} */
      renderCell: ({ row }) => (
        <Stack direction="row" spacing={1} alignItems="center">
          <Stack className="tw-py-1">
            <span className="tw-whitespace-nowrap">
              {row.createdAt.toDate().format('dd MMM yyyy HH:mm:ss') || '-'}
            </span>
            <span className="tw-text-gray-500">{row.actionUserFullname}</span>
          </Stack>
          {row.evidences?.length > 0 ? (
            <Tooltip title="Lihat bukti">
              <IconButton size="small" className="tw-h-min" onClick={(e) => onViewEvidence(e, row)}>
                <Iconify icon="mdi:images-outline" width={16} />
              </IconButton>
            </Tooltip>
          ) : null}
        </Stack>
      ),
    },
    {
      field: 'Keterangan',
      key: item.description,
      flex: 1,
      /** @param {{row: UserWalletLog}} */
      renderCell: ({ row }) => row.description || '-',
    },
    {
      field: 'Debet',
      key: item.amount,
      flex: 1,
      /** @param {{row: UserWalletLog}} */
      renderCell: ({ row }) => {
        const isPlus = row.amount >= 0;
        if (!isPlus) return '-';
        const prefix = isPlus ? '+' : '';
        const textColor = isPlus ? 'tw-text-green-500' : 'tw-text-red-500';
        return (
          <span className={`${textColor} tw-font-semibold`}>
            {prefix}
            {row.amount.formatCurrency()}
          </span>
        );
      },
    },
    {
      field: 'Kredit',
      key: item.amount,
      flex: 1,
      /** @param {{row: UserWalletLog}} */
      renderCell: ({ row }) => {
        const isPlus = row.amount >= 0;
        if (isPlus) return '-';
        const prefix = isPlus ? '+' : '';
        const textColor = isPlus ? 'tw-text-green-500' : 'tw-text-red-500';
        return (
          <span className={`${textColor} tw-font-semibold`}>
            {prefix}
            {row.amount.formatCurrency()}
          </span>
        );
      },
    },
    {
      field: 'Saldo',
      key: item.lastBalance,
      flex: 1,
      /** @param {{row: UserWalletLog}} */
      renderCell: ({ row }) => <span>{row.lastBalance?.formatCurrency() ?? '-'}</span>,
    },
  ];

  return (
    <div style={{ height: 400, width: '100%' }}>
      <DataGrid
        rows={items}
        columns={columns}
        getRowHeight={() => 'auto'}
        disableColumnResize
        columnBufferPx={100}
        getRowClassName={() => 'tw-text-xs'}
        disableColumnSorting
        disableColumnMenu
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: 10,
            },
          },
        }}
        pageSizeOptions={[10, 25, 50]}
        sx={{ ...datagridStyle.verticalCenter }}
      />
    </div>
  );
}

/**
 * Komponen MobileData untuk menampilkan daftar user wallet log dalam bentuk accordion.
 * @param {LogDialogDataProps} param0
 */
function MobileData({ items, onRollback, onPreviewImage }) {
  return (
    <div>
      {items.map((row) => (
        <Accordion key={row._id} className="tw-mb-2 tw-text-xs tw-w-full">
          <AccordionSummary className="tw-w-full">
            <Stack
              className="tw-w-full"
              direction="row"
              spacing={1}
              alignItems="center"
              justifyContent="space-between"
            >
              <span>{row.createdAt.toDate().format('dd MMM yyyy HH:mm:ss') || '-'}</span>
              <span className={row.amount >= 0 ? 'tw-text-green-500' : 'tw-text-red-500'}>
                {row.amount >= 0 ? '+' : ''}
                {row.amount.formatCurrency()}
              </span>
            </Stack>
          </AccordionSummary>
          <AccordionDetails>
            <Stack>
              <span className="tw-text-xs">{row.description}</span>
              <span>Saldo: {row.lastBalance?.formatCurrency() ?? '-'}</span>
              {row.evidences?.length > 0 ? (
                <div className="tw-mt-4">
                  <Grid container spacing={1} >
                    {row.evidences.map((img, i) => (
                      <Grid item xs={3} key={i}>
                        <button type="button" onClick={() => onPreviewImage(img)}>
                          <img
                            src={`/public/uploads/${img}`}
                            alt={`evidence-${i}`}
                            className="tw-rounded tw-w-24"
                          />
                        </button>
                      </Grid>
                    ))}
                  </Grid>
                </div>
              ) : null}
            </Stack>
          </AccordionDetails>
          <AccordionActions>
            <Tooltip title="Rollback">
              <IconButton color="warning" onClick={() => onRollback(row)}>
                <Iconify icon="material-symbols:history" />
              </IconButton>
            </Tooltip>
          </AccordionActions>
        </Accordion>
      ))}
    </div>
  );
}
