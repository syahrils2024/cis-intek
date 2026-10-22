import { toast } from 'sonner';
import { Iconify } from '@components/iconify';
import { useRef, forwardRef, useImperativeHandle } from 'react';
import AreaPickerFilter from '@components/billing/areaPickerFilter';

import {
  Stack,
  Dialog,
  Button,
  useTheme,
  MenuItem,
  TextField,
  DialogTitle,
  useMediaQuery,
  DialogContent,
  DialogActions,
} from '@mui/material';

import 'src/extension/number';
import 'src/extension/string';

import { useImportCustomerTemplatePickerState } from './ImportCustomerTemplatePicker.state';

const ToolsImportCustomerTemplatePicker = forwardRef((props, ref) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const areaPickerFilterRef = useRef();

  const {
    data,
    listItems,
    prefetch,
    reset,
    setData,
    setTemplateData,
    show,
    addData,
    removeData,
    transformToRequest,
  } = useImportCustomerTemplatePickerState();

  const resolver = useRef();

  function open() {
    reset();
    show.onTrue();
    prefetch();
    return new Promise((resolve) => {
      resolver.current = resolve;
    });
  }

  async function pickArea(index) {
    const currentArea = data[index].areaId;
    const resultArea = await areaPickerFilterRef.current.open(currentArea, false);
    setTemplateData(index, {
      areaId: resultArea._id,
      areaName: resultArea.name,
    });
  }

  function close() {
    show.onFalse();
    resolver.current();
  }

  async function submit() {
    try {
      const request = transformToRequest();
      resolver.current(request);
      show.onFalse();
    } catch (error) {
      toast.error(error.message);
    }
  }

  useImperativeHandle(ref, () => ({ open }));

  return (
    <>
      <Dialog open={show.value} fullWidth maxWidth="md" fullScreen={isMobile}>
        <DialogTitle>Buat Template</DialogTitle>
        <DialogContent>
          <div className="tw-flex tw-flex-col tw-py-2 tw-gap-4 tw-w-full">
            {data.map((d, i) => (
              <div
                className="tw-p-4 tw-ring-1 tw-ring-gray-400 tw-rounded-lg tw-flex tw-flex-col"
                key={i}
              >
                <Stack
                  direction={isMobile ? 'column' : 'row'}
                  spacing={2}
                  alignItems={isMobile ? 'end' : 'center'}
                >
                  <Stack spacing={0.3} className="tw-w-full">
                    <span className="tw-text-xs">Area / POP</span>
                    <TextField
                      size="small"
                      fullWidth
                      placeholder="Pilih"
                      InputProps={{ readOnly: true }}
                      onClick={() => pickArea(i)}
                      value={d.areaName ?? null}
                    />
                  </Stack>
                  <Stack spacing={0.3} className="tw-w-full">
                    <span className="tw-text-xs">ODP</span>
                    <TextField
                      size="small"
                      fullWidth
                      value={d.odpId}
                      select
                      placeholder="Pilih ODP"
                      onChange={(e) => setTemplateData(i, { odpId: e.target.value })}
                    >
                      {listItems[i].odpList.map((odp, j) => (
                        <MenuItem key={j} value={odp._id}>
                          {odp.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Stack>
                  <Stack spacing={0.3} className="tw-w-full">
                    <span className="tw-text-xs">Paket</span>
                    <TextField
                      size="small"
                      fullWidth
                      value={d.packageId}
                      select
                      onChange={(e) => setTemplateData(i, { packageId: e.target.value })}
                    >
                      {listItems[i].packageList.map((packagePlan, j) => (
                        <MenuItem key={j} value={packagePlan._id}>
                          {packagePlan.title} (Rp. {packagePlan.price.formatCurrency()})
                        </MenuItem>
                      ))}
                    </TextField>
                  </Stack>
                  <Stack spacing={0.3} className="tw-w-full">
                    <span className="tw-text-xs">Jumlah Pelanggan / Data</span>
                    <TextField
                      size="small"
                      fullWidth
                      value={d.amount ?? null}
                      onChange={(e) =>
                        setTemplateData(i, { amount: e.target.value.toString().toNumber() })
                      }
                    />
                  </Stack>
                  {data.length > 1 ? (
                    <Button size="small" variant="text" color="error" onClick={() => removeData(i)}>
                      <Iconify icon="mdi:close" />
                    </Button>
                  ) : null}
                </Stack>
              </div>
            ))}
            <div className="tw-flex tw-flex-row tw-items-center tw-justify-end tw-mt-2">
              <Button variant="outlined" color="success" size="small" onClick={() => addData()}>
                <Iconify icon="mdi-plus" /> Tambah
              </Button>
            </div>
          </div>
        </DialogContent>
        <DialogActions>
          <Button color="error" variant="text" onClick={() => close()}>
            Tutup
          </Button>
          <Button color="primary" variant="contained" onClick={() => submit()}>
            Buat Template
          </Button>
        </DialogActions>
      </Dialog>
      <AreaPickerFilter ref={areaPickerFilterRef} />
    </>
  );
});

export default ToolsImportCustomerTemplatePicker;
