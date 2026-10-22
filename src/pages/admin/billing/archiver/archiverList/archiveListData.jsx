/**
 * @typedef {import("src/repositories/subscription").ArchiveInvoice} ArchiveInvoice
 */

import { Iconify } from '@components/iconify';

import { Stack, Tooltip, IconButton } from '@mui/material';

/**
 * @typedef {Object} ArchiveListDataProps
 * @property {ArchiveInvoice[]} data
 * @property {( item: ArchiveInvoice) => void} onDetail
 * @property {( item: ArchiveInvoice) => void} onDownload
 * @property {( item: ArchiveInvoice) => void} onRemove
 */

/**
 *
 * @param {ArchiveListDataProps} param0
 */
export default function ArchiveListData({ data, onDetail, onDownload, onRemove }) {
  return data.map((item, i) => (
    <div key={i} className="tw-p-3 tw-ring-1 tw-ring-gray-300 tw-rounded-md">
      <Stack spacing={1}>
        <span className="tw-text-xs">{item.archiveFilename}</span>
        <span className="tw-text-xs">
          Billing: {item.billingMonth} - {item.billingYear}
        </span>
        <span className="tw-text-xs">Created Agent: {item.createdUser.fullname}</span>
        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Tooltip title="Hapus">
            <IconButton color="error" size="small" onClick={() => onRemove(item)}>
              <Iconify icon="ic:outline-delete" fontSize={16} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Detail">
            <IconButton color="success" size="small" onClick={() => onDetail(item)}>
              <Iconify icon="ic:outline-remove-red-eye" fontSize={16} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Download">
            <IconButton
              color="primary"
              size="small"
              onClick={() => onDownload(item)}
              disabled={!item.finishedAt}
            >
              <Iconify icon="ic:round-download" fontSize={16} />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>
    </div>
  ));
}
