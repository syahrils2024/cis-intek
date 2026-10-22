import { Stack, Button, TextField } from '@mui/material';

export function PPPoEInterfaceFormat({ value = "", onChange }) {
  const format = {
    customer_id: '{customer-id}',
    odp: '{odp}',
    phone_number: '{phone-number}',
    serial_number: '{serial-number}',
    nama_pelanggan: '{customer-fullname}',
  };

  const formatList = Object.entries(format).map(([key, v]) => ({ key, v }));

  function addFormat(key) {
    let currentValue = value;
    const placeholder = format[key];
    if (placeholder) currentValue = `${currentValue} ${placeholder}`.trim().replaceAll(' ', '_');
    onChange(currentValue);
  }

  return (
    <Stack spacing={2}>
      <TextField value={value} fullWidth size="small" label="PPPoE Interface Format" onChange={(e) => onChange(e.target.value)} />
      <div className="tw-gap-2 flex tw-flex-wrap">
        {formatList.map(({ key, v }) => (
          <Button key={v} onClick={() => addFormat(key)} size="small">
            {key}
          </Button>
        ))}
      </div>
    </Stack>
  );
}
