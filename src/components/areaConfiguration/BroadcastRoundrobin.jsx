import dayjs from 'dayjs';
import { toast } from 'sonner';
import { Iconify } from '@components/iconify';
import { useBoolean } from '@hooks/use-boolean';
import { useAppPicker } from '@hooks/use-app-picker';
import { useExpansionToggle } from '@hooks/use-expansion-toggle';
import { useRef, useState, forwardRef, useImperativeHandle } from 'react';

import { LoadingButton } from '@mui/lab';
import { DatePicker } from '@mui/x-date-pickers';
import {
  Grid,
  Menu,
  Stack,
  Dialog,
  Button,
  useTheme,
  MenuItem,
  Checkbox,
  TextField,
  DialogTitle,
  useMediaQuery,
  DialogContent,
  DialogActions,
  FormHelperText,
  FormControlLabel,
} from '@mui/material';

import 'src/extension/string';
import {
  customerRepository,
  whatsappNodeRepository,
  broadcastTemplateRepository,
  broadcastOptionTemplateRepository,
} from 'src/repositories';

import SaveBroadcastOptionConfirm from './SaveBroadcastOptionConfirm';

/**
 * @typedef {import('src/repositories/broadcastTemplate').BroadcastTemplate} BroadcastTemplate
 * @typedef {import('src/repositories/whatsappNode').WhatsappNode} WhatsappNode
 */

const BroadcastRoundrobin = forwardRef((props, ref) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const saveBroadcastOptionRef = useRef();
  const disabledSaveBroadcastTemplate = useBoolean(false);
  const appPicker = useAppPicker();

  const show = useBoolean(false);
  const [areaId, setAreaId] = useState(null);
  const [areaName, setAreaName] = useState(null);
  const [date, setDate] = useState(new Date());
  const [message, setMessage] = useState('');
  const billingStatus = useExpansionToggle();
  const special = useBoolean(false);
  const invoice = useBoolean(false);
  const loading = useBoolean(false);
  const loadingSaveOption = useBoolean(false);

  const [chunkSize, setChunkSize] = useState(5); // item
  const [intervalMessage, setIntervalMessage] = useState(15); // Seconds
  const [intervalChunk, setIntervalChunk] = useState(10); // Minutes

  const [anchorEl, setAnchorEl] = useState(null);
  const openedAnchor = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  /** @type {[BroadcastTemplate[], void]} */
  const [templates, setTemplates] = useState([]);
  /** @type {[WhatsappNode[], void]} */
  const [whatsappNodeList, setWhatsappNodeList] = useState([]);
  /** @type {[string[], void]} */
  const [selectedWhatsappNode, setSelectedWhatsappNode] = useState(['']);
  const [selectedTempate, setSelectedTemplate] = useState('');

  const billingStatusList = [
    {
      label: 'Unpaid',
      value: 'unpaid',
    },
    {
      label: 'Paid',
      value: 'paid',
    },
    {
      label: 'Partially Paid',
      value: 'partially_paid',
    },
    {
      label: 'Canceled',
      value: 'canceled',
    },
  ];

  function reset() {
    setAreaId(null);
    setAreaName(null);
    setDate(new Date());
    setSelectedTemplate('');
    setMessage('');
    billingStatus.reset();
    special.onFalse();
    setWhatsappNodeList([]);
    setSelectedWhatsappNode(['']);
    setChunkSize(5);
    setIntervalMessage(15);
    setIntervalChunk(10);
    invoice.onFalse();
  }

  async function fetchTemplates() {
    loading.onTrue();
    try {
      const snapshotWhatsappNodes = await whatsappNodeRepository.getWhatsappNode();
      setWhatsappNodeList(snapshotWhatsappNodes);
      const snapshotTemplates = await broadcastTemplateRepository.getBroadcastTemplate();
      setTemplates(snapshotTemplates);
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
    } finally {
      loading.onFalse();
    }
  }

  function addWhatsappNode() {
    setSelectedWhatsappNode((prev) => [...prev, '']);
  }

  function removeWhatsappNode(index) {
    if (selectedWhatsappNode.length <= 1) return;
    setSelectedWhatsappNode((prev) => prev.filter((_, i) => i !== index));
  }

  function changeWhatsappNode(index, value) {
    setSelectedWhatsappNode((prev) => {
      const newList = [...prev];
      newList[index] = value;
      return newList;
    });
  }

  function validateBeforeSubmit() {
    if (billingStatus.length <= 0) throw new Error('Pilih minimal 1 status pembayaran');
    if (selectedWhatsappNode.length <= 0) throw new Error('Pilih minimal 1 Whatsapp Node');

    selectedWhatsappNode.forEach((node, i) => {
      if (!node) throw new Error(`Pilih Whatsapp Node No. ${i + 1}`);
    });

    const text = message.trim();
    if (selectedTempate === '') {
      if (text === '') throw new Error('Pesan tidak boleh kosong');
    }
  }

  async function pickProfile() {
    handleClose();
    const result = await appPicker.broadcastProfilePicker.open();
    if (!result) return;

    setSelectedTemplate(result.template_id ?? '');
    setMessage(result.message ?? '');
    setChunkSize(result.messagePerSession);
    setIntervalMessage(result.messageDelay);
    setIntervalChunk(result.sessionDelay);
    setSelectedWhatsappNode(result.whatsappNodes.map((node) => node._id));
    billingStatus.setData(result.billingStatus);
    special.setValue(result.specialCustomer);
    invoice.setValue(result.withInvoice);
  }

  function submit() {
    try {
      validateBeforeSubmit();
      const promises = customerRepository.broadcast({
        area: areaId,
        billingStatus: billingStatus.data,
        chunkSize,
        intervalEachChunk: intervalChunk,
        intervalEachMessage: intervalMessage,
        message,
        special: special.value,
        template: selectedTempate,
        whatsappNodes: selectedWhatsappNode,
        month: date.getMonth() + 1,
        year: date.getFullYear(),
        invoice: invoice.value,
      });
      loading.onTrue();
      toast.promise(promises, {
        loading: 'Memproses Broadcast',
        success: () => {
          close();
          return 'Sukses melakukan broadcast';
        },
        error: (error) => (error instanceof Error ? error.message : 'Gagal Melakukan Broadcast'),
        finally: () => {
          loading.onFalse();
        },
      });
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
    }
  }

  async function saveOption() {
    handleClose();
    const snapshotName = await saveBroadcastOptionRef.current.open();
    if (typeof snapshotName !== 'string') return;

    loadingSaveOption.onTrue();
    try {
      const body = {
        name: snapshotName,
        billingStatus: billingStatus.data,
        message: selectedTempate === '' ? message : null,
        templateId: selectedTempate === '' ? null : selectedTempate,
        whatsappNode: selectedWhatsappNode,
        messagePerSession: chunkSize,
        messageDelay: intervalMessage,
        sessionDelay: intervalChunk,
      };
      await broadcastOptionTemplateRepository.create(body);
      disabledSaveBroadcastTemplate.onTrue();
      toast.info('Berhasil menyimpan');
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
    } finally {
      loadingSaveOption.onFalse();
    }
  }

  /**
   * Open Dialog
   * @param {{
   *   id: string;
   *   name: string;
   * }} param0
   */
  function open({ id, name }) {
    reset();
    setAreaId(id);
    setAreaName(name);
    show.onTrue();
    fetchTemplates();
  }

  function close() {
    reset();
    show.onFalse();
  }

  useImperativeHandle(ref, () => ({ open }));

  return (
    <>
      <Dialog
        open={show.value}
        fullWidth
        maxWidth="sm"
        fullScreen={isMobile}
        onClose={() => close()}
        scroll="paper"
      >
        <DialogTitle>Broadcast Pesan</DialogTitle>
        <DialogContent>
          <Stack spacing={1.5} className="tw-py-2">
            {/* Area Label */}
            <Grid container>
              <Grid item xs={12} md={6}>
                <Stack>
                  <span className="tw-text-xs tw-text-gray-400">Tujuan</span>
                  <span className="tw-text-xs tw-font-semibold">{areaName ?? '-'}</span>
                </Stack>
              </Grid>
            </Grid>
            {/* Template */}
            <TextField
              label="Template"
              value={selectedTempate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
              variant="filled"
              select
              fullWidth
              size="small"
              SelectProps={{ displayEmpty: true }}
              InputLabelProps={{ shrink: true }}
            >
              <MenuItem value="">Pesan Ketik</MenuItem>
              {templates.map((item, i) => (
                <MenuItem key={i} value={item._id}>
                  {item.title}
                </MenuItem>
              ))}
            </TextField>
            {/* Message */}
            {selectedTempate === '' ? (
              <TextField
                label="Pesan"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                multiline
                rows={3}
                variant="filled"
                fullWidth
              />
            ) : null}
            {/* End Message */}
            {/* Billing Date */}
            <div className="tw-ring-1 tw-ring-gray-400 tw-rounded-lg tw-w-full tw-relative tw-mt-4">
              <span className="tw-text-xs tw-font-semibold tw-p-1.5 tw-bg-gray-200 tw-absolute -tw-top-3 tw-left-5 tw-rounded-lg tw-ring-primary tw-ring-1">
                Billing
              </span>
              <Stack className="tw-p-5 tw-pt-8 tw-w-full" spacing={1.5}>
                <DatePicker
                  value={dayjs(date)}
                  onChange={(value) => setDate(value.toDate())}
                  views={['year', 'month']}
                  label="Bulan dan Tahun"
                  slotProps={{ textField: { variant: 'filled', fullWidth: true } }}
                />
                <div className="tw-flex tw-flex-wrap tw-gap-1">
                  {billingStatusList.map((item, index) => (
                    <FormControlLabel
                      key={index}
                      control={
                        <Checkbox
                          checked={billingStatus.isIncludes(item.value)}
                          onChange={() => billingStatus.toggle(item.value)}
                        />
                      }
                      label={item.label}
                    />
                  ))}
                  <FormControlLabel
                    control={
                      <Checkbox checked={special.value} onChange={() => special.onToggle()} />
                    }
                    label="Pelanggan Spesial"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox checked={invoice.value} onChange={() => invoice.onToggle()} />
                    }
                    label="Invoice"
                  />
                </div>
              </Stack>
            </div>
            {/* End Billing Date */}
            {/* Whatsapp Node */}
            <div className="tw-ring-1 tw-ring-gray-400 tw-rounded-lg tw-w-full tw-relative tw-mt-4">
              <span className="tw-text-xs tw-font-semibold tw-p-1.5 tw-bg-gray-200 tw-absolute -tw-top-3 tw-left-5 tw-rounded-lg tw-ring-primary tw-ring-1">
                Whatsapp Node
              </span>
              <Stack className="tw-p-5 tw-pt-8 tw-w-full" spacing={1.5}>
                {selectedWhatsappNode.map((node, i) => (
                  <Stack key={i} direction="row" spacing={0.5}>
                    <TextField
                      label="WhatsappNode"
                      value={node}
                      onChange={(e) => changeWhatsappNode(i, e.target.value)}
                      size="small"
                      variant="filled"
                      select
                      fullWidth
                    >
                      {whatsappNodeList.map((item) => (
                        <MenuItem key={item._id} value={item._id}>
                          {item.title}
                        </MenuItem>
                      ))}
                    </TextField>
                    <Button color="error" variant="text" onClick={() => removeWhatsappNode(i)}>
                      <Iconify icon="mdi:delete" />
                    </Button>
                  </Stack>
                ))}
                <div className="tw-flex tw-flex-row tw-items-center tw-justify-end tw-w-full">
                  <Button color="primary" variant="soft" onClick={() => addWhatsappNode()}>
                    <Iconify icon="mdi:plus" /> Tambah
                  </Button>
                </div>
              </Stack>
            </div>
            {/* End Whatsapp Node */}
            {/* Interval Settings */}
            <div className="tw-ring-1 tw-ring-gray-400 tw-rounded-lg tw-w-full tw-relative tw-mt-4">
              <span className="tw-text-xs tw-font-semibold tw-p-1.5 tw-bg-gray-200 tw-absolute -tw-top-3 tw-left-5 tw-rounded-lg tw-ring-primary tw-ring-1">
                Pengaturan Broadcast
              </span>
              <Stack className="tw-p-5 tw-pt-8 tw-w-full">
                <Grid spacing={1.5} container>
                  <Grid item xs={12} md={4}>
                    <TextField
                      label="Pesan Per Sesi"
                      value={chunkSize}
                      onChange={(e) => setChunkSize(e.target.value.toString().toNumber())}
                      variant="filled"
                      fullWidth
                      number
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      label="Jeda Pesan (detik)"
                      value={intervalMessage}
                      onChange={(e) => setIntervalMessage(e.target.value.toString().toNumber())}
                      variant="filled"
                      fullWidth
                      number
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      label="Jeda Sesi (Menit)"
                      value={intervalChunk}
                      onChange={(e) => setIntervalChunk(e.target.value.toString().toNumber())}
                      variant="filled"
                      fullWidth
                      number
                    />
                  </Grid>
                </Grid>
                <FormHelperText>Isi 0 semua apabila tidak ingin menjeda pesan</FormHelperText>
              </Stack>
            </div>
            {/* End Interval Settings */}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Stack direction="row" justifyContent="space-between" alignItems="center" width="100%">
            <Stack direction="row">
              <LoadingButton
                variant="soft"
                color="success"
                loading={loadingSaveOption.value}
                onClick={(e) => handleClick(e)}
              >
                Profile
              </LoadingButton>
            </Stack>
            <Stack direction="row">
              <Button color="error" variant="text" onClick={() => close()}>
                Cancel
              </Button>
              <LoadingButton
                loading={loading.value}
                color="primary"
                onClick={() => submit()}
                variant="contained"
              >
                Broadcast
              </LoadingButton>
            </Stack>
          </Stack>
        </DialogActions>
      </Dialog>
      <SaveBroadcastOptionConfirm ref={saveBroadcastOptionRef} />
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={openedAnchor}
        onClose={handleClose}
        slotProps={{
          list: {
            'aria-labelledby': 'basic-button',
          },
        }}
      >
        <MenuItem disabled={disabledSaveBroadcastTemplate.value} onClick={() => saveOption()}>
          Simpan Profile
        </MenuItem>
        <MenuItem onClick={() => pickProfile()}>Import Profile</MenuItem>
      </Menu>
    </>
  );
});

export default BroadcastRoundrobin;
