import dayjs from 'dayjs';
import { toast } from 'sonner';
import { Iconify } from '@components/iconify';
import AreaPickerFilter from '@components/billing/areaPickerFilter';
import { useRef, useState, useEffect, forwardRef, useImperativeHandle } from 'react';

import { DatePicker } from '@mui/x-date-pickers';
import {
  Stack,
  Dialog,
  Button,
  Select,
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
import { depositMethodRepository } from 'src/repositories';

import { useImportBillingTemplatePickerState } from './ImportBillingTemplatePicker.state';

const ToolsImportBillingTemplatePicker = forwardRef((props, ref) => {
  const [paymentMethod, setPaymentMethod] = useState([]);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const areaPickerFilterRef = useRef();

  const { data, reset, setTemplateData, show, addData, removeData, transformToRequest } =
    useImportBillingTemplatePickerState();

  const resolver = useRef();

  function open() {
    reset();
    show.onTrue();
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

  async function pickPaymentMethod(index) {
    // const currentPaymentMethod = data[index].paymentMethodId;
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

  useEffect(() => {
    fetchPaymentMethod();
  }, []);

  const fetchPaymentMethod = async () => {
    try {
      const result = await depositMethodRepository.getPaymentMethod('transfer');
      const resultCash = await depositMethodRepository.getPaymentMethod('cash');
      setPaymentMethod([...resultCash, ...result]);
    } catch (error) {
      toast.error('Failed to fetch payment methods');
    }
  };

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
                    <span className="tw-text-xs">Periode</span>
                    <DatePicker
                      openTo="year"
                      views={['year', 'month']}
                      slotProps={{ textField: { size: 'small' } }}
                      value={dayjs(new Date(d.year, d.month - 1))}
                      onChange={(value) =>
                        setTemplateData(i, {
                          month: value.toDate().getMonth() + 1,
                          year: value.toDate().getFullYear(),
                        })
                      }
                    />
                  </Stack>
                  <Stack spacing={0.3} className="tw-w-full">
                    <span className="tw-text-xs">Jumlah Data</span>
                    <TextField
                      size="small"
                      fullWidth
                      value={d.amount ?? null}
                      onChange={(e) =>
                        setTemplateData(i, { amount: e.target.value.toString().toNumber() })
                      }
                    />
                  </Stack>
                  <Stack spacing={0.3} className="tw-w-full">
                    <span className="tw-text-xs">Metode Pembayaran</span>
                    <Select onChange={(e) => {
                      console.log(e.target.value);
                      setTemplateData(i, { depositMethodId: e.target.value })
                    }} size="small" fullWidth inputProps={{ 'aria-label': 'Without label' }}>
                      {...(paymentMethod ?? []).map((method, index) => (
                        <MenuItem key={index} value={method._id}>
                          {method.title}
                        </MenuItem>
                      ))}
                    </Select>
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

export default ToolsImportBillingTemplatePicker;
