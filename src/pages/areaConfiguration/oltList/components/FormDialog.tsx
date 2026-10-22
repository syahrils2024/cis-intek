// @ts-nocheck
import { toast } from 'sonner';
import { useBoolean } from '@hooks/use-boolean';
import AreaPickerFilter from '@components/billing/areaPickerFilter';
import { useRef, useState, forwardRef, useImperativeHandle } from 'react';

import { LoadingButton } from '@mui/lab';
import {
  Stack,
  Dialog,
  Button,
  MenuItem,
  TextField,
  DialogTitle,
  DialogActions,
  DialogContent,
} from '@mui/material';

import 'src/extension/string';
import 'src/extension/number';
import { oltDeviceRepository } from 'src/repositories';

const OltFormDialog = forwardRef((props, ref) => {
  const show = useBoolean(false);
  const resolver = useRef();
  const loadingSubmit = useBoolean(false);
  const overlayLoading = useBoolean(false);
  const areaPickerRef = useRef();

  const [currentId, setCurrentId] = useState(null);
  const [deviceName, setDeviceName] = useState('');
  const [ipAddress, setIpAddress] = useState('');
  const [port, setPort] = useState(161);
  const [communityRead, setCommunityRead] = useState('public');
  const [communityWrite, setCommunityWrite] = useState('private');
  const [areaName, setAreaName] = useState('');
  const [areaId, setAreaId] = useState('');
  const [category, setCategory] = useState(1);

  const categoryList = [
    { label: 'HSGQ', value: 1 },
    { label: 'KINGTYPE', value: 2 },
  ];

  async function pickArea() {
    const result = await areaPickerRef.current.open(null, false);
    if (!result) return;
    setAreaId(result._id);
    setAreaName(result.title);
  }

  function reset() {
    setCurrentId(null);
    setDeviceName('');
    setAreaId('');
    setAreaName('');
    setIpAddress('');
    setPort(161);
    setCommunityRead('public');
    setCommunityWrite('private');
    setCategory(1);
  }

  async function fetchOltDeviceDetail(_id) {
    overlayLoading.onTrue();
    try {
      const data = await oltDeviceRepository.findOneOltDevice(_id);
      setDeviceName(data.deviceName);
      setIpAddress(data.ipAddress);
      setPort(data.port.toString().toNumber());
      setCommunityRead(data.communityRead);
      setCommunityWrite(data.communityWrite);
      setAreaId(data.area);
      setAreaName(data.areaTitle);
      setCategory(data.category ?? 1); // default category 1
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
    } finally {
      overlayLoading.onFalse();
    }
  }

  function open(_id) {
    reset();
    show.onTrue();
    if (_id) {
      fetchOltDeviceDetail(_id);
      setCurrentId(_id);
    }
    return new Promise((resolve) => {
      resolver.current = resolve;
    });
  }

  function close() {
    show.onFalse();
    resolver.current?.();
  }

  async function submit() {
    loadingSubmit.onTrue();
    try {
      const reqBody = {
        deviceName,
        ipAddress,
        port: port.toString().toNumber(),
        communityRead,
        communityWrite,
        areaId,
        category,
      };

      if (currentId) await oltDeviceRepository.updateOltDevice(currentId, reqBody);
      else await oltDeviceRepository.createOltDevice(reqBody);

      toast.success('OLT berhasil disimpan');
      close();
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
    } finally {
      loadingSubmit.onFalse();
    }
  }

  useImperativeHandle(ref, () => ({
    open,
    close,
  }));

  return (
    <Dialog open={show.value} maxWidth="sm" fullWidth onClose={() => close()}>
      <DialogTitle>Form OLT</DialogTitle>
      <DialogContent>
        <Stack spacing={2} className="tw-py-1.5">
          <TextField
            label="POP / Area"
            fullWidth
            size="small"
            value={areaName}
            onClick={() => pickArea()}
          />
          <TextField
            label="OLT Name"
            fullWidth
            size="small"
            value={deviceName}
            onChange={(e) => setDeviceName(e.target.value)}
          />
          <TextField
            label="Device Type"
            fullWidth
            size="small"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            select
          >
            {categoryList.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="IP Address"
            fullWidth
            size="small"
            value={ipAddress}
            onChange={(e) => setIpAddress(e.target.value)}
          />
          <TextField
            label="SNMP Port"
            fullWidth
            size="small"
            type="number"
            value={port}
            onChange={(e) => setPort(e.target.value.toString().toNumber())}
          />
          <TextField
            label="SNMP Community Read"
            fullWidth
            size="small"
            value={communityRead}
            onChange={(e) => setCommunityRead(e.target.value)}
          />
          <TextField
            label="SNMP Community Write"
            fullWidth
            size="small"
            value={communityWrite}
            onChange={(e) => setCommunityWrite(e.target.value)}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button color="error" variant="text" onClick={() => close()}>
          Tutup
        </Button>
        <LoadingButton
          variant="contained"
          color="primary"
          loading={loadingSubmit.value}
          onClick={() => submit()}
        >
          Simpan
        </LoadingButton>
      </DialogActions>
      {/* Area Picker */}
      <AreaPickerFilter ref={areaPickerRef} />
      {/* End Area Picker */}
    </Dialog>
  );
});

export default OltFormDialog;
