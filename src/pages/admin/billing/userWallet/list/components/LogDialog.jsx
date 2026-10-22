import Overloading from '@components/overloading';
import { forwardRef, useImperativeHandle } from 'react';

import {
  Grid,
  Stack,
  Button,
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
} from '@mui/material';

import LogDialogData from './LogDIalogData';
import LogDialogMenu from './LogDialogMenu';
import UserLogDialogFilter from './LogDialogFilter';
import UserWithdrawConfirm from './WithdrawConfirm';
import { useUserWalletLogDialogState } from './LogDialog.state';

const UserWalletLogDialog = forwardRef((props, ref) => {
  const { state, handlers, ref: refState } = useUserWalletLogDialogState();

  useImperativeHandle(ref, () => ({ open: handlers.open }));

  return (
    <>
      <Dialog
        open={state.show.value}
        onClose={handlers.close}
        fullScreen={state.mobile}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <span>Mutasi Kas Kolektor</span>
            {/* <Button onClick={handlers.withdraw} color="primary" variant="soft" size="small">
              Tarik Kas Kolektor
            </Button> */}
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} className="tw-relative">
            <Overloading loading={state.loading.value} />
            <Grid container>
              {state.headerData.map(({ label, value }) => (
                <Grid item xs={6} key={label}>
                  <Stack>
                    <span className="tw-text-xs tw-text-gray-500">{label}</span>
                    <span className="tw-text-xs tw-font-semibold">{value}</span>
                  </Stack>
                </Grid>
              ))}
            </Grid>
            <UserLogDialogFilter
              start={state.start}
              until={state.until}
              setStart={handlers.setStart}
              setUntil={handlers.setUntil}
              isMobile={state.mobile}
            />
            <LogDialogData
              items={state.logs}
              mobileLayout={state.mobile}
              onViewEvidence={handlers.viewEvidence}
              onPreviewImage={handlers.previewImage}
            />
            <LogDialogMenu
              anchorEl={state.anchorEl}
              selectedWalletLog={state.selectedWalletLog}
              closeEvidence={handlers.closeEvidence}
              onPreviewImage={handlers.previewImage}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handlers.close} color="error" variant="text">
            Tutup
          </Button>
        </DialogActions>
      </Dialog>
      <UserWithdrawConfirm ref={refState.withdrawConfirmRef} />
    </>
  );
});

export default UserWalletLogDialog;
