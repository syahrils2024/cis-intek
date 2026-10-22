import Overloading from '@components/overloading';
import { forwardRef, useImperativeHandle } from 'react';

import { Stack, Button, Dialog, DialogTitle, DialogActions, DialogContent } from '@mui/material';

import { useArchiverDetailState } from './archiverDetail.state';

const ArchiveDetail = forwardRef((props, ref) => {
  const {
    close,
    loading,
    open,
    show,
    mobile,
    messageLogs,
    scrollRef,
    archivedFiles,
    allowDownload,
    download,
  } = useArchiverDetailState();

  useImperativeHandle(ref, () => ({ open }));

  return (
    <Dialog open={show.value} fullWidth maxWidth="sm" fullScreen={mobile}>
      <DialogTitle>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <span>Archive Detail</span>
          <span className="tw-text-sm tw-font-normal tw-text-gray-500">
            Files Archived: {archivedFiles}
          </span>
        </Stack>
      </DialogTitle>
      <DialogContent>
        <div className="tw-relative">
          <Overloading loading={loading.value} />
          <div
            className="tw-py-2 tw-flex tw-flex-col tw-overflow-y-auto tw-min-h-28 tw-max-h-96"
            ref={scrollRef}
          >
            {messageLogs.map((message, i) => (
              <span
                className={[
                  'tw-text-xs',
                  message.toLowerCase().includes('failure')
                    ? 'tw-text-red-500 tw-font-semibold'
                    : '',
                ].join(' ')}
                key={i}
              >
                {message}
              </span>
            ))}
          </div>
        </div>
      </DialogContent>
      <DialogActions>
        <Button color="error" variant="text" onClick={() => close()}>
          Tutup
        </Button>
        <Button color="primary" variant="contained" onClick={() => download()} disabled={!allowDownload}>
          Download
        </Button>
      </DialogActions>
    </Dialog>
  );
});

export default ArchiveDetail;
