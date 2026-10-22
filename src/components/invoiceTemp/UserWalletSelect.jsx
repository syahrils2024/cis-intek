import { useState } from 'react';

import { Stack, MenuItem, TextField } from '@mui/material';

/**
 *
 * @param {object} param0
 * @param {boolean} param0.value
 * @param {function} param0.onChange
 * @returns
 * @description Component untuk memilih wallet user ketika melakukan pembayaran dengan metode cash, sehingga ketika metode pembayaran cash dipilih maka saldo akan masuk ke wallet user tersebut
 */
export const UserWalletSelect = ({ value = null, onChange, label = 'User Wallet' }) => {
  const [focus, setFocus] = useState(false);
  return (
    <TextField
      select
      focus={focus}
      onFocus={() => setFocus(true)}
      onBlur={() => setFocus(false)}
      fullWidth
      label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      InputLabelProps={{ shrink: true }}
      className="tw-bg-white"
      size="small"
    >
      <MenuItem value={null} key="null">
        Pilih
      </MenuItem>
      <MenuItem value>
        <Stack>
          <span>+ Kas Kolektor</span>
          {focus ? (
            <p className="tw-text-gray-500">
              Pilih opsi ini apabila uang masih belum diterima admin dan akan ditambahkan ke kas
              kolektor teknisi.
            </p>
          ) : null}
        </Stack>
      </MenuItem>
      <MenuItem value={false} title="Tanpa Kas Kolektor">
        <Stack>
          <span>Admin</span>
          {focus ? (
            <p className="tw-text-gray-500">
              Pilih opsi ini apabila uang sudah diterima admin
            </p>
          ) : null}
        </Stack>
      </MenuItem>
    </TextField>
  );
};
