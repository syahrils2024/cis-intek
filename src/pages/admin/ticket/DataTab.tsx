// @ts-nocheck

/**
 * @typedef {import('src/repositories/ticket').Ticket} Ticket
 */

import { TicketLogForm } from '@components/ticket/logForm';
import { useRef, forwardRef, useImperativeHandle } from 'react';
import { TicketEngineerPicker } from '@components/ticket/engineerPicker';

import { Tab, Stack } from '@mui/material';
import { TabList, TabPanel, TabContext } from '@mui/lab';

import DataTabMenu from './components/DataTabMenu';
import DataTabChart from './components/DataTabChart';
import { useTicketData } from './hooks/useTicketData';
import DataTabFilter from './components/DataTabFilter';
import DataTabContent from './components/DataTabContent';

const TicketDataTab = forwardRef(({ showKtp }, ref) => {
  const engineerPickerRef = useRef();
  const ticketLogFormRef = useRef();

  const { state, handler } = useTicketData();

  useImperativeHandle(ref, () => ({ prefetch: handler.prefetch }));

  return (
    <Stack gap={2}>
      {/* Tab */}
      <TabContext value={state.tab}>
        {/* Tab List */}
        {state.isMobile ? (
          <TabList onChange={(ev, value) => handler.setTab(value)}>
            {state.tabs.map((t, i) => (
              <Tab key={i} label={t.label} value={t.value} />
            ))}
          </TabList>
        ) : null}
        {/* End Tab List */}
        <TabPanel value="ticket.recap" sx={{ paddingX: 0 }}>
          <DataTabChart ticketDashboardChart={state.ticketDashboardChart} />
        </TabPanel>
        <TabPanel value="ticket.list" sx={{ paddingX: 0 }}>
          {/* Chart Desktop */}
          {state.isMobile ? null : <DataTabChart ticketDashboardChart={state.ticketDashboardChart} />}
          {/* End Chart Desktop */}
          <DataTabFilter />
          {/* Content */}
          <DataTabContent
            data={state.data}
            isLoading={state.isLoading}
            showKtp={showKtp}
            ticketLogFormRef={ticketLogFormRef}
            handleClick={handler.handleClick}
            sort={state.sort}
            sortBy={state.sortBy}
            setData={handler.setData}
            onChangeStatus={handler.onChangeStatus}
            totalItems={state.totalItems}
            page={state.page}
            limit={state.limit}
            onChangeEngineer={(ticket) => handler.onChangeEngineer(ticket)}
          />
        </TabPanel>
      </TabContext>
      {/* End Tab */}

      {/* Menu */}
      <DataTabMenu
        anchorEl={state.anchorEl}
        open={state.open}
        onClose={handler.handleClose}
        allowModify={state.allowModify}
        selectedTicket={state.selectedTicket}
        allowProcessEngineer={state.allowProcessEngineer}
        onNavigateToCustomerData={handler.navigateToCustomerData}
        onProcess={handler.onProcess}
        onFinishing={handler.onFinishing}
        onChangeEngineer={handler.onChangeEngineer}
        onRemove={handler.onRemove}
        onProcessed={handler.onProcessed}
        onSendNotif={handler.onSendNotif}
        onOpenAcsDialog={handler.openAcsDialog}
        ticketLogFormRef={ticketLogFormRef}
      />
      <TicketLogForm ref={ticketLogFormRef} />
      {/* <TicketLogChat ref={ticketLogFormRef} /> */}
      <TicketEngineerPicker ref={engineerPickerRef} />
    </Stack>
  );
});

export default TicketDataTab;
