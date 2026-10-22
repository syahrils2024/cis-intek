import Overloading from '@components/overloading';
import { useEffect, forwardRef, useImperativeHandle } from 'react';

import { Stack, Button, Dialog, DialogTitle, DialogActions, DialogContent } from '@mui/material';

import ArchiveListData from './archiveListData';
import { useArchiverListState } from './archiverList.state';
import ArchiveDetail from '../archiverDetail/archiveDetail';
import ArchivePickerDialog from '../archiverPicker/archiverPickerDialog';

const ArchiveListDialog = forwardRef((props, ref) => {
  const {
    data,
    load,
    loading,
    open,
    show,
    mobile,
    openDetail,
    archiveDetailRef,
    archivePickerRef,
    openPicker,
    download,
    remove
  } = useArchiverListState();

  useEffect(() => {
    load();
  }, []);

  useImperativeHandle(ref, () => ({ open }));

  return (
    <Dialog
      open={show.value}
      fullWidth
      maxWidth="sm"
      fullScreen={mobile}
      onClose={() => show.onFalse()}
    >
      <DialogTitle>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          Archive List
          <Button variant="soft" color='primary' size="small" onClick={() => openPicker()}>
            Create Archive
          </Button>
        </Stack>
      </DialogTitle>
      <DialogContent>
        <div className="tw-relative tw-flex tw-flex-col tw-gap-2 tw-py-2">
          <Overloading loading={loading.value} />
          <ArchiveListData
            data={data}
            onDetail={(item) => openDetail(item)}
            onDownload={(item) => download(item)}
            onRemove={(item) => remove(item)}
          />
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => show.onFalse()} variant="text" color="error">
          Tutup
        </Button>
      </DialogActions>
      <ArchiveDetail ref={archiveDetailRef} />
      <ArchivePickerDialog ref={archivePickerRef} />
    </Dialog>
  );
});

export default ArchiveListDialog;
