// @ts-nocheck

import dayjs from 'dayjs';
import { useRef } from 'react';
import UserAutoComplete from '@components/swerve/UserAutoComplete';
import AreaPickerFilter from '@components/billing/areaPickerFilter';

import { DatePicker } from '@mui/x-date-pickers';
import {
  Stack,
  Select,
  useTheme,
  MenuItem,
  Checkbox,
  TextField,
  InputLabel,
  FormControl,
  ListItemText,
  useMediaQuery,
} from '@mui/material';

import { useTicketMainStore } from 'src/stores/ticketMain';
import { TICKET_TYPE_LABELS_LIST } from 'src/enums/ticketType';

/**
 * @typedef {import('src/stores/ticketMain').TicketMainStore} TicketMainStore
 */

const DataTabFilter = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const areaPickerRef = useRef();

  /** @type {TicketMainStore} */
  const { search, areaTitle, ticketType, status, setData, start, until, createdBy } =
    useTicketMainStore();

  const statusList = [
    {
      label: 'Pending',
      value: 'pending',
    },
    {
      label: 'Processed',
      value: 'processed',
    },
    {
      label: 'Request Finish',
      value: 'waiting_finishing',
    },
    {
      label: 'finish',
      value: 'finish',
    },
  ];

  async function pickArea() {
    const area = await areaPickerRef.current?.open();
    if (area) {
      setData({ areaId: area._id, areaTitle: area.name });
    }
  }

  function changeTicketType(event) {
    const { value } = event.target;
    const newValue = typeof value === 'string' ? value.split(',') : value;
    setData({ ticketType: newValue });
  }

  return (
    <>
      <Stack
        direction={isMobile ? 'column' : 'row'}
        className="w-full"
        alignItems="center"
        justifyItems="end"
        justifyContent="end"
        spacing={2}
      >
        <div className="tw-w-full md:tw-w-48">
          <UserAutoComplete
            label="Created Agent"
            value={createdBy}
            onChange={(e, value) =>
              setData({
                createdBy: value,
              })
            }
          />
        </div>
        <div className="tw-w-full md:tw-w-48">
          <DatePicker
            label="Mulai"
            value={dayjs(start)}
            onChange={(newValue) => setData({ start: newValue.toDate() })}
            slotProps={{
              textField: { fullWidth: true, size: 'small' },
            }}
          />
        </div>
        <div className="tw-w-full md:tw-w-48">
          <DatePicker
            label="Sampai"
            value={dayjs(until)}
            onChange={(newValue) => setData({ until: newValue.toDate() })}
            slotProps={{
              textField: { fullWidth: true, className: 'tw-w-full md:tw-w-48', size: 'small' },
            }}
          />
        </div>
        <TextField
          size="small"
          label="Status"
          value={status}
          className="tw-w-full md:tw-w-48"
          InputLabelProps={{ shrink: true }}
          SelectProps={{ displayEmpty: true }}
          select
          onChange={(e) => setData({ status: e.target.value })}
        >
          <MenuItem value="">Semua</MenuItem>
          {statusList.map((item) => (
            <MenuItem key={item.value} value={item.value}>
              {item.label}
            </MenuItem>
          ))}
        </TextField>
        {/* <TextField
          size="small"
          label="Jenis"
          value={ticketType}
          className="tw-w-full md:tw-w-48"
          InputLabelProps={{ shrink: true }}
          SelectProps={{ displayEmpty: true }}
          select
          onChange={(e) => setData({ ticketType: e.target.value })}
        >
          <MenuItem value="">Semua</MenuItem>
          {TICKET_TYPE_LABELS_LIST.map((item) => (
            <MenuItem key={item.value} value={item.value}>
              {item.label}
            </MenuItem>
          ))}
        </TextField> */}
        <FormControl className="tw-w-full md:tw-w-48" size="small">
          <InputLabel>Jenis</InputLabel>
          <Select
            multiple
            value={ticketType}
            onChange={(e) => changeTicketType(e)}
            label="Jenis"
            renderValue={(selected) => selected.join(', ')}
          >
            {TICKET_TYPE_LABELS_LIST.map((item) => (
              <MenuItem key={item.value} value={item.value}>
                <Checkbox checked={ticketType.includes(item.value)} />
                <ListItemText primary={item.label} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          size="small"
          label="Area"
          value={areaTitle}
          InputProps={{ readOnly: true }}
          className="tw-w-full md:tw-w-48"
          onClick={() => pickArea()}
        />
        <TextField
          defaultValue={search}
          size="small"
          label="Cari"
          className="tw-w-full md:tw-w-48"
          onChange={(e) => setData({ search: e.target.value })}
        />
      </Stack>
      <AreaPickerFilter ref={areaPickerRef} />
    </>
  );
};

export default DataTabFilter;
