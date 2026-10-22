import Overloading from '@components/overloading';
import { forwardRef, useImperativeHandle } from 'react';

import { Grid, Button, Dialog, DialogTitle, DialogActions, DialogContent } from '@mui/material';

import { useMeStore } from 'src/stores/meStore';

import { LogChatSummary } from './logChatSummary';
import { useTicketLogChatState } from './logChat.state';
import { TicketLogChatContainer } from './logChatContainer';

const TicketLogChat = forwardRef((props, ref) => {
  /** @type {import('src/stores/meStore').MeStore } */
  const { me } = useMeStore();
  const { state, handlers } = useTicketLogChatState();

  useImperativeHandle(ref, () => ({ open: handlers.open }));

  return (
    <Dialog open={state.show.value} onClose={() => state.show.onFalse()} fullWidth maxWidth="lg">
      <DialogTitle>Ticket Log</DialogTitle>
      <DialogContent>
        <div className="tw-relative">
          <Overloading loading={state.loading.value} />
          <Grid container>
            <Grid item xs={12} sm={6}>
              <LogChatSummary labelItems={state.customerLabel} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TicketLogChatContainer items={state.logs} selfUserId={me?._id ?? ''} />
            </Grid>
          </Grid>
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => state.show.onFalse()} color="error" variant="text">
          Tutup
        </Button>
      </DialogActions>
    </Dialog>
  );
});

export default TicketLogChat;
