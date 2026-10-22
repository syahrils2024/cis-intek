// @ts-nocheck
import Overloading from '@components/overloading';
import { forwardRef, useImperativeHandle } from 'react';

import { DataGrid } from '@mui/x-data-grid';
import {
  Stack,
  Button,
  Dialog,
  TextField,
  DialogTitle,
  Autocomplete,
  DialogActions,
  DialogContent,
} from '@mui/material';

import { useDuplicatedOnuDialogState } from './DuplicatedOnuDialog.state';

const DuplicatedOnuDialog = forwardRef((props, ref) => {
  const { methods, state } = useDuplicatedOnuDialogState();

  useImperativeHandle(ref, () => ({ open: methods.open }));

  return (
    <Dialog
      open={state.show.value}
      onClose={methods.close}
      fullWidth
      maxWidth="md"
      fullScreen={state.mobile}
    >
      <DialogTitle>Duplicated ONU in database</DialogTitle>

      <DialogContent>
        <Stack className="tw-relative tw-py-2" spacing={2}>
          <Stack
            direction={state.mobile ? 'column' : 'row'}
            justifyContent="end"
            className="tw-w-full"
            spacing={2}
          >
            <div className="tw-w-full md:tw-max-w-40">
              <TextField
                value={state.search}
                onChange={(e) => methods.setSearch(e.target.value)}
                label="Serial Number"
                size="small"
                fullWidth
              />
            </div>
            <div className="tw-w-full md:tw-max-w-56">
              <Autocomplete
                fullWidth
                value={state.selectedOltId}
                options={state.oltList}
                getOptionKey={(opt) => opt._id}
                getOptionLabel={(opt) => opt.deviceName}
                isOptionEqualToValue={(opt, val) => val._id === opt._id}
                onChange={(e, val) => methods.setSelectedOltId(val)}
                renderInput={(params) => <TextField {...params} label="OLT" size="small" />}
              />
            </div>
          </Stack>
          <Overloading loading={state.loading.value} />
          <div style={{ height: 500, width: '100%' }}>
            <DataGrid
              rows={state.filteredDuplicatedOnuData}
              columns={state.mobile ? state.mobileColumns : state.columns}
              rowBufferPx={100}
              initialState={{
                pagination: {
                  paginationModel: {
                    pageSize: 10,
                  },
                },
              }}
              disableAutosize
              pageSizeOptions={[10, 25, 50]}
              disableColumnResize
            />
          </div>
          <span className="tw-text-xs">
            Untuk menghapus data duplikat pada database silahkan hapus onu masing-masing pada
            perangkat olt, ketika sudah selesai maka anda dapat menggunakan fitur rebuild database
            (proses ini menghapus cache data ONU dan akan scan ulang menggunakan SNMP)
          </span>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button variant="text" color="error" onClick={methods.close}>
          Tutup
        </Button>
      </DialogActions>
    </Dialog>
  );
});

export default DuplicatedOnuDialog;
