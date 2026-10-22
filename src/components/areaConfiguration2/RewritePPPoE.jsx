import { forwardRef, useImperativeHandle } from 'react';

import { Dialog, Button, DialogTitle, DialogContent, DialogActions } from '@mui/material';

import RewritePPPoEConfirm from './RewritePPPoEConfirm';
import { useRewritePPPoEState } from './rewritePPPoE.state';
import RewritePPPoEStreamLog from './RewritePPPoEStreamLog';

const RewritePPPoEDialog = forwardRef((props, ref) => {
  const { state, handlers } = useRewritePPPoEState();

  useImperativeHandle(ref, () => ({ open: handlers.open, close: handlers.close }));

  return (
    <Dialog fullWidth maxWidth="sm" fullScreen={state.mobile} open={state.show.value}>
      <DialogTitle>Rewrite PPPoE</DialogTitle>
      <DialogContent>
        {/* Debug: Logs count: {state.logs.length} */}
        {!state.isSubmited.value ? (
          <RewritePPPoEConfirm
            description={`Apakah anda ingin inject PPPoE pelanggan ke mikrotik untuk POP / Area ${state.area?.title} ?`}
            rewriteSecret={state.rewriteSecret.value}
            rewriteInterface={state.rewriteInterface.value}
            onChangeRewriteSecret={(value) => state.rewriteSecret.setValue(value)}
            onChangeRewriteInterface={(value) => state.rewriteInterface.setValue(value)}
          />
        ) : (
          <RewritePPPoEStreamLog logs={state.logs} />
        )}
      </DialogContent>
      <DialogActions>
        <Button color="error" variant="text" onClick={() => handlers.close()}>
          Tutup
        </Button>
        {!state.isSubmited.value ? (
          <Button
            color="primary"
            variant="contained"
            disabled={state.disabledSubmit}
            onClick={() => handlers.submit()}
          >
            Rewrite PPPoE
          </Button>
        ) : null}
      </DialogActions>
    </Dialog>
  );
});
export default RewritePPPoEDialog;
