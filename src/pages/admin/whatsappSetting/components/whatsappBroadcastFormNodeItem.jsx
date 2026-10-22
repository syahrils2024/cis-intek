/**
 * @typedef {import("src/repositories/whatsappNode").WhatsappNode} WhatsappNode
 */

import { Iconify } from '@components/iconify';

import { Stack, MenuItem, TextField, IconButton } from '@mui/material';

/**
 * @param {{value: whatsappNode, items: WhatsappNode[], onChange: (value: string) => void, onRemove: Function}} props
 */
export default function WhatsappBroadcastFormNodeItem({
  whatsappNode = '',
  items = [],
  onChange,
  onRemove,
}) {
  return (
    <Stack direction="row" spacing={2}>
      <TextField
        value={whatsappNode}
        size="small"
        label="Whatsapp Node"
        select
        fullWidth
        InputLabelProps={{ shrink: true }}
        SelectProps={{ displayEmpty: true }}
        onChange={(e) => onChange(e.target.value)}
      >
        <MenuItem value="">Pilih</MenuItem>
        {items.map((item, i) => (
          <MenuItem key={i} value={item._id}>
            {item.title}
          </MenuItem>
        ))}
      </TextField>
      {onRemove ? (
        <IconButton onClick={onRemove} color="error">
          <Iconify icon="mdi:delete" />
        </IconButton>
      ) : null}
    </Stack>
  );
}
