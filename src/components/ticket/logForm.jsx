/* eslint-disable jsx-a11y/label-has-associated-control */
/**
 * @typedef {import("src/repositories/customer").CustomerTicketLog} CustomerTicketLog
 * @typedef {import('src/repositories/customer').CustomerTicket} CustomerTicket
 * @typedef {import('src/repositories/customer').Customer} Customer
 * @typedef {import('src/repositories/ticket').Ticket} Ticket
 */

import { toast } from 'sonner';
import { Iconify } from '@components/iconify';
import { useBoolean } from '@hooks/use-boolean';
import Overloading from '@components/overloading';
import { ViewerImageDialog } from '@components/viewerImageDialog';
import { useRef, useMemo, useState, forwardRef, useImperativeHandle } from 'react';

import { LoadingButton } from '@mui/lab';
import {
  Grid,
  Stack,
  Button,
  Dialog,
  Divider,
  useTheme,
  TextField,
  IconButton,
  DialogTitle,
  DialogActions,
  DialogContent,
  useMediaQuery,
} from '@mui/material';

import 'src/extension/date';
import 'src/extension/string';
import { useMeStore } from 'src/stores/meStore';
import { ticketRepository, customerRepository } from 'src/repositories';

import { TicketLogFormSummary } from './LogFormSummary';
import { TicketLogFormTimeline } from './logFormTimeline';

export const TicketLogForm = forwardRef((props, ref) => {
  const showDialog = useBoolean(false);
  const loading = useBoolean(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const loadingSend = useBoolean(false);

  const [message, setMessage] = useState('');
  const [file, setFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const pickerRef = useRef();
  const viewerRef = useRef();

  /** @type {import('src/stores/meStore').MeStore} */
  const meStore = useMeStore();

  /**
   * @param {Event} e
   */
  const onPickFile = (e) => {
    const [someFile] = e.target.files;
    setFile(someFile);
    setPreviewImage(URL.createObjectURL(someFile));
  };

  const clearFile = () => {
    setFile(null);
    setPreviewImage(null);
  };

  const clearInput = () => {
    clearFile();
    setMessage('');
  };

  const send = async () => {
    loadingSend.onTrue();
    try {
      if (message.trim() === '' && !file) throw new Error('Mohon mengisi teks laporan atau gambar');

      const description =
        message.trim() === '' && file != null ? 'Menambahkan foto' : message.trim();

      await ticketRepository.sendLog(currentTicket._id, { message: description, file });
      clearInput();
      toast.success('Berhasil dikirim');
      prefetch(currentTicket._id, customer._id);
    } catch (error) {
      toast.error(error.message);
    } finally {
      loadingSend.onFalse();
    }
  };

  /**
   * @type {[Customer, void]}
   */
  const [customer, setCustomer] = useState(null);

  /**
   * @type {[Ticket, void]}
   */
  const [currentTicket, setCurrentTicket] = useState(null);

  const customerLabel = useMemo(
    () => ({
      'Ticket ID': currentTicket?.ticketId ?? '-',
      ID: customer?.customerId ?? '-',
      Pelangan: customer?.fullname ?? '-',
      Whatsapp: customer?.phone ?? '-',
      'Area / POP': customer?.areaName ?? '-',
      ODP: customer?.ODPName ?? '-',
      'Paket Saat ini': customer?.packageData?.title ?? '-',
      'Biaya Bulanan': customer?.activePackage?.price.formatCurrency() ?? '-',
      Alamat: customer?.address ?? '-',
      Keluhan: currentTicket?.description ?? '-',
    }),
    [customer, currentTicket]
  );

  /** @type {[CustomerTicketLog[], void]} */
  const [logs, setLogs] = useState([]);
  const memoLogs = useMemo(() => logs, [logs]);

  const ticketTypeLabel = {
    maintenance: 'Perbaikan',
    installation_request: 'Pemasangan',
    other: 'Lainnya',
    problem: 'Kendala Lain',
    internet_trouble: 'Gangguan Internet',
    upgrade_request: 'Upgrade Internet',
    dismaintenance: 'Dismantle',
  };

  const prefetch = async (ticketId, customerId) => {
    loading.onTrue();
    try {
      const snapshotLog = await customerRepository.getCustomerTicketLog(customerId, ticketId);
      const sorted = snapshotLog.sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      setLogs(sorted);

      if (!customer) {
        const snapshotCustomer = await customerRepository.getCustomer(customerId);
        setCustomer(snapshotCustomer);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      loading.onFalse();
    }
  };

  const close = () => {
    showDialog.onFalse();
    setCustomer(null);
    setLogs([]);
    setCurrentTicket(null);
  };

  /**
   * @param {Ticket} ticket
   * @param {string} customerId
   */
  const open = (ticket, customerId) => {
    showDialog.onTrue();
    setCurrentTicket(ticket);
    prefetch(ticket._id, customerId);
  };

  useImperativeHandle(ref, () => ({ open }));

  return (
    <Dialog open={showDialog.value} fullWidth maxWidth="md" fullScreen={isMobile}>
      <DialogTitle>Ticket Log</DialogTitle>
      <DialogContent>
        <div className="tw-relative">
          <Overloading loading={loading.value} />
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Stack direction={isMobile ? 'column' : 'row'} spacing={2}>
                <TicketLogFormSummary labelItems={customerLabel} />
                {isMobile ? (
                  <Divider />
                ) : (
                  <div className="tw-w-[2px] tw-flex-none tw-h-96 tw-bg-gray-200" />
                )}
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <TicketLogFormTimeline
                items={memoLogs}
                self={meStore.me?._id}
                onViewImage={(photos, description) =>
                  viewerRef.current.showImage(photos, description)
                }
              />
            </Grid>
          </Grid>
        </div>
      </DialogContent>
      <DialogActions>
        {!['processed', 'waiting_finishing'].includes(currentTicket?.status) ? (
          <Button onClick={close} color="error">
            Tutup
          </Button>
        ) : (
          <div className="tw-flex tw-flex-row tw-w-full tw-items-center">
            <Button onClick={close} color="error">
              Tutup
            </Button>
            <TextField
              label="Laporan/Pesan"
              value={message}
              size="small"
              onChange={(e) => setMessage(e.target.value)}
              className="tw-w-full"
            />

            {previewImage ? (
              <div className="tw-relative tw-mx-2">
                <div className="tw-absolute -tw-right-4 -tw-top-4">
                  <IconButton color="error" onClick={clearFile}>
                    <Iconify icon="mdi:close" />
                  </IconButton>
                </div>

                <img
                  src={previewImage}
                  className="tw-w-14 tw-aspect-square tw-rounded-md tw-object-cover tw-object-center"
                  alt="Preview"
                />
              </div>
            ) : (
              <>
                <Button variant="text" color="primary" onClick={() => pickerRef.current.click()}>
                  <Iconify icon="material-symbols:image" />
                </Button>
                <input
                  ref={pickerRef}
                  name="imagePicker"
                  id="imagePicker"
                  type="file"
                  accept="image/*"
                  onChange={onPickFile}
                  className="tw-hidden"
                />
              </>
            )}

            <LoadingButton
              color="primary"
              variant="text"
              loading={loadingSend.value}
              onClick={send}
            >
              <Iconify icon="lucide:send" />
            </LoadingButton>
          </div>
        )}
      </DialogActions>
      <ViewerImageDialog ref={viewerRef} />
    </Dialog>
  );
});
