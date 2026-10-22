import dayjs from 'dayjs';
import { toast } from 'sonner';
import { useEffect } from 'react';
import { format } from 'date-fns';
import { useConfirm } from 'material-ui-confirm';
import Overloading from '@components/overloading';
import { useDebouncedCallback } from 'use-debounce';

import { DatePicker } from '@mui/x-date-pickers';
import {
  Chip,
  Tooltip,
  useTheme,
  MenuItem,
  TextField,
  useMediaQuery,
  TablePagination,
} from '@mui/material';

import { whatsappLogRepository } from 'src/repositories';

import useWhatsappSettingStore from '../whatsappSetting.store';
import { WhatsappLogCustomerData } from './whatsappLogCustomerData';
import { useWhatsappLogCustomerStore } from '../whatsappLogCustomer.store';

/**
 * @typedef {import("../whatsappLogCustomer.store").WhatsappLogCustomerStore} WhatsappLogCustomerStore
 * @typedef {import('../whatsappSetting.state').WhatsappSettingState} WhatsappSettingState
 */

export default function WhatsappLogCustomerPanel() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  /** @type {WhatsappSettingState} */
  const { whatsappNodes } = useWhatsappSettingStore();

  /** @type {WhatsappLogCustomerStore} */
  const {
    data,
    fetchData,
    loading,
    total,
    page,
    limit,
    start,
    until,
    pendingJobs,
    totalFailed,
    totalSuccess,
    search,
    status,
    fromWhatsappNode,
    messageCategory,
    setDateRange,
    setPagination,
    setSearch,
  } = useWhatsappLogCustomerStore();
  const confirm = useConfirm();

  const messageCategoryList = {
    broadcast: 'Broadcast',
    auto_broadcast: 'Auto Broadcast',
    auto_reply: 'Auto Reply',
    auto_reply_payment: 'Auto Reply Pembayaran',
    auto_reply_reject_payment: 'Auto Reply Penolakan Pembayaran',
    notification: 'Notifikasi',
    message: 'Pesan',
    test: 'Test',
    payment_notification: 'Notifikasi Pembayaran',
    otp: 'OTP',
  };

  const handlerSetPage = (e, n) => {
    setPagination({ page: n });
  };

  const handlerSetLimit = (e) => {
    setPagination({ limit: e.target.value });
  };

  const prefetchDebouncer = useDebouncedCallback(fetchData, 500);

  useEffect(() => {
    prefetchDebouncer();
  }, []);

  useEffect(() => {
    setPagination({ page: 0 });
    prefetchDebouncer();
  }, [start, until, search, status, fromWhatsappNode, messageCategory]);

  useEffect(() => {
    prefetchDebouncer();
  }, [page, limit]);

  async function resend(item) {
    const promise = whatsappLogRepository.resendWhatsappLogCustomer(item._id);
    toast.promise(promise, {
      loading: 'Mengirim ulang pesan...',
      success: () => {
        fetchData();
        return 'Pesan berhasil dikirim';
      },
      error: (error) => error.message ?? 'Gagal mengirim pesan',
    });
  }

  async function resendBatch() {
    if (totalFailed <= 0) return;
    try {
      await confirm({
        title: 'Kirim ulang pesan',
        description: `Apakah anda yakin ingin mengirim ulang ${totalFailed} pesan yang gagal?`,
        confirmationText: 'Ya',
        cancellationText: 'Batal',
      });

      const promise = whatsappLogRepository.resendWhatsappLogCustomerBatch({
        start: format(start, 'yyyy-MM-dd'),
        until: format(until, 'yyyy-MM-dd'),
      });

      toast.promise(promise, {
        loading: 'Mengirim ulang pesan...',
        success: () => {
          fetchData();
          return 'Pesan berhasil dijadwalkan';
        },
        error: (error) => error.message ?? 'Gagal mengirim pesan',
      });
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }

  return (
    <div className="tw-flex tw-flex-col tw-gap-4">
      <div className="tw-flex tw-flex-col tw-items-start tw-justify-between tw-w-full tw-gap-2">
        <span className="tw-text-lg tw-font-semibold tw-whitespace-nowrap">Log Pelanggan</span>
        <div className="tw-flex tw-flex-col-reverse md:tw-flex-col tw-w-full tw-gap-4 tw-justify-between">
          {/* Chip Category */}
          <div className="tw-flex tw-flex-wrap tw-items-center tw-justify-end md:tw-justify-start tw-gap-2 tw-w-full md:tw-flex-nowrap md:tw-flex-none md:tw-w-min">
            <Chip label={`${totalSuccess} Terkirim`} color="success" variant="soft" />
            <Tooltip title="Kirim ulang pesan yang gagal">
              <button type="button" onClick={() => resendBatch()}>
                <Chip label={`${totalFailed} Gagal`} color="error" variant="soft" />
              </button>
            </Tooltip>
            <Chip label={`${pendingJobs} Pending`} color="warning" variant="soft" />
          </div>
          {/* End Chip Category */}
          {/* Filter */}
          <div className="tw-flex tw-flex-col md:tw-flex-row tw-items-center tw-justify-end tw-gap-3 tw-w-full">
            <div className="tw-w-full tw-max-w-full md:tw-max-w-48">
              <DatePicker
                label="Mulai"
                value={dayjs(start)}
                maxDate={dayjs()}
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
                onChange={(date) => {
                  setDateRange({ start: date.toDate() });
                }}
              />
            </div>
            <div className="tw-w-full tw-max-w-full md:tw-max-w-48">
              <DatePicker
                label="Sampai"
                value={dayjs(until)}
                maxDate={dayjs()}
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
                onChange={(date) => {
                  setDateRange({ until: date.toDate() });
                }}
              />
            </div>
            <div className="tw-w-full tw-max-w-full md:tw-max-w-48">
              <TextField
                label="Whatsapp Node"
                size="small"
                fullWidth
                select
                onChange={(e) => setSearch({ fromWhatsappNode: e.target.value })}
                value={fromWhatsappNode}
                SelectProps={{ displayEmpty: true }}
                InputLabelProps={{ shrink: true }}
              >
                <MenuItem value="">Semua</MenuItem>
                {whatsappNodes.map((node) => (
                  <MenuItem key={node._id} value={node._id}>
                    {node.title}
                  </MenuItem>
                ))}
              </TextField>
            </div>
            <div className="tw-w-full tw-max-w-full md:tw-max-w-48">
              <TextField
                size="small"
                value={status}
                label="Status"
                select
                fullWidth
                SelectProps={{ displayEmpty: true }}
                InputLabelProps={{ shrink: true }}
                onChange={(e) =>
                  setSearch({
                    status: e.target.value,
                  })
                }
              >
                <MenuItem value="">Semua</MenuItem>
                <MenuItem value="success">Success</MenuItem>
                <MenuItem value="Failed">Failed</MenuItem>
              </TextField>
            </div>
            <div className="tw-w-full tw-max-w-full md:tw-max-w-48">
              <TextField
                size="small"
                value={messageCategory}
                label="Kategori"
                select
                fullWidth
                SelectProps={{ displayEmpty: true }}
                InputLabelProps={{ shrink: true }}
                onChange={(e) =>
                  setSearch({
                    messageCategory: e.target.value,
                  })
                }
              >
                <MenuItem value="">Semua</MenuItem>
                {Object.entries(messageCategoryList).map(([key, label]) => (
                  <MenuItem key={key} value={key}>
                    {label}
                  </MenuItem>
                ))}
              </TextField>
            </div>
            <div className="tw-w-full tw-max-w-full md:tw-max-w-48">
              <TextField
                size="small"
                value={search}
                label="Cari"
                onChange={(e) =>
                  setSearch({
                    search: e.target.value,
                  })
                }
              />
            </div>
          </div>
          {/* End Filter */}
        </div>
      </div>
      <div className="tw-flex tw-flex-col tw-relative tw-gap-3">
        <Overloading loading={loading} />
        {isMobile ? (
          <WhatsappLogCustomerData.Mobile data={data} onResend={(item) => resend(item)} />
        ) : (
          <WhatsappLogCustomerData.Table data={data} onResend={(item) => resend(item)} />
        )}
        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={handlerSetPage}
          rowsPerPage={limit}
          onRowsPerPageChange={handlerSetLimit}
        />
      </div>
    </div>
  );
}
