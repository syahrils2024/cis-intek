// @ts-nocheck

/* eslint-disable react/jsx-no-bind */

import type { ChangeEvent } from 'react';

import { toast } from 'sonner';
import { format } from 'date-fns';
import { useRef, useState } from 'react';
import { download } from '@utils/download';
import { Iconify } from '@components/iconify';
import { useBoolean } from '@hooks/use-boolean';
import { ViewerImageDialog } from '@components/viewerImageDialog';
import TicketFormDialog from '@pages/admin/ticket/components/FormDialog';

import { Tab, Stack, Button } from '@mui/material';
import { TabList, TabPanel, TabContext, LoadingButton } from '@mui/lab';

import { useInfoStore } from 'src/stores/info';
import { ticketRepository } from 'src/repositories';
import { useTicketMainStore } from 'src/stores/ticketMain';

import TicketDataTab from './DataTab';
import AvailableDismantle from './availableDismantle/AvailableDismantle';

import type { TicketTab, TicketDialogHandle, TicketDataTabHandle } from './types';

export default function TicketPage() {
  const infoStore = useInfoStore();
  const viewerImageDialogRef = useRef<TicketDialogHandle | null>(null);
  const ticketFormDialogRef = useRef<TicketDialogHandle | null>(null);
  const isLoadingExport = useBoolean(false);
  const pendingTabRef = useRef<TicketDataTabHandle | null>(null);
  // const tabList = useMemo(() => [
  //   {
  //     label: (
  //       <Badge badgeContent={infoStore.ticketPending} color="warning" variant="standard">
  //         Pending
  //       </Badge>
  //     ),
  //     value: 'pending',
  //   },
  //   {
  //     label: (
  //       <Badge badgeContent={infoStore.ticketProcessed} color="warning" variant="standard">
  //         Progress
  //       </Badge>
  //     ),
  //     value: 'progress',
  //   },
  //   {
  //     label: (
  //       <Badge badgeContent={infoStore.ticketWaitingFinishing} color="warning" variant="standard">
  //         Waiting Finish
  //       </Badge>
  //     ),
  //     value: 'waiting_finish',
  //   },
  //   { label: 'Finished', value: 'finished' },
  // ]);

  const [tab, setTab] = useState<TicketTab>('ticket');
  const [ticketByStatus, setTicketByStatus] = useState({});

  // useEffect(() => {
  //   ticketRepository
  //     .getStatistics()
  //     .then((res) => setTicketByStatus(res.byStatus))
  //     .catch(() => toast.error('Gagal memuat statistik ticket'));
  // }, []);

  const tabs = [
    {
      label: 'Ticket Support',
      value: 'ticket',
    },
    {
      label: 'Available Dismantle',
      value: 'availableDismantle',
    },
  ];

  /** @type {TicketMainStore} */
  const { finishedStart, finishedUntil } = useTicketMainStore();

  function showKtp(ktpPath) {
    const imageUrl = ktpPath.replaceAll('/public/uploads/', '');
    viewerImageDialogRef.current.showImage([imageUrl], 'KTP');
  }

  async function openForm() {
    await ticketFormDialogRef.current.open();
    pendingTabRef.current?.prefetch();
  }

  async function getReport() {
    isLoadingExport.onTrue();
    try {
      const start = format(finishedStart, 'yyyy-MM-dd');
      const until = format(finishedUntil, 'yyyy-MM-dd');
      const filename = `laporan_ticket_${start}_${until}.xlsx`;
      const result = await ticketRepository.getReport({
        start,
        until,
      });
      download(result, filename);
    } catch (error) {
      toast.error(error.message);
    } finally {
      isLoadingExport.onFalse();
    }
  }

  return (
    <div className="tw-flex tw-flex-col tw-w-full tw-gap-4">
      <TabContext value={tab}>
          <TabList sx={{ px: 2 }} onChange={(_ev: ChangeEvent<{}>, value: string) => setTab(value as TicketTab)}>
          {tabs.map((t, i) => (
            <Tab label={t.label} value={t.value} key={i} sx={{ paddingRight: 2 }} />
          ))}
        </TabList>
        <TabPanel value="ticket">
          {/* <TicketChart byStatus={ticketByStatus} /> */}
          <div className="tw-flex tw-flex-col md:tw-flex-row tw-w-full tw-items-start md:tw-items-center tw-justify-between tw-gap-4">
            <h1 className="md:tw-text-lg tw-text-base tw-font-semibold tw-w-full">
              Ticket Support
            </h1>
            <Stack direction="row" spacing={1} justifyContent="end" className="tw-w-full">
              {/* eslint-disable-next-line react/jsx-no-bind */}
              {tab === 'finished' && (
                <LoadingButton
                  color="success"
                  variant="outlined"
                  loading={isLoadingExport.value}
                  onClick={getReport}
                >
                  <Iconify icon="icon-park-solid:excel" />
                  Laporan
                </LoadingButton>
              )}
              {/* eslint-disable-next-line react/jsx-no-bind */}
              <Button onClick={openForm} color="primary" variant="contained">
                <Iconify icon="mdi:plus" />
                Ticket
              </Button>
            </Stack>
          </div>
          {/* eslint-disable-next-line react/jsx-no-bind */}
          <TicketDataTab showKtp={showKtp} ref={pendingTabRef} />
        </TabPanel>
        <TabPanel value="availableDismantle">
          <AvailableDismantle />
        </TabPanel>
      </TabContext>

      {/* <TabContext value={tab}>
        <TabList onChange={(ev, value) => setTab(value)} aria-label="lab API tabs example">
          {tabList.map((t, i) => (
            <Tab label={t.label} value={t.value} key={i} sx={{ paddingRight: 2 }} />
          ))}
        </TabList>
        <TabPanel value="pending" sx={{ paddingX: 0 }}>
          <TicketPendingTab showKtp={(ktpPath) => showKtp(ktpPath)} ref={pendingTabRef} />
        </TabPanel>
        <TabPanel value="progress" sx={{ paddingX: 0 }}>
          <TicketProgressTab showKtp={(ktpPath) => showKtp(ktpPath)} />
        </TabPanel>
        <TabPanel value="waiting_finish" sx={{ paddingX: 0 }}>
          <TicketWaitingFinish showKtp={(ktpPath) => showKtp(ktpPath)} />
        </TabPanel>
        <TabPanel value="finished" sx={{ paddingX: 0 }}>
          <TicketFinishTab showKtp={(ktpPath) => showKtp(ktpPath)} />
        </TabPanel>
      </TabContext> */}
      <ViewerImageDialog ref={viewerImageDialogRef} />
      <TicketFormDialog ref={ticketFormDialogRef} />
    </div>
  );
}
