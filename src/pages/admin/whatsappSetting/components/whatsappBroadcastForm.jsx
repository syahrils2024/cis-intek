import { toast } from 'sonner';
import { Iconify } from '@components/iconify';
import Overloading from '@components/overloading';
import { useRef, forwardRef, useImperativeHandle } from 'react';
import AreaPickerFilter from '@components/billing/areaPickerFilter';

import { LoadingButton } from '@mui/lab';
import {
  Grid,
  Stack,
  Button,
  Dialog,
  useTheme,
  TextField,
  DialogTitle,
  DialogActions,
  useMediaQuery,
  DialogContent,
} from '@mui/material';

import 'src/extension/string';
import { useBroadcastStore } from 'src/stores/broadcastStore';

import useWhatsappSettingStore from '../whatsappSetting.store';
import WhatsappBroadcastFormNodeItem from './whatsappBroadcastFormNodeItem';
import WhatsappBroadcastFormRulesItem from './whatsappBroadcastFormRulesItem';
import { useWhatsappBroadcastFormState } from '../states/whatsappBroadcastForm.state';

/** @typedef {import('src/stores/broadcastStore').BroadcastStore} BroadcastStore */

const WhatsappBroadcastForm = forwardRef((props, ref) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const {
    title,
    setTitle,
    date,
    setDate,
    addRules,
    areaPickerRef,
    delayMessage,
    delaySession,
    messagePerSession,
    removeRules,
    rules,
    setDelayMessage,
    setDelaySession,
    setMessagePerSession,
    showDialog,
    updateRules,
    whatsappNodes,
    addWhatsappNode,
    updateWhatsappNode,
    removeWhatsappNode,
    loading,
    submit,
    loadRules,
    resetForm,
    loadingSubmit,
  } = useWhatsappBroadcastFormState();

  /** @type {BroadcastStore} */
  const { data: broadcastTemplateList, loadData: loadBroadcastTemplateList } = useBroadcastStore();

  /** @type {import('../whatsappSetting.state').WhatsappSettingState} */
  const { whatsappNodes: whatsappNodeList, fetchWhatsappNodes } = useWhatsappSettingStore();

  const resolver = useRef();

  async function prefetch() {
    await loadBroadcastTemplateList().catch(() => {
      toast.error('Gagal memuat template broadcast');
    });

    await fetchWhatsappNodes().catch(() => {
      toast.error('Gagal memuat Whatsapp Node');
    });
  }

  async function pickArea(index) {
    const currentItem = rules[index];
    const result = await areaPickerRef.current.open(currentItem.areaId, false);
    if (!result) return;
    updateRules(index, {
      areaId: result._id,
      areaTitle: result.title,
    });
  }

  function open(id) {
    resetForm();
    showDialog.onTrue();
    prefetch();
    if (id) {
      loadRules(id);
    }
    return new Promise((resolve) => {
      resolver.current = resolve;
    });
  }

  function close() {
    if (resolver.current) {
      resolver.current();
      resolver.current = null;
    }
    showDialog.onFalse();
  }

  function onSubmit() {
    const promises = submit();
    toast.promise(promises, {
      loading: () => {
        loadingSubmit.onTrue();
        return 'Menyimpan...';
      },
      success: () => {
        close();
        return 'Berhasil Menyimpan...';
      },
      error: (err) => (err instanceof Error ? err.message : 'Gagal Menyimpan...'),
      finally: () => {
        loadingSubmit.onFalse();
      },
    });
    loading.onFalse();
  }

  useImperativeHandle(ref, () => ({ open, close }));

  return (
    <Dialog open={showDialog.value} fullScreen={isMobile} fullWidth maxWidth="sm" scroll="paper">
      <DialogTitle>Schedule Broadcast Form</DialogTitle>
      <DialogContent>
        <Stack className="tw-pt-5 tw-relative" spacing={4}>
          <Overloading loading={loading.value} />
          <TextField
            fullWidth
            size="small"
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          {/* Broadcast Rules */}
          <div className="tw-relative tw-p-5 tw-ring-1 tw-ring-gray-400 tw-rounded-md">
            <div className="tw-absolute -tw-top-4 tw-ring-primary tw-ring-1 tw-bg-gray-200 tw-left-5 tw-p-2 tw-rounded-md tw-text-xs tw-font-medium">
              Pengaturan Broadcast
            </div>
            <Grid container className="tw-py-4" spacing={2}>
              <Grid item columns={12} xs={12} sm={6} md={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Tanggal Broadcast"
                  value={date}
                  onChange={(e) => setDate(e.target.value.toString().toNumber())}
                  helperText="Tanggal 1 sampai 28"
                />
              </Grid>
              <Grid item columns={12} xs={12} sm={6} md={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Pesan Per Sesi"
                  value={messagePerSession}
                  onChange={(e) => setMessagePerSession(e.target.value.toString().toNumber())}
                  helperText="Pesan Per Sesi"
                />
              </Grid>
              <Grid item columns={12} xs={12} sm={6} md={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Jeda Pesan (detik)"
                  value={delayMessage}
                  onChange={(e) => setDelayMessage(e.target.value.toString().toNumber())}
                  helperText="Jeda Antar Pesan"
                />
              </Grid>
              <Grid item columns={12} xs={12} sm={6} md={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Jeda Sesi (menit)"
                  value={delaySession}
                  onChange={(e) => setDelaySession(e.target.value.toString().toNumber())}
                  helperText="Jeda Antar Sesi"
                />
              </Grid>
            </Grid>
          </div>
          {/* End Broadcast Rules */}
          {/* Whatsapp Node */}
          <div className="tw-relative tw-p-5 tw-ring-1 tw-ring-gray-400 tw-rounded-md">
            <div className="tw-absolute -tw-top-4 tw-ring-primary tw-ring-1 tw-bg-gray-200 tw-left-5 tw-p-2 tw-rounded-md tw-text-xs tw-font-medium">
              Whatsapp Node
            </div>
            <Stack spacing={2} className="tw-pt-4">
              {whatsappNodes.map((whatsappNode, index) => (
                <WhatsappBroadcastFormNodeItem
                  key={index}
                  whatsappNode={whatsappNode}
                  items={whatsappNodeList}
                  onChange={(value) => updateWhatsappNode(index, value)}
                  onRemove={whatsappNodes.length > 1 ? () => removeWhatsappNode(index) : undefined}
                />
              ))}
              <Stack direction="row" justifyContent="end" className="tw-mt-4">
                <Button
                  variant="soft"
                  color="primary"
                  onClick={() => addWhatsappNode()}
                  size="small"
                >
                  <Iconify icon="mdi:plus" /> Tambah
                </Button>
              </Stack>
            </Stack>
          </div>
          {/* End Whatsapp Node */}
          {/* Area Rules */}
          <Stack spacing={4}>
            {rules.map((rule, index) => (
              <WhatsappBroadcastFormRulesItem
                key={index}
                iteration={index + 1}
                areaTitle={rule.areaTitle}
                areaId={rule.areaId}
                onPickArea={() => pickArea(index)}
                billingStatus={rule.billingStatus}
                onChangeBillingStatus={(value) => updateRules(index, { billingStatus: value })}
                sendInvoice={rule.sendInvoice}
                onChangeSendInvoice={(value) => updateRules(index, { sendInvoice: value })}
                sendSpecial={rule.sendSpecial}
                onChangeSendSpecial={(value) => updateRules(index, { sendSpecial: value })}
                template={rule.template}
                templateList={broadcastTemplateList}
                onChangeTemplate={(value) => updateRules(index, { template: value })}
                onRemove={rules.length > 1 ? () => removeRules(index) : undefined}
              />
            ))}
          </Stack>
          <Stack direction="row" justifyContent="end" className="tw-mt-4">
            <Button variant="soft" color="primary" onClick={() => addRules()} size="small">
              <Iconify icon="mdi:plus" />
              Tambah Area
            </Button>
          </Stack>
          {/* End Area Rules */}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => close()} variant="text" color="error">
          Tutup
        </Button>
        <LoadingButton
          color="primary"
          variant="contained"
          loading={loadingSubmit.value}
          onClick={() => onSubmit()}
        >
          Simpan
        </LoadingButton>
      </DialogActions>
      <AreaPickerFilter ref={areaPickerRef} />
    </Dialog>
  );
});

export default WhatsappBroadcastForm;
