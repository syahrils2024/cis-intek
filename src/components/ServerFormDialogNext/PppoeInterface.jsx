import { Stack, Button, TextField } from '@mui/material';

export function PPPoEInterface({ value = "", onChange, label = "PPPoE Interface Format" }) {
  const items = {
    'ID Pelanggan': '{customer-id}',
    'Nama Pelanggan': '{customer-fullname}',
    ODP: '{odp}',
    Phone: '{customer-phone}',
    'Serial Number': '{serial-number}',
  };

  const entries = Object.entries(items);

  function append(text) {
    let newValue = `${value}_${text}`;
    if(value.trim() === ""){
      newValue = text;
    }
    onChange(newValue);
  }

  return (
    <Stack>
      <TextField label={label} value={value} onChange={(e) => onChange(e.target.value)} size="small" />
      <div className="tw-flex tw-flex-wrap tw-gap-2 tw-mt-4">
        {entries.map(([l, placeholder]) => (
          <Button size="small" variant="outlined" key={l} onClick={() => append(placeholder)}>
            {l}
          </Button>
        ))}
      </div>
    </Stack>
  );
}
