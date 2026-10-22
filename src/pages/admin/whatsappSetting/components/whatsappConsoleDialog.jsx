import { toast } from 'sonner';
import { useBoolean } from '@hooks/use-boolean';
import Overloading from '@components/overloading';
import { useMemo, useState, forwardRef, useImperativeHandle } from 'react';

import {
  Chip,
  Grid,
  Stack,
  Button,
  Dialog,
  Divider,
  useTheme,
  DialogTitle,
  DialogActions,
  DialogContent,
  useMediaQuery,
} from '@mui/material';

import { whatsappNodeRepository } from 'src/repositories';

/**
 * @typedef {import('src/repositories/whatsappNode').WhatsappNode} WhatsappNode
 */

const WhatsappConsoleDialog = forwardRef((props, ref) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const show = useBoolean(false);
  const isLoading = useBoolean(false);

  /** @type {[WhatsappNode, void]} */
  const [whatsappNode, setWhatsappNode] = useState(null);

  const [consoleLogs, setConsoleLogs] = useState('');

  const headersNode = useMemo(() => {
    const items = {
      title: whatsappNode?.title ?? '-',
      description: whatsappNode?.description ?? '-',
      phone: whatsappNode?.phone ?? '-',
      port: whatsappNode?.port ?? '-',
      categories:
        whatsappNode?.groups?.map((g, i) => (
          <Chip
            key={i}
            label={<span className="tw-text-xs">{g.name}</span>}
            variant="outlined"
            size="small"
            color="primary"
          />
        )) ?? '-',
    };

    return Object.keys(items).map((key) => ({
      label: key.charAt(0).toUpperCase() + key.slice(1),
      value: items[key],
    }));
  });

  /**
   * @param {WhatsappNode} node
   */
  async function open(node) {
    setWhatsappNode(node);
    show.onTrue();
    isLoading.onTrue();
    try {
      const snapshotLogs = await whatsappNodeRepository.getNodeLogs(node._id);
      setConsoleLogs(snapshotLogs);
    } catch (error) {
      toast.error(error.message);
    } finally {
      isLoading.onFalse();
    }
  }

  function reset() {
    setWhatsappNode(null);
    setConsoleLogs('');
  }

  function close() {
    show.onFalse();
    reset();
  }

  useImperativeHandle(ref, () => ({ open }));

  return (
    <Dialog open={show.value} fullWidth maxWidth="md" fullScreen={isMobile}>
      <DialogTitle>Console</DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          <Grid container spacing={2}>
            {headersNode.map((header, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Stack>
                  <span className="tw-text-xs tw-text-gray-500">{header.label}</span>
                  <div className="tw-flex tw-flex-wrap tw-gap-2 tw-text-xs">{header.value}</div>
                </Stack>
              </Grid>
            ))}
          </Grid>
          <Divider />
          <div className="tw-flex tw-flex-col tw-relative">
            <Overloading loading={isLoading.value} />
            <p className="tw-text-xs tw-whitespace-pre-line">{consoleLogs}</p>
          </div>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button color="error" onClick={() => close()} variant="text">
          Tutup
        </Button>
      </DialogActions>
    </Dialog>
  );
});

export default WhatsappConsoleDialog;
