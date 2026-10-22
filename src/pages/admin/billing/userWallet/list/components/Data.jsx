/**
 * @typedef {import("src/repositories/userWallet").UserWallet} UserWallet
 */

import { Iconify } from '@components/iconify';
import { proxyMapper } from '@utils/proxyMapper';

import { DataGrid } from '@mui/x-data-grid';
import {
  Stack,
  Tooltip,
  useTheme,
  Accordion,
  IconButton,
  useMediaQuery,
  AccordionSummary,
  AccordionActions,
} from '@mui/material';

import 'src/extension/number';
import { datagridStyle } from 'src/helpers/style.helper';

/**
 * @typedef {object} UserWalletProps
 * @property {UserWallet[]} items - Daftar user wallet yang akan ditampilkan.
 * @property {(item: UserWallet) => void} onLog - Fungsi yang dipanggil ketika ingin melihat log transaksi dari user wallet tertentu.
 * @property {(item: UserWallet) => void} onWithdraw - Fungsi yang dipanggil ketika ingin melakukan penarikan dana dari user wallet tertentu.
 * @property {(item: UserWallet) => void} onRefresh - Fungsi yang dipanggil ketika ingin melakukan refresh data user wallet tertentu.
 */

/**
 * Data Component untuk User Wallet List
 * @param {UserWalletProps} props
 * @returns {JSX.Element}
 */
export function UserWalletListData(props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  if (isMobile) {
    return <DataMobile {...props} />;
  }
  return <DataTable {...props} />;
}

/**
 * Komponen DataTable untuk menampilkan daftar user wallet dalam bentuk tabel.
 * @param {UserWalletProps} param0
 */
function DataTable({ items, onLog, onWithdraw, onRefresh }) {
  /** @type {UserWallet} */
  const item = proxyMapper();

  /** @type {import("@mui/x-data-grid").GridColDef<UserWallet>} */
  const columns = [
    {
      field: 'User',
      key: item.fullname,
      flex: 1,
      renderCell: ({ row }) => {
        /** @type {UserWallet} */
        const { phone, fullname } = row;
        return (
          <Stack direction="row" spacing={1} alignItems="center">
            <img
              src="/assets/avatar-25.webp"
              className="tw-w-12 tw-aspect-square tw-rounded-full tw-object-cover tw-object-center"
              alt="KTP"
            />
            <Stack className="tw-text-xs">
              <span>{fullname}</span>
              <span className="tw-text-gray-500">{phone}</span>
            </Stack>
          </Stack>
        );
      },
    },
    {
      field: 'Kas Kolektor',
      key: item.balance,
      flex: 1,
      renderCell: ({ row }) => {
        /** @type {UserWallet} */
        const { balance } = row;
        return <span>Rp. {balance.formatCurrency()}</span>;
      },
    },
    {
      field: 'Action',
      key: item.phone,
      sortable: false,
      width: 150,
      /** @param {{row: UserWallet}} */
      renderCell: ({ row }) => (
        <Stack direction="row" spacing={1} alignItems="center">
          <Tooltip title="Mutasi Kas Kolektor">
            <IconButton color="primary" onClick={() => onLog(row)}>
              <Iconify icon="material-symbols:history" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Tarik Kas Kolektor">
            <IconButton color="warning" disabled={row.balance <= 0} onClick={() => onWithdraw(row)}>
              <Iconify icon="ph:hand-withdraw" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Refresh">
            <IconButton color="success" onClick={() => onRefresh(row)}>
              <Iconify icon="material-symbols:refresh" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ];

  return (
    <div style={{ width: '100%', height: 500 }}>
      <DataGrid
        columns={columns}
        rows={items}
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

/**
 * Komponen DataMobile untuk menampilkan daftar user wallet dalam bentuk accordion.
 * @param {UserWalletProps} param0
 */
function DataMobile({ items, onLog, onWithdraw, onRefresh }) {
  return (
    <div>
      {items.map((row) => (
        <Accordion key={row._id} className="tw-mb-2">
          <AccordionSummary>
            <Stack direction="row" spacing={1} alignItems="center">
              <img
                src="/assets/avatar-25.webp"
                className="tw-w-12 tw-aspect-square tw-rounded-full tw-object-cover tw-object-center"
                alt="KTP"
              />
              <Stack className="tw-text-xs">
                <span>{row.fullname}</span>
                <span className="tw-text-gray-500">{row.phone}</span>
                <span>Rp. {row.balance.formatCurrency()}</span>
              </Stack>
            </Stack>
          </AccordionSummary>
          <AccordionActions>
            <Stack direction="row" spacing={1} alignItems="center">
              <Tooltip title="Mutasi Saldo">
                <IconButton color="primary" onClick={() => onLog(row)}>
                  <Iconify icon="material-symbols:history" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Tarik Kas Kolektor">
                <IconButton
                  color="warning"
                  disabled={row.balance <= 0}
                  onClick={() => onWithdraw(row)}
                >
                  <Iconify icon="ph:hand-withdraw" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Refresh">
                <IconButton color="success" onClick={() => onRefresh(row)}>
                  <Iconify icon="material-symbols:refresh" />
                </IconButton>
              </Tooltip>
            </Stack>
          </AccordionActions>
        </Accordion>
      ))}
    </div>
  );
}
