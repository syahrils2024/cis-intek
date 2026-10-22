/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/**
 * @typedef {import("src/repositories/customer").CustomerTicketLog} CustomerTicketLog
 * @typedef {import('src/repositories/customer').CustomerTicket} CustomerTicket
 */

import { toast } from 'sonner';
import { Iconify } from '@components/iconify';
import { useBoolean } from '@hooks/use-boolean';
import { useRef, useState, useEffect } from 'react';
import { ViewerImageDialog } from '@components/viewerImageDialog';

import Grid from '@mui/material/Unstable_Grid2';
import {
  Step,
  List,
  Stack,
  Button,
  Dialog,
  Stepper,
  useTheme,
  ListItem,
  StepLabel,
  DialogTitle,
  StepContent,
  ListItemIcon,
  DialogActions,
  DialogContent,
  useMediaQuery,
} from '@mui/material';

import 'src/extension/date';
import 'src/extension/string';
import { customerRepository } from 'src/repositories';

/**
 * @param {{ticketId?: string; customerId?: string; selectedTicket?: CustomerTicket; onClose: () => void}} props -- React Props
 */
export default function TicketLog({ customerId, ticketId, selectedTicket, onClose }) {
  const showDialog = useBoolean(false);
  const loading = useBoolean(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const dialogContent = useRef();
  const viewerDialogRef = useRef();

  /** @type {[CustomerTicketLog[], void]} */
  const [logs, setLogs] = useState([]);

  const ticketTypeLabel = {
    installation_request: 'Alur Pemasangan',
    maintenance: 'Perbaikan',
    other: 'Lainnya',
  };

  const prefetch = async () => {
    loading.onTrue();
    try {
      const snapshotLog = await customerRepository.getCustomerTicketLog(customerId, ticketId);
      setLogs(snapshotLog);
      setTimeout(() => {
        dialogContent.current?.scrollIntoView({ behavior: 'smooth' });
      }, 500);
    } catch (error) {
      toast.error(error.message);
    } finally {
      loading.onFalse();
    }
  };

  useEffect(() => {
    if (!ticketId || !customerId) {
      showDialog.onFalse();
      setLogs([]);
      return;
    }

    showDialog.onTrue();
    prefetch();
  }, [ticketId, customerId]);

  return (
    <Dialog open={showDialog.value} onClose={onClose} fullWidth fullScreen={isMobile}>
      <DialogTitle>
        <div className="tw-flex tw-flex-col">
          <span>
            {selectedTicket?.ticketType ? ticketTypeLabel[selectedTicket.ticketType] : ''}
          </span>
          <span className="tw-text-sm tw-text-gray-400">
            {selectedTicket?.createdAt.toDate().formatSummaryDate()}
          </span>
        </div>
      </DialogTitle>
      <DialogContent>
        <Stepper orientation="vertical">
          {logs.reverse().map((log, i) => (
            <Step key={i} active expanded>
              <StepLabel>{log.description}</StepLabel>
              <StepContent>
                <Stack spacing={2}>
                  {log.photos.length >= 1 && (
                    <Grid container gap={2}>
                      {log.photos.map((photo, j) => (
                        <Grid xs={6} md={4} lg={2} key={j}>
                          <img
                            alt={photo}
                            src={`/public/uploads/${photo}`}
                            className="tw-aspect-square tw-rounded-lg tw-object-cover tw-object-center"
                            onClick={() => viewerDialogRef.current.showImage([photo], 'Preview')}
                          />
                        </Grid>
                      ))}
                    </Grid>
                  )}

                  {log.itemDescription?.length >= 1 && (
                    <List>
                      {log.itemDescription?.map((item, j) => (
                        <ListItem key={j}>
                          <ListItemIcon>
                            <Iconify icon="mdi:circle-small" />
                          </ListItemIcon>
                          <span className="tw-text-xs"> {item} </span>
                        </ListItem>
                      ))}
                    </List>
                  )}

                  <p className="tw-text-xs tw-text-gray-500">
                    Created by {log.createdBy.fullname}, {log.createdAt.toDate().formatDateTime()}
                  </p>
                </Stack>
              </StepContent>
            </Step>
          ))}
        </Stepper>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="error">
          Tutup
        </Button>
      </DialogActions>
      <ViewerImageDialog ref={viewerDialogRef} />
    </Dialog>
  );
}
